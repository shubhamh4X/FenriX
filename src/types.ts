export interface BotConfig {
  token: string;
  clientId: string;
  guildId: string;
  adminUserIds: string[];
  antiNuke: {
    enabled: boolean;
    roleChangeAction: 'ban' | 'kick' | 'strip_roles' | 'alert_only';
    channelCreateAction: 'ban' | 'kick' | 'delete_channel' | 'alert_only';
    channelDeleteAction: 'ban' | 'kick' | 'alert_only';
    suspiciousActivityAction: 'ban' | 'kick' | 'timeout' | 'alert_only';
    massBanThreshold: number; // max bans per 10s before auto-ban executor
    massKickThreshold: number; // max kicks per 10s before auto-ban executor
    massChannelThreshold: number; // max channels created/deleted per 10s
    whitelistedUserIds: string[];
    whitelistedRoleIds: string[];
  };
  autoMod: {
    spamFilterEnabled: boolean;
    maxMessagesPer5Sec: number;
    duplicateMessageLimit: number;
    blockDiscordInvites: boolean;
    blockExternalLinks: boolean;
    massMentionsThreshold: number;
    capsPercentageThreshold: number;
    zalgoFilter: boolean;
    spamAction: 'delete_warn' | 'timeout_5m' | 'timeout_1h' | 'kick';
  };
  aiToxicity: {
    enabled: boolean;
    sensitivity: 'low' | 'medium' | 'high';
    categories: {
      harassment: boolean;
      hateSpeech: boolean;
      threats: boolean;
      severeProfanity: boolean;
      scams: boolean;
    };
    action: 'delete_warn' | 'timeout_1h' | 'kick' | 'ban';
  };
  dmAlerts: {
    enabled: boolean;
    minSeverity: 'critical' | 'high' | 'all';
    alertOnRoleTamper: boolean;
    alertOnChannelTamper: boolean;
    alertOnRaid: boolean;
    alertOnSpamMass: boolean;
    alertOnToxicSevere: boolean;
  };
  moderation?: {
    enabled?: boolean;
    modLogChannelId?: string;
    modRoleId?: string;
    muteRoleId?: string;
    quarantineRoleId?: string;
    dmUserOnSanction: boolean;
    appealInviteUrl?: string;
    autoEscalateWarns: boolean;
    warnDecayDays: number;
    escalationRules: WarnEscalationRule[];
  };
}

export type ModActionType =
  | 'ban'
  | 'softban'
  | 'tempban'
  | 'unban'
  | 'kick'
  | 'timeout'
  | 'untimeout'
  | 'warn'
  | 'clearwarns'
  | 'quarantine'
  | 'unquarantine'
  | 'note'
  | 'purge'
  | 'slowmode'
  | 'lock'
  | 'unlock'
  | 'lockdown';

export interface ModCase {
  id: string; // e.g. "CASE-1048"
  caseNumber: number;
  type: ModActionType;
  target: {
    id: string;
    tag: string;
    avatarUrl?: string;
  };
  moderator: {
    id: string;
    tag: string;
    avatarUrl?: string;
  };
  reason: string;
  duration?: string; // e.g. "1h", "24h", "7d"
  createdAt: number;
  expiresAt?: number;
  status: 'active' | 'expired' | 'revoked';
  channelId?: string;
  channelName?: string;
  messagesDeleted?: number;
}

export interface WarnEscalationRule {
  strikeCount: number;
  action: 'warn' | 'timeout_1h' | 'timeout_24h' | 'kick' | 'ban';
  label: string;
}

export interface WarnStrike {
  id: string;
  userId: string;
  userTag: string;
  moderatorTag: string;
  reason: string;
  timestamp: number;
  caseId: string;
  active: boolean;
}

export interface GuildChannelInfo {
  id: string;
  name: string;
  type: 'text' | 'voice' | 'announcement';
  isLocked: boolean;
  slowmode: number; // in seconds
}

export interface BotCommandOption {
  name: string;
  description: string;
  type: 'STRING' | 'INTEGER' | 'BOOLEAN' | 'USER' | 'CHANNEL' | 'ROLE';
  required: boolean;
  choices?: { name: string; value: string | number }[];
}

export interface BotCommandDefinition {
  name: string;
  description: string;
  category: 'antinuke' | 'moderation' | 'utility' | 'ai' | 'leveling' | 'config';
  syntax: string;
  example: string;
  permissions: 'Everyone' | 'Moderator' | 'Admin' | 'Server Owner';
  options?: BotCommandOption[];
  cooldown?: number; // in seconds
  isSlash: boolean;
  prefixAlias?: string;
}

export type SeverityLevel = 'info' | 'warning' | 'high' | 'critical';

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  type:
    | 'role_change'
    | 'channel_created'
    | 'channel_deleted'
    | 'channel_tamper'
    | 'spam_blocked'
    | 'toxic_blocked'
    | 'auto_moderation'
    | 'moderation_sanction'
    | 'kick'
    | 'ban'
    | 'dm_alert'
    | 'bot_status'
    | 'simulated_event';
  severity: SeverityLevel;
  executor: {
    id: string;
    tag: string;
    avatarUrl?: string;
  };
  target: {
    id?: string;
    name: string;
    type?: string;
  };
  actionTaken: string;
  details: string;
  channelName?: string;
  metadata?: Record<string, any>;
}

export interface ConnectedGuild {
  id: string;
  name: string;
  memberCount: number;
  iconUrl?: string;
  ownerId?: string;
  rolesCount?: number;
  channelsCount?: number;
}

export interface BotStatus {
  status: 'online' | 'offline' | 'connecting' | 'error';
  error?: string;
  tag?: string;
  id?: string;
  avatarUrl?: string;
  ping?: number;
  uptime?: number;
  startedAt?: number;
  guilds: ConnectedGuild[];
  stats: {
    todayBlockedSpam: number;
    todayBlockedToxicity: number;
    todayRoleTamperBlocked: number;
    todayChannelTamperBlocked: number;
    todayDmAlertsSent: number;
    todayBansKicks: number;
  };
}
