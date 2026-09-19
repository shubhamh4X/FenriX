import React, { useState, useEffect } from 'react';
import {
  Gavel,
  Shield,
  Clock,
  UserX,
  AlertTriangle,
  Lock,
  Unlock,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sliders,
  Filter,
  UserCheck,
  Send,
  MessageSquare,
  Flame,
  FileCheck,
  Copy,
  AlertOctagon,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { ModCase, WarnStrike, ModActionType, BotConfig } from '../../types.js';

interface ModerationTabProps {
  config: BotConfig | null;
  onSaveConfig?: (cfg: Partial<BotConfig>) => void;
  isBotOnline?: boolean;
}

export const ModerationTab: React.FC<ModerationTabProps> = ({
  config,
  onSaveConfig,
  isBotOnline = true,
}) => {
  const [modCases, setModCases] = useState<ModCase[]>([]);
  const [warnStrikes, setWarnStrikes] = useState<WarnStrike[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'revoked' | 'expired'>('all');

  // Quick Action Form state
  const [actionType, setActionType] = useState<ModActionType>('warn');
  const [targetUser, setTargetUser] = useState('');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState('1h');
  const [deleteDays, setDeleteDays] = useState(0);
  const [executing, setExecuting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Channel Moderation state
  const [purgeChannel, setPurgeChannel] = useState('general');
  const [purgeAmount, setPurgeAmount] = useState(25);
  const [purgeFilter, setPurgeFilter] = useState<'all' | 'bots' | 'embeds' | 'links' | 'user'>('all');
  const [purgeUserTarget, setPurgeUserTarget] = useState('');
  const [purgeStatus, setPurgeStatus] = useState<string | null>(null);

  const [lockChannel, setLockChannel] = useState('general');
  const [lockReason, setLockReason] = useState('Staff investigation / anti-raid lockdown');
  const [isLocked, setIsLocked] = useState(false);
  const [lockStatus, setLockStatus] = useState<string | null>(null);

  const [slowmodeChannel, setSlowmodeChannel] = useState('general');
  const [slowmodeSeconds, setSlowmodeSeconds] = useState(15);
  const [slowmodeStatus, setSlowmodeStatus] = useState<string | null>(null);

  const [emergencyLockdown, setEmergencyLockdown] = useState(false);
  const [emergencyStatus, setEmergencyStatus] = useState<string | null>(null);

  // Fetch Cases and Strikes
  const fetchModerationData = async () => {
    setLoading(true);
    try {
      const [casesRes, strikesRes] = await Promise.all([
        fetch('/api/bot/moderation/cases'),
        fetch('/api/bot/moderation/strikes'),
      ]);

      if (casesRes.ok) {
        const casesData = await casesRes.json();
        setModCases(casesData);
      }
      if (strikesRes.ok) {
        const strikesData = await strikesRes.json();
        setWarnStrikes(strikesData);
      }
    } catch (err) {
      console.error('Failed to fetch moderation data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationData();
    const interval = setInterval(fetchModerationData, 6000);
    return () => clearInterval(interval);
  }, []);

  // Quick preset reasons
  const presetReasons = [
    'Rule #1 Violation: Unsolicited spam / advertisement',
    'Rule #2 Violation: Toxicity and harassment towards members',
    'Rule #4 Violation: Inappropriate NSFW / offensive content',
    'Mass spam velocity / raiding behavior detected',
    'Suspicious alt account / bypass attempt',
  ];

  // Execute Sanction
  const handleExecuteSanction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser.trim()) {
      setActionFeedback({ type: 'error', text: 'Please specify a target user ID or username' });
      return;
    }

    setExecuting(true);
    setActionFeedback(null);

    try {
      const res = await fetch('/api/bot/moderation/sanction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: actionType,
          targetUser: targetUser.trim(),
          reason: reason.trim() || 'Staff Disciplinary Action',
          duration: ['timeout', 'quarantine', 'mute'].includes(actionType) ? duration : undefined,
          deleteDays: actionType === 'ban' ? deleteDays : 0,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionFeedback({
          type: 'success',
          text: `Case #${data.caseId} recorded: ${actionType.toUpperCase()} executed successfully!`,
        });
        setTargetUser('');
        setReason('');
        await fetchModerationData();
      } else {
        setActionFeedback({
          type: 'error',
          text: data.error || 'Failed to execute moderation sanction.',
        });
      }
    } catch (err: any) {
      setActionFeedback({ type: 'error', text: err?.message || 'Execution failed' });
    } finally {
      setExecuting(false);
    }
  };

  // Revoke / Pardon Case
  const handleRevokeCase = async (caseId: string) => {
    try {
      const res = await fetch('/api/bot/moderation/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId, reason: 'Staff discretionary pardon' }),
      });
      if (res.ok) {
        await fetchModerationData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Purge Messages
  const handlePurge = async () => {
    setPurgeStatus('Purging messages...');
    try {
      const res = await fetch('/api/bot/moderation/purge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: purgeChannel,
          amount: purgeAmount,
          filterType: purgeFilter,
          targetUserId: purgeUserTarget || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPurgeStatus(`Successfully purged ${data.deletedCount} messages in #${purgeChannel}.`);
      } else {
        setPurgeStatus(`Error: ${data.error || 'Purge failed'}`);
      }
    } catch (err: any) {
      setPurgeStatus(`Error: ${err?.message || 'Purge network error'}`);
    }
    setTimeout(() => setPurgeStatus(null), 4000);
  };

  // Lock Channel
  const handleToggleLock = async () => {
    const nextLocked = !isLocked;
    setLockStatus(nextLocked ? 'Locking channel...' : 'Unlocking channel...');
    try {
      const res = await fetch('/api/bot/moderation/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: lockChannel, lock: nextLocked, reason: lockReason }),
      });
      const data = await res.json();
      if (data.success) {
        setIsLocked(nextLocked);
        setLockStatus(`Channel #${lockChannel} ${nextLocked ? 'LOCKED' : 'UNLOCKED'}.`);
      } else {
        setLockStatus(`Error: ${data.error || 'Lock update failed'}`);
      }
    } catch (err: any) {
      setLockStatus(`Error: ${err?.message || 'Failed'}`);
    }
    setTimeout(() => setLockStatus(null), 4000);
  };

  // Set Slowmode
  const handleSetSlowmode = async () => {
    setSlowmodeStatus('Applying slowmode...');
    try {
      const res = await fetch('/api/bot/moderation/slowmode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId: slowmodeChannel, seconds: slowmodeSeconds }),
      });
      const data = await res.json();
      if (data.success) {
        setSlowmodeStatus(`Slowmode set to ${slowmodeSeconds}s in #${slowmodeChannel}.`);
      } else {
        setSlowmodeStatus(`Error: ${data.error || 'Failed'}`);
      }
    } catch (err: any) {
      setSlowmodeStatus(`Error: ${err?.message || 'Failed'}`);
    }
    setTimeout(() => setSlowmodeStatus(null), 4000);
  };

  // Server Lockdown
  const handleToggleEmergencyLockdown = async () => {
    const nextState = !emergencyLockdown;
    setEmergencyStatus(nextState ? 'Engaging server lockdown...' : 'Lifting server lockdown...');
    try {
      const res = await fetch('/api/bot/moderation/lockdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lock: nextState, reason: 'Emergency Anti-Raid Server Lockdown' }),
      });
      const data = await res.json();
      if (data.success) {
        setEmergencyLockdown(nextState);
        setEmergencyStatus(nextState ? '🚨 SERVER-WIDE LOCKDOWN ACTIVE' : '✅ Server lockdown lifted');
      } else {
        setEmergencyStatus(`Error: ${data.error || 'Lockdown failed'}`);
      }
    } catch (err: any) {
      setEmergencyStatus(`Error: ${err?.message || 'Failed'}`);
    }
  };

  // Filter cases
  const filteredCases = modCases.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.target.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.target.id.includes(searchQuery) ||
      c.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = filterAction === 'all' || c.type === filterAction;
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && c.status === 'active') ||
      (filterStatus === 'revoked' && c.status === 'revoked') ||
      (filterStatus === 'expired' && c.status === 'expired');

    return matchesSearch && matchesAction && matchesStatus;
  });

  const getActionBadgeClass = (type: ModActionType) => {
    switch (type) {
      case 'ban':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'softban':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'kick':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/30';
      case 'timeout':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'warn':
        return 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30';
      case 'quarantine':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      default:
        return 'bg-neutral-800 text-neutral-300 border-neutral-700';
    }
  };

  const activeWarnStrikesCount = warnStrikes.filter((s) => s.active).length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner / Metrics Overview with Cozy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="cozy-card p-5 rounded-2xl flex items-center justify-between group">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Total Mod Cases</span>
            <div className="text-3xl font-bold font-sans text-white mt-1">{modCases.length}</div>
            <span className="text-[11px] text-neutral-400">Recorded disciplinary logs</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#5865F2]/15 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2] group-hover:scale-110 transition-transform shadow-md">
            <Gavel className="w-5 h-5" />
          </div>
        </div>

        <div className="cozy-card p-5 rounded-2xl flex items-center justify-between group">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Active Warn Strikes</span>
            <div className="text-3xl font-bold font-sans text-amber-400 mt-1">
              {activeWarnStrikesCount}
            </div>
            <span className="text-[11px] text-neutral-400">Across active warning strikes</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-md">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="cozy-card p-5 rounded-2xl flex items-center justify-between group">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Active Sanctions</span>
            <div className="text-3xl font-bold font-sans text-white mt-1">
              {modCases.filter((c) => c.status === 'active').length}
            </div>
            <span className="text-[11px] text-neutral-400">Timeouts, Bans &amp; Quarantines</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform shadow-md">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="cozy-card p-5 rounded-2xl flex items-center justify-between group">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">Defense Protocol</span>
            <div className="text-base font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              ARMED &amp; ACTIVE
            </div>
            <span className="text-[11px] text-neutral-400">Gateway latency ~18ms</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-md">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Sanction Console & Channel Management */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col (7 cols): Quick Sanction Console */}
        <div className="lg:col-span-7 cozy-card rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#222b3a] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#8ea1e1]">
                <Gavel className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Staff Disciplinary Console</h3>
                <p className="text-xs text-neutral-400">Dispatch authoritative moderation actions directly to Discord</p>
              </div>
            </div>
            <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-lg bg-[#181f2b] border border-[#2b3548] text-[#8ea1e1] font-semibold">
              Audit-Enforced
            </span>
          </div>

          <form onSubmit={handleExecuteSanction} className="space-y-4">
            {/* Action Type Select */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-2">
                Sanction Type
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {(['warn', 'timeout', 'kick', 'ban', 'softban', 'quarantine'] as ModActionType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setActionType(type)}
                    className={`py-2 px-2 rounded-xl text-xs font-mono uppercase font-semibold border transition-all text-center cursor-pointer active:scale-95 ${
                      actionType === type
                        ? 'bg-[#5865F2] text-white border-[#5865F2] shadow-md shadow-[#5865F2]/30'
                        : 'bg-[#121620] text-neutral-400 border-[#212a3a] hover:text-white hover:border-[#35435b]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Target User */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                Target User (@mention or 18-digit Discord ID)
              </label>
              <input
                type="text"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                placeholder="e.g. 109283746592817264 or @SpammerAccount"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121620] border border-[#212a3a] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#5865F2] transition-all font-mono shadow-inner"
              />
            </div>

            {/* Duration / Delete days (Conditional) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['timeout', 'quarantine', 'mute'].includes(actionType) && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Sanction Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121620] border border-[#212a3a] text-xs text-white focus:outline-none focus:border-[#5865F2] transition-all font-mono"
                  >
                    <option value="10m">10 Minutes</option>
                    <option value="1h">1 Hour</option>
                    <option value="12h">12 Hours</option>
                    <option value="1d">1 Day (24 Hours)</option>
                    <option value="3d">3 Days</option>
                    <option value="7d">7 Days</option>
                    <option value="14d">14 Days</option>
                    <option value="28d">28 Days (Discord Timeout Max)</option>
                  </select>
                </div>
              )}

              {actionType === 'ban' && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1.5">
                    Purge Message History
                  </label>
                  <select
                    value={deleteDays}
                    onChange={(e) => setDeleteDays(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#121620] border border-[#212a3a] text-xs text-white focus:outline-none focus:border-[#5865F2] transition-all font-mono"
                  >
                    <option value={0}>Do not purge messages</option>
                    <option value={1}>Delete previous 24 hours</option>
                    <option value={7}>Delete previous 7 days</option>
                  </select>
                </div>
              )}
            </div>

            {/* Reason input & quick presets */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-300">
                  Infraction Reason
                </label>
                <span className="text-[10px] text-neutral-400">Logged to #mod-logs &amp; DMed to user</span>
              </div>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for disciplinary action..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#121620] border border-[#212a3a] text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#5865F2] transition-all"
              />

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {presetReasons.map((pr, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setReason(pr)}
                    className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#121620] text-neutral-300 border border-[#212a3a] hover:text-white hover:border-[#5865F2]/50 transition-all cursor-pointer"
                  >
                    + {pr.split(':')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Feedback */}
            {actionFeedback && (
              <div
                className={`p-3.5 rounded-xl border text-xs font-mono flex items-center gap-2.5 ${
                  actionFeedback.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
                }`}
              >
                {actionFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{actionFeedback.text}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={executing}
              className="shine-hover w-full py-3 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white font-semibold text-xs uppercase tracking-wider font-mono transition-all shadow-md shadow-[#5865F2]/25 hover:shadow-lg hover:shadow-[#5865F2]/35 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {executing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Disciplinary Gateway Payload...</span>
                </>
              ) : (
                <>
                  <Gavel className="w-4 h-4" />
                  <span>Execute {actionType.toUpperCase()}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Col (5 cols): Channel Emergency & Purge Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Emergency Server Lockdown Card */}
          <div className="cozy-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertOctagon className={`w-5 h-5 ${emergencyLockdown ? 'text-rose-400 animate-pulse' : 'text-neutral-400'}`} />
                <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                  Emergency Server Lockdown
                </h4>
              </div>
              <span className="text-[10px] font-mono uppercase text-neutral-400">Raid Mitigation</span>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Instantly revokes <code className="text-neutral-200 bg-[#121620] px-1.5 py-0.5 rounded">SEND_MESSAGES</code> on all standard channels for @everyone to halt raiders or mass-bot attacks.
            </p>

            {emergencyStatus && (
              <div className="p-2.5 rounded-lg bg-[#121620] border border-[#212a3a] text-[11px] font-mono text-neutral-300">
                {emergencyStatus}
              </div>
            )}

            <button
              type="button"
              onClick={handleToggleEmergencyLockdown}
              className={`shine-hover w-full py-2.5 rounded-xl font-mono text-xs uppercase font-bold tracking-wider transition-all border cursor-pointer active:scale-95 ${
                emergencyLockdown
                  ? 'bg-rose-600 text-white border-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                  : 'bg-[#121620] text-neutral-300 border-[#212a3a] hover:text-white hover:border-[#3b4b66]'
              }`}
            >
              {emergencyLockdown ? '🚨 Lift Server-Wide Lockdown' : '🔒 Engage Emergency Lockdown'}
            </button>
          </div>

          {/* Channel Lock & Slowmode Utilities */}
          <div className="cozy-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#212a3a] pb-3">
              <h4 className="text-xs font-mono uppercase tracking-wider font-bold text-white flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-neutral-400" />
                <span>Channel Controls</span>
              </h4>
              <span className="text-[10px] font-mono text-neutral-400">Live Gateway</span>
            </div>

            {/* Lock / Unlock */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Target Channel</span>
                <input
                  type="text"
                  value={lockChannel}
                  onChange={(e) => setLockChannel(e.target.value)}
                  className="w-32 px-2.5 py-1 rounded-lg bg-[#121620] border border-[#212a3a] text-xs font-mono text-white text-right focus:border-[#5865F2] outline-none"
                  placeholder="general"
                />
              </div>

              {lockStatus && (
                <div className="p-2 rounded bg-[#121620] border border-[#212a3a] text-[11px] font-mono text-neutral-300">
                  {lockStatus}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleToggleLock}
                  className={`shine-hover flex-1 py-2 rounded-xl text-xs font-mono uppercase font-bold border transition-all cursor-pointer active:scale-95 ${
                    isLocked
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-[#121620] text-neutral-300 border-[#212a3a] hover:text-white hover:border-[#35435b]'
                  }`}
                >
                  {isLocked ? 'Unlock Channel' : 'Lock Channel'}
                </button>
              </div>
            </div>

            {/* Slowmode */}
            <div className="space-y-2 pt-2 border-t border-[#202737]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Slowmode ({slowmodeSeconds}s)</span>
                <div className="flex gap-1">
                  {[0, 5, 15, 60, 300].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSlowmodeSeconds(sec)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                        slowmodeSeconds === sec
                          ? 'bg-[#5865F2] text-white border-[#5865F2] font-bold shadow-sm'
                          : 'bg-[#121620] text-neutral-400 border-[#212a3a] hover:text-white'
                      }`}
                    >
                      {sec === 0 ? 'Off' : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>

              {slowmodeStatus && (
                <div className="p-2 rounded bg-[#121620] border border-[#212a3a] text-[11px] font-mono text-neutral-300">
                  {slowmodeStatus}
                </div>
              )}

              <button
                type="button"
                onClick={handleSetSlowmode}
                className="shine-hover w-full py-2 rounded-xl text-xs font-mono uppercase bg-[#121620] text-neutral-200 border border-[#212a3a] hover:text-white hover:border-[#384865] font-bold transition-all cursor-pointer active:scale-95"
              >
                Apply Slowmode
              </button>
            </div>

            {/* Bulk Purge Utility */}
            <div className="space-y-2 pt-2 border-t border-[#202737]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-400">Purge Bulk Messages</span>
                <span className="text-[10px] font-mono text-neutral-400">{purgeAmount} messages</span>
              </div>

              <div className="flex gap-2">
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={purgeAmount}
                  onChange={(e) => setPurgeAmount(Number(e.target.value))}
                  className="w-20 px-2 py-1.5 rounded-xl bg-[#121620] border border-[#212a3a] text-xs font-mono text-white text-center focus:border-[#5865F2] outline-none"
                />
                <select
                  value={purgeFilter}
                  onChange={(e) => setPurgeFilter(e.target.value as any)}
                  className="flex-1 px-2.5 py-1.5 rounded-xl bg-[#121620] border border-[#212a3a] text-xs font-mono text-white focus:border-[#5865F2] outline-none"
                >
                  <option value="all">All Messages</option>
                  <option value="bots">Bot Messages Only</option>
                  <option value="links">Links / URLs Only</option>
                  <option value="embeds">Embeds / Attachments</option>
                </select>
              </div>

              {purgeStatus && (
                <div className="p-2 rounded bg-[#121620] border border-[#212a3a] text-[11px] font-mono text-neutral-300">
                  {purgeStatus}
                </div>
              )}

              <button
                type="button"
                onClick={handlePurge}
                className="shine-hover w-full py-2 rounded-xl text-xs font-mono uppercase bg-rose-950/40 text-rose-300 border border-rose-800/60 hover:bg-rose-900/50 hover:text-white font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Execute Purge</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Cases Table & Filter Bar */}
      <div className="cozy-card rounded-2xl overflow-hidden">
        {/* Table Header & Search Controls */}
        <div className="p-5 border-b border-[#212a3a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-neutral-400" />
              <span>Authoritative Case Ledger</span>
            </h3>
            <p className="text-xs text-neutral-400">Complete audit trails of all disciplinary actions and pardons</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user, ID or case #..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#121620] border border-[#212a3a] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#5865F2] font-mono"
              />
            </div>

            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-[#121620] border border-[#212a3a] text-xs text-neutral-300 font-mono focus:border-[#5865F2] outline-none"
            >
              <option value="all">All Actions</option>
              <option value="ban">Bans</option>
              <option value="softban">Softbans</option>
              <option value="kick">Kicks</option>
              <option value="timeout">Timeouts</option>
              <option value="warn">Warns</option>
              <option value="quarantine">Quarantines</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-[#121620] border border-[#212a3a] text-xs text-neutral-300 font-mono focus:border-[#5865F2] outline-none"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="revoked">Pardoned / Revoked</option>
              <option value="expired">Expired</option>
            </select>

            <button
              onClick={fetchModerationData}
              disabled={loading}
              className="p-2 rounded-xl bg-[#121620] border border-[#212a3a] text-neutral-400 hover:text-white hover:border-[#384865] transition-all cursor-pointer"
              title="Refresh ledger"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121620]/60 text-neutral-400 font-mono text-[11px] uppercase tracking-wider border-b border-[#212a3a]">
              <tr>
                <th className="py-3 px-4">Case #</th>
                <th className="py-3 px-4">Target User</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Reason</th>
                <th className="py-3 px-4">Moderator</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2535] font-mono">
              {filteredCases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-neutral-400 font-sans">
                    No moderation cases match current query.
                  </td>
                </tr>
              ) : (
                filteredCases.map((c) => (
                  <tr key={c.id} className="hover:bg-[#161d2a] transition-colors">
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      {c.id}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {c.target.avatarUrl ? (
                          <img
                            src={c.target.avatarUrl}
                            alt=""
                            referrerPolicy="no-referrer"
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#20293a] flex items-center justify-center text-[10px] text-white">
                            {c.target.tag.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-neutral-200">{c.target.tag}</div>
                          <div className="text-[10px] text-neutral-400">{c.target.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${getActionBadgeClass(
                          c.type
                        )}`}
                      >
                        {c.type}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-neutral-300 whitespace-nowrap">
                      {c.duration || '—'}
                    </td>

                    <td className="py-3 px-4 text-neutral-200 font-sans max-w-xs truncate">
                      {c.reason}
                    </td>

                    <td className="py-3 px-4 text-neutral-300 whitespace-nowrap">
                      {c.moderator.tag}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {c.status === 'revoked' ? (
                        <span className="text-[10px] text-neutral-400 bg-[#121620] px-2 py-0.5 rounded border border-[#212a3a]">
                          Pardoned
                        </span>
                      ) : c.status === 'active' ? (
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 w-max">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400">Expired</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {c.status === 'active' ? (
                        <button
                          onClick={() => handleRevokeCase(c.id)}
                          className="shine-hover text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#121620] hover:bg-[#5865F2] hover:text-white border border-[#212a3a] text-neutral-300 transition-all cursor-pointer"
                        >
                          Pardon
                        </button>
                      ) : (
                        <span className="text-neutral-500 text-[10px]">Closed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warn Strike Tracking Ledger */}
      <div className="cozy-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#212a3a] pb-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Active Warning Strikes System</span>
            </h3>
            <p className="text-xs text-neutral-400">
              Thresholds: 3 Strikes → 1 Hour Timeout | 5 Strikes → Automatic Permanent Ban
            </p>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">
            Decay Window: {config?.moderation?.warnDecayDays || 30} days
          </span>
        </div>

        {warnStrikes.length === 0 ? (
          <div className="py-8 text-center text-xs text-neutral-400 font-mono">
            No users currently have active warning strikes.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.values(
              warnStrikes.reduce<Record<string, { userId: string; userTag: string; strikes: WarnStrike[] }>>((acc, s) => {
                if (!acc[s.userId]) {
                  acc[s.userId] = { userId: s.userId, userTag: s.userTag, strikes: [] };
                }
                acc[s.userId].strikes.push(s);
                return acc;
              }, {})
            ).map((ws) => {
              const activeCount = ws.strikes.filter((s: WarnStrike) => s.active).length;
              return (
                <div
                  key={ws.userId}
                  className="p-4 rounded-xl bg-[#121620] border border-[#212a3a] hover:border-[#33425b] transition-all space-y-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-xs font-semibold text-white">{ws.userTag}</div>
                      <div className="text-[10px] font-mono text-neutral-400">{ws.userId}</div>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <span
                        className={`font-bold px-2 py-0.5 rounded border ${
                          activeCount >= 3
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {activeCount} / 5 STRIKES
                      </span>
                    </div>
                  </div>

                  {/* Strike history list */}
                  <div className="space-y-1.5 text-[11px]">
                    {ws.strikes.map((s: WarnStrike) => (
                      <div
                        key={s.id}
                        className={`p-2 rounded-lg border flex items-start justify-between ${
                          s.active
                            ? 'bg-[#181f2c] border-[#29354a] text-neutral-200'
                            : 'bg-[#10141c] border-[#1a212e] text-neutral-500 line-through'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{s.reason}</div>
                          <div className="text-[9px] font-mono text-neutral-400">
                            By {s.moderatorTag} • {new Date(s.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
