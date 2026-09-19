import React, { useState, useEffect, useCallback } from 'react';
import { BotStatus, BotConfig, AuditLogEntry } from './types.js';
import { Header } from './components/Header.js';
import { Navigation, TabId } from './components/Navigation.js';
import { OverviewTab } from './components/tabs/OverviewTab.js';
import { ModerationTab } from './components/tabs/ModerationTab.js';
import { CommandsTab } from './components/tabs/CommandsTab.js';
import { SetupTab } from './components/tabs/SetupTab.js';
import { AntiNukeTab } from './components/tabs/AntiNukeTab.js';
import { AutoModTab } from './components/tabs/AutoModTab.js';
import { AdminDmTab } from './components/tabs/AdminDmTab.js';
import { AuditLogsTab } from './components/tabs/AuditLogsTab.js';
import { SimulatorTab } from './components/tabs/SimulatorTab.js';
import { ExportTab } from './components/tabs/ExportTab.js';
import { LevelingTab } from './components/tabs/LevelingTab.js';
import { LandingPage } from './components/landing/LandingPage.js';
import { InviteModal } from './components/landing/InviteModal.js';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const getInitialView = (): 'landing' | 'dashboard' => {
    if (typeof window !== 'undefined') {
      const search = window.location.search.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (search.includes('view=dashboard') || hash.includes('dashboard')) {
        return 'dashboard';
      }
    }
    return 'landing';
  };

  const [viewMode, setViewModeState] = useState<'landing' | 'dashboard'>(getInitialView);

  const setViewMode = (mode: 'landing' | 'dashboard') => {
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      const newHash = mode === 'dashboard' ? '#dashboard' : '';
      if (window.location.hash !== newHash) {
        window.history.replaceState(
          null,
          '',
          newHash ? `${window.location.pathname}${newHash}` : window.location.pathname
        );
      }
    }
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('dashboard')) {
        setViewModeState('dashboard');
      } else {
        setViewModeState('landing');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 4000);
  };

  // Fetch bot status
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.error('Failed to fetch status', err);
    }
  }, []);

  // Fetch bot config
  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/config');
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error('Failed to fetch config', err);
    }
  }, []);

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('/api/bot/logs');
      if (res.ok) {
        const data = await res.json();
        const logsArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.logs)
          ? data.logs
          : [];
        setLogs(logsArray);
      }
    } catch (err) {
      console.error('Failed to fetch logs', err);
    }
  }, []);

  // Initial load & Polling
  useEffect(() => {
    fetchStatus();
    fetchConfig();
    fetchLogs();

    // Poll status and logs every 3 seconds
    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
    }, 3000);

    return () => clearInterval(interval);
  }, [fetchStatus, fetchConfig, fetchLogs]);

  // Refresh all
  const handleRefresh = async () => {
    setLoading(true);
    await Promise.all([fetchStatus(), fetchConfig(), fetchLogs()]);
    setLoading(false);
    showToast('Fenris data refreshed', 'info');
  };

  // Start bot
  const handleStartBot = async (tokenOverride?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenOverride }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        showToast(data.message || 'Failed to start bot', 'error');
      } else {
        showToast(data.message || 'Fenris starting up and arming sentinel defenses...', 'success');
        await fetchStatus();
      }
    } catch (err: any) {
      showToast(err?.message || 'Network error starting bot', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Stop bot
  const handleStopBot = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/stop', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || 'Fenris stopped', 'info');
      await fetchStatus();
    } catch (err: any) {
      showToast(err?.message || 'Failed to stop bot', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Save config
  const handleSaveConfig = async (updated: Partial<BotConfig>) => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config || data);
        showToast('Configuration updated successfully', 'success');
      } else {
        showToast('Failed to save configuration', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to update config', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Clear logs
  const handleClearLogs = async () => {
    try {
      const res = await fetch('/api/bot/logs/clear', { method: 'POST' });
      if (res.ok) {
        setLogs([]);
        showToast('Audit logs cleared', 'info');
      }
    } catch (err) {
      showToast('Failed to clear logs', 'error');
    }
  };

  // Simulate breach
  const handleSimulateBreach = async (type: string, targetAdminId?: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/bot/simulate-breach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, targetAdminId }),
      });
      const data = await res.json();
      showToast(`Simulated breach triggered: ${type}`, 'success');
      await fetchLogs();
      return data;
    } catch (err: any) {
      showToast('Error simulating breach', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Test admin DM
  const handleTestDm = async (adminId?: string) => {
    try {
      const res = await fetch('/api/bot/test-dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId }),
      });
      const data = await res.json();
      if (data.success && data.sentCount > 0) {
        showToast(`Test alert DM delivered to ${data.sentCount} admin(s)!`, 'success');
      } else {
        showToast(data.errors?.[0] || 'Unable to deliver test DM alert', 'error');
      }
      await fetchLogs();
      return data;
    } catch (err: any) {
      showToast('Error dispatching test DM', 'error');
      throw err;
    }
  };

  // Execute bot command from web terminal
  const handleExecuteCommand = async (command: string, args: string[]) => {
    const res = await fetch('/api/bot/commands/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, args }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || 'Command failed');
    }
    await fetchLogs();
    return data;
  };

  const threatCount =
    (status?.stats.todayBlockedSpam || 0) +
    (status?.stats.todayBlockedToxicity || 0) +
    (status?.stats.todayRoleTamperBlocked || 0) +
    (status?.stats.todayChannelTamperBlocked || 0);

  if (viewMode === 'landing') {
    return (
      <div className="relative">
        <LandingPage
          status={status}
          onOpenDashboard={() => setViewMode('dashboard')}
        />

        {/* Quick floating pill to jump to Live Console */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setViewMode('dashboard')}
            className="px-4 py-2.5 rounded-xl bg-neutral-900/90 border border-neutral-700 text-white font-mono text-xs uppercase tracking-wider font-semibold shadow-2xl hover:bg-neutral-800 hover:border-neutral-500 transition-all flex items-center gap-2 backdrop-blur hover:scale-105"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Open Bot Console</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Top Header */}
      <Header
        status={status}
        loading={loading}
        onRefresh={handleRefresh}
        onStart={() => handleStartBot()}
        onStop={handleStopBot}
        onNavigateToSetup={() => setActiveTab('setup')}
        onSwitchToLanding={() => setViewMode('landing')}
        onOpenInvite={() => setInviteModalOpen(true)}
      />

      {/* Main Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        threatCount={threatCount}
        isOnline={status?.status === 'online'}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {activeTab === 'overview' && (
          <OverviewTab
            status={status}
            config={config}
            recentLogs={logs}
            onChangeTab={setActiveTab}
            onSimulateBreach={handleSimulateBreach}
            onTestDm={() => handleTestDm()}
          />
        )}

        {activeTab === 'moderation' && (
          <ModerationTab
            config={config}
            onSaveConfig={handleSaveConfig}
            isBotOnline={status?.status === 'online'}
          />
        )}

        {activeTab === 'commands' && (
          <CommandsTab onExecuteCommand={handleExecuteCommand} />
        )}

        {activeTab === 'leveling' && <LevelingTab />}

        {activeTab === 'setup' && (
          <SetupTab
            config={config}
            status={status}
            onSaveConfig={handleSaveConfig}
            onStartBot={handleStartBot}
            onStopBot={handleStopBot}
            loading={loading}
          />
        )}

        {activeTab === 'anti-nuke' && (
          <AntiNukeTab
            config={config}
            onSaveConfig={handleSaveConfig}
            loading={loading}
          />
        )}

        {activeTab === 'automod' && (
          <AutoModTab
            config={config}
            onSaveConfig={handleSaveConfig}
            loading={loading}
          />
        )}

        {activeTab === 'admin-dm' && (
          <AdminDmTab
            config={config}
            onSaveConfig={handleSaveConfig}
            onSendTestDm={handleTestDm}
            loading={loading}
          />
        )}

        {activeTab === 'audit-logs' && (
          <AuditLogsTab
            logs={logs}
            onClearLogs={handleClearLogs}
            loading={loading}
          />
        )}

        {activeTab === 'simulator' && (
          <SimulatorTab
            onSimulateBreach={handleSimulateBreach}
            loading={loading}
          />
        )}

        {activeTab === 'export' && <ExportTab />}
      </main>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-xl border shadow-2xl flex items-center gap-3 transition-all transform duration-300 ${
            toast.type === 'success'
              ? 'bg-neutral-900 border-white text-white shadow-[0_0_20px_rgba(255,255,255,0.2)]'
              : toast.type === 'error'
              ? 'bg-neutral-950 border-neutral-600 text-neutral-200'
              : 'bg-neutral-900 border-neutral-800 text-neutral-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-neutral-400 shrink-0" />
          )}
          <span className="text-xs font-mono font-medium leading-relaxed">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-neutral-400 hover:text-white ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Dashboard Footer */}
      <footer className="border-t border-neutral-800/80 bg-black px-4 sm:px-8 py-4 text-xs text-neutral-400">
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-7xl mx-auto gap-2 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wide">FENRIS</span>
            <span className="text-neutral-600">•</span>
            <span>Discord Server Security &amp; Moderation Platform</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span>Prefix: <code className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-200 font-mono text-[11px]">!</code> or <code className="px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-200 font-mono text-[11px]">/</code></span>
            <span className="text-neutral-600">•</span>
            <span className="font-mono text-[11px]">Discord.js v14</span>
          </div>
        </div>
      </footer>

      {/* Discord Bot Invite Modal */}
      <InviteModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        clientId={status?.id || config?.clientId || '1550746964151242793'}
      />
    </div>
  );
}
