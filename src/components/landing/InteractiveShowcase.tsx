import React, { useState } from 'react';
import { Gavel, ShieldAlert, Award, Sparkles, Zap, CheckCircle2, AlertTriangle, User, RefreshCw, Lock, Unlock, Trash2, ArrowRight, Terminal, Shield, Sliders, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SpotlightCard } from './SpotlightCard.js';

interface InteractiveShowcaseProps {
  onOpenDashboard?: () => void;
}

export const InteractiveShowcase: React.FC<InteractiveShowcaseProps> = ({
  onOpenDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'moderation' | 'antinuke' | 'leveling'>('moderation');

  // Moderation simulation state
  const [selectedAction, setSelectedAction] = useState<'warn' | 'timeout' | 'kick' | 'ban' | 'softban'>('warn');
  const [targetUsername, setTargetUsername] = useState('SuspiciousRaid#4092');
  const [targetReason, setTargetReason] = useState('Unsolicited phishing links & malicious token grabber');
  const [strikeCount, setStrikeCount] = useState(2);
  const [caseHistory, setCaseHistory] = useState([
    { id: '#1092', user: 'SuspiciousRaid#4092', action: 'WARN', reason: 'Unsolicited mass ping in #announcements', time: 'Just now', mod: 'Fenris Sentinel' },
    { id: '#1091', user: 'CryptoSpammer#0001', action: 'BAN', reason: 'Malicious token stealer URL', time: '4m ago', mod: 'Fenris AutoMod' },
    { id: '#1090', user: 'ToxicTroll#9999', action: 'TIMEOUT', reason: 'Repeated harassment in voice channel', time: '18m ago', mod: 'Admin' },
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Anti-nuke simulation state
  const [attackScenario, setAttackScenario] = useState<string>('Mass Channel Wipe');
  const [simulationLogs, setSimulationLogs] = useState<
    { time: string; text: string; type: 'alert' | 'action' | 'success' }[]
  >([
    { time: '00:00:00.001', text: 'Anti-Nuke tripwire daemon active on Discord WebSocket Gateway Shard #0', type: 'action' },
    { time: '00:00:00.004', text: 'All 6 tripwire thresholds calibrated: 0 false-positive tolerance', type: 'action' },
    { time: '00:00:00.007', text: 'Server state verified: Channel hierarchy snapshot cached securely', type: 'success' },
  ]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [tripwireToggles, setTripwireToggles] = useState({
    channelDelete: true,
    roleDelete: true,
    massBan: true,
    webhookSpam: true,
  });

  // Leveling customizer state
  const [rankUser, setRankUser] = useState('ValkyrieCommander');
  const [rankLevel, setRankLevel] = useState(42);
  const [rankXp, setRankXp] = useState(7850);
  const [rankNumber, setRankNumber] = useState(1);
  const [rankAccent, setRankAccent] = useState<'white' | 'emerald' | 'amber' | 'cyan'>('white');

  const handleSimulateModeration = () => {
    setIsExecuting(true);
    setFeedback(null);
    setTimeout(() => {
      const newCaseId = `#${Math.floor(1093 + Math.random() * 50)}`;
      const nextStrikes = selectedAction === 'warn' ? strikeCount + 1 : strikeCount;
      setStrikeCount(nextStrikes);

      setCaseHistory((prev) => [
        {
          id: newCaseId,
          user: targetUsername,
          action: selectedAction.toUpperCase(),
          reason: targetReason,
          time: 'Just now',
          mod: 'Fenris Sentinel Web Console',
        },
        ...prev.slice(0, 4),
      ]);

      setIsExecuting(false);
      setFeedback(
        `Case ${newCaseId} logged: ${selectedAction.toUpperCase()} executed on ${targetUsername}.${
          selectedAction === 'warn' && nextStrikes >= 3
            ? ` Auto-Escalation: 3 Strikes reached! Permanent Ban & message purge auto-enforced!`
            : ''
        }`
      );
    }, 450);
  };

  const runAntiNukeSimulation = (scenario: string) => {
    if (isSimulating) return;
    setIsSimulating(true);
    setAttackScenario(scenario);
    setSimulationLogs([]);

    const timestamp = () => new Date().toISOString().split('T')[1].slice(0, 8);

    const steps = [
      { delay: 80, text: `[00:00:00.002] INCOMING ANOMALY: Unauthorized destructive payload detected: ${scenario}`, type: 'alert' as const },
      { delay: 350, text: `[00:00:00.005] THRESHOLD BREACH: 5 unauthorized mutations triggered within 300ms window`, type: 'alert' as const },
      { delay: 700, text: `[00:00:00.008] THREAT QUARANTINED: Administrator permissions revoked from malicious token`, type: 'action' as const },
      { delay: 1100, text: `[00:00:00.012] FORENSIC ROLLBACK: Restoring deleted channels, role hierarchy & permissions...`, type: 'action' as const },
      { delay: 1500, text: `[00:00:00.015] OWNER DISPATCH: Emergency DM report with forensic audit delivered to Guild Owner`, type: 'success' as const },
      { delay: 1900, text: `[00:00:00.018] RESOLVED: Guild restored to pristine state in 18ms with 0 data loss.`, type: 'success' as const },
    ];

    steps.forEach(({ delay, text, type }) => {
      setTimeout(() => {
        setSimulationLogs((prev) => [...prev, { time: timestamp(), text, type }]);
        if (delay === 1900) setIsSimulating(false);
      }, delay);
    });
  };

  const accentColors = {
    white: { bar: 'bg-white', text: 'text-white', border: 'border-white/30', glow: 'shadow-[0_0_20px_rgba(255,255,255,0.2)]' },
    emerald: { bar: 'bg-emerald-400', text: 'text-emerald-400', border: 'border-emerald-500/30', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.25)]' },
    amber: { bar: 'bg-amber-400', text: 'text-amber-400', border: 'border-amber-500/30', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.25)]' },
    cyan: { bar: 'bg-cyan-400', text: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'shadow-[0_0_20px_rgba(34,211,238,0.25)]' },
  };

  return (
    <section id="showcase" className="py-28 relative z-10 bg-[#08090c] border-y border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-neutral-300 uppercase tracking-widest mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            Interactive Demonstration
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight mb-4"
          >
            Test the Sentinel Subsystems Live
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="text-neutral-400 text-sm sm:text-base font-sans"
          >
            Experience the moderation console, anti-nuke tripwire matrix, and customized leveling engine directly in your browser.
          </motion.p>
        </div>

        {/* Animated Segmented Tab Switcher with Motion Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex p-1.5 rounded-2xl bg-neutral-950 border border-neutral-800/90 backdrop-blur-md">
            {[
              { id: 'moderation', label: 'Moderation Console', icon: Gavel },
              { id: 'antinuke', label: 'Anti-Nuke Matrix', icon: ShieldAlert },
              { id: 'leveling', label: 'Rank Card Studio', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                    isSelected ? 'text-black' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="showcaseActiveTab"
                      className="absolute inset-0 bg-white rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab 1: Moderation Console */}
        {activeTab === 'moderation' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Interactive Moderation Controls */}
            <div className="lg:col-span-7 rounded-3xl bg-[#0a0a0e] border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                    <Gavel className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-white text-lg">Disciplinary Action Panel</h3>
                    <p className="text-xs font-mono text-neutral-400">Target Member: <span className="text-white font-semibold">{targetUsername}</span></p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                  Enforcement Online
                </span>
              </div>

              {/* Reported Infraction Preview */}
              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    Reported Message Infraction
                  </span>
                  <span>#general-chat • Today at 03:14 AM</span>
                </div>
                <div className="text-xs font-mono text-neutral-200 bg-neutral-900/70 p-3 rounded-lg border border-neutral-800/80">
                  &ldquo;🚨 FREE DISCORD NITRO GIFT FROM DISCORD! CLICK HERE TO CLAIM: https://free-nitro-steam.xyz/grab-token&rdquo;
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Select Disciplinary Action:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'warn', label: 'Warn', icon: AlertTriangle },
                    { id: 'timeout', label: 'Timeout', icon: Lock },
                    { id: 'softban', label: 'Softban', icon: Trash2 },
                    { id: 'kick', label: 'Kick', icon: User },
                    { id: 'ban', label: 'Ban', icon: Gavel },
                  ].map((act) => {
                    const Icon = act.icon;
                    const isCurrent = selectedAction === act.id;
                    return (
                      <button
                        key={act.id}
                        type="button"
                        onClick={() => setSelectedAction(act.id as any)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-mono font-medium transition-all flex flex-col items-center gap-1 cursor-pointer ${
                          isCurrent
                            ? 'bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                            : 'bg-neutral-900/60 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{act.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Strike Threshold Selector */}
              {selectedAction === 'warn' && (
                <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-300">Warning Strike Accumulator:</span>
                    <span className="text-amber-400 font-bold">Strike {strikeCount} of 3</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStrikeCount(s)}
                        className={`py-2 rounded-lg text-xs font-mono text-center cursor-pointer transition-colors ${
                          s <= strikeCount
                            ? s === 3
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40 font-bold'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium'
                            : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
                        }`}
                      >
                        Strike {s}
                      </button>
                    ))}
                  </div>
                  {strikeCount >= 3 && (
                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-xs font-mono text-red-300 flex items-center gap-2 animate-pulse">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>THRESHOLD BREACH: 3rd strike automatically escalates to permanent ban!</span>
                    </div>
                  )}
                </div>
              )}

              {/* Reason Input Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Audit Reason (Logged in Immutable Case):
                </label>
                <input
                  type="text"
                  value={targetReason}
                  onChange={(e) => setTargetReason(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-white transition-colors"
                  placeholder="Reason for disciplinary action..."
                />
              </div>

              {/* Execute Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleSimulateModeration}
                disabled={isExecuting}
                className="w-full py-3.5 rounded-xl bg-white text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Executing Disciplinary Protocol...</span>
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    <span>Execute Sanction on Member</span>
                  </>
                )}
              </motion.button>

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{feedback}</span>
                </motion.div>
              )}
            </div>

            {/* Right Column: Live Case Ledger */}
            <div className="lg:col-span-5 rounded-3xl bg-[#0a0a0e] border border-neutral-800 p-6 sm:p-8 space-y-5 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-serif font-bold text-white text-base">Live Case Ledger</h3>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500">Auto-Synced</span>
                </div>

                <p className="text-xs text-neutral-400 mb-4 font-sans">
                  Every sanction is assigned an immutable case index, timestamped to the millisecond, and transmitted to the server owner via DM.
                </p>

                <div className="space-y-2.5">
                  {caseHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-white">{item.id} • {item.user}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.action === 'BAN'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : item.action === 'TIMEOUT'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                          }`}
                        >
                          {item.action}
                        </span>
                      </div>
                      <p className="text-[11px] font-mono text-neutral-400 truncate">{item.reason}</p>
                      <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-900">
                        <span>Issued by: {item.mod}</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800/80">
                {onOpenDashboard && (
                  <button
                    onClick={onOpenDashboard}
                    className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>View Full Audit in Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Anti-Nuke Matrix */}
        {activeTab === 'antinuke' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Threat Configuration Panel */}
            <div className="lg:col-span-6 rounded-3xl bg-[#0a0a0e] border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-amber-400">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-white text-lg">Anti-Nuke Defense Grid</h3>
                    <p className="text-xs font-mono text-neutral-400">Autonomous Raid &amp; Rogue Bot Protection</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                  Tripwires Armed
                </span>
              </div>

              {/* Tripwire Toggles */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Active Permission Tripwires:
                </label>
                {[
                  { key: 'channelDelete', label: 'Channel Deletion Barrier', desc: 'Auto-rollback if >2 channels deleted within 500ms' },
                  { key: 'roleDelete', label: 'Role Deletion Shield', desc: 'Revokes bot permissions if administrative roles altered' },
                  { key: 'massBan', label: 'Mass Ban / Kick Trap', desc: 'Freezes token if >3 members banned in 1 second' },
                  { key: 'webhookSpam', label: 'Webhook Flood Guard', desc: 'Destroys rogue webhooks sending unauthorized @everyone pings' },
                ].map((item) => {
                  const isChecked = (tripwireToggles as any)[item.key];
                  return (
                    <div
                      key={item.key}
                      onClick={() =>
                        setTripwireToggles((prev) => ({ ...prev, [item.key]: !isChecked }))
                      }
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-mono font-semibold text-white flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          {item.label}
                        </div>
                        <p className="text-[11px] font-sans text-neutral-400">{item.desc}</p>
                      </div>
                      <div
                        className={`w-11 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ${
                          isChecked ? 'bg-emerald-500' : 'bg-neutral-800'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            isChecked ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Threat Triggers */}
              <div className="space-y-2 pt-2 border-t border-neutral-800/80">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Simulate Zero-Day Attack:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Mass Channel Wipe',
                    'Admin Role Stripping',
                    'Webhook Token Flood',
                    'Rogue Bot Mass Ban',
                  ].map((scenario) => (
                    <button
                      key={scenario}
                      onClick={() => runAntiNukeSimulation(scenario)}
                      disabled={isSimulating}
                      className={`p-3 rounded-xl border text-xs font-mono text-left transition-all flex items-center justify-between cursor-pointer ${
                        attackScenario === scenario
                          ? 'bg-neutral-800 text-white border-neutral-600'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                      } ${isSimulating ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <span className="truncate">{scenario}</span>
                      <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Threat Terminal */}
            <div className="lg:col-span-6 rounded-3xl bg-[#0a0a0e] border border-neutral-800 p-6 sm:p-8 space-y-4 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4 mb-4">
                  <div className="flex items-center gap-2 font-mono text-xs text-neutral-300 font-semibold">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Anti-Nuke Interception Feed
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Sub-10ms Active
                  </span>
                </div>

                <div className="p-4 bg-black rounded-2xl border border-neutral-900 font-mono text-xs min-h-[300px] space-y-2.5 terminal-scanline">
                  {simulationLogs.map((log, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-start gap-2 ${
                        log.type === 'alert'
                          ? 'text-red-400'
                          : log.type === 'action'
                          ? 'text-neutral-300'
                          : 'text-emerald-400 font-bold'
                      }`}
                    >
                      <span className="text-neutral-600 select-none">&gt;</span>
                      <span className="leading-relaxed">{log.text}</span>
                    </motion.div>
                  ))}

                  {isSimulating && (
                    <div className="flex items-center gap-2 text-amber-400 text-xs animate-pulse pt-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Reverting damages &amp; restoring server state...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Autonomous Rollback: <strong className="text-emerald-400">100% Guaranteed</strong></span>
                <span>Response Time: <strong className="text-white">18ms</strong></span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Rank Card Studio */}
        {activeTab === 'leveling' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Customization Sliders */}
            <div className="lg:col-span-5 rounded-3xl bg-[#0a0a0e] border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-white text-lg">Rank Card Studio</h3>
                    <p className="text-xs font-mono text-neutral-400">Real-Time Canvas Customizer</p>
                  </div>
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Member Handle:
                </label>
                <input
                  type="text"
                  value={rankUser}
                  onChange={(e) => setRankUser(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              {/* Level Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Level:</span>
                  <span className="text-white font-bold">{rankLevel}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={rankLevel}
                  onChange={(e) => setRankLevel(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              {/* XP Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Current XP:</span>
                  <span className="text-white font-bold">{rankXp.toLocaleString()} / 10,000 XP</span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={250}
                  value={rankXp}
                  onChange={(e) => setRankXp(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              {/* Leaderboard Rank Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-400">Leaderboard Placement:</span>
                  <span className="text-white font-bold">#{rankNumber}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={rankNumber}
                  onChange={(e) => setRankNumber(Number(e.target.value))}
                  className="w-full accent-white cursor-pointer"
                />
              </div>

              {/* Accent Color Chooser */}
              <div className="space-y-2">
                <label className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                  Accent Color Theme:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'white', label: 'Platinum' },
                    { id: 'emerald', label: 'Emerald' },
                    { id: 'amber', label: 'Amber' },
                    { id: 'cyan', label: 'Cyan' },
                  ].map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setRankAccent(color.id as any)}
                      className={`py-2 rounded-xl text-xs font-mono text-center cursor-pointer transition-all ${
                        rankAccent === color.id
                          ? 'bg-neutral-800 text-white border border-white/60 font-bold'
                          : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Discord Rank Card Canvas Preview */}
            <div className="lg:col-span-7 rounded-3xl bg-[#0a0a0e] border border-neutral-800 p-6 sm:p-8 space-y-6 shadow-2xl flex flex-col justify-center">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 flex items-center justify-between">
                <span>Discord Embed Rank Preview</span>
                <span className="text-emerald-400 font-semibold">Live Generated</span>
              </div>

              {/* The Actual Simulated Discord Rank Banner */}
              <motion.div
                layout
                className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-neutral-900 to-black border ${accentColors[rankAccent].border} ${accentColors[rankAccent].glow} transition-all duration-300 relative overflow-hidden`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
                  {/* Left: Avatar & User Info */}
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-2xl bg-neutral-800 border-2 border-white/20 flex items-center justify-center font-serif text-2xl font-bold text-white shadow-xl">
                        {rankUser.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 ring-4 ring-black" />
                    </div>

                    <div>
                      <h4 className="text-xl font-bold font-serif text-white tracking-wide">
                        {rankUser || 'AnonymousMember'}
                      </h4>
                      <div className="text-xs font-mono text-neutral-400 mt-0.5">
                        Guild Veteran • Online
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-300">
                        <span>Rank</span>
                        <strong className={accentColors[rankAccent].text}>#{rankNumber}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right: Level Badge */}
                  <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
                    <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
                      Level
                    </span>
                    <span className={`text-4xl sm:text-5xl font-serif font-black ${accentColors[rankAccent].text}`}>
                      {rankLevel}
                    </span>
                  </div>
                </div>

                {/* Bottom: Animated XP Progress Bar */}
                <div className="mt-8 space-y-2 relative z-10">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-400">Progress to Level {rankLevel + 1}</span>
                    <span className="text-white font-semibold">
                      {rankXp.toLocaleString()} / 10,000 XP ({Math.round((rankXp / 10000) * 100)}%)
                    </span>
                  </div>

                  <div className="w-full h-3 rounded-full bg-neutral-950 border border-neutral-800 p-0.5 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${accentColors[rankAccent].bar} transition-all duration-300`}
                      style={{ width: `${Math.min(100, Math.round((rankXp / 10000) * 100))}%` }}
                    />
                  </div>
                </div>
              </motion.div>

              <div className="text-[11px] font-mono text-neutral-500 text-center pt-2">
                Type <code className="text-white font-bold">!rank</code> or <code className="text-white font-bold">/rank</code> in Discord to display your live rank card.
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
