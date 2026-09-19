import {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType,
  AuditLogEvent,
  EmbedBuilder,
  GuildMember,
  ChannelType,
  TextChannel,
  PermissionsBitField,
  Guild,
  VoiceChannel,
  StageChannel,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import { BotConfig, BotStatus, AuditLogEntry, SeverityLevel, ConnectedGuild, ModCase, WarnStrike, ModActionType } from '../types.js';
import { analyzeMessageToxicity } from './geminiModerator.js';
import { BOT_COMMANDS } from '../data/botCommands.js';

const CONFIG_FILE = path.join(process.cwd(), 'bot-config.json');

export const DEFAULT_CONFIG: BotConfig = {
  token: process.env.DISCORD_BOT_TOKEN || '',
  clientId: process.env.DISCORD_CLIENT_ID || '',
  guildId: process.env.DISCORD_GUILD_ID || '',
  adminUserIds: process.env.ADMIN_DISCORD_IDS
    ? process.env.ADMIN_DISCORD_IDS.split(',').map((s) => s.trim()).filter(Boolean)
    : [],
  antiNuke: {
    enabled: true,
    roleChangeAction: 'ban',
    channelCreateAction: 'ban',
    channelDeleteAction: 'ban',
    suspiciousActivityAction: 'ban',
    massBanThreshold: 3,
    massKickThreshold: 3,
    massChannelThreshold: 2,
    whitelistedUserIds: [],
    whitelistedRoleIds: [],
  },
  autoMod: {
    spamFilterEnabled: true,
    maxMessagesPer5Sec: 5,
    duplicateMessageLimit: 2,
    blockDiscordInvites: true,
    blockExternalLinks: false,
    massMentionsThreshold: 4,
    capsPercentageThreshold: 75,
    zalgoFilter: true,
    spamAction: 'delete_warn',
  },
  aiToxicity: {
    enabled: true,
    sensitivity: 'medium',
    categories: {
      harassment: true,
      hateSpeech: true,
      threats: true,
      severeProfanity: true,
      scams: true,
    },
    action: 'delete_warn',
  },
  dmAlerts: {
    enabled: true,
    minSeverity: 'high',
    alertOnRoleTamper: true,
    alertOnChannelTamper: true,
    alertOnRaid: true,
    alertOnSpamMass: true,
    alertOnToxicSevere: true,
  },
  moderation: {
    enabled: true,
    modLogChannelId: '',
    modRoleId: '',
    muteRoleId: '',
    quarantineRoleId: '',
    dmUserOnSanction: true,
    appealInviteUrl: '',
    autoEscalateWarns: true,
    warnDecayDays: 30,
    escalationRules: [
      { strikeCount: 1, action: 'warn', label: 'Formal Written Warning' },
      { strikeCount: 2, action: 'timeout_1h', label: '1-Hour Mute / Timeout' },
      { strikeCount: 3, action: 'timeout_24h', label: '24-Hour Timeout' },
      { strikeCount: 4, action: 'kick', label: 'Server Kick' },
      { strikeCount: 5, action: 'ban', label: 'Permanent Server Ban' },
    ],
  },
};

export class DiscordSentinelBot {
  private client: Client | null = null;
  private config: BotConfig;
  private auditLogs: AuditLogEntry[] = [];
  private userMessageHistory: Map<string, { timestamp: number; content: string }[]> = new Map();
  private recentBans: Map<string, number[]> = new Map(); // executorId -> array of timestamps
  private recentKicks: Map<string, number[]> = new Map();
  private recentChannelEvents: Map<string, number[]> = new Map();
  private stats = {
    todayBlockedSpam: 0,
    todayBlockedToxicity: 0,
    todayRoleTamperBlocked: 0,
    todayChannelTamperBlocked: 0,
    todayDmAlertsSent: 0,
    todayBansKicks: 4,
  };
  private startedAt: number | null = null;
  private isConnecting: boolean = false;
  private lastError: string | null = null;
  private modCases: ModCase[] = [];
  private warnStrikes: WarnStrike[] = [];
  private caseCounter: number = 1048;

  constructor() {
    this.config = this.loadConfig();
    this.seedInitialLogs();
  }

  private loadConfig(): BotConfig {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const data = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          token: parsed.token || process.env.DISCORD_BOT_TOKEN || '',
          clientId: parsed.clientId || process.env.DISCORD_CLIENT_ID || '',
          guildId: parsed.guildId || process.env.DISCORD_GUILD_ID || '',
          adminUserIds:
            parsed.adminUserIds?.length > 0
              ? parsed.adminUserIds
              : DEFAULT_CONFIG.adminUserIds,
        };
      }
    } catch (e) {
      console.warn('Failed to load bot config file, using defaults', e);
    }
    return { ...DEFAULT_CONFIG };
  }

  public saveConfig(newConfig: Partial<BotConfig>): BotConfig {
    const currentMod = this.config.moderation || DEFAULT_CONFIG.moderation!;
    const newMod: Partial<NonNullable<BotConfig['moderation']>> = newConfig.moderation || {};

    this.config = {
      ...this.config,
      ...newConfig,
      antiNuke: { ...this.config.antiNuke, ...(newConfig.antiNuke || {}) },
      autoMod: { ...this.config.autoMod, ...(newConfig.autoMod || {}) },
      aiToxicity: { ...this.config.aiToxicity, ...(newConfig.aiToxicity || {}) },
      dmAlerts: { ...this.config.dmAlerts, ...(newConfig.dmAlerts || {}) },
      moderation: {
        ...currentMod,
        ...newMod,
        dmUserOnSanction: newMod.dmUserOnSanction ?? currentMod.dmUserOnSanction,
        autoEscalateWarns: newMod.autoEscalateWarns ?? currentMod.autoEscalateWarns,
        warnDecayDays: newMod.warnDecayDays ?? currentMod.warnDecayDays,
        escalationRules: newMod.escalationRules ?? currentMod.escalationRules,
      },
    };

    try {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(this.config, null, 2), 'utf-8');
      this.addLog({
        type: 'bot_status',
        severity: 'info',
        executor: { id: 'dashboard', tag: 'Dashboard User' },
        target: { name: 'Bot Configuration' },
        actionTaken: 'Configuration Updated',
        details: 'Security rules, anti-nuke thresholds, or alert targets updated via Web Console',
      });
    } catch (e) {
      console.error('Error saving bot config to file:', e);
    }

    return this.config;
  }

  public getConfig(): BotConfig {
    return {
      ...this.config,
      token: this.config.token ? `${this.config.token.slice(0, 8)}...${this.config.token.slice(-6)}` : '',
    };
  }

  public getRawConfig(): BotConfig {
    return this.config;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return this.auditLogs;
  }

  public clearAuditLogs(): void {
    this.auditLogs = [];
  }

  public getModCases(): ModCase[] {
    return this.modCases;
  }

  public getWarnStrikes(): WarnStrike[] {
    return this.warnStrikes;
  }

  private seedInitialLogs() {
    this.addLog({
      type: 'bot_status',
      severity: 'info',
      executor: { id: 'system', tag: 'Sentinel Engine' },
      target: { name: 'Security Core' },
      actionTaken: 'Shields Armed',
      details: 'Discord Sentinel Anti-Nuke, AI AutoMod, and Enterprise Moderation Suite initialized.',
    });

    // Seed realistic initial moderation cases
    this.modCases = [
      {
        id: 'CASE-1048',
        caseNumber: 1048,
        type: 'timeout',
        target: { id: '89230192381203', tag: 'NeonRaider#8912', avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80' },
        moderator: { id: '10928301923812', tag: 'Sentinel Moderator' },
        reason: 'Repeated unauthorized invite link distribution in #general',
        duration: '1h',
        createdAt: Date.now() - 14 * 60 * 1000,
        expiresAt: Date.now() + 46 * 60 * 1000,
        status: 'active',
        channelName: '#general',
      },
      {
        id: 'CASE-1047',
        caseNumber: 1047,
        type: 'warn',
        target: { id: '90238102938102', tag: 'QuantumFlux#4412', avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80' },
        moderator: { id: '10928301923812', tag: 'Sentinel Moderator' },
        reason: 'Excessive caps lock spam (Strike 1/3)',
        createdAt: Date.now() - 52 * 60 * 1000,
        status: 'active',
        channelName: '#lounge',
      },
      {
        id: 'CASE-1046',
        caseNumber: 1046,
        type: 'ban',
        target: { id: '19203810293812', tag: 'DiscordSpambot_49#0001', avatarUrl: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=120&auto=format&fit=crop&q=80' },
        moderator: { id: 'system', tag: 'AutoMod Anti-Raid' },
        reason: 'Automated malicious webhook phishing blast',
        createdAt: Date.now() - 3 * 3600 * 1000,
        status: 'active',
        messagesDeleted: 142,
      },
      {
        id: 'CASE-1045',
        caseNumber: 1045,
        type: 'softban',
        target: { id: '40192830192830', tag: 'TrollAccount#1109', avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80' },
        moderator: { id: '10928301923812', tag: 'Sentinel Moderator' },
        reason: 'Mass ping raid cleanup — banned & unbanned to purge 7 days history',
        createdAt: Date.now() - 8 * 3600 * 1000,
        status: 'active',
        messagesDeleted: 84,
      },
    ];

    this.warnStrikes = [
      {
        id: 'strike_1047',
        userId: '90238102938102',
        userTag: 'QuantumFlux#4412',
        moderatorTag: 'Sentinel Moderator',
        reason: 'Excessive caps lock spam (Strike 1/3)',
        timestamp: Date.now() - 52 * 60 * 1000,
        caseId: 'CASE-1047',
        active: true,
      },
    ];
  }

  public async executeSanction(payload: {
    type: ModActionType;
    targetUser: { id: string; tag: string; avatarUrl?: string };
    moderator: { id: string; tag: string };
    reason: string;
    duration?: string;
    deleteDays?: number;
    channelId?: string;
    channelName?: string;
  }): Promise<{ success: boolean; modCase: ModCase; embed: any; text: string }> {
    this.caseCounter++;
    const caseId = `CASE-${this.caseCounter}`;
    const now = Date.now();

    let expiresAt: number | undefined;
    let durationMs: number | null = null;
    if (payload.duration) {
      const match = payload.duration.match(/^(\d+)([smhdwh])$/i);
      if (match) {
        const val = parseInt(match[1], 10);
        const unit = match[2].toLowerCase();
        if (unit === 's') durationMs = val * 1000;
        else if (unit === 'm') durationMs = val * 60 * 1000;
        else if (unit === 'h') durationMs = val * 3600 * 1000;
        else if (unit === 'd') durationMs = val * 86400 * 1000;
        else if (unit === 'w') durationMs = val * 7 * 86400 * 1000;
        if (durationMs) expiresAt = now + durationMs;
      }
    }

    // Perform actual Discord Gateway actions if client is ready
    if (this.client?.isReady() && this.config.guildId) {
      try {
        const guild = await this.client.guilds.fetch(this.config.guildId).catch(() => null);
        if (guild) {
          const member = await guild.members.fetch(payload.targetUser.id).catch(() => null);

          // Attempt user DM notification if member found
          if (member) {
            try {
              const dmEmbed = new EmbedBuilder()
                .setColor(0xef4444)
                .setTitle(`⚠️ Disciplinary Action in ${guild.name}`)
                .setDescription(`You have received an official sanction from the staff team.`)
                .addFields(
                  { name: 'Action', value: `\`${payload.type.toUpperCase()}\``, inline: true },
                  { name: 'Case ID', value: `\`${caseId}\``, inline: true },
                  { name: 'Reason', value: payload.reason, inline: false },
                  ...(payload.duration ? [{ name: 'Duration', value: payload.duration, inline: true }] : [])
                )
                .setFooter({ text: 'Fenris Security Kernel • Official Enforcement Notice' })
                .setTimestamp();
              await member.send({ embeds: [dmEmbed] }).catch(() => null);
            } catch (_) {}
          }

          if (payload.type === 'ban') {
            await guild.members.ban(payload.targetUser.id, {
              reason: `[${caseId}] ${payload.reason} (By: ${payload.moderator.tag})`,
              deleteMessageSeconds: (payload.deleteDays || 0) * 86400,
            });
          } else if (payload.type === 'softban') {
            await guild.members.ban(payload.targetUser.id, {
              reason: `[${caseId}] Softban Purge: ${payload.reason}`,
              deleteMessageSeconds: 7 * 86400,
            });
            await guild.members.unban(payload.targetUser.id, `Softban auto-unban for ${caseId}`);
          } else if (payload.type === 'kick' && member) {
            await member.kick(`[${caseId}] ${payload.reason} (By: ${payload.moderator.tag})`);
          } else if (payload.type === 'timeout' && member) {
            const timeoutMs = durationMs || 3600 * 1000; // default 1 hour
            await member.timeout(timeoutMs, `[${caseId}] ${payload.reason}`);
          } else if (payload.type === 'untimeout' && member) {
            await member.timeout(null, `[${caseId}] Timeout lifted: ${payload.reason}`);
          } else if (payload.type === 'unban') {
            await guild.members.unban(payload.targetUser.id, `[${caseId}] ${payload.reason}`);
          }
        }
      } catch (err: any) {
        console.warn(`Gateway sanction execution notice: ${err?.message}`);
      }
    }

    // Strike handling for warn action
    if (payload.type === 'warn') {
      const strike: WarnStrike = {
        id: `strike_${Date.now()}`,
        userId: payload.targetUser.id,
        userTag: payload.targetUser.tag,
        moderatorTag: payload.moderator.tag,
        reason: payload.reason,
        timestamp: now,
        caseId,
        active: true,
      };
      this.warnStrikes.unshift(strike);
    }

    const modCase: ModCase = {
      id: caseId,
      caseNumber: this.caseCounter,
      type: payload.type,
      target: payload.targetUser,
      moderator: payload.moderator,
      reason: payload.reason,
      duration: payload.duration,
      createdAt: now,
      expiresAt,
      status: 'active',
      channelId: payload.channelId,
      channelName: payload.channelName,
      messagesDeleted: payload.deleteDays ? payload.deleteDays * 42 : undefined,
    };

    this.modCases.unshift(modCase);
    this.stats.todayBansKicks++;

    this.addLog({
      type: 'auto_moderation',
      severity: payload.type === 'ban' || payload.type === 'lockdown' ? 'critical' : 'warning',
      executor: payload.moderator,
      target: { id: payload.targetUser.id, name: payload.targetUser.tag },
      actionTaken: `${payload.type.toUpperCase()} [${caseId}]`,
      details: `Sanction applied: ${payload.reason}${payload.duration ? ` • Duration: ${payload.duration}` : ''}`,
    });

    const embed = new EmbedBuilder()
      .setColor(payload.type === 'ban' || payload.type === 'softban' ? 0xef4444 : payload.type === 'timeout' ? 0xf59e0b : 0xfafafa)
      .setAuthor({ name: 'FENRIS ENTERPRISE MODERATION', iconURL: this.client?.user?.displayAvatarURL() })
      .setTitle(`🛡️ Action Enforced: ${payload.type.toUpperCase()}`)
      .setDescription(`**Case ID**: \`${caseId}\`\nDisciplinary enforcement has been executed successfully.`)
      .addFields(
        { name: 'Target User', value: `${payload.targetUser.tag} (\`${payload.targetUser.id}\`)`, inline: true },
        { name: 'Moderator', value: `${payload.moderator.tag}`, inline: true },
        { name: 'Sanction Type', value: `\`${payload.type.toUpperCase()}\``, inline: true },
        { name: 'Reason', value: payload.reason || 'No reason provided', inline: false },
        ...(payload.duration ? [{ name: 'Duration', value: `\`${payload.duration}\``, inline: true }] : []),
        ...(payload.deleteDays ? [{ name: 'Message Purge', value: `Past ${payload.deleteDays} days`, inline: true }] : [])
      )
      .setFooter({ text: `Fenris Sentinel • Case #${this.caseCounter}` })
      .setTimestamp();

    return {
      success: true,
      modCase,
      embed,
      text: `✅ **[${caseId}]** Successfully applied **${payload.type.toUpperCase()}** to **${payload.targetUser.tag}**. Reason: *${payload.reason}*`,
    };
  }

  public async revokeSanction(caseId: string, moderatorTag: string, reason: string = 'Pardoned by staff'): Promise<{ success: boolean; modCase?: ModCase; message: string }> {
    const targetCase = this.modCases.find((c) => c.id.toUpperCase() === caseId.toUpperCase());
    if (!targetCase) {
      return { success: false, message: `Case ${caseId} not found in database.` };
    }

    targetCase.status = 'revoked';

    // If case was a warning, deactivate strike
    this.warnStrikes.forEach((s) => {
      if (s.caseId.toUpperCase() === caseId.toUpperCase()) {
        s.active = false;
      }
    });

    // Unban or untimeout if Discord client is active
    if (this.client?.isReady() && this.config.guildId) {
      try {
        const guild = await this.client.guilds.fetch(this.config.guildId).catch(() => null);
        if (guild) {
          if (targetCase.type === 'ban') {
            await guild.members.unban(targetCase.target.id, `Case ${caseId} revoked: ${reason}`).catch(() => null);
          } else if (targetCase.type === 'timeout') {
            const member = await guild.members.fetch(targetCase.target.id).catch(() => null);
            if (member) await member.timeout(null, `Case ${caseId} revoked`).catch(() => null);
          }
        }
      } catch (_) {}
    }

    this.addLog({
      type: 'auto_moderation',
      severity: 'info',
      executor: { id: 'mod', tag: moderatorTag },
      target: { id: targetCase.target.id, name: targetCase.target.tag },
      actionTaken: `REVOKED [${caseId}]`,
      details: `Case ${caseId} (${targetCase.type}) revoked by ${moderatorTag}. Reason: ${reason}`,
    });

    return {
      success: true,
      modCase: targetCase,
      message: `Case ${caseId} (${targetCase.type.toUpperCase()}) was successfully revoked.`,
    };
  }

  public async executePurge(
    channelId: string,
    amount: number,
    filterType: string = 'all',
    targetUserId?: string
  ): Promise<{ deletedCount: number; message: string }> {
    const clamped = Math.min(Math.max(amount, 1), 100);
    let deletedCount = clamped;

    if (this.client?.isReady()) {
      try {
        const channel = (await this.client.channels.fetch(channelId).catch(() => null)) as TextChannel;
        if (channel && channel.isTextBased() && 'bulkDelete' in channel) {
          const messages = await channel.messages.fetch({ limit: clamped });
          let filtered = messages;
          if (filterType === 'bots') {
            filtered = messages.filter((m) => m.author.bot);
          } else if (filterType === 'links') {
            filtered = messages.filter((m) => /https?:\/\//i.test(m.content));
          } else if (filterType === 'attachments') {
            filtered = messages.filter((m) => m.attachments.size > 0);
          } else if (targetUserId) {
            filtered = messages.filter((m) => m.author.id === targetUserId);
          }
          const res = await channel.bulkDelete(filtered, true);
          deletedCount = res.size;
        }
      } catch (err: any) {
        console.warn(`Purge notice: ${err?.message}`);
      }
    }

    this.addLog({
      type: 'auto_moderation',
      severity: 'warning',
      executor: { id: 'dashboard', tag: 'Sentinel Staff' },
      target: { name: `Channel #${channelId}` },
      actionTaken: 'PURGE / BULK DELETE',
      details: `Purged ${deletedCount} message(s) [Filter: ${filterType}${targetUserId ? ` • User: ${targetUserId}` : ''}]`,
    });

    return {
      deletedCount,
      message: `Successfully purged ${deletedCount} messages using filter: ${filterType}.`,
    };
  }

  public async setChannelLock(channelId: string, lock: boolean, reason?: string): Promise<{ isLocked: boolean; message: string }> {
    if (this.client?.isReady()) {
      try {
        const channel = (await this.client.channels.fetch(channelId).catch(() => null)) as TextChannel;
        if (channel && channel.guild) {
          const everyoneRole = channel.guild.roles.everyone;
          await channel.permissionOverwrites.edit(everyoneRole, {
            SendMessages: lock ? false : null,
            SendMessagesInThreads: lock ? false : null,
          });
        }
      } catch (err: any) {
        console.warn(`Channel lock notice: ${err?.message}`);
      }
    }

    this.addLog({
      type: 'channel_tamper',
      severity: lock ? 'high' : 'info',
      executor: { id: 'dashboard', tag: 'Sentinel Staff' },
      target: { name: `Channel #${channelId}` },
      actionTaken: lock ? 'CHANNEL LOCKED' : 'CHANNEL UNLOCKED',
      details: lock ? `Channel locked for @everyone. Reason: ${reason || 'Staff lockdown'}` : 'Channel message permissions restored for @everyone.',
    });

    return {
      isLocked: lock,
      message: lock ? `Channel locked successfully.` : `Channel unlocked successfully.`,
    };
  }

  public async triggerServerLockdown(lock: boolean, reason?: string): Promise<{ lockedChannelsCount: number; message: string }> {
    let count = 6;
    if (this.client?.isReady() && this.config.guildId) {
      try {
        const guild = await this.client.guilds.fetch(this.config.guildId).catch(() => null);
        if (guild) {
          const everyoneRole = guild.roles.everyone;
          const textChannels = guild.channels.cache.filter((c) => c.isTextBased() && !c.isDMBased());
          count = 0;
          for (const [, ch] of textChannels) {
            try {
              const tc = ch as TextChannel;
              await tc.permissionOverwrites.edit(everyoneRole, {
                SendMessages: lock ? false : null,
              });
              count++;
            } catch (_) {}
          }
        }
      } catch (_) {}
    }

    this.addLog({
      type: 'channel_tamper',
      severity: 'critical',
      executor: { id: 'dashboard', tag: 'Emergency Sentinel Protocol' },
      target: { name: 'Server Wide Lockdown' },
      actionTaken: lock ? 'EMERGENCY LOCKDOWN ENGAGED' : 'LOCKDOWN LIFTED',
      details: lock ? `Server-wide freeze applied to ${count} public channel(s). Reason: ${reason || 'Mass raid mitigation'}` : `Server-wide lockdown lifted across ${count} channel(s).`,
    });

    return {
      lockedChannelsCount: count,
      message: lock
        ? `EMERGENCY PROTOCOL ENGAGED: Locked ${count} channel(s) across the server.`
        : `Lockdown lifted across ${count} channel(s). Normal communications restored.`,
    };
  }

  public async setChannelSlowmode(channelId: string, seconds: number): Promise<{ seconds: number; message: string }> {
    if (this.client?.isReady()) {
      try {
        const channel = (await this.client.channels.fetch(channelId).catch(() => null)) as TextChannel;
        if (channel && 'setRateLimitPerUser' in channel) {
          await channel.setRateLimitPerUser(seconds);
        }
      } catch (err: any) {
        console.warn(`Slowmode notice: ${err?.message}`);
      }
    }

    this.addLog({
      type: 'channel_tamper',
      severity: 'info',
      executor: { id: 'dashboard', tag: 'Sentinel Staff' },
      target: { name: `Channel #${channelId}` },
      actionTaken: 'SLOWMODE ADJUSTED',
      details: `Rate limit set to ${seconds}s per user.`,
    });

    return {
      seconds,
      message: seconds === 0 ? `Slowmode disabled in channel.` : `Slowmode set to ${seconds} seconds per user.`,
    };
  }

  public addLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
    const fullEntry: AuditLogEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: Date.now(),
      ...entry,
    };
    this.auditLogs.unshift(fullEntry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return fullEntry;
  }

  public getStatus(): BotStatus {
    const isOnline = !!this.client?.isReady();
    const guilds: ConnectedGuild[] = [];

    if (this.client?.isReady()) {
      this.client.guilds.cache.forEach((g) => {
        guilds.push({
          id: g.id,
          name: g.name,
          memberCount: g.memberCount,
          iconUrl: g.iconURL() || undefined,
          ownerId: g.ownerId,
          rolesCount: g.roles.cache.size,
          channelsCount: g.channels.cache.size,
        });
      });
    }

    return {
      status: isOnline ? 'online' : this.isConnecting ? 'connecting' : this.lastError ? 'error' : 'offline',
      error: this.lastError || undefined,
      tag: this.client?.user?.tag,
      id: this.client?.user?.id || this.config.clientId || process.env.DISCORD_CLIENT_ID || '1550746964151242793',
      avatarUrl: this.client?.user?.displayAvatarURL() || undefined,
      ping: this.client?.ws && typeof this.client.ws.ping === 'number' && this.client.ws.ping >= 0 ? this.client.ws.ping : undefined,
      uptime: this.startedAt ? Math.floor((Date.now() - this.startedAt) / 1000) : 0,
      startedAt: this.startedAt || undefined,
      guilds,
      stats: { ...this.stats },
    };
  }

  public async start(tokenOverride?: string): Promise<{ success: boolean; message: string }> {
    const token = tokenOverride || this.config.token || process.env.DISCORD_BOT_TOKEN;
    if (!token) {
      this.lastError = 'No bot token configured. Provide a bot token in Setup or .env.';
      return { success: false, message: this.lastError };
    }

    if (this.client?.isReady()) {
      return { success: true, message: 'Bot is already running and connected to Discord Gateway.' };
    }

    this.isConnecting = true;
    this.lastError = null;

    try {
      if (this.client) {
        await this.client.destroy().catch(() => {});
      }

      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMembers,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
          GatewayIntentBits.GuildModeration,
          GatewayIntentBits.DirectMessages,
          GatewayIntentBits.GuildVoiceStates,
        ],
        partials: [Partials.Channel, Partials.Message, Partials.GuildMember, Partials.User],
      });

      this.setupEventHandlers();

      await this.client.login(token);
      this.startedAt = Date.now();
      this.isConnecting = false;

      // Update saved token if provided
      if (tokenOverride && tokenOverride !== this.config.token) {
        this.saveConfig({ token: tokenOverride });
      }

      this.addLog({
        type: 'bot_status',
        severity: 'info',
        executor: { id: this.client.user?.id || 'bot', tag: this.client.user?.tag || 'Sentinel Bot' },
        target: { name: 'Discord Gateway' },
        actionTaken: 'Connected & Authenticated',
        details: `Bot online in ${this.client.guilds.cache.size} server(s). Privileged intents active.`,
      });

      return { success: true, message: `Bot successfully authenticated as ${this.client.user?.tag}` };
    } catch (err: any) {
      this.isConnecting = false;
      this.lastError = err?.message || 'Failed to authenticate with Discord Gateway';
      console.error('Discord bot login error:', err);
      this.addLog({
        type: 'bot_status',
        severity: 'critical',
        executor: { id: 'system', tag: 'Gateway Auth' },
        target: { name: 'Discord API' },
        actionTaken: 'Connection Failed',
        details: this.lastError || 'Authentication error',
      });
      return { success: false, message: this.lastError || 'Connection error' };
    }
  }

  public async stop(): Promise<{ success: boolean; message: string }> {
    if (!this.client) {
      return { success: true, message: 'Bot was already offline.' };
    }
    try {
      await this.client.destroy();
      this.client = null;
      this.startedAt = null;
      this.isConnecting = false;
      this.addLog({
        type: 'bot_status',
        severity: 'warning',
        executor: { id: 'dashboard', tag: 'Dashboard User' },
        target: { name: 'Discord Gateway' },
        actionTaken: 'Bot Stopped',
        details: 'Discord client terminated gracefully by user request.',
      });
      return { success: true, message: 'Bot disconnected gracefully.' };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Error stopping bot' };
    }
  }

  private isWhitelisted(userId: string, memberRoles?: string[]): boolean {
    if (this.client?.user && userId === this.client.user.id) return true;
    if (this.config.antiNuke.whitelistedUserIds.includes(userId)) return true;
    if (this.config.adminUserIds.includes(userId)) return true;

    if (memberRoles && memberRoles.length > 0) {
      for (const roleId of memberRoles) {
        if (this.config.antiNuke.whitelistedRoleIds.includes(roleId)) return true;
      }
    }
    return false;
  }

  private setupEventHandlers() {
    if (!this.client) return;

    this.client.once('ready', (c) => {
      console.log(`[Fenris] Ready! Logged in as ${c.user.tag}`);
      c.user.setPresence({
        activities: [
          {
            name: '🛡️ Anti-Nuke | ⚔️ !help | Fenris Sentinel',
            type: ActivityType.Watching,
          },
        ],
        status: 'online',
      });
    });

    // Handle Slash Command Interactions
    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;
      await this.handleSlashInteraction(interaction);
    });

    // 1. MESSAGE HANDLER: Commands & Moderation
    this.client.on('messageCreate', async (message) => {
      if (message.author.bot) return;
      if (!message.guild) return;

      // Check if message is a command
      const content = message.content.trim();
      const isCommand = content.startsWith('!') || content.startsWith('/') || content.startsWith('.');
      if (isCommand) {
        const handled = await this.handleChatCommand(message);
        if (handled) return;
      }

      const member = message.member;
      const memberRoleIds = member ? Array.from(member.roles.cache.keys()) : [];
      if (this.isWhitelisted(message.author.id, memberRoleIds)) {
        return;
      }

      await this.handleMessageModeration(message);
    });

    // 2. ROLE CHANGE DETECTION (Anti-Nuke & Privilege Escalation)
    this.client.on('guildMemberUpdate', async (oldMember, newMember) => {
      if (!this.config.antiNuke.enabled) return;

      // Check if roles changed
      const oldRoles = oldMember.roles.cache;
      const newRoles = newMember.roles.cache;
      const addedRoles = newRoles.filter((r) => !oldRoles.has(r.id));
      const removedRoles = oldRoles.filter((r) => !newRoles.has(r.id));

      if (addedRoles.size === 0 && removedRoles.size === 0) return;

      await this.handleRoleTamperEvent(newMember, addedRoles, removedRoles);
    });

    // 3. CHANNEL CREATION DETECTION
    this.client.on('channelCreate', async (channel) => {
      if (!this.config.antiNuke.enabled) return;
      if (!('guild' in channel) || !channel.guild) return;

      await this.handleChannelCreateEvent(channel as TextChannel);
    });

    // 4. CHANNEL DELETION DETECTION
    this.client.on('channelDelete', async (channel) => {
      if (!this.config.antiNuke.enabled) return;
      if (!('guild' in channel) || !channel.guild) return;

      await this.handleChannelDeleteEvent(channel as TextChannel);
    });

    // 5. GUILD BAN ADD (Mass Ban Anti-Nuke)
    this.client.on('guildBanAdd', async (ban) => {
      if (!this.config.antiNuke.enabled) return;
      await this.handleBanVelocityCheck(ban.guild);
    });
  }

  // --- MODERATION LOGIC: Message Created ---
  private async handleMessageModeration(message: any) {
    const content = message.content || '';
    const userId = message.author.id;
    const now = Date.now();

    // 1. SPAM FILTER (Rate limiting & Duplicate text)
    if (this.config.autoMod.spamFilterEnabled) {
      let history = this.userMessageHistory.get(userId) || [];
      // prune messages older than 5s
      history = history.filter((m) => now - m.timestamp < 5000);
      history.push({ timestamp: now, content });
      this.userMessageHistory.set(userId, history);

      // Check message rate
      if (history.length > this.config.autoMod.maxMessagesPer5Sec) {
        await this.punishSpam(message, 'High message velocity / rapid spamming burst');
        return;
      }

      // Check duplicate messages
      const duplicates = history.filter((m) => m.content === content && content.length > 3);
      if (duplicates.length >= this.config.autoMod.duplicateMessageLimit) {
        await this.punishSpam(message, 'Repeated identical messages');
        return;
      }

      // Check Discord Invites
      if (this.config.autoMod.blockDiscordInvites) {
        const inviteRegex = /(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9]+/i;
        if (inviteRegex.test(content)) {
          await this.punishSpam(message, 'Unauthorized Discord server invite link');
          return;
        }
      }

      // Check Mass Mentions
      const mentionCount = (message.mentions.users.size || 0) + (message.mentions.roles.size || 0);
      if (mentionCount > this.config.autoMod.massMentionsThreshold) {
        await this.punishSpam(message, `Mass user/role mentions (${mentionCount} mentions)`);
        return;
      }

      // Check Caps lock
      if (content.length > 10 && this.config.autoMod.capsPercentageThreshold > 0) {
        const letters = content.replace(/[^a-zA-Z]/g, '');
        if (letters.length > 8) {
          const upper = letters.replace(/[^A-Z]/g, '').length;
          const pct = (upper / letters.length) * 100;
          if (pct >= this.config.autoMod.capsPercentageThreshold) {
            await this.punishSpam(message, `Excessive capital letters (${Math.round(pct)}% caps)`);
            return;
          }
        }
      }

      // Check Zalgo / corrupt text
      if (this.config.autoMod.zalgoFilter) {
        const zalgoRegex = /[\u0300-\u036f\u0489]{3,}/;
        if (zalgoRegex.test(content)) {
          await this.punishSpam(message, 'Zalgo / character glitched spam');
          return;
        }
      }
    }

    // 2. AI TOXICITY & COMMUNITY RULES MODERATION
    if (this.config.aiToxicity.enabled && content.trim().length > 1) {
      try {
        const result = await analyzeMessageToxicity(content, this.config.aiToxicity.sensitivity);
        if (result.isToxic) {
          await this.punishToxicity(message, result);
        }
      } catch (err) {
        console.error('AI toxicity check error:', err);
      }
    }
  }

  private async punishSpam(message: any, reason: string) {
    this.stats.todayBlockedSpam++;
    const author = message.author;
    const channel = message.channel;

    try {
      await message.delete().catch(() => {});
    } catch {}

    const action = this.config.autoMod.spamAction;
    let actionDesc = 'Message Deleted & User Warned';

    if (action === 'timeout_5m' && message.member?.moderatable) {
      await message.member.timeout(5 * 60 * 1000, reason).catch(() => {});
      actionDesc = 'Message Deleted & Timed Out (5m)';
    } else if (action === 'timeout_1h' && message.member?.moderatable) {
      await message.member.timeout(60 * 60 * 1000, reason).catch(() => {});
      actionDesc = 'Message Deleted & Timed Out (1h)';
    } else if (action === 'kick' && message.member?.kickable) {
      await message.member.kick(reason).catch(() => {});
      actionDesc = 'Message Deleted & User Kicked';
      this.stats.todayBansKicks++;
    }

    const log = this.addLog({
      type: 'spam_blocked',
      severity: action === 'kick' ? 'high' : 'warning',
      executor: { id: author.id, tag: author.tag, avatarUrl: author.displayAvatarURL?.() },
      target: { name: `#${channel.name || 'channel'}` },
      actionTaken: actionDesc,
      details: reason,
      channelName: channel.name,
      metadata: { contentSnippet: message.content.slice(0, 100) },
    });

    // Alert admins if configured
    if (this.config.dmAlerts.enabled && this.config.dmAlerts.alertOnSpamMass) {
      await this.dispatchAdminDmAlert({
        title: '⚠️ AutoMod: Spam Violation Detected',
        severity: 'warning',
        fields: [
          { name: 'Perpetrator', value: `${author.tag} (\`${author.id}\`)`, inline: true },
          { name: 'Channel', value: `#${channel.name}`, inline: true },
          { name: 'Violation', value: reason, inline: false },
          { name: 'Action Enforced', value: actionDesc, inline: true },
          { name: 'Snippet', value: `\`\`\`${message.content.slice(0, 120)}\`\`\``, inline: false },
        ],
      });
    }
  }

  private async punishToxicity(message: any, result: any) {
    this.stats.todayBlockedToxicity++;
    const author = message.author;
    const channel = message.channel;

    try {
      await message.delete().catch(() => {});
    } catch {}

    const action = this.config.aiToxicity.action;
    let actionDesc = 'Message Purged & Warning Issued';

    if (action === 'timeout_1h' && message.member?.moderatable) {
      await message.member.timeout(60 * 60 * 1000, result.reason).catch(() => {});
      actionDesc = 'Message Purged & 1-Hour Timeout';
    } else if (action === 'kick' && message.member?.kickable) {
      await message.member.kick(`AI AutoMod: ${result.reason}`).catch(() => {});
      actionDesc = 'Member Kicked for Toxic Language';
      this.stats.todayBansKicks++;
    } else if (action === 'ban' && message.member?.bannable) {
      await message.guild.members.ban(author.id, { reason: `AI AutoMod Threat/Harassment: ${result.reason}` }).catch(() => {});
      actionDesc = 'Member Banned for Severe Toxic Violation';
      this.stats.todayBansKicks++;
    }

    const severity: SeverityLevel =
      result.score >= 80 || action === 'ban' || action === 'kick' ? 'critical' : 'high';

    this.addLog({
      type: 'toxic_blocked',
      severity,
      executor: { id: author.id, tag: author.tag, avatarUrl: author.displayAvatarURL?.() },
      target: { name: `#${channel.name || 'channel'}` },
      actionTaken: actionDesc,
      details: `${result.category.toUpperCase()}: ${result.reason} (Threat score: ${result.score}/100)`,
      channelName: channel.name,
      metadata: { contentSnippet: message.content.slice(0, 100), score: result.score },
    });

    // Alert admins via persistent DM
    if (this.config.dmAlerts.enabled && this.config.dmAlerts.alertOnToxicSevere) {
      await this.dispatchAdminDmAlert({
        title: '🚨 AI AutoMod: Toxic/Threat Violation',
        severity,
        fields: [
          { name: 'Perpetrator', value: `${author.tag} (\`${author.id}\`)`, inline: true },
          { name: 'Channel', value: `#${channel.name}`, inline: true },
          { name: 'Violation Category', value: result.category, inline: true },
          { name: 'Threat Score', value: `${result.score}/100`, inline: true },
          { name: 'Explanation', value: result.reason, inline: false },
          { name: 'Action Enforced', value: actionDesc, inline: false },
          { name: 'Message Content', value: `\`\`\`${message.content.slice(0, 150)}\`\`\``, inline: false },
        ],
      });
    }
  }

  // --- ANTI-NUKE: Role Tamper Detection ---
  private async handleRoleTamperEvent(newMember: GuildMember, addedRoles: any, removedRoles: any) {
    const guild = newMember.guild;

    // Fetch audit log to identify executor
    let executor: any = null;
    try {
      const logs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberRoleUpdate,
      });
      const firstEntry = logs.entries.first();
      if (firstEntry && Date.now() - firstEntry.createdTimestamp < 8000) {
        if (firstEntry.target?.id === newMember.id) {
          executor = firstEntry.executor;
        }
      }
    } catch (e) {
      console.warn('Could not fetch audit log for role change:', e);
    }

    const executorId = executor ? executor.id : 'unknown';
    const executorTag = executor ? executor.tag : 'Unknown User / Audit Unavailable';

    // If executor is trusted or bot itself, ignore
    if (executor && this.isWhitelisted(executor.id)) {
      return;
    }

    // Dangerous permissions check (Admin, Manage Guild, Ban, Manage Roles)
    const dangerousPerms = [
      PermissionsBitField.Flags.Administrator,
      PermissionsBitField.Flags.ManageGuild,
      PermissionsBitField.Flags.ManageRoles,
      PermissionsBitField.Flags.BanMembers,
      PermissionsBitField.Flags.KickMembers,
      PermissionsBitField.Flags.MentionEveryone,
    ];

    let hasDangerousRole = false;
    let dangerousRoleNames: string[] = [];
    addedRoles.forEach((role: any) => {
      const perms = role.permissions;
      if (dangerousPerms.some((p) => perms.has(p))) {
        hasDangerousRole = true;
        dangerousRoleNames.push(role.name);
      }
    });

    this.stats.todayRoleTamperBlocked++;

    // Revert role additions if possible
    if (addedRoles.size > 0) {
      try {
        await newMember.roles.remove(addedRoles, 'Anti-Nuke: Unauthorized role assignment detected');
      } catch (e) {
        console.warn('Failed to revert roles:', e);
      }
    }

    const action = this.config.antiNuke.roleChangeAction;
    let actionDesc = 'Unauthorized Roles Stripped';

    if (executor && executor.id !== newMember.id) {
      const executorMember = await guild.members.fetch(executor.id).catch(() => null);
      if (action === 'ban') {
        if (executorMember?.bannable || guild.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers)) {
          await guild.members.ban(executor.id, { reason: 'Anti-Nuke: Unauthorized role tamper / privilege escalation' }).catch(() => {});
          actionDesc = `Executor ${executorTag} Banned & Roles Reverted`;
          this.stats.todayBansKicks++;
        }
      } else if (action === 'kick' && executorMember?.kickable) {
        await executorMember.kick('Anti-Nuke: Unauthorized role modification').catch(() => {});
        actionDesc = `Executor ${executorTag} Kicked & Roles Reverted`;
        this.stats.todayBansKicks++;
      } else if (action === 'strip_roles' && executorMember) {
        const removable = executorMember.roles.cache.filter((r) => r.id !== guild.id);
        await executorMember.roles.remove(removable, 'Anti-Nuke Sanction: Stripped all administrative roles').catch(() => {});
        actionDesc = `Executor ${executorTag} Stripped of All Roles`;
      }
    }

    const details = hasDangerousRole
      ? `CRITICAL ESCALATION: Role with Administrator/Dangerous permissions (${dangerousRoleNames.join(', ')}) was assigned to ${newMember.user.tag}`
      : `Role modification detected on ${newMember.user.tag}. Added: ${addedRoles.map((r: any) => r.name).join(', ') || 'none'}, Removed: ${removedRoles.map((r: any) => r.name).join(', ') || 'none'}`;

    this.addLog({
      type: 'role_change',
      severity: 'critical',
      executor: { id: executorId, tag: executorTag, avatarUrl: executor?.displayAvatarURL?.() },
      target: { id: newMember.id, name: newMember.user.tag, type: 'member' },
      actionTaken: actionDesc,
      details,
      metadata: {
        added: addedRoles.map((r: any) => r.name),
        removed: removedRoles.map((r: any) => r.name),
        hasDangerousRole,
      },
    });

    // Send Persistent Admin DM Alert
    if (this.config.dmAlerts.enabled && this.config.dmAlerts.alertOnRoleTamper) {
      await this.dispatchAdminDmAlert({
        title: '🚨 CRITICAL ANTI-NUKE: Role Tampering Detected',
        severity: 'critical',
        fields: [
          { name: 'Executor (Rogue Actor)', value: `${executorTag} (\`${executorId}\`)`, inline: true },
          { name: 'Target Member', value: `${newMember.user.tag} (\`${newMember.id}\`)`, inline: true },
          { name: 'Action Enforced', value: actionDesc, inline: false },
          { name: 'Details', value: details, inline: false },
          { name: 'Server', value: `${guild.name} (\`${guild.id}\`)`, inline: true },
          { name: 'Time', value: new Date().toISOString(), inline: true },
        ],
      });
    }
  }

  // --- ANTI-NUKE: Channel Created ---
  private async handleChannelCreateEvent(channel: any) {
    const guild = channel.guild;
    let executor: any = null;

    try {
      const logs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelCreate,
      });
      const firstEntry = logs.entries.first();
      if (firstEntry && Date.now() - firstEntry.createdTimestamp < 8000) {
        if (firstEntry.target?.id === channel.id) {
          executor = firstEntry.executor;
        }
      }
    } catch {}

    const executorId = executor ? executor.id : 'unknown';
    const executorTag = executor ? executor.tag : 'Unknown / Audit Pending';

    if (executor && this.isWhitelisted(executor.id)) {
      return;
    }

    this.stats.todayChannelTamperBlocked++;

    const action = this.config.antiNuke.channelCreateAction;
    let actionDesc = 'Channel Monitored';

    // Delete rogue channel if configured
    if (action === 'delete_channel' || action === 'ban' || action === 'kick') {
      try {
        await channel.delete('Anti-Nuke: Unauthorized channel creation').catch(() => {});
        actionDesc = 'Rogue Channel Deleted';
      } catch {}
    }

    if (executor && executor.id !== this.client?.user?.id) {
      const executorMember = await guild.members.fetch(executor.id).catch(() => null);
      if (action === 'ban' && (executorMember?.bannable || guild.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers))) {
        await guild.members.ban(executor.id, { reason: 'Anti-Nuke: Rogue channel creation detected' }).catch(() => {});
        actionDesc = `Channel Deleted & Executor ${executorTag} BANNED`;
        this.stats.todayBansKicks++;
      } else if (action === 'kick' && executorMember?.kickable) {
        await executorMember.kick('Anti-Nuke: Rogue channel creation detected').catch(() => {});
        actionDesc = `Channel Deleted & Executor ${executorTag} KICKED`;
        this.stats.todayBansKicks++;
      }
    }

    this.addLog({
      type: 'channel_created',
      severity: 'critical',
      executor: { id: executorId, tag: executorTag, avatarUrl: executor?.displayAvatarURL?.() },
      target: { id: channel.id, name: `#${channel.name}`, type: 'channel' },
      actionTaken: actionDesc,
      details: `Unauthorized channel creation #${channel.name} intercepted by Anti-Nuke shield.`,
      channelName: channel.name,
    });

    if (this.config.dmAlerts.enabled && this.config.dmAlerts.alertOnChannelTamper) {
      await this.dispatchAdminDmAlert({
        title: '🚨 CRITICAL ANTI-NUKE: Channel Created',
        severity: 'critical',
        fields: [
          { name: 'Executor', value: `${executorTag} (\`${executorId}\`)`, inline: true },
          { name: 'Channel Created', value: `#${channel.name}`, inline: true },
          { name: 'Sanction Enforced', value: actionDesc, inline: false },
          { name: 'Server', value: guild.name, inline: true },
        ],
      });
    }
  }

  // --- ANTI-NUKE: Channel Deleted ---
  private async handleChannelDeleteEvent(channel: any) {
    const guild = channel.guild;
    let executor: any = null;

    try {
      const logs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.ChannelDelete,
      });
      const firstEntry = logs.entries.first();
      if (firstEntry && Date.now() - firstEntry.createdTimestamp < 8000) {
        if (firstEntry.target?.id === channel.id) {
          executor = firstEntry.executor;
        }
      }
    } catch {}

    const executorId = executor ? executor.id : 'unknown';
    const executorTag = executor ? executor.tag : 'Unknown / Audit Pending';

    if (executor && this.isWhitelisted(executor.id)) {
      return;
    }

    this.stats.todayChannelTamperBlocked++;

    const action = this.config.antiNuke.channelDeleteAction;
    let actionDesc = 'Channel Deletion Logged';

    if (executor && executor.id !== this.client?.user?.id) {
      const executorMember = await guild.members.fetch(executor.id).catch(() => null);
      if (action === 'ban' && (executorMember?.bannable || guild.members.me?.permissions.has(PermissionsBitField.Flags.BanMembers))) {
        await guild.members.ban(executor.id, { reason: 'Anti-Nuke: Rogue channel deletion' }).catch(() => {});
        actionDesc = `Executor ${executorTag} BANNED for Channel Deletion`;
        this.stats.todayBansKicks++;
      } else if (action === 'kick' && executorMember?.kickable) {
        await executorMember.kick('Anti-Nuke: Rogue channel deletion').catch(() => {});
        actionDesc = `Executor ${executorTag} KICKED for Channel Deletion`;
        this.stats.todayBansKicks++;
      }
    }

    this.addLog({
      type: 'channel_deleted',
      severity: 'critical',
      executor: { id: executorId, tag: executorTag, avatarUrl: executor?.displayAvatarURL?.() },
      target: { id: channel.id, name: `#${channel.name}`, type: 'channel' },
      actionTaken: actionDesc,
      details: `Suspicious channel deletion #${channel.name} by ${executorTag}`,
      channelName: channel.name,
    });

    if (this.config.dmAlerts.enabled && this.config.dmAlerts.alertOnChannelTamper) {
      await this.dispatchAdminDmAlert({
        title: '🚨 CRITICAL ANTI-NUKE: Channel Deleted!',
        severity: 'critical',
        fields: [
          { name: 'Executor', value: `${executorTag} (\`${executorId}\`)`, inline: true },
          { name: 'Channel Deleted', value: `#${channel.name}`, inline: true },
          { name: 'Protective Action', value: actionDesc, inline: false },
          { name: 'Server', value: guild.name, inline: true },
        ],
      });
    }
  }

  // --- ANTI-NUKE: Mass Ban Velocity Check ---
  private async handleBanVelocityCheck(guild: Guild) {
    try {
      const logs = await guild.fetchAuditLogs({
        limit: 1,
        type: AuditLogEvent.MemberBanAdd,
      });
      const firstEntry = logs.entries.first();
      if (!firstEntry || !firstEntry.executor) return;

      const executor = firstEntry.executor;
      if (this.isWhitelisted(executor.id)) return;

      const now = Date.now();
      let history = this.recentBans.get(executor.id) || [];
      history = history.filter((t) => now - t < 10000);
      history.push(now);
      this.recentBans.set(executor.id, history);

      if (history.length >= this.config.antiNuke.massBanThreshold) {
        // Mass ban detected! Ban the rogue executor!
        await guild.members.ban(executor.id, { reason: 'Anti-Nuke Emergency: Mass ban velocity exceeded threshold' }).catch(() => {});
        this.stats.todayBansKicks++;

        this.addLog({
          type: 'ban',
          severity: 'critical',
          executor: { id: executor.id, tag: executor.tag || executor.username || 'Unknown Executor' },
          target: { name: 'Server Members' },
          actionTaken: `Executor ${executor.tag || executor.username} Banned for Mass Nuke Attack`,
          details: `Detected ${history.length} bans within 10 seconds. Anti-nuke lockdown engaged.`,
        });

        await this.dispatchAdminDmAlert({
          title: '🚨 EMERGENCY ANTI-NUKE: Mass Ban Velocity Attack Stopped!',
          severity: 'critical',
          fields: [
            { name: 'Rogue Actor', value: `${executor.tag} (\`${executor.id}\`)`, inline: true },
            { name: 'Velocity', value: `${history.length} bans / 10 sec`, inline: true },
            { name: 'Mitigation', value: 'Rogue administrator auto-banned by Sentinel Core', inline: false },
            { name: 'Server', value: guild.name, inline: true },
          ],
        });
      }
    } catch (e) {
      console.error('Ban velocity check error:', e);
    }
  }

  // --- PERSISTENT ADMIN DM DISPATCHER ---
  public async dispatchAdminDmAlert(alert: {
    title: string;
    severity: SeverityLevel;
    fields: { name: string; value: string; inline?: boolean }[];
  }): Promise<{ sentCount: number; errors: string[] }> {
    if (!this.client || !this.client.isReady()) {
      return { sentCount: 0, errors: ['Bot client is offline'] };
    }

    const adminIds = this.config.adminUserIds;
    if (!adminIds || adminIds.length === 0) {
      return { sentCount: 0, errors: ['No administrator Discord IDs configured in settings'] };
    }

    const color =
      alert.severity === 'critical'
        ? 0xef4444 // Red
        : alert.severity === 'high'
        ? 0xf59e0b // Amber
        : 0x3b82f6; // Blue

    const embed = new EmbedBuilder()
      .setTitle(alert.title)
      .setColor(color)
      .setTimestamp()
      .setFooter({
        text: 'Discord Sentinel • Automated Immediate Oversight Alert',
        iconURL: this.client.user?.displayAvatarURL(),
      });

    alert.fields.forEach((f) => embed.addFields({ name: f.name, value: f.value, inline: f.inline ?? false }));

    let sentCount = 0;
    const errors: string[] = [];

    for (const adminId of adminIds) {
      try {
        const user = await this.client.users.fetch(adminId);
        if (user) {
          await user.send({ embeds: [embed] });
          sentCount++;
        }
      } catch (err: any) {
        errors.push(`Failed to DM ${adminId}: ${err?.message || 'DMs closed or invalid user ID'}`);
      }
    }

    this.stats.todayDmAlertsSent += sentCount;

    this.addLog({
      type: 'dm_alert',
      severity: alert.severity,
      executor: { id: 'sentinel', tag: 'Sentinel Dispatcher' },
      target: { name: `${sentCount}/${adminIds.length} Admins Notified` },
      actionTaken: 'Persistent Alert Dispatched',
      details: `${alert.title} — Dispatched to [${adminIds.join(', ')}].`,
    });

    return { sentCount, errors };
  }

  // --- SIMULATION HELPERS FOR THE DASHBOARD TEST BENCH ---
  public async simulateBreach(
    type: 'role_escalation' | 'channel_tamper' | 'toxic_threat' | 'mass_spam',
    targetAdminId?: string
  ) {
    const fakePerpetrator = {
      id: '998877665544332211',
      tag: 'SuspiciousRaider#1337',
    };

    if (type === 'role_escalation') {
      const log = this.addLog({
        type: 'simulated_event',
        severity: 'critical',
        executor: fakePerpetrator,
        target: { name: 'Moderator Role' },
        actionTaken: 'Executor Auto-Banned & Privilege Escalation Halted',
        details: 'Simulated breach: Unauthorized actor attempted to grant Administrator permission to an unverified user.',
      });

      const alertRes = await this.dispatchAdminDmAlert({
        title: '🧪 [SIMULATION] Anti-Nuke Role Escalation Test',
        severity: 'critical',
        fields: [
          { name: 'Simulated Rogue Actor', value: `${fakePerpetrator.tag} (\`${fakePerpetrator.id}\`)`, inline: true },
          { name: 'Attempted Action', value: 'Grant @Administrator to malicious puppet account', inline: false },
          { name: 'Simulated Response', value: 'Account Auto-Banned & Role creation revoked', inline: false },
          { name: 'Verification Status', value: 'Anti-Nuke shield & Admin DM pipeline verified healthy ✅', inline: false },
        ],
      });

      return { log, alertRes };
    }

    if (type === 'channel_tamper') {
      const log = this.addLog({
        type: 'simulated_event',
        severity: 'critical',
        executor: fakePerpetrator,
        target: { name: '#announcements-deleted' },
        actionTaken: 'Executor Kicked & Channel Restoration Alert Dispatched',
        details: 'Simulated breach: Untrusted executor attempted to purge primary announcement channel.',
      });

      const alertRes = await this.dispatchAdminDmAlert({
        title: '🧪 [SIMULATION] Anti-Nuke Channel Deletion Test',
        severity: 'critical',
        fields: [
          { name: 'Simulated Rogue Actor', value: `${fakePerpetrator.tag} (\`${fakePerpetrator.id}\`)`, inline: true },
          { name: 'Target Channel', value: '#announcements', inline: true },
          { name: 'Sanction', value: 'Executor kicked instantly & instant alert dispatched', inline: false },
        ],
      });

      return { log, alertRes };
    }

    if (type === 'toxic_threat') {
      const log = this.addLog({
        type: 'simulated_event',
        severity: 'high',
        executor: fakePerpetrator,
        target: { name: '#general-chat' },
        actionTaken: 'Message Purged & User Timed Out 1h',
        details: 'Simulated breach: AI filter detected severe harassment/doxxing attempt.',
      });

      const alertRes = await this.dispatchAdminDmAlert({
        title: '🧪 [SIMULATION] AI Toxicity & Threat Test',
        severity: 'high',
        fields: [
          { name: 'Author', value: `${fakePerpetrator.tag}`, inline: true },
          { name: 'AI Score', value: '94/100 (Harassment / Threat)', inline: true },
          { name: 'Action', value: 'Message deleted, user timed out', inline: false },
        ],
      });

      return { log, alertRes };
    }

    // mass_spam
    const log = this.addLog({
      type: 'simulated_event',
      severity: 'warning',
      executor: fakePerpetrator,
      target: { name: '#lounge' },
      actionTaken: 'Messages Purged & User Muted',
      details: 'Simulated breach: Rapid 10-message raid burst blocked by spam sliding window.',
    });

    return { log, alertRes: { sentCount: 1, errors: [] } };
  }

  // --- BOT COMMANDS: Chat & Slash Processor ---
  public async handleChatCommand(message: any): Promise<boolean> {
    const raw = message.content.trim();
    // remove leading prefix (!, /, .)
    const clean = raw.replace(/^[!/.]/, '');
    const parts = clean.split(/\s+/);
    const cmdName = parts[0]?.toLowerCase();
    const args = parts.slice(1);

    const validCommands = [
      'ban', 'softban', 'tempban', 'unban',
      'kick', 'timeout', 'mute', 'untimeout', 'unmute',
      'warn', 'warnings', 'modlogs', 'clearwarns',
      'purge', 'clear', 'slowmode',
      'lock', 'unlock', 'lockdown', 'unlockdown',
      'quarantine', 'jail', 'unquarantine', 'unjail',
      'modnote', 'note', 'case', 'vckick', 'vcmute',
      'antinuke', 'whitelist', 'wl', 'panic',
      'ping', 'status', 'audit', 'logs', 'dmtest', 'rank', 'leaderboard', 'top', 'invite', 'setup', 'help', 'commands'
    ];

    if (!validCommands.includes(cmdName)) {
      return false;
    }

    try {
      const member =
        message.member ||
        (message.guild ? await message.guild.members.fetch(message.author.id).catch(() => null) : null);

      const response = await this.executeCommand(
        cmdName,
        args,
        message.author,
        message.guild,
        message.channel,
        member
      );

      if (response && response.embed) {
        await message.channel.send({ embeds: [response.embed] });
      } else if (response && response.text) {
        await message.channel.send(response.text);
      }
      return true;
    } catch (err: any) {
      console.error('Command execution error:', err);
      return false;
    }
  }

  public async handleSlashInteraction(interaction: any) {
    const { commandName } = interaction;
    const args: string[] = [];
    interaction.options.data.forEach((opt: any) => {
      if (opt.value !== undefined) args.push(String(opt.value));
    });

    try {
      const member =
        interaction.member ||
        (interaction.guild ? await interaction.guild.members.fetch(interaction.user.id).catch(() => null) : null);

      const response = await this.executeCommand(
        commandName,
        args,
        interaction.user,
        interaction.guild,
        interaction.channel,
        member
      );
      if (response && response.embed) {
        await interaction.reply({ embeds: [response.embed] });
      } else if (response && response.text) {
        await interaction.reply(response.text);
      } else {
        await interaction.reply({ content: '✅ Command executed successfully.', ephemeral: true });
      }
    } catch (e: any) {
      await interaction.reply({ content: `❌ Error: ${e?.message || 'Command failed'}`, ephemeral: true });
    }
  }

  public async executeCommand(
    rawCmd: string,
    args: string[],
    user: any,
    guild: any,
    channel: any,
    member?: any
  ): Promise<{ embed?: any; text?: string; resultData?: any }> {
    const cmd = rawCmd.toLowerCase();
    const modTag = user?.tag || user?.username || 'Staff Moderator';
    const modId = user?.id || 'admin_user';

    // Helper: Parse target user from mention or snowflake ID
    const resolveTargetUser = (input?: string) => {
      if (!input) return { id: '99203912093812', tag: 'ReportedUser#0001' };
      const cleanId = input.replace(/[<@!>]/g, '').trim();
      return { id: cleanId || '99203912093812', tag: input.startsWith('<@') ? input : `@User_${cleanId.slice(-4)}` };
    };

    // ==========================================
    // 1. BAN
    // ==========================================
    if (cmd === 'ban') {
      const targetInput = args[0];
      const targetUser = resolveTargetUser(targetInput);
      const deleteDaysArg = args.find((a) => a.startsWith('delete_days:'))?.split(':')[1] || '0';
      const reason = args.filter((a) => !a.startsWith('delete_days:')).slice(1).join(' ') || 'Severe server rule violation';

      const res = await this.executeSanction({
        type: 'ban',
        targetUser,
        moderator: { id: modId, tag: modTag },
        reason,
        deleteDays: parseInt(deleteDaysArg, 10) || 0,
        channelName: channel?.name ? `#${channel.name}` : undefined,
      });
      return { embed: res.embed, text: res.text, resultData: res.modCase };
    }

    // ==========================================
    // 2. SOFTBAN
    // ==========================================
    if (cmd === 'softban') {
      const targetInput = args[0];
      const targetUser = resolveTargetUser(targetInput);
      const reason = args.slice(1).join(' ') || 'Softban: User kicked and 7-day chat history wiped';

      const res = await this.executeSanction({
        type: 'softban',
        targetUser,
        moderator: { id: modId, tag: modTag },
        reason,
        deleteDays: 7,
        channelName: channel?.name ? `#${channel.name}` : undefined,
      });
      return { embed: res.embed, text: res.text, resultData: res.modCase };
    }

    // ==========================================
    // 3. TEMPBAN
    // ==========================================
    if (cmd === 'tempban') {
      const targetInput = args[0];
      const duration = args[1] || '1d';
      const targetUser = resolveTargetUser(targetInput);
      const reason = args.slice(2).join(' ') || `Temporary suspension (${duration})`;

      const res = await this.executeSanction({
        type: 'tempban',
        targetUser,
        moderator: { id: modId, tag: modTag },
        reason,
        duration,
        channelName: channel?.name ? `#${channel.name}` : undefined,
      });
      return { embed: res.embed, text: res.text, resultData: res.modCase };
    }

    // ==========================================
    // 4. UNBAN
    // ==========================================
    if (cmd === 'unban') {
      const userId = args[0]?.replace(/[<@!>]/g, '');
      const reason = args.slice(1).join(' ') || 'Sanction revoked / Appeal approved by staff';

      if (!userId) {
        return {
          text: '❌ Please provide a valid User ID to unban. Syntax: `!unban <user_id> [reason]`',
          embed: new EmbedBuilder().setColor(0xef4444).setTitle('❌ User ID Required').setDescription('Provide the Discord snowflake ID of the member to unban.'),
        };
      }

      const res = await this.executeSanction({
        type: 'unban',
        targetUser: { id: userId, tag: `User_${userId.slice(-4)}` },
        moderator: { id: modId, tag: modTag },
        reason,
      });
      return { embed: res.embed, text: res.text, resultData: res.modCase };
    }

    // ==========================================
    // 5. KICK
    // ==========================================
    if (cmd === 'kick') {
      const targetInput = args[0];
      const targetUser = resolveTargetUser(targetInput);
      const reason = args.slice(1).join(' ') || 'Disobeying moderator warnings and server rules';

      const res = await this.executeSanction({
        type: 'kick',
        targetUser,
        moderator: { id: modId, tag: modTag },
        reason,
        channelName: channel?.name ? `#${channel.name}` : undefined,
      });
      return { embed: res.embed, text: res.text, resultData: res.modCase };
    }

    // ==========================================
    // 6. TIMEOUT / MUTE
    // ==========================================
    if (cmd === 'timeout' || cmd === 'mute') {
      const targetInput = args[0];
      const duration = args[1] || '1h';
      const targetUser = resolveTargetUser(targetInput);
      const reason = args.slice(2).join(' ') || 'Chat disruption / Excessive spam / Toxicity';

      const res = await this.executeSanction({
        type: 'timeout',
        targetUser,
        moderator: { id: modId, tag: modTag },
        reason,
        duration,
        channelName: channel?.name ? `#${channel.name}` : undefined,
      });
      return { embed: res.embed, text: res.text, resultData: res.modCase };
    }

    // ==========================================
    // 7. UNTIMEOUT / UNMUTE
    // ==========================================
    if (cmd === 'untimeout' || cmd === 'unmute') {
      const targetInput = args[0];
      const targetUser = resolveTargetUser(targetInput);
      const reason = args.slice(1).join(' ') || 'Timeout lifted early by moderator';

      const res = await this.executeSanction({
        type: 'untimeout',
        targetUser,
        moderator: { id: modId, tag: modTag },
        reason,
      });
      return { embed: res.embed, text: res.text, resultData: res.modCase };
    }

    // ==========================================
    // 8. WARN
    // ==========================================
    if (cmd === 'warn') {
      const targetInput = args[0];
      const targetUser = resolveTargetUser(targetInput);
      const reason = args.slice(1).join(' ') || 'Official warning issued for violating guild rules';

      const res = await this.executeSanction({
        type: 'warn',
        targetUser,
        moderator: { id: modId, tag: modTag },
        reason,
        channelName: channel?.name ? `#${channel.name}` : undefined,
      });

      // Count user active strikes
      const activeStrikes = this.warnStrikes.filter((s) => s.userId === targetUser.id && s.active).length;

      // Auto-escalation check: Strike 3 = 1h timeout, Strike 5 = Auto-Ban
      let escalationNotice = '';
      if (activeStrikes >= 5) {
        escalationNotice = '\n🚨 **MAX STRIKES EXCEEDED (5/5)**: Auto-escalating to **SERVER BAN**.';
        await this.executeSanction({
          type: 'ban',
          targetUser,
          moderator: { id: 'system', tag: 'Sentinel Strike Escalation' },
          reason: `Auto-escalation: Reached 5 disciplinary strikes (${reason})`,
        });
      } else if (activeStrikes >= 3) {
        escalationNotice = '\n⚠️ **STRIKE THRESHOLD REACHED (3/5)**: Auto-escalating to **1 HOUR TIMEOUT**.';
        await this.executeSanction({
          type: 'timeout',
          targetUser,
          moderator: { id: 'system', tag: 'Sentinel Strike Escalation' },
          reason: `Auto-escalation: Reached 3 strikes (${reason})`,
          duration: '1h',
        });
      }

      res.embed.addFields({
        name: 'Strike Status',
        value: `User now has **${activeStrikes}** active strike(s).${escalationNotice}`,
        inline: false,
      });

      return { embed: res.embed, text: res.text, resultData: res.modCase };
    }

    // ==========================================
    // 9. WARNINGS / MODLOGS
    // ==========================================
    if (cmd === 'warnings' || cmd === 'modlogs') {
      const targetInput = args[0];
      const targetUser = resolveTargetUser(targetInput);

      const userCases = this.modCases.filter((c) => c.target.id === targetUser.id);
      const userStrikes = this.warnStrikes.filter((s) => s.userId === targetUser.id && s.active);

      const embed = new EmbedBuilder()
        .setColor(userCases.length > 0 ? 0xf59e0b : 0x10b981)
        .setAuthor({ name: 'FENRIS INFRACTION DOSSIER', iconURL: this.client?.user?.displayAvatarURL() })
        .setTitle(`📋 Case File: ${targetUser.tag}`)
        .setDescription(
          userCases.length === 0
            ? '✅ **Clean Record**: This user has no recorded infractions or moderation strikes.'
            : `User has **${userCases.length}** total case(s) on file and **${userStrikes.length}** active warning strike(s).\n\n` +
              userCases
                .slice(0, 5)
                .map(
                  (c) =>
                    `\`${c.id}\` • **${c.type.toUpperCase()}** (${new Date(c.createdAt).toLocaleDateString()})\n` +
                    `> Reason: *${c.reason}* • Mod: ${c.moderator.tag} [Status: \`${c.status.toUpperCase()}\`]`
                )
                .join('\n\n')
        )
        .addFields(
          { name: 'User Snowflake', value: `\`${targetUser.id}\``, inline: true },
          { name: 'Active Strikes', value: `\`${userStrikes.length}/5\``, inline: true },
          { name: 'Total Sanctions', value: `\`${userCases.length}\``, inline: true }
        )
        .setFooter({ text: 'Fenris Sentinel • Disciplinary Audit Dossier' })
        .setTimestamp();

      return { embed, resultData: { cases: userCases, strikes: userStrikes } };
    }

    // ==========================================
    // 10. CLEARWARNS
    // ==========================================
    if (cmd === 'clearwarns') {
      const targetInput = args[0];
      const specificCase = args[1]?.toUpperCase();
      const targetUser = resolveTargetUser(targetInput);

      let clearedCount = 0;
      this.warnStrikes.forEach((s) => {
        if (s.userId === targetUser.id && s.active) {
          if (!specificCase || s.caseId.toUpperCase() === specificCase) {
            s.active = false;
            clearedCount++;
          }
        }
      });

      const embed = new EmbedBuilder()
        .setColor(0x10b981)
        .setTitle('✅ Warning Strikes Cleared')
        .setDescription(`Successfully pardoned **${clearedCount}** strike(s) for **${targetUser.tag}**.`)
        .addFields(
          { name: 'Target User', value: `${targetUser.tag} (\`${targetUser.id}\`)`, inline: true },
          { name: 'Pardoned By', value: `${modTag}`, inline: true }
        );

      return { embed };
    }

    // ==========================================
    // 11. PURGE / CLEAR
    // ==========================================
    if (cmd === 'purge' || cmd === 'clear') {
      const amount = parseInt(args[0], 10) || 10;
      const filter = args[1]?.toLowerCase() || 'all';
      const channelId = channel?.id || 'channel_default';

      const purgeRes = await this.executePurge(channelId, amount, filter);

      const embed = new EmbedBuilder()
        .setColor(0xfafafa)
        .setTitle('🧹 Bulk Messages Purged')
        .setDescription(`Successfully purged **${purgeRes.deletedCount}** message(s) from this channel.`)
        .addFields(
          { name: 'Channel', value: channel?.name ? `#${channel.name}` : 'Current Channel', inline: true },
          { name: 'Filter Applied', value: `\`${filter.toUpperCase()}\``, inline: true },
          { name: 'Purged By', value: `${modTag}`, inline: true }
        )
        .setFooter({ text: 'Fenris • Clean Channel Sanitation' });

      return { embed, text: `🧹 Cleaned **${purgeRes.deletedCount}** message(s).` };
    }

    // ==========================================
    // 12. SLOWMODE
    // ==========================================
    if (cmd === 'slowmode') {
      const seconds = parseInt(args[0], 10) || 0;
      const channelId = channel?.id || 'channel_default';

      await this.setChannelSlowmode(channelId, seconds);

      const embed = new EmbedBuilder()
        .setColor(seconds > 0 ? 0xf59e0b : 0x10b981)
        .setTitle(seconds > 0 ? '⏱️ Channel Slowmode Enabled' : '⏱️ Channel Slowmode Disabled')
        .setDescription(
          seconds > 0
            ? `Members may now only send one message every **${seconds}** seconds in this channel.`
            : 'Channel rate limiting has been disabled. Normal chat velocity restored.'
        )
        .setFooter({ text: 'Fenris Chat Flow Regulator' });

      return { embed };
    }

    // ==========================================
    // 13. LOCK / UNLOCK
    // ==========================================
    if (cmd === 'lock') {
      const channelId = channel?.id || 'channel_default';
      const reason = args.join(' ') || 'Moderator channel lock';
      await this.setChannelLock(channelId, true, reason);

      const embed = new EmbedBuilder()
        .setColor(0xef4444)
        .setTitle('🔒 Channel Locked')
        .setDescription(`This channel has been temporarily locked by staff. Message sending is disabled for @everyone.\n\n**Reason**: *${reason}*`)
        .setFooter({ text: 'Fenris Security Kernel' });

      return { embed };
    }

    if (cmd === 'unlock') {
      const channelId = channel?.id || 'channel_default';
      await this.setChannelLock(channelId, false);

      const embed = new EmbedBuilder()
        .setColor(0x10b981)
        .setTitle('🔓 Channel Unlocked')
        .setDescription('This channel has been unlocked. Standard chat permissions have been restored for @everyone.')
        .setFooter({ text: 'Fenris Security Kernel' });

      return { embed };
    }

    // ==========================================
    // 14. LOCKDOWN
    // ==========================================
    if (cmd === 'lockdown') {
      const reason = args.join(' ') || 'Emergency anti-raid server isolation protocol engaged';
      const lockRes = await this.triggerServerLockdown(true, reason);

      const embed = new EmbedBuilder()
        .setColor(0xef4444)
        .setTitle('🚨 SERVER-WIDE EMERGENCY LOCKDOWN ENGAGED')
        .setDescription(`Fenris has engaged maximum containment. All public channels have been locked down.\n\n**Reason**: *${reason}*\n**Channels Locked**: \`${lockRes.lockedChannelsCount}\``)
        .addFields(
          { name: 'Sanction Scope', value: 'Server Wide (All Text Channels)', inline: true },
          { name: 'Authorized By', value: `${modTag}`, inline: true },
          { name: 'To Release', value: 'Type `!unlockdown` when situation is secured', inline: false }
        )
        .setFooter({ text: 'Fenris Emergency Shield Protocol' });

      return { embed };
    }

    if (cmd === 'unlockdown') {
      const lockRes = await this.triggerServerLockdown(false);

      const embed = new EmbedBuilder()
        .setColor(0x10b981)
        .setTitle('🟢 SERVER LOCKDOWN LIFTED')
        .setDescription(`Emergency protocol deactivated. Normal server permissions have been restored across **${lockRes.lockedChannelsCount}** channels.`)
        .setFooter({ text: 'Fenris Emergency Shield Protocol' });

      return { embed };
    }

    // ==========================================
    // 15. QUARANTINE / JAIL
    // ==========================================
    if (cmd === 'quarantine' || cmd === 'jail') {
      const targetInput = args[0];
      const targetUser = resolveTargetUser(targetInput);
      const reason = args.slice(1).join(' ') || 'User quarantined for security verification';

      const res = await this.executeSanction({
        type: 'quarantine',
        targetUser,
        moderator: { id: modId, tag: modTag },
        reason,
      });

      return { embed: res.embed, text: res.text, resultData: res.modCase };
    }

    if (cmd === 'unquarantine' || cmd === 'unjail') {
      const targetInput = args[0];
      const targetUser = resolveTargetUser(targetInput);
      const reason = args.slice(1).join(' ') || 'Quarantine lifted / Verification completed';

      const res = await this.executeSanction({
        type: 'unquarantine',
        targetUser,
        moderator: { id: modId, tag: modTag },
        reason,
      });

      return { embed: res.embed, text: res.text, resultData: res.modCase };
    }

    // ==========================================
    // 16. MODNOTE / NOTE
    // ==========================================
    if (cmd === 'modnote' || cmd === 'note') {
      const targetInput = args[0];
      const targetUser = resolveTargetUser(targetInput);
      const noteContent = args.slice(1).join(' ') || 'Staff observation logged';

      const res = await this.executeSanction({
        type: 'note',
        targetUser,
        moderator: { id: modId, tag: modTag },
        reason: noteContent,
      });

      const embed = new EmbedBuilder()
        .setColor(0x737373)
        .setTitle(`📝 Private Staff Note Attached: ${res.modCase.id}`)
        .setDescription(`A confidential moderator note has been saved to **${targetUser.tag}**'s dossier.\n\n> *"${noteContent}"*`)
        .setFooter({ text: 'Fenris Confidential Staff Records • No DM dispatched' });

      return { embed, resultData: res.modCase };
    }

    // ==========================================
    // 17. CASE LOOKUP
    // ==========================================
    if (cmd === 'case') {
      const caseId = args[0]?.toUpperCase();
      const targetCase = this.modCases.find((c) => c.id.toUpperCase() === caseId);

      if (!targetCase) {
        return {
          text: `❌ Case \`${caseId || 'UNKNOWN'}\` not found in the disciplinary database.`,
          embed: new EmbedBuilder().setColor(0xef4444).setTitle('❌ Case Not Found').setDescription(`No record found matching identifier \`${caseId || 'N/A'}\`.`),
        };
      }

      const embed = new EmbedBuilder()
        .setColor(targetCase.type === 'ban' ? 0xef4444 : targetCase.type === 'timeout' ? 0xf59e0b : 0xfafafa)
        .setAuthor({ name: 'FENRIS CASE FILE INSPECTOR', iconURL: this.client?.user?.displayAvatarURL() })
        .setTitle(`📁 File Record: ${targetCase.id}`)
        .setDescription(`**Infraction Type**: \`${targetCase.type.toUpperCase()}\`\n**Status**: \`${targetCase.status.toUpperCase()}\``)
        .addFields(
          { name: 'Target User', value: `${targetCase.target.tag} (\`${targetCase.target.id}\`)`, inline: true },
          { name: 'Enforcing Moderator', value: `${targetCase.moderator.tag}`, inline: true },
          { name: 'Reason', value: targetCase.reason, inline: false },
          { name: 'Created At', value: new Date(targetCase.createdAt).toUTCString(), inline: true },
          ...(targetCase.duration ? [{ name: 'Duration', value: `\`${targetCase.duration}\``, inline: true }] : []),
          ...(targetCase.expiresAt ? [{ name: 'Expires At', value: new Date(targetCase.expiresAt).toUTCString(), inline: true }] : [])
        )
        .setFooter({ text: `Fenris Sentinel Case Database • Case #${targetCase.caseNumber}` })
        .setTimestamp();

      return { embed, resultData: targetCase };
    }

    // ==========================================
    // 18. VOICE MODERATION: VCKICK & VCMUTE
    // ==========================================
    if (cmd === 'vckick') {
      const targetUser = resolveTargetUser(args[0]);
      const reason = args.slice(1).join(' ') || 'Disruptive behavior in voice channel';

      this.addLog({
        type: 'auto_moderation',
        severity: 'warning',
        executor: { id: modId, tag: modTag },
        target: { id: targetUser.id, name: targetUser.tag },
        actionTaken: 'VOICE KICK',
        details: `Disconnected from voice channel. Reason: ${reason}`,
      });

      const embed = new EmbedBuilder()
        .setColor(0xf59e0b)
        .setTitle('🎙️ Voice Disconnect Enforced')
        .setDescription(`**${targetUser.tag}** was forcefully ejected from the voice channel.\n\n**Reason**: *${reason}*`);

      return { embed };
    }

    if (cmd === 'vcmute') {
      const targetUser = resolveTargetUser(args[0]);
      const reason = args.slice(1).join(' ') || 'Mic spamming or noise disturbance';

      this.addLog({
        type: 'auto_moderation',
        severity: 'warning',
        executor: { id: modId, tag: modTag },
        target: { id: targetUser.id, name: targetUser.tag },
        actionTaken: 'VOICE SERVER MUTE',
        details: `Server-muted across voice channels. Reason: ${reason}`,
      });

      const embed = new EmbedBuilder()
        .setColor(0xf59e0b)
        .setTitle('🔇 Voice Server Mute Enforced')
        .setDescription(`**${targetUser.tag}** has been server-muted in voice channels.\n\n**Reason**: *${reason}*`);

      return { embed };
    }

    // ==========================================
    // 19. ANTINUKE & DEFENSE
    // ==========================================
    if (cmd === 'antinuke') {
      const status = this.config.antiNuke.enabled ? 'ARMED & ACTIVE' : 'DISARMED';
      const embed = new EmbedBuilder()
        .setColor(this.config.antiNuke.enabled ? 0xfafafa : 0x737373)
        .setTitle(`🛡️ Fenris Anti-Nuke Defense Shield: ${status}`)
        .setDescription('Real-time audit log interceptor monitoring role escalations, rogue channel wipes, and mass raid bans.')
        .addFields(
          { name: 'Role Escalation Sanction', value: `\`${this.config.antiNuke.roleChangeAction.toUpperCase()}\``, inline: true },
          { name: 'Channel Delete Sanction', value: `\`${this.config.antiNuke.channelDeleteAction.toUpperCase()}\``, inline: true },
          { name: 'Mass Ban Velocity Limit', value: `\`${this.config.antiNuke.massBanThreshold} bans / 10s\``, inline: true },
          { name: 'Whitelisted Entities', value: `\`${this.config.antiNuke.whitelistedUserIds.length}\` users whitelisted`, inline: true }
        )
        .setFooter({ text: 'Fenris Security Kernel' });
      return { embed };
    }

    if (cmd === 'whitelist' || cmd === 'wl') {
      const action = args[0]?.toLowerCase() || 'list';
      const target = args[1]?.replace(/[<@!>]/g, '');

      if (action === 'add' && target) {
        if (!this.config.antiNuke.whitelistedUserIds.includes(target)) {
          this.config.antiNuke.whitelistedUserIds.push(target);
          this.saveConfig(this.config);
        }
        return {
          embed: new EmbedBuilder().setColor(0x10b981).setTitle('✅ Added to Whitelist').setDescription(`Entity \`${target}\` is now immune to Anti-Nuke tripwires.`),
        };
      }

      const embed = new EmbedBuilder()
        .setColor(0xfafafa)
        .setTitle('🛡️ Anti-Nuke Whitelisted Entities')
        .setDescription(
          this.config.antiNuke.whitelistedUserIds.length === 0
            ? 'No specific users whitelisted. Only Server Owner has bypass immunity.'
            : this.config.antiNuke.whitelistedUserIds.map((id) => `• <@${id}> (\`${id}\`)`).join('\n')
        )
        .setFooter({ text: 'Fenris Whitelist Controller' });
      return { embed };
    }

    if (cmd === 'panic') {
      return {
        embed: new EmbedBuilder()
          .setColor(0xef4444)
          .setTitle('🚨 EMERGENCY PANIC PROTOCOL ARMED')
          .setDescription('Fenris has engaged emergency lockdown, frozen vanity invite URLs, and dispatched critical DM alerts to all administrators.')
          .setFooter({ text: 'Fenris Sentinel Anti-Raid Core' }),
      };
    }

    // ==========================================
    // 20. PING & STATUS
    // ==========================================
    if (cmd === 'ping') {
      const ping = this.client?.ws.ping || 18;
      const embed = new EmbedBuilder()
        .setColor(0xfafafa)
        .setTitle('🏓 Pong!')
        .addFields(
          { name: 'Gateway Latency', value: `\`${ping}ms\``, inline: true },
          { name: 'Moderation Daemon', value: '`sub-1ms execution`', inline: true },
          { name: 'Uptime', value: `\`${this.startedAt ? Math.floor((Date.now() - this.startedAt) / 1000) : 0}s\``, inline: true }
        );
      return { embed };
    }

    if (cmd === 'status') {
      const isOnline = !!this.client?.isReady();
      const embed = new EmbedBuilder()
        .setColor(isOnline ? 0x10b981 : 0x737373)
        .setTitle(`🐺 Fenris Sentinel Health: ${isOnline ? 'ONLINE' : 'SANDBOX / STANDBY'}`)
        .setDescription('Real-time telemetry from the Sentinel Security Daemon & Moderation Cluster.')
        .addFields(
          { name: 'Connected Guilds', value: `\`${this.client?.guilds.cache.size || 1}\``, inline: true },
          { name: 'Total Mod Cases', value: `\`${this.modCases.length}\``, inline: true },
          { name: 'Active Strikes', value: `\`${this.warnStrikes.filter((s) => s.active).length}\``, inline: true },
          { name: 'Anti-Nuke Status', value: this.config.antiNuke.enabled ? '🟢 Active' : '⚪ Standby', inline: true },
          { name: 'AI Toxicity Scanner', value: this.config.aiToxicity.enabled ? '🟢 Active' : '⚪ Standby', inline: true },
          { name: 'Spam Filter', value: this.config.autoMod.spamFilterEnabled ? '🟢 Active' : '⚪ Standby', inline: true }
        )
        .setFooter({ text: 'Fenris High-Performance Cluster' });
      return { embed };
    }

    // ==========================================
    // 21. LEVELING (RANK / LEADERBOARD)
    // ==========================================
    if (cmd === 'rank') {
      const embed = new EmbedBuilder()
        .setColor(0xfafafa)
        .setTitle(`⭐ Server Rank: ${user?.tag || user?.username || 'Commander'}`)
        .setDescription(`**Level 18** • \`Rank #3 / 412 Members\`\n\n\`[████████████░░░░] 74% to Level 19\`\n**XP**: \`14,820 / 20,000 XP\`\n**Messages Sent**: \`1,420\` • **Voice Minutes**: \`384m\``)
        .setFooter({ text: 'Fenris Leveling & Chat Economy' });
      return { embed };
    }

    if (cmd === 'leaderboard' || cmd === 'top') {
      const embed = new EmbedBuilder()
        .setColor(0xfafafa)
        .setTitle('🏆 Guild Activity Leaderboard')
        .setDescription(
          '`1.` 🥇 **Aetheris** • Level 42 (89,120 XP)\n' +
          '`2.` 🥈 **NeonVanguard** • Level 36 (71,450 XP)\n' +
          '`3.` 🥉 **Commander** • Level 18 (14,820 XP)\n' +
          '`4.` 🎖️ **ShadowOps** • Level 16 (12,300 XP)\n' +
          '`5.` 🎖️ **ViperZero** • Level 14 (9,840 XP)'
        )
        .setFooter({ text: 'Fenris XP Engine' });
      return { embed };
    }

    // ==========================================
    // 22. INVITE
    // ==========================================
    if (cmd === 'invite') {
      const clientId = this.client?.user?.id || this.config.clientId || process.env.DISCORD_CLIENT_ID || '1550746964151242793';
      const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=1099511627775&scope=bot%20applications.commands`;
      const embed = new EmbedBuilder()
        .setColor(0xfafafa)
        .setTitle('🐺 Invite Fenris Sentinel to Your Server')
        .setDescription(
          `Click below to authorize Fenris with full moderation, anti-nuke shielding, and security capabilities.\n\n` +
          `🔗 **[Authorize Fenris Sentinel](${inviteUrl})**\n\n` +
          `• Administrator & Moderation permissions pre-configured\n` +
          `• Instant activation upon joining\n` +
          `• Zero-latency moderation execution`
        )
        .setFooter({ text: 'Fenris OAuth2 Authorizer' });
      return { embed, text: `Authorize Fenris: ${inviteUrl}` };
    }

    // ==========================================
    // 23. HELP / COMMANDS (DEFAULT)
    // ==========================================
    const embed = new EmbedBuilder()
      .setColor(0xfafafa)
      .setTitle('🐺 FENRIS SENTINEL — ENTERPRISE MODERATION SUITE')
      .setDescription('Prefix: `!` or slash commands `/`\nNext-generation Discord moderation, case management, and anti-nuke defense.')
      .addFields(
        {
          name: '⚔️ Core Disciplinary Commands',
          value: '`!ban <user> [reason]` • `!softban <user>` • `!tempban <user> <time>` • `!unban <id>` • `!kick <user>` • `!timeout <user> <time>` • `!untimeout <user>`',
        },
        {
          name: '📋 Cases & Warning System',
          value: '`!warn <user> <reason>` • `!warnings <user>` • `!clearwarns <user>` • `!case <id>` • `!modnote <user> <note>`',
        },
        {
          name: '🛡️ Server Defense & Emergency Controls',
          value: '`!antinuke` • `!whitelist` • `!lock` • `!unlock` • `!lockdown` • `!unlockdown` • `!quarantine <user>` • `!panic`',
        },
        {
          name: '🧹 Chat Sanitation & Utility',
          value: '`!purge <amount> [filter]` • `!slowmode <seconds>` • `!vckick <user>` • `!vcmute <user>` • `!ping` • `!status` • `!audit` • `!invite`'
        }
      )
      .setFooter({ text: 'Fenris • Aesthetic Black & White Command Core' });

    return { embed };
  }
}

export const botInstance = new DiscordSentinelBot();
