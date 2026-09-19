import React, { useState } from 'react';
import { BotConfig, BotStatus } from '../../types.js';
import {
  KeyRound,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ShieldCheck,
  Power,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react';

interface SetupTabProps {
  config: BotConfig | null;
  status: BotStatus | null;
  onSaveConfig: (updated: Partial<BotConfig>) => Promise<void>;
  onStartBot: (tokenOverride?: string) => Promise<void>;
  onStopBot: () => Promise<void>;
  loading: boolean;
}

export const SetupTab: React.FC<SetupTabProps> = ({
  config,
  status,
  onSaveConfig,
  onStartBot,
  onStopBot,
  loading,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [clientIdInput, setClientIdInput] = useState(config?.clientId || '');
  const [adminIdsInput, setAdminIdsInput] = useState(
    Array.isArray(config?.adminUserIds) ? config.adminUserIds.join(', ') : ''
  );
  const [copiedLink, setCopiedLink] = useState(false);
  const [testingToken, setTestingToken] = useState(false);
  const [tokenValidationResult, setTokenValidationResult] = useState<{
    valid: boolean;
    message: string;
    botUser?: any;
  } | null>(null);

  React.useEffect(() => {
    if (config) {
      if (!clientIdInput && config.clientId) setClientIdInput(config.clientId);
      if (!adminIdsInput && Array.isArray(config.adminUserIds)) {
        setAdminIdsInput(config.adminUserIds.join(', '));
      }
    }
  }, [config]);

  const isOnline = status?.status === 'online';

  // Calculate Invite URL
  const effectiveClientId = clientIdInput.trim() || config?.clientId || status?.id || '1550746964151242793';
  // Standard Admin permissions = 8. Or Granular Security permissions:
  // Kick (2) + Ban (4) + Manage Channels (16) + View Audit Log (128) + Manage Roles (268435456) + Send Messages (2048) + Embed Links (16384) + Use Slash Commands (2147483648)
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${effectiveClientId}&permissions=8&scope=bot%20applications.commands`;

  const handleCopyInvite = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleVerifyToken = async () => {
    const token = tokenInput.trim();
    if (!token) {
      setTokenValidationResult({ valid: false, message: 'Please paste a Bot Token first.' });
      return;
    }
    setTestingToken(true);
    setTokenValidationResult(null);

    try {
      const res = await fetch('/api/bot/test-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      setTokenValidationResult(data);
      if (data.valid && data.botUser?.id && !clientIdInput) {
        setClientIdInput(data.botUser.id);
      }
    } catch (e: any) {
      setTokenValidationResult({ valid: false, message: e?.message || 'Verification network error' });
    } finally {
      setTestingToken(false);
    }
  };

  const handleSaveAndStart = async () => {
    const adminIds = adminIdsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    await onSaveConfig({
      clientId: clientIdInput.trim(),
      adminUserIds: adminIds,
      ...(tokenInput.trim() ? { token: tokenInput.trim() } : {}),
    });

    if (tokenInput.trim() || config?.token) {
      await onStartBot(tokenInput.trim() || undefined);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Overview Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Discord Bot Setup & Gateway Activation Wizard
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Connect your Discord bot in under 2 minutes. Sentinel requires specific Gateway Intents to
              detect unauthorized role modifications, channel creation/deletion, and analyze message contents for spam and toxicity.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              {isOnline ? 'Gateway Connected' : 'Awaiting Token'}
            </span>
          </div>
        </div>
      </div>

      {/* Step by Step Guide Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Instructions */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">
                1
              </span>
              Create Your Application & Bot
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open the Discord Developer Portal. Click <strong>"New Application"</strong>, name your bot (e.g. <em>Sentinel Guard</em>), and navigate to the <strong>Bot</strong> tab on the left.
            </p>
            <a
              href="https://discord.com/developers/applications"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
            >
              <span>Open Discord Developer Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">
                2
              </span>
              Enable Privileged Gateway Intents (CRITICAL)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In your Discord Bot settings under <strong>"Privileged Gateway Intents"</strong>, toggle ON the following switches:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">Server Members Intent</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Enables the bot to monitor role assignments and instantly kick/ban unauthorized actors.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-200">Message Content Intent</strong>
                  <p className="text-slate-400 text-[11px] mt-0.5">
                    Enables automated spam filtering, invite link blocking, and Gemini AI toxicity scanning.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">
                3
              </span>
              Bot Role Hierarchy Rule
            </h3>
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                In Discord <strong>Server Settings &gt; Roles</strong>, drag the Sentinel Bot's role to the very <strong>top of the role list</strong> (above Moderator and Member roles). Discord prevents bots from kicking or banning users with higher or equal roles!
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Configuration Form */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Connect & Authorize Bot
            </h3>

            {/* Token Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Discord Bot Token</span>
                <span className="text-[11px] text-slate-500 font-normal">Found in Developer Portal &gt; Bot &gt; Reset Token</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder={config?.token ? `•••••••••••••••• (Configured: ${config.token})` : 'Paste your Bot Token here'}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 transition"
                />
                <button
                  onClick={handleVerifyToken}
                  disabled={testingToken || (!tokenInput && !config?.token)}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold transition whitespace-nowrap"
                >
                  {testingToken ? 'Testing...' : 'Verify Token'}
                </button>
              </div>

              {tokenValidationResult && (
                <div
                  className={`p-3 rounded-lg text-xs mt-2 flex items-start gap-2 ${
                    tokenValidationResult.valid
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {tokenValidationResult.valid ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong>{tokenValidationResult.valid ? 'Token Validated' : 'Validation Failed'}:</strong>{' '}
                    {tokenValidationResult.message}
                  </div>
                </div>
              )}
            </div>

            {/* Client ID (Application ID) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Application / Client ID</span>
                <span className="text-[11px] text-slate-500 font-normal">Found in General Information</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 123456789012345678"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 transition"
              />
            </div>

            {/* Admin Discord IDs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Administrator Discord User IDs (for persistent DMs)</span>
                <span className="text-[11px] text-slate-500 font-normal">Comma-separated</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 349123847129384712, 987123984712938471"
                value={adminIdsInput}
                onChange={(e) => setAdminIdsInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-600 transition"
              />
              <p className="text-[11px] text-slate-500">
                To get your Discord User ID: enable <em>Discord Settings &gt; Advanced &gt; Developer Mode</em>, then right-click your name and click <em>"Copy User ID"</em>.
              </p>
            </div>

            {/* One-Click Bot Invite Generator */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  Bot Server Invite Link
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Pre-configured Permissions
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Click to invite Sentinel into your Discord server with anti-nuke kick/ban and audit log privileges:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 select-all"
                />
                <button
                  onClick={handleCopyInvite}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
                <a
                  href={inviteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition"
                >
                  <span>Invite</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Save & Run Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleSaveAndStart}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition"
              >
                <Power className="w-4 h-4" />
                <span>Save Settings & Connect Bot</span>
              </button>

              {isOnline && (
                <button
                  onClick={onStopBot}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs transition"
                >
                  Disconnect Bot
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
