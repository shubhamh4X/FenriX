import React, { useState } from 'react';
import { BotConfig } from '../../types.js';
import {
  BellRing,
  Send,
  Plus,
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Info,
  Save,
  Check,
  Smartphone,
} from 'lucide-react';

interface AdminDmTabProps {
  config: BotConfig | null;
  onSaveConfig: (updated: Partial<BotConfig>) => Promise<void>;
  onSendTestDm: (adminId?: string) => Promise<any>;
  loading: boolean;
}

export const AdminDmTab: React.FC<AdminDmTabProps> = ({
  config,
  onSaveConfig,
  onSendTestDm,
  loading,
}) => {
  const [enabled, setEnabled] = useState(config?.dmAlerts.enabled ?? true);
  const [minSeverity, setMinSeverity] = useState<'critical' | 'high' | 'all'>(
    config?.dmAlerts.minSeverity ?? 'high'
  );
  const [alertOnRoleTamper, setAlertOnRoleTamper] = useState(
    config?.dmAlerts.alertOnRoleTamper ?? true
  );
  const [alertOnChannelTamper, setAlertOnChannelTamper] = useState(
    config?.dmAlerts.alertOnChannelTamper ?? true
  );
  const [alertOnRaid, setAlertOnRaid] = useState(
    config?.dmAlerts.alertOnRaid ?? true
  );
  const [alertOnSpamMass, setAlertOnSpamMass] = useState(
    config?.dmAlerts.alertOnSpamMass ?? true
  );
  const [alertOnToxicSevere, setAlertOnToxicSevere] = useState(
    config?.dmAlerts.alertOnToxicSevere ?? true
  );

  const [adminUserIds, setAdminUserIds] = useState<string[]>(
    Array.isArray(config?.adminUserIds) ? config.adminUserIds : []
  );
  const [newAdminId, setNewAdminId] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (config) {
      if (config.dmAlerts) {
        setEnabled(config.dmAlerts.enabled ?? true);
        setMinSeverity(config.dmAlerts.minSeverity ?? 'high');
        setAlertOnRoleTamper(config.dmAlerts.alertOnRoleTamper ?? true);
        setAlertOnChannelTamper(config.dmAlerts.alertOnChannelTamper ?? true);
        setAlertOnRaid(config.dmAlerts.alertOnRaid ?? true);
        setAlertOnSpamMass(config.dmAlerts.alertOnSpamMass ?? true);
        setAlertOnToxicSevere(config.dmAlerts.alertOnToxicSevere ?? true);
      }
      if (Array.isArray(config.adminUserIds)) {
        setAdminUserIds(config.adminUserIds);
      }
    }
  }, [config]);

  const handleAddAdmin = () => {
    const id = newAdminId.trim();
    if (id && !adminUserIds.includes(id)) {
      setAdminUserIds([...adminUserIds, id]);
      setNewAdminId('');
    }
  };

  const handleRemoveAdmin = (id: string) => {
    setAdminUserIds(adminUserIds.filter((u) => u !== id));
  };

  const handleSave = async () => {
    await onSaveConfig({
      adminUserIds,
      dmAlerts: {
        enabled,
        minSeverity,
        alertOnRoleTamper,
        alertOnChannelTamper,
        alertOnRaid,
        alertOnSpamMass,
        alertOnToxicSevere,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleTestAlert = async (targetId?: string) => {
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await onSendTestDm(targetId);
      if (res && res.sentCount > 0) {
        setTestResult({
          success: true,
          message: `Successfully delivered persistent DM alert to ${res.sentCount} administrator(s)! Check your Discord inbox.`,
        });
      } else {
        setTestResult({
          success: false,
          message: res?.errors?.[0] || 'Could not deliver DM. Check that bot is running and user allows DMs.',
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'Error triggering test DM alert',
      });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BellRing className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Persistent Administrator Direct Message (DM) Alerts
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Never miss an emergency: the bot dispatches immediate rich embed alerts directly to server
            administrators via private Discord messages for instantaneous manual oversight.
          </p>
        </div>

        {/* Master Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-300">
            {enabled ? 'DM Dispatch Active' : 'DM Dispatch Muted'}
          </span>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`w-12 h-6 rounded-full transition-colors relative ${
              enabled ? 'bg-amber-500' : 'bg-slate-700'
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
        {/* Left Column: Target Admin IDs */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              Administrator Recipient Discord IDs
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {adminUserIds.length} Registered
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Add the Discord User IDs of server owners and lead moderators. Every time a threat or breach is intercepted, Sentinel will immediately send a private direct message to each recipient.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter Discord User ID (e.g. 349123847129384712)"
              value={newAdminId}
              onChange={(e) => setNewAdminId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
              className="flex-1 px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleAddAdmin}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add ID</span>
            </button>
          </div>

          {/* List of Registered Admin IDs */}
          <div className="space-y-2 max-h-48 overflow-y-auto pt-1">
            {adminUserIds.map((id) => (
              <div
                key={id}
                className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-slate-200">{id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestAlert(id)}
                    disabled={sendingTest}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-sans transition"
                  >
                    Test DM
                  </button>
                  <button
                    onClick={() => handleRemoveAdmin(id)}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {adminUserIds.length === 0 && (
              <div className="p-4 rounded-lg bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No administrator IDs configured yet. Add your Discord User ID above to start receiving alerts.
              </div>
            )}
          </div>

          {/* Verification feedback box */}
          {testResult && (
            <div
              className={`p-3 rounded-lg text-xs flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>{testResult.message}</div>
            </div>
          )}

          {/* Test DM button */}
          <button
            onClick={() => handleTestAlert()}
            disabled={sendingTest || adminUserIds.length === 0}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>{sendingTest ? 'Dispatching to Discord...' : 'Send Live Test DM to All Admins'}</span>
          </button>
        </div>

        {/* Right Column: Alert Triggers & Sensitivity */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              Event Triggers & Sensitivity
            </h3>
            <span className="text-xs text-slate-500">Immediate Push</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Minimum Severity */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Minimum Alert Severity:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['critical', 'high', 'all'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setMinSeverity(level)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold capitalize transition ${
                      minSeverity === level
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {level === 'critical' && 'Critical Only'}
                    {level === 'high' && 'High & Critical'}
                    {level === 'all' && 'All Incidents'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Critical triggers only for unauthorized role changes, channel deletion, and mass nuke attacks.
              </p>
            </div>

            {/* Event Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="font-semibold text-slate-300 block">Active DM Push Notifications:</span>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Unauthorized Role Tampering</strong>
                  <span className="text-[11px] text-slate-500">Role assigned/modified by untrusted user</span>
                </div>
                <input
                  type="checkbox"
                  checked={alertOnRoleTamper}
                  onChange={(e) => setAlertOnRoleTamper(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Channel Created or Deleted</strong>
                  <span className="text-[11px] text-slate-500">Immediate alert on channel tampering</span>
                </div>
                <input
                  type="checkbox"
                  checked={alertOnChannelTamper}
                  onChange={(e) => setAlertOnChannelTamper(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Mass Raid & Velocity Attacks</strong>
                  <span className="text-[11px] text-slate-500">Mass ban or mass kick spikes</span>
                </div>
                <input
                  type="checkbox"
                  checked={alertOnRaid}
                  onChange={(e) => setAlertOnRaid(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Severe Toxic Language & Violent Threats</strong>
                  <span className="text-[11px] text-slate-500">AI flags high-threat harassment/doxxing</span>
                </div>
                <input
                  type="checkbox"
                  checked={alertOnToxicSevere}
                  onChange={(e) => setAlertOnToxicSevere(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Mass Spam Bursts</strong>
                  <span className="text-[11px] text-slate-500">Rapid rate limit violations</span>
                </div>
                <input
                  type="checkbox"
                  checked={alertOnSpamMass}
                  onChange={(e) => setAlertOnSpamMass(e.target.checked)}
                  className="rounded accent-amber-500 w-4 h-4"
                />
              </label>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition"
            >
              {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Alert Settings Saved!' : 'Save DM Dispatch Settings'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
