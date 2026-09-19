import React, { useState } from 'react';
import { Shield, Terminal, Zap, ArrowRight, ExternalLink, ShieldAlert, CheckCircle2, Lock, Activity, RefreshCw, AlertTriangle, Radio } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BotStatus } from '../../types.js';

interface LandingHeroProps {
  status: BotStatus | null;
  onOpenInvite: () => void;
  onOpenDashboard: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  status,
  onOpenInvite,
  onOpenDashboard,
}) => {
  const guildCount = status?.guilds && status.guilds.length > 0 ? status.guilds.length.toLocaleString() : '1,420+';
  const ping = status?.ping || 18;

  // Interactive Live Defense Simulation State
  const [activeScenario, setActiveScenario] = useState<'webhook' | 'deletion' | 'phishing'>('deletion');
  const [isIntercepting, setIsIntercepting] = useState(false);
  const [simLogs, setSimLogs] = useState<Array<{ text: string; type: 'alert' | 'action' | 'success' }>>([
    { text: '[00:00.001] Sentinel Defense Daemon monitoring Discord Gateway Shard #0', type: 'action' },
    { text: '[00:00.003] Real-time permission tripwires armed (Anti-Nuke / Anti-Raid / AutoMod)', type: 'action' },
    { text: '[00:00.006] Ready: Sub-10ms mitigation armed across all administrative channels', type: 'success' },
  ]);

  const triggerAttackScenario = (scenario: 'webhook' | 'deletion' | 'phishing') => {
    setActiveScenario(scenario);
    setIsIntercepting(true);
    setSimLogs([]);

    const scenarios = {
      deletion: [
        { text: '[00:00.002] INCOMING THREAT: Rogue bot attempting mass channel deletion (#announcements, #general)', type: 'alert' as const },
        { text: '[00:00.005] TRIPWIRE BREACH: 4 deletion events triggered within 280ms threshold', type: 'alert' as const },
        { text: '[00:00.008] THREAT NEUTRALIZED: Rogue Administrator permissions revoked & token quarantined', type: 'action' as const },
        { text: '[00:00.012] FORENSIC ROLLBACK: Restoring channel hierarchy, webhooks, and permissions...', type: 'action' as const },
        { text: '[00:00.016] SERVER RESTORED: All 4 channels reconstructed in 16ms. Emergency DM sent to Owner.', type: 'success' as const },
      ],
      webhook: [
        { text: '[00:00.002] INCOMING THREAT: Unauthorized webhook token dispatching 50+ @everyone pings', type: 'alert' as const },
        { text: '[00:00.004] PHISHING DETECTED: Malicious domain "free-nitro-gift.app" flagged by AutoMod filter', type: 'alert' as const },
        { text: '[00:00.007] INTERCEPTED: Webhook destroyed permanently & 52 spam messages purged instantly', type: 'action' as const },
        { text: '[00:00.011] CHANNEL QUARANTINE: Channel write-permissions temporarily frozen for 15 seconds', type: 'action' as const },
        { text: '[00:00.014] RAID SHIELD CONCLUDED: Raid averted in 14ms. Case #1094 logged in ledger.', type: 'success' as const },
      ],
      phishing: [
        { text: '[00:00.002] INCOMING THREAT: Compromised staff account posting malicious QR code login links', type: 'alert' as const },
        { text: '[00:00.005] PATTERN MATCH: Discord Token Grabber signature recognized by Deep Neural Filter', type: 'alert' as const },
        { text: '[00:00.008] AUTOMATIC ACTION: Compromised member timed out for 7 days & moderator roles stripped', type: 'action' as const },
        { text: '[00:00.012] AUDIT DISPATCH: Security alert with IP signature and message hash delivered to Owner', type: 'success' as const },
        { text: '[00:00.015] INCIDENT RESOLVED: 0 members compromised. Total defense response: 15ms.', type: 'success' as const },
      ],
    };

    const targetSteps = scenarios[scenario];
    targetSteps.forEach((step, idx) => {
      setTimeout(() => {
        setSimLogs((prev) => [...prev, step]);
        if (idx === targetSteps.length - 1) {
          setIsIntercepting(false);
        }
      }, (idx + 1) * 350);
    });
  };

  const scrollToShowcase = () => {
    const el = document.getElementById('showcase');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden bg-[#07080a]">
      {/* Cinematic subtle ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-neutral-100/[0.03] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[300px] bg-emerald-500/[0.025] rounded-full blur-[120px] pointer-events-none" />
      
      {/* Fine radial background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Release / Announcement Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-neutral-900/80 border border-neutral-700/60 mb-8 backdrop-blur-md shadow-inner hover:border-neutral-500 transition-colors"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-300">
            Fenris Sentinel Live • Autonomous Discord Defense
          </span>
          <span className="text-neutral-600">•</span>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Sub-10ms Tripwires
          </span>
        </motion.div>

        {/* Master Display Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[1.1] mb-6 font-sans"
        >
          Sentinel Protection for{' '}
          <span className="text-white underline decoration-[#5865F2] decoration-4 underline-offset-8">Discord Communities</span>
        </motion.h1>

        {/* Hero Lead Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-base sm:text-lg lg:text-xl text-neutral-400 max-w-3xl mx-auto font-sans leading-relaxed mb-10"
        >
          Autonomous <strong className="text-neutral-200 font-medium">Anti-Nuke raid shields</strong>, authoritative <strong className="text-neutral-200 font-medium">disciplinary strikes</strong> with automatic escalation, intelligent AutoMod, and a live web telemetry console.
        </motion.p>

        {/* Action CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenInvite}
            className="px-8 py-4 rounded-xl bg-white text-black font-mono font-bold text-sm uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center gap-2.5 shadow-[0_0_30px_rgba(255,255,255,0.25)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            <span>Invite to Discord</span>
            <ExternalLink className="w-4 h-4" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenDashboard}
            className="px-7 py-4 rounded-xl bg-neutral-900 border border-neutral-700 text-white font-mono font-semibold text-sm uppercase tracking-wider hover:bg-neutral-800 hover:border-neutral-500 transition-all flex items-center gap-2.5 cursor-pointer"
          >
            <span>Open Dashboard</span>
            <ArrowRight className="w-4 h-4 text-neutral-400" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToShowcase}
            className="px-6 py-4 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-300 font-mono text-xs uppercase tracking-wider hover:text-white hover:border-neutral-600 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Interactive Simulator</span>
          </motion.button>
        </motion.div>

        {/* Interactive Live Sentinel Defense Console (Replaces generic 5-box metric block) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-5xl mx-auto rounded-3xl border border-neutral-800 bg-[#0a0a0d]/90 backdrop-blur-xl shadow-2xl overflow-hidden text-left"
        >
          {/* Console Header Bar */}
          <div className="px-5 py-3.5 border-b border-neutral-800/80 bg-neutral-900/50 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-3 font-mono text-xs text-neutral-300 font-medium flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Fenris Autonomous Threat Interceptor • Shard #0
              </span>
            </div>

            <div className="flex items-center gap-4 text-[11px] font-mono">
              <span className="text-neutral-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                SHIELD: ARMED
              </span>
              <span className="text-neutral-600">•</span>
              <span className="text-neutral-300">
                LATENCY: <strong className="text-emerald-400 font-semibold">{ping}ms</strong>
              </span>
              <span className="text-neutral-600 hidden sm:inline">•</span>
              <span className="text-neutral-400 hidden sm:inline">
                GUILDS: <strong className="text-white">{guildCount}</strong>
              </span>
            </div>
          </div>

          {/* Interactive Simulation Controls */}
          <div className="p-5 sm:p-6 border-b border-neutral-800/60 bg-neutral-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Interactive Raid Simulation
              </div>
              <p className="text-xs text-neutral-400">
                Click any simulated zero-day attack to test Fenris&apos;s real-time interception and rollback:
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => triggerAttackScenario('deletion')}
                disabled={isIntercepting}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeScenario === 'deletion'
                    ? 'bg-neutral-800 text-white border border-neutral-600'
                    : 'bg-neutral-900/60 text-neutral-400 border border-neutral-800 hover:text-white'
                } ${isIntercepting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Channel Wipe
              </button>

              <button
                onClick={() => triggerAttackScenario('webhook')}
                disabled={isIntercepting}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeScenario === 'webhook'
                    ? 'bg-neutral-800 text-white border border-neutral-600'
                    : 'bg-neutral-900/60 text-neutral-400 border border-neutral-800 hover:text-white'
                } ${isIntercepting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Radio className="w-3 h-3 text-red-400" />
                Webhook Spam
              </button>

              <button
                onClick={() => triggerAttackScenario('phishing')}
                disabled={isIntercepting}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  activeScenario === 'phishing'
                    ? 'bg-neutral-800 text-white border border-neutral-600'
                    : 'bg-neutral-900/60 text-neutral-400 border border-neutral-800 hover:text-white'
                } ${isIntercepting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <Lock className="w-3 h-3 text-emerald-400" />
                QR Token Grab
              </button>
            </div>
          </div>

          {/* Terminal Output Area with Scanline & Live Typing */}
          <div className="p-5 sm:p-6 bg-black font-mono text-xs space-y-2 min-h-[190px] relative terminal-scanline">
            {simLogs.map((log, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start gap-2.5 ${
                  log.type === 'alert'
                    ? 'text-red-400'
                    : log.type === 'action'
                    ? 'text-neutral-300'
                    : 'text-emerald-400 font-semibold'
                }`}
              >
                <span className="select-none text-neutral-600 font-bold shrink-0">&gt;</span>
                <span className="leading-relaxed">{log.text}</span>
              </motion.div>
            ))}

            {isIntercepting && (
              <div className="flex items-center gap-2 text-amber-400 text-xs animate-pulse pt-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Interception daemon executing countermeasure...</span>
              </div>
            )}
          </div>

          {/* Console Sub-telemetry Footer */}
          <div className="px-5 py-3 bg-neutral-950 border-t border-neutral-900 flex flex-wrap items-center justify-between text-[11px] font-mono text-neutral-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Tripwires Active
              </span>
              <span>•</span>
              <span>Tripwire Interception: &lt;10ms</span>
              <span>•</span>
              <span>Autonomous Rollback: Enabled</span>
            </div>
            <div className="text-neutral-400">
              Official Client ID: <code className="text-white font-mono">1550746964151242793</code>
            </div>
          </div>
        </motion.div>

        {/* Animated Scroll Cue */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-14 flex flex-col items-center justify-center"
        >
          <button
            onClick={() => {
              const el = document.getElementById('features');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group flex flex-col items-center gap-2.5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Scroll to explore features"
          >
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 group-hover:text-neutral-300 transition-colors">
              Scroll to explore
            </span>
            <div className="w-5 h-8 rounded-full border border-neutral-700/80 group-hover:border-white/60 flex items-start justify-center p-1 transition-colors">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
              />
            </div>
          </button>
        </motion.div>
      </div>
    </section>
  );
};
