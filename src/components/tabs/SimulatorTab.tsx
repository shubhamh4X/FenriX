import React, { useState } from 'react';
import {
  FlaskConical,
  Sparkles,
  ShieldAlert,
  Send,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Hash,
  Users,
  MessageSquare,
  Flame,
} from 'lucide-react';

interface SimulatorTabProps {
  onSimulateBreach: (type: 'role_escalation' | 'channel_tamper') => Promise<any>;
  loading: boolean;
}

export const SimulatorTab: React.FC<SimulatorTabProps> = ({
  onSimulateBreach,
  loading,
}) => {
  // Sandbox message state
  const [testMessage, setTestMessage] = useState(
    'Hey guys claim 3 months of free Discord Nitro here: discord.gg/free-nitro-drop !!'
  );
  const [testAuthor, setTestAuthor] = useState('SuspiciousRaid#4040');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);

  // Breach simulation state
  const [simulatingBreach, setSimulatingBreach] = useState(false);
  const [breachResult, setBreachResult] = useState<any | null>(null);

  const presets = [
    {
      label: 'Invite Spam Link',
      text: 'Check out this awesome new gaming hub discord.gg/exclusive-perks join fast!',
    },
    {
      label: 'Toxic Harassment & Threat',
      text: 'I know your IP and address, you better delete your account or I will dox you right now.',
    },
    {
      label: 'Mass Mention & Caps',
      text: 'WAKE UP EVERYONE @everyone @everyone @here FREE ROBUX AND STEAM KEYS CLICK NOW!!!!',
    },
    {
      label: 'Clean Community Chat',
      text: 'Has anyone finished the new raid boss yet? Looking for two more players to join voice chat tonight!',
    },
  ];

  const handleAnalyzeMessage = async () => {
    if (!testMessage.trim()) return;
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const res = await fetch('/api/bot/simulate-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: testMessage,
          authorTag: testAuthor,
        }),
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      setAnalysisResult({
        error: true,
        message: err?.message || 'Simulation network error',
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTriggerBreach = async (type: 'role_escalation' | 'channel_tamper') => {
    setSimulatingBreach(true);
    setBreachResult(null);
    try {
      const res = await onSimulateBreach(type);
      setBreachResult(res);
    } catch (e: any) {
      setBreachResult({ error: e?.message || 'Simulation execution failed' });
    } finally {
      setSimulatingBreach(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            Threat & Incident Simulation Sandbox
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl">
          Safely test your auto-moderation rules, Gemini AI toxicity analyzer, and anti-nuke safeguards without
          disrupting your live Discord server or requiring a compromised dummy account.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: AI & Spam Text Scanner */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Message Moderation Simulator
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Heuristics + Gemini AI
            </span>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1">
            <span className="text-[11px] text-slate-400 font-semibold">Test Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setTestMessage(p.text)}
                  className="px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 transition"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Message Content:</label>
            <textarea
              rows={3}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              placeholder="Type or paste any Discord chat message to evaluate..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Simulated Author Tag:</label>
            <input
              type="text"
              value={testAuthor}
              onChange={(e) => setTestAuthor(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            onClick={handleAnalyzeMessage}
            disabled={analyzing || !testMessage.trim()}
            className="w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{analyzing ? 'Scanning Heuristics & AI...' : 'Run AutoMod & AI Scan'}</span>
          </button>

          {/* Analysis Results Display */}
          {analysisResult && (
            <div
              className={`p-4 rounded-xl border space-y-2.5 text-xs ${
                analysisResult.blocked
                  ? 'bg-rose-500/10 border-rose-500/30'
                  : 'bg-emerald-500/10 border-emerald-500/30'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {analysisResult.blocked ? (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <strong className={analysisResult.blocked ? 'text-rose-300' : 'text-emerald-300'}>
                    {analysisResult.blocked ? 'Message Blocked by Sentinel' : 'Message Permitted (Clean)'}
                  </strong>
                </div>

                {analysisResult.toxicityScore !== undefined && (
                  <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-200 text-[11px]">
                    Toxicity: {analysisResult.toxicityScore}/100
                  </span>
                )}
              </div>

              {analysisResult.reason && (
                <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px]">
                  <strong>Triggered Rule:</strong> {analysisResult.reason}
                </p>
              )}

              {analysisResult.actionEnforced && (
                <div className="text-[11px] text-amber-300 flex items-center gap-1.5 font-medium">
                  <AlertOctagon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Enforcement Action: {analysisResult.actionEnforced}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Anti-Nuke Breach Scenarios */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              Anti-Nuke Incident Scenarios
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
              Live Defensive Core
            </span>
          </div>

          <p className="text-xs text-slate-400">
            Execute mock security breaches. Sentinel will instantly invoke its defensive logic, log the
            incident with critical severity, and dispatch emergency alerts to registered administrators.
          </p>

          <div className="space-y-3">
            {/* Scenario 1: Role Escalation */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-xs text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  Scenario: Unauthorized Admin Role Grant
                </strong>
                <span className="text-[10px] text-rose-400 font-mono">Severity: Critical</span>
              </div>
              <p className="text-[11px] text-slate-400">
                A non-whitelisted moderator attempts to grant the "Administrator" role to an untrusted account.
              </p>
              <button
                onClick={() => handleTriggerBreach('role_escalation')}
                disabled={simulatingBreach}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <span>Trigger Role Escalation Defense</span>
              </button>
            </div>

            {/* Scenario 2: Channel Wipe */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-xs text-white flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  Scenario: Rogue Channel Deletion (Nuke)
                </strong>
                <span className="text-[10px] text-amber-400 font-mono">Severity: Critical</span>
              </div>
              <p className="text-[11px] text-slate-400">
                A compromised moderator account deletes the primary server announcement channel.
              </p>
              <button
                onClick={() => handleTriggerBreach('channel_tamper')}
                disabled={simulatingBreach}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <span>Trigger Channel Deletion Defense</span>
              </button>
            </div>
          </div>

          {/* Breach feedback */}
          {breachResult && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/40 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulation Incident Intercepted & Guarded!</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                {breachResult.message || 'Defensive protocol triggered successfully.'}
              </p>
              <span className="text-[10px] text-indigo-400 block font-mono">
                Log generated & added to Audit Trail. Admin DM alert triggered.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
