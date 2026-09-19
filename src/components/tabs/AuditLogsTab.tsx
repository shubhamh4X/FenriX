import React, { useState } from 'react';
import { AuditLogEntry, SeverityLevel } from '../../types.js';
import {
  ScrollText,
  Search,
  Filter,
  Trash2,
  Download,
  Copy,
  Check,
  ShieldAlert,
  Flame,
  MessageSquareWarning,
  Users,
  Hash,
  Bell,
  Sparkles,
} from 'lucide-react';

interface AuditLogsTabProps {
  logs: AuditLogEntry[];
  onClearLogs: () => Promise<void>;
  loading: boolean;
}

export const AuditLogsTab: React.FC<AuditLogsTabProps> = ({
  logs,
  onClearLogs,
  loading,
}) => {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copied, setCopied] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const filteredLogs = safeLogs.filter((log) => {
    if (selectedSeverity !== 'all' && log.severity !== selectedSeverity) {
      return false;
    }
    if (selectedCategory !== 'all' && log.type !== selectedCategory) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchExecutor = log.executor.tag.toLowerCase().includes(q) || log.executor.id.includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchAction = log.actionTaken.toLowerCase().includes(q);
      const matchTarget = log.target.name.toLowerCase().includes(q);
      return matchExecutor || matchDetails || matchAction || matchTarget;
    }
    return true;
  });

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(safeLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `discord-sentinel-audit-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(JSON.stringify(filteredLogs, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'role_change':
        return <Users className="w-4 h-4 text-purple-400" />;
      case 'channel_created':
      case 'channel_deleted':
        return <Hash className="w-4 h-4 text-cyan-400" />;
      case 'spam_blocked':
        return <Flame className="w-4 h-4 text-amber-400" />;
      case 'toxic_blocked':
        return <MessageSquareWarning className="w-4 h-4 text-rose-400" />;
      case 'dm_alert':
        return <Bell className="w-4 h-4 text-indigo-400" />;
      case 'simulated_event':
        return <Sparkles className="w-4 h-4 text-amber-300" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fadeIn">
      {/* Top Header Controls */}
      <div className="cozy-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/40 flex items-center justify-center text-[#8ea1e1]">
              <ScrollText className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Real-Time Security Audit &amp; Incident Log
            </h2>
          </div>
          <p className="text-xs text-neutral-400">
            Immutable live audit trail of all moderation actions, auto-bans, role revocations, channel tampers, and admin alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLogs}
            className="shine-hover px-3.5 py-2 rounded-xl bg-[#121620] hover:bg-[#1a212e] text-neutral-200 text-xs font-semibold flex items-center gap-1.5 border border-[#212a3a] hover:border-[#3a4a66] transition cursor-pointer active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-neutral-400" />}
            <span>{copied ? 'Copied' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleExportJson}
            className="shine-hover px-3.5 py-2 rounded-xl bg-[#121620] hover:bg-[#1a212e] text-neutral-200 text-xs font-semibold flex items-center gap-1.5 border border-[#212a3a] hover:border-[#3a4a66] transition cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>Export</span>
          </button>

          <button
            onClick={onClearLogs}
            disabled={loading || safeLogs.length === 0}
            className="shine-hover px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-800/60 transition cursor-pointer active:scale-95 disabled:opacity-40"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative sm:col-span-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by user, channel, or detail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#121620] border border-[#212a3a] text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#5865F2] transition"
          />
        </div>

        {/* Severity Filter */}
        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#121620] border border-[#212a3a] text-xs text-neutral-200 focus:outline-none focus:border-[#5865F2] transition"
          >
            <option value="all">All Severities</option>
            <option value="critical">🔴 Critical Only (Role tamper &amp; nuke)</option>
            <option value="high">🟠 High (Severe toxicity &amp; bans)</option>
            <option value="warning">🟡 Warning (Spam bursts &amp; timeouts)</option>
            <option value="info">🔵 Info (Status &amp; configs)</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[#121620] border border-[#212a3a] text-xs text-neutral-200 focus:outline-none focus:border-[#5865F2] transition"
          >
            <option value="all">All Event Categories</option>
            <option value="role_change">Role Change &amp; Escalation</option>
            <option value="channel_created">Channel Created</option>
            <option value="channel_deleted">Channel Deleted</option>
            <option value="spam_blocked">Spam Blocked</option>
            <option value="toxic_blocked">AI Toxic / Harassment</option>
            <option value="dm_alert">Admin DM Alerts</option>
            <option value="simulated_event">Simulated Sandbox Events</option>
            <option value="bot_status">Bot Status</option>
          </select>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="cozy-card rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121620]/70 border-b border-[#212a3a] text-neutral-400 font-semibold uppercase text-[10px] tracking-wider font-mono">
              <tr>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Event &amp; Action</th>
                <th className="py-3 px-4">Perpetrator / Executor</th>
                <th className="py-3 px-4">Target / Channel</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2535]">
              {filteredLogs.map((log) => {
                const isCrit = log.severity === 'critical';
                const isHigh = log.severity === 'high';
                const isWarn = log.severity === 'warning';

                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-[#161d2a] cursor-pointer transition"
                  >
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase font-mono ${
                          isCrit
                            ? 'bg-rose-500 text-white shadow-sm shadow-rose-950'
                            : isHigh
                            ? 'bg-amber-500 text-neutral-950 font-extrabold'
                            : isWarn
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-[#121620] text-neutral-400 border border-[#212a3a]'
                        }`}
                      >
                        {log.severity}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getLogIcon(log.type)}
                        <span className="font-semibold text-white">{log.actionTaken}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-mono text-[#8ea1e1]">
                        {log.executor.tag}
                        <span className="text-neutral-400 text-[10px] block font-mono">
                          ID: {log.executor.id}
                        </span>
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-neutral-300">
                      {log.target.name}
                    </td>

                    <td className="py-3 px-4 text-neutral-400 max-w-xs truncate">
                      {log.details}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right text-neutral-400 font-mono text-[11px]">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400 text-xs">
                    No security incidents match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Modal / Drawer for Selected Log */}
      {selectedLog && (
        <div
          className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="max-w-lg w-full p-6 rounded-2xl bg-[#141820] border border-[#263143] shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#212a3a] pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase font-mono ${
                    selectedLog.severity === 'critical'
                      ? 'bg-rose-500 text-white'
                      : selectedLog.severity === 'high'
                      ? 'bg-amber-500 text-neutral-950'
                      : 'bg-[#121620] text-neutral-300 border border-[#212a3a]'
                  }`}
                >
                  {selectedLog.severity}
                </span>
                <h3 className="font-bold text-white text-sm">{selectedLog.actionTaken}</h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-[#202838] transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-neutral-400 block font-medium">Incident Description:</span>
                <p className="text-neutral-200 mt-1 leading-relaxed bg-[#10141c] p-3 rounded-xl border border-[#202736]">
                  {selectedLog.details}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#10141c] border border-[#202736]">
                  <span className="text-neutral-400 text-[11px] block">Perpetrator</span>
                  <strong className="text-[#8ea1e1] font-mono block truncate mt-0.5">
                    {selectedLog.executor.tag}
                  </strong>
                  <span className="text-neutral-400 font-mono text-[10px]">
                    ID: {selectedLog.executor.id}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#10141c] border border-[#202736]">
                  <span className="text-neutral-400 text-[11px] block">Target Entity</span>
                  <strong className="text-white block truncate mt-0.5">{selectedLog.target.name}</strong>
                  <span className="text-neutral-400 text-[10px]">Type: {selectedLog.type}</span>
                </div>
              </div>

              {selectedLog.metadata && (
                <div>
                  <span className="text-neutral-400 block font-medium mb-1">Metadata / Audit Payload:</span>
                  <pre className="p-3 rounded-xl bg-[#10141c] border border-[#202736] text-[11px] font-mono text-neutral-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="text-neutral-400 text-[11px] flex items-center justify-between pt-2 border-t border-[#212a3a]">
                <span>Logged at {new Date(selectedLog.timestamp).toUTCString()}</span>
                <span className="font-mono">{selectedLog.id}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
