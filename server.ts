import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { botInstance } from './src/bot/discordSentinel.js';
import { analyzeMessageToxicity } from './src/bot/geminiModerator.js';
import { BOT_COMMANDS } from './src/data/botCommands.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Automatically attempt startup if DISCORD_BOT_TOKEN is present in env
  if (process.env.DISCORD_BOT_TOKEN) {
    console.log('[Server] DISCORD_BOT_TOKEN detected in environment. Attempting connection...');
    botInstance.start().then((res) => {
      console.log('[Server] Bot startup result:', res.message);
    });
  }

  // --- API ROUTES ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // Bot Status
  app.get('/api/bot/status', (req, res) => {
    res.json(botInstance.getStatus());
  });

  // Start Bot
  app.post('/api/bot/start', async (req, res) => {
    const { token } = req.body || {};
    const result = await botInstance.start(token);
    res.json({
      ...result,
      status: botInstance.getStatus(),
    });
  });

  // Stop Bot
  app.post('/api/bot/stop', async (req, res) => {
    const result = await botInstance.stop();
    res.json({
      ...result,
      status: botInstance.getStatus(),
    });
  });

  // Get Config
  app.get('/api/bot/config', (req, res) => {
    res.json(botInstance.getConfig());
  });

  // Update Config
  app.post('/api/bot/config', (req, res) => {
    try {
      const updated = botInstance.saveConfig(req.body);
      res.json({ success: true, config: botInstance.getConfig() });
    } catch (e: any) {
      res.status(400).json({ success: false, message: e?.message || 'Error saving config' });
    }
  });

  // Get Logs
  app.get('/api/bot/logs', (req, res) => {
    res.json(botInstance.getAuditLogs());
  });

  // Clear Logs
  app.post('/api/bot/logs/clear', (req, res) => {
    botInstance.clearAuditLogs();
    res.json({ success: true });
  });

  // Validate Token against Discord API
  app.post('/api/bot/test-token', async (req, res) => {
    const { token } = req.body;
    const tokenToTest = token || botInstance.getRawConfig().token || process.env.DISCORD_BOT_TOKEN;

    if (!tokenToTest) {
      return res.status(400).json({ valid: false, message: 'No token provided' });
    }

    try {
      const response = await fetch('https://discord.com/api/v10/users/@me', {
        headers: {
          Authorization: `Bot ${tokenToTest.trim()}`,
        },
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        return res.json({
          valid: false,
          message: errJson.message || `Discord API returned HTTP ${response.status}`,
        });
      }

      const botUser = await response.json();
      return res.json({
        valid: true,
        botUser: {
          id: botUser.id,
          username: botUser.username,
          discriminator: botUser.discriminator,
          avatar: botUser.avatar,
        },
        message: `Successfully verified as ${botUser.username}#${botUser.discriminator || '0'}!`,
      });
    } catch (err: any) {
      return res.status(500).json({ valid: false, message: err?.message || 'Failed to reach Discord API' });
    }
  });

  // Test AutoMod / Gemini Toxicity on sample text
  app.post('/api/bot/test-message', async (req, res) => {
    const { content, sensitivity } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ error: 'Content required' });
    }

    try {
      const analysis = await analyzeMessageToxicity(content, sensitivity || 'medium');
      res.json({ analysis });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Analysis failed' });
    }
  });

  // Dispatch Test DM Alert
  app.post('/api/bot/test-dm', async (req, res) => {
    const { adminId } = req.body;
    const currentConfig = botInstance.getRawConfig();

    if (adminId && !currentConfig.adminUserIds.includes(adminId)) {
      botInstance.saveConfig({ adminUserIds: [...currentConfig.adminUserIds, adminId] });
    }

    const result = await botInstance.dispatchAdminDmAlert({
      title: '🔔 Discord Sentinel: Test Administrator Alert',
      severity: 'high',
      fields: [
        { name: 'Channel Dispatcher', value: 'Direct Message Security Pipeline', inline: true },
        { name: 'Status', value: 'Online & Actively Monitoring', inline: true },
        {
          name: 'Manual Oversight',
          value: 'This verifies that the bot can directly DM your Discord account when high-severity threats or unauthorized role/channel changes are detected.',
          inline: false,
        },
        { name: 'Timestamp', value: new Date().toUTCString(), inline: false },
      ],
    });

    res.json(result);
  });

  // Simulate Security Breach Event
  app.post('/api/bot/simulate-breach', async (req, res) => {
    const { type, targetAdminId } = req.body;
    const result = await botInstance.simulateBreach(type || 'role_escalation', targetAdminId);
    res.json({ success: true, ...result });
  });

  // --- ENTERPRISE MODERATION API ---
  // Get all moderation cases
  app.get('/api/bot/moderation/cases', (req, res) => {
    res.json(botInstance.getModCases());
  });

  // Get active warning strikes
  app.get('/api/bot/moderation/strikes', (req, res) => {
    res.json(botInstance.getWarnStrikes());
  });

  // Execute disciplinary sanction (ban, kick, timeout, warn, etc.)
  app.post('/api/bot/moderation/sanction', async (req, res) => {
    const { type, targetUser, reason, duration, deleteDays, channelId, channelName } = req.body;
    if (!type || !targetUser) {
      return res.status(400).json({ error: 'Sanction type and target user are required.' });
    }

    try {
      const result = await botInstance.executeSanction({
        type,
        targetUser,
        moderator: { id: 'dashboard_admin', tag: 'Web Dashboard Staff' },
        reason: reason || 'Staff Disciplinary Action',
        duration,
        deleteDays: Number(deleteDays) || 0,
        channelId,
        channelName,
      });
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Sanction execution failed' });
    }
  });

  // Revoke / pardon a case
  app.post('/api/bot/moderation/revoke', async (req, res) => {
    const { caseId, reason } = req.body;
    if (!caseId) {
      return res.status(400).json({ error: 'Case ID is required' });
    }
    const result = await botInstance.revokeSanction(caseId, 'Web Dashboard Staff', reason);
    res.json(result);
  });

  // Execute message purge
  app.post('/api/bot/moderation/purge', async (req, res) => {
    const { channelId, amount, filterType, targetUserId } = req.body;
    const result = await botInstance.executePurge(
      channelId || 'general',
      Number(amount) || 10,
      filterType || 'all',
      targetUserId
    );
    res.json(result);
  });

  // Channel Lock / Unlock
  app.post('/api/bot/moderation/lock', async (req, res) => {
    const { channelId, lock, reason } = req.body;
    const result = await botInstance.setChannelLock(channelId || 'general', !!lock, reason);
    res.json(result);
  });

  // Server-Wide Emergency Lockdown
  app.post('/api/bot/moderation/lockdown', async (req, res) => {
    const { lock, reason } = req.body;
    const result = await botInstance.triggerServerLockdown(!!lock, reason);
    res.json(result);
  });

  // Channel Slowmode
  app.post('/api/bot/moderation/slowmode', async (req, res) => {
    const { channelId, seconds } = req.body;
    const result = await botInstance.setChannelSlowmode(channelId || 'general', Number(seconds) || 0);
    res.json(result);
  });

  // --- BOT COMMANDS DIRECTORY & TEST RUNNER ---
  app.get('/api/bot/commands', (req, res) => {
    res.json({ commands: BOT_COMMANDS });
  });

  app.post('/api/bot/commands/execute', async (req, res) => {
    const { command, args } = req.body;
    if (!command) {
      return res.status(400).json({ error: 'Command name is required' });
    }
    const cleanCmd = String(command).replace(/^[!/.]/, '');
    const cleanArgs = Array.isArray(args) ? args : String(args || '').split(/\s+/).filter(Boolean);

    try {
      const response = await botInstance.executeCommand(
        cleanCmd,
        cleanArgs,
        { id: 'web_admin', tag: 'WebConsole#0001', username: 'WebConsole' },
        null,
        null
      );
      res.json({ success: true, ...response });
    } catch (e: any) {
      res.status(500).json({ success: false, error: e?.message || 'Execution error' });
    }
  });

  // --- VITE MIDDLEWARE SETUP ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Sentinel Bot & Security Console running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup error:', err);
});
