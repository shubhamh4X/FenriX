import React, { useState } from 'react';
import { BotConfig } from '../../types.js';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Users,
  Hash,
  UserX,
  AlertOctagon,
  Plus,
  X,
  Save,
  Check,
} from 'lucide-react';

interface AntiNukeTabProps {
  config: BotConfig | null;
  onSaveConfig: (updated: Partial<BotConfig>) => Promise<void>;
  loading: boolean;
}

export const AntiNukeTab: React.FC<AntiNukeTabProps> = ({
  config,
  onSaveConfig,
  loading,
}) => {
  const [enabled, setEnabled] = useState(config?.antiNuke.enabled ?? true);
  const [roleAction, setRoleAction] = useState(config?.antiNuke.roleChangeAction ?? 'ban');
  const [channelCreateAction, setChannelCreateAction] = useState(
    config?.antiNuke.channelCreateAction ?? 'ban'
  );
  const [channelDeleteAction, setChannelDeleteAction] = useState(
    config?.antiNuke.channelDeleteAction ?? 'ban'
  );
  const [massBanThreshold, setMassBanThreshold] = useState(
    config?.antiNuke.massBanThreshold ?? 3
  );
  const [massKickThreshold, setMassKickThreshold] = useState(
    config?.antiNuke.massKickThreshold ?? 3
  );
  const [massChannelThreshold, setMassChannelThreshold] = useState(
    config?.antiNuke.massChannelThreshold ?? 2
  );

  const [whitelistedUsers, setWhitelistedUsers] = useState<string[]>(
    Array.isArray(config?.antiNuke?.whitelistedUserIds) ? config.antiNuke.whitelistedUserIds : []
  );
  const [newUserTag, setNewUserTag] = useState('');

  const [whitelistedRoles, setWhitelistedRoles] = useState<string[]>(
    Array.isArray(config?.antiNuke?.whitelistedRoleIds) ? config.antiNuke.whitelistedRoleIds : []
  );
  const [newRoleTag, setNewRoleTag] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (config?.antiNuke) {
      setEnabled(config.antiNuke.enabled ?? true);
      setRoleAction(config.antiNuke.roleChangeAction ?? 'ban');
      setChannelCreateAction(config.antiNuke.channelCreateAction ?? 'ban');
      setChannelDeleteAction(config.antiNuke.channelDeleteAction ?? 'ban');
      setMassBanThreshold(config.antiNuke.massBanThreshold ?? 3);
      setMassKickThreshold(config.antiNuke.massKickThreshold ?? 3);
      setMassChannelThreshold(config.antiNuke.massChannelThreshold ?? 2);
      if (Array.isArray(config.antiNuke.whitelistedUserIds)) {
        setWhitelistedUsers(config.antiNuke.whitelistedUserIds);
      }
      if (Array.isArray(config.antiNuke.whitelistedRoleIds)) {
        setWhitelistedRoles(config.antiNuke.whitelistedRoleIds);
      }
    }
  }, [config]);

  const handleAddUser = () => {
    const id = newUserTag.trim();
    if (id && !whitelistedUsers.includes(id)) {
      setWhitelistedUsers([...whitelistedUsers, id]);
      setNewUserTag('');
    }
  };

  const handleRemoveUser = (id: string) => {
    setWhitelistedUsers(whitelistedUsers.filter((u) => u !== id));
  };

  const handleAddRole = () => {
    const id = newRoleTag.trim();
    if (id && !whitelistedRoles.includes(id)) {
      setWhitelistedRoles([...whitelistedRoles, id]);
      setNewRoleTag('');
    }
  };

  const handleRemoveRole = (id: string) => {
    setWhitelistedRoles(whitelistedRoles.filter((r) => r !== id));
  };

  const handleSave = async () => {
    await onSaveConfig({
      antiNuke: {
        enabled,
        roleChangeAction: roleAction,
        channelCreateAction,
        channelDeleteAction,
        suspiciousActivityAction: 'ban',
        massBanThreshold,
        massKickThreshold,
        massChannelThreshold,
        whitelistedUserIds: whitelistedUsers,
        whitelistedRoleIds: whitelistedRoles,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Anti-Nuke & Server Tamper Protection Core
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Intercepts compromised administrator accounts, unauthorized role grants, rogue channel deletions,
            and raid attempts with millisecond auto-kick, auto-ban, and instant role revocation.
          </p>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">
            {enabled ? 'Shields Armed' : 'Protection Paused'}
          </span>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              enabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                enabled ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Core Protections */}
        <div className="space-y-4">
          {/* Role Change Guard */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Role Change & Escalation Guard</h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Audit Monitored
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Triggers when any member receives or modifies roles (especially roles with Administrator, Manage Roles, or Ban permissions) by an untrusted executor.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Enforcement Action on Untrusted Executor:</label>
              <select
                value={roleAction}
                onChange={(e: any) => setRoleAction(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="ban">🔨 Auto-Ban Executor & Revert Roles (Strict Anti-Nuke)</option>
                <option value="kick">👢 Auto-Kick Executor & Revert Roles</option>
                <option value="strip_roles">✂️ Strip All Admin Roles from Executor & Revert</option>
                <option value="alert_only">⚠️ Revert Roles & Send Admin Alert Only</option>
              </select>
            </div>
            <div className="text-[11px] text-emerald-400/90 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Automatically strips unauthorized permissions from target member.</span>
            </div>
          </div>

          {/* Channel Creation & Deletion Guard */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Channel Wipe & Creation Guard</h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Anti-Wipe
              </span>
            </div>

            <p className="text-xs text-slate-400">
              Protects against rogue channel mass creation (spam channels) or channel deletions (wiping server history).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">On Channel Created:</label>
                <select
                  value={channelCreateAction}
                  onChange={(e: any) => setChannelCreateAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ban">🔨 Ban Executor & Delete Channel</option>
                  <option value="kick">👢 Kick Executor & Delete Channel</option>
                  <option value="delete_channel">🗑️ Delete Channel Only</option>
                  <option value="alert_only">⚠️ Log & Alert Only</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">On Channel Deleted:</label>
                <select
                  value={channelDeleteAction}
                  onChange={(e: any) => setChannelDeleteAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ban">🔨 Auto-Ban Rogue Executor</option>
                  <option value="kick">👢 Auto-Kick Rogue Executor</option>
                  <option value="alert_only">⚠️ Alert Admins via DM Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Mass Actions Velocity Thresholds */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Mass Velocity Tripwires (Anti-Raid)</h3>
            </div>
            <p className="text-xs text-slate-400">
              If an administrator or moderator account is hijacked and begins executing rapid destructive actions, Sentinel auto-bans them when limits are exceeded in 10 seconds:
            </p>

            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">Mass Bans</span>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={massBanThreshold}
                  onChange={(e) => setMassBanThreshold(parseInt(e.target.value) || 3)}
                  className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">bans / 10s</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">Mass Kicks</span>
                <input
                  type="number"
                  min="2"
                  max="20"
                  value={massKickThreshold}
                  onChange={(e) => setMassKickThreshold(parseInt(e.target.value) || 3)}
                  className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">kicks / 10s</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-medium">Channel Wipes</span>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={massChannelThreshold}
                  onChange={(e) => setMassChannelThreshold(parseInt(e.target.value) || 2)}
                  className="w-full px-2 py-1.5 rounded bg-slate-900 border border-slate-700 text-white font-mono font-bold"
                />
                <span className="text-[10px] text-slate-500">deletions / 10s</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Whitelist Manager */}
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Immune Whitelist Manager</h3>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Safe Entities
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Users and roles added here are completely exempt from Anti-Nuke kicks, bans, and rate limits (e.g. Server Owner, Head Administrators, or verified management bots).
            </p>

            {/* Whitelisted User IDs */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Whitelisted User IDs (Immune to Sanctions)</span>
                <span className="text-[11px] text-slate-500">{whitelistedUsers.length} Users</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste Discord User ID..."
                  value={newUserTag}
                  onChange={(e) => setNewUserTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAddUser}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                {whitelistedUsers.map((uid) => (
                  <span
                    key={uid}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs text-indigo-300 font-mono"
                  >
                    <span>{uid}</span>
                    <button
                      onClick={() => handleRemoveUser(uid)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {whitelistedUsers.length === 0 && (
                  <p className="text-[11px] text-slate-500 italic py-1">
                    No individual users whitelisted yet. (Configured admin IDs are automatically immune).
                  </p>
                )}
              </div>
            </div>

            {/* Whitelisted Role IDs */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Whitelisted Role IDs</span>
                <span className="text-[11px] text-slate-500">{whitelistedRoles.length} Roles</span>
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Paste Discord Role ID..."
                  value={newRoleTag}
                  onChange={(e) => setNewRoleTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddRole()}
                  className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleAddRole}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                {whitelistedRoles.map((rid) => (
                  <span
                    key={rid}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs text-purple-300 font-mono"
                  >
                    <span>Role: {rid}</span>
                    <button
                      onClick={() => handleRemoveRole(rid)}
                      className="text-slate-500 hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {whitelistedRoles.length === 0 && (
                  <p className="text-[11px] text-slate-500 italic py-1">
                    No roles whitelisted. Right-click any Discord role and copy its ID to add it here.
                  </p>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition"
              >
                {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                <span>{savedSuccess ? 'Anti-Nuke Settings Saved!' : 'Save Anti-Nuke Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
