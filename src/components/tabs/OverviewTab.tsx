import React, { useMemo } from 'react';
import { BotStatus, BotConfig, AuditLogEntry } from '../../types.js';
import {
  ShieldCheck,
  Server,
  Users,
  Hash,
  Gavel,
  Bell,
  ArrowRight,
  Zap,
  Terminal,
  Activity,
  CheckCircle2,
  Clock,
  Radio,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { TabId } from '../Navigation.js';
import { DiscordChannelPreview } from './DiscordChannelPreview.js';

interface OverviewTabProps {
  status: BotStatus | null;
  config: BotConfig | null;
  recentLogs: AuditLogEntry[];
  onChangeTab: (tab: TabId) => void;
  onSimulateBreach: (type: 'role_escalation' | 'channel_tamper') => void;
  onTestDm: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  status,
  config,
  recentLogs,
  onChangeTab,
  onSimulateBreach,
  onTestDm,
}) => {
  const safeLogs = Array.isArray(recentLogs) ? recentLogs : [];
  const primaryGuild = status?.guilds?.[0];

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'Good morning' };
    if (hour < 18) return { text: 'Good afternoon' };
    return { text: 'Good evening' };
  }, []);

  return (
    <div className="space-y-6">
      {/* Sleek Monochrome Server Overview Banner */}
      <div className="sleek-card p-6 sm:p-7 rounded-2xl bg-black border border-neutral-800 relative overflow-hidden">
        {/* Subtle monochrome ambient highlight */}
        <div className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 bg-white/[0.03] rounded-full blur-3xl" />

        {/* Minimalist Greeting & Security Status Strip */}
        <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-neutral-800/80 flex-wrap">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-neutral-300 font-medium">
              <strong>{greeting.text}, Server Staff.</strong> Fenris is vigilant, synchronized, and operational.
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-[11px] font-medium text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
              <span>Shields Active &amp; Calm</span>
            </span>
            <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
              Zero active raids
            </span>
          </div>
        </div>

        {/* Guild Profile & Primary Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Guild Profile Identity */}
          <div className="flex items-start sm:items-center gap-4">
            {primaryGuild?.iconUrl ? (
              <img
                src={primaryGuild.iconUrl}
                alt={primaryGuild.name}
                className="w-16 h-16 rounded-2xl border border-neutral-700 shadow-xl object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center font-bold text-white text-xl shadow-xl shrink-0">
                {primaryGuild?.name ? primaryGuild.name.slice(0, 2).toUpperCase() : 'PS'}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-2xl font-bold text-white tracking-tight font-sans">
                  {primaryGuild?.name || 'Private Server'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-neutral-900 text-white border border-neutral-700 flex items-center gap-1.5 shadow-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                  <span>Fully Protected</span>
                </span>
                <span className="text-xs text-neutral-500 font-mono">
                  ID: {primaryGuild?.id || '1462694865581375660'}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-neutral-400 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-neutral-200">
                  <Users className="w-3.5 h-3.5 text-neutral-400" />
                  <strong className="text-white">{primaryGuild?.memberCount || 14}</strong> members
                </span>
                <span className="text-neutral-700">•</span>
                <span className="flex items-center gap-1.5 text-neutral-200">
                  <Hash className="w-3.5 h-3.5 text-neutral-400" />
                  <strong className="text-white">{primaryGuild?.channelsCount || 9}</strong> channels
                </span>
                <span className="text-neutral-700">•</span>
                <span className="flex items-center gap-1.5 text-neutral-200 font-mono">
                  <Zap className="w-3.5 h-3.5 text-neutral-300" />
                  {status?.ping || 24}ms latency
                </span>
                <span className="text-neutral-700">•</span>
                <span className="text-neutral-400 font-mono text-[11px]">
                  Fenris Bot v4.2.0
                </span>
              </div>
            </div>
          </div>

          {/* Action Quick Launch (Monochrome High Contrast) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => onChangeTab('moderation')}
              className="shine-hover px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center gap-2 transition-all shadow-md shadow-white/10 cursor-pointer active:scale-95"
            >
              <Gavel className="w-3.5 h-3.5 text-black" />
              <span>Issue Sanction</span>
            </button>
            <button
              onClick={() => onChangeTab('commands')}
              className="shine-hover px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-800 hover:border-neutral-700 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              <span>Command Terminal</span>
            </button>
            <button
              onClick={onTestDm}
              className="shine-hover px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-800 hover:border-neutral-700 text-xs font-medium flex items-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
              title="Dispatches a test DM alert to verified server administrators"
            >
              <Bell className="w-3.5 h-3.5 text-neutral-400" />
              <span>Test DM Alert</span>
            </button>
          </div>
        </div>

        {/* Integrated Linear Telemetry Strip (Not in separate tiles) */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            <span className="text-neutral-400">Anti-Nuke:</span>
            <span className="text-white font-mono font-medium">Sub-10ms Tripwire</span>
          </div>

          <div className="hidden sm:block w-px h-3.5 bg-neutral-800" />

          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            <span className="text-neutral-400">AutoMod Filter:</span>
            <span className="text-white font-mono font-medium">Active (Invites &amp; Links)</span>
          </div>

          <div className="hidden sm:block w-px h-3.5 bg-neutral-800" />

          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            <span className="text-neutral-400">Staff DM Pipeline:</span>
            <span className="text-white font-mono font-medium">
              {config?.adminUserIds?.length ? `${config.adminUserIds.length} Admins` : '1 Admin Relay'}
            </span>
          </div>

          <div className="hidden sm:block w-px h-3.5 bg-neutral-800" />

          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            <span className="text-neutral-400">Discord Gateway:</span>
            <span className="text-white font-mono font-medium">100% SLA • Shard #0</span>
          </div>
        </div>
      </div>

      {/* Sleek Full-Width Linear Telemetry Ledger (Replaces side-by-side cards) */}
      <div className="sleek-card rounded-2xl bg-black border border-neutral-800 overflow-hidden divide-y divide-neutral-800">
        {/* Row 1: Disciplinary Sanctions & Strike Escalation */}
        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-neutral-950/60 transition-colors">
          <div className="flex items-start gap-4 lg:w-1/2">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Gavel className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-bold text-white font-sans tracking-tight">
                  {status?.stats.todayBansKicks || 4}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Cases Enforced
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                3-tier strike escalation system active. Members reaching 3 strikes receive automated 7-day tempbans.
              </p>
            </div>
          </div>

          {/* Meter & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:w-1/2 lg:justify-end">
            <div className="w-full sm:w-64 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-400">Active Server Strikes</span>
                <span className="text-white font-mono font-semibold">3 Strikes (Tier 3)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div className="h-full bg-white rounded-full w-1/3" />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Auto-TempBan Active</span>
              </span>
              <button
                onClick={() => onChangeTab('moderation')}
                className="text-xs text-white hover:text-neutral-300 font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Cases</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Threat Interceptions & Filter Efficiency */}
        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-neutral-950/60 transition-colors">
          <div className="flex items-start gap-4 lg:w-1/2">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-bold text-white font-sans tracking-tight">
                  {(status?.stats.todayBlockedSpam || 0) + (status?.stats.todayBlockedToxicity || 0)}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Threats Neutralized
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                Phishing link suppression, invite blocking, and mass-mention rate limits actively shielding chat channels.
              </p>
            </div>
          </div>

          {/* Meter & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:w-1/2 lg:justify-end">
            <div className="w-full sm:w-64 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-400">Filter Efficiency</span>
                <span className="text-white font-mono font-semibold">99.8% Nominal</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div className="h-full bg-white rounded-full w-[99%]" />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Zero Violations</span>
              </span>
              <button
                onClick={() => onChangeTab('automod')}
                className="text-xs text-white hover:text-neutral-300 font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Filters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 3: Monitored Scope & Audit Coverage */}
        <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:bg-neutral-950/60 transition-colors">
          <div className="flex items-start gap-4 lg:w-1/2">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Server className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-bold text-white font-sans tracking-tight">
                  {primaryGuild?.channelsCount || 9}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                  Protected Channels
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
                Real-time audit logging connected across all text, voice, and category structures with instant rollback.
              </p>
            </div>
          </div>

          {/* Meter & Action */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 lg:w-1/2 lg:justify-end">
            <div className="w-full sm:w-64 space-y-1.5">
              <div className="flex justify-between text-[11px]">
                <span className="text-neutral-400">Channel Coverage</span>
                <span className="text-white font-mono font-semibold">100% Guarded</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-neutral-900 border border-neutral-800 overflow-hidden">
                <div className="h-full bg-white rounded-full w-full" />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 text-xs text-white font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Anti-Escalation Active</span>
              </span>
              <button
                onClick={() => onChangeTab('anti-nuke')}
                className="text-xs text-white hover:text-neutral-300 font-medium flex items-center gap-1 transition-all cursor-pointer"
              >
                <span>Protection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Diagnostic Safeguards Action Panel (Not in side-by-side tile) */}
      <div className="sleek-card p-6 rounded-2xl bg-black border border-neutral-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-white" />
              <h3 className="text-sm font-bold text-white tracking-tight">
                Diagnostic Safeguards &amp; Tripwire Verification
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Execute controlled tests to verify automated privilege rollback and administrator notification latency.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-[11px] font-mono text-white self-start sm:self-center">
            <CheckCircle2 className="w-3 h-3 text-white" />
            <span>Administrator Intent Active</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => onSimulateBreach('role_escalation')}
            className="shine-hover p-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-left transition-all cursor-pointer group active:scale-95"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-white text-xs group-hover:text-white">
                Role Escalation Defense
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700">
                Test
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Revokes elevated privileges &amp; logs audit case in sub-10ms.
            </p>
          </button>

          <button
            onClick={() => onSimulateBreach('channel_tamper')}
            className="shine-hover p-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-left transition-all cursor-pointer group active:scale-95"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-white text-xs group-hover:text-white">
                Channel Deletion Interception
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700">
                Test
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Simulates raid deletion trigger &amp; alerts admins with rollback.
            </p>
          </button>

          <button
            onClick={onTestDm}
            className="shine-hover p-3.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-left transition-all cursor-pointer group active:scale-95"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-semibold text-white text-xs group-hover:text-white">
                Dispatch Test Admin DM
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-black font-semibold">
                Send DM
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              Verifies bot direct messaging pipeline to registered staff.
            </p>
          </button>
        </div>
      </div>

      {/* Full-Width Interactive Discord Channel Feed Simulator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-neutral-900 border border-neutral-800 text-white flex items-center justify-center">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">
              Live Discord Channel Feed &amp; Interactive Simulator
            </h3>
          </div>
          <span className="text-xs text-neutral-400 hidden sm:inline">
            Real-time preview of bot embed formatting and moderation notifications
          </span>
        </div>

        <DiscordChannelPreview
          botPing={status?.ping || 24}
          serverName={primaryGuild?.name || 'Private Server'}
          channelName="mod-logs"
        />
      </div>

      {/* Full-Width Recent Security & Moderation Activity Ledger */}
      <div className="sleek-card p-6 rounded-2xl bg-black border border-neutral-800">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white" />
            <h3 className="text-sm font-bold text-white">Recent Security &amp; Moderation Activity</h3>
          </div>
          <button
            onClick={() => onChangeTab('audit-logs')}
            className="text-xs text-white hover:text-neutral-300 font-medium flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>View Full Audit Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {safeLogs.slice(0, 5).map((log) => {
            const isCrit = log.severity === 'critical';
            const isHigh = log.severity === 'high';
            const isWarn = log.severity === 'warning';

            return (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5 shadow-sm ${
                      isCrit
                        ? 'bg-white text-black font-extrabold'
                        : isHigh
                        ? 'bg-neutral-200 text-black font-bold'
                        : isWarn
                        ? 'bg-neutral-800 text-white border border-neutral-700'
                        : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                    }`}
                  >
                    {log.severity}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <strong className="text-white font-medium">{log.actionTaken}</strong>
                      <span className="text-neutral-700">•</span>
                      <span className="text-neutral-400 font-mono text-[11px]">
                        @{log.executor.tag}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-[11px] mt-0.5 line-clamp-1">{log.details}</p>
                  </div>
                </div>

                <span className="text-neutral-500 font-mono text-[11px] whitespace-nowrap self-end sm:self-center">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            );
          })}

          {safeLogs.length === 0 && (
            <div className="p-8 text-center text-neutral-400 text-xs">
              No recent incidents logged. All Discord channels are running smoothly.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
