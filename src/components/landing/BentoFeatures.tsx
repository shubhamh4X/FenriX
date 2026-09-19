import React, { useState } from 'react';
import { Gavel, ShieldAlert, Zap, Award, Sliders, Lock, Cpu, Sparkles, CheckCircle2, ShieldCheck, ArrowRight, Eye, Terminal } from 'lucide-react';
import { motion } from 'motion/react';
import { SpotlightCard } from './SpotlightCard.js';

interface BentoFeaturesProps {
  onOpenDashboard: () => void;
  onOpenInvite: () => void;
}

export const BentoFeatures: React.FC<BentoFeaturesProps> = ({
  onOpenDashboard,
  onOpenInvite,
}) => {
  // Interactive micro-state for previewing warn strike escalation
  const [interactiveStrike, setInteractiveStrike] = useState(2);

  return (
    <section id="features" className="py-28 relative z-10 bg-[#07080a] border-t border-neutral-900/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900/80 border border-neutral-800 text-[11px] font-mono text-neutral-300 uppercase tracking-widest mb-4"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            Core Architecture
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight mb-4"
          >
            Engineered for Precision &amp; Resilience
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-neutral-400 text-sm sm:text-base font-sans"
          >
            Every subsystem is built with sub-10ms event execution, mathematical precision, and zero fluff.
          </motion.p>
        </div>

        {/* Bento Grid with Spotlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Enterprise Disciplinary Moderation Suite (Spans 2 cols on lg) */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="lg:col-span-2 flex"
          >
            <SpotlightCard className="w-full p-8 flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
                    <Gavel className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Moderation Suite
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold font-serif text-white tracking-wide">
                    Authoritative Moderation &amp; Strike Escalation
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mt-2 max-w-xl">
                    Bans, Softbans, Timeouts, Kicks, Quarantines, and multi-tier Warning Strikes. Disciplinary sanctions auto-escalate upon strike thresholds and log irreversible case audits.
                  </p>
                </div>

                {/* Interactive Strike Simulator Widget inside Card */}
                <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800/90 space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-neutral-300 font-medium">Auto-Escalation Strike Meter:</span>
                    <span className="text-amber-400 font-bold">
                      Strike {interactiveStrike} of 3
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3].map((strike) => (
                      <button
                        key={strike}
                        type="button"
                        onClick={() => setInteractiveStrike(strike)}
                        className={`py-2 px-3 rounded-lg text-xs font-mono transition-all text-center cursor-pointer ${
                          strike <= interactiveStrike
                            ? strike === 3
                              ? 'bg-red-500/20 border border-red-500/40 text-red-400 font-bold'
                              : 'bg-amber-500/20 border border-amber-500/40 text-amber-300 font-medium'
                            : 'bg-neutral-950 border border-neutral-800 text-neutral-500 hover:border-neutral-700'
                        }`}
                      >
                        {strike === 1 && '1: Formal Warning'}
                        {strike === 2 && '2: 1-Hr Timeout'}
                        {strike === 3 && '3: Auto-Ban'}
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] font-mono text-neutral-400 pt-1 flex items-center justify-between">
                    <span>
                      Status:{' '}
                      <strong className={interactiveStrike === 3 ? 'text-red-400' : 'text-neutral-200'}>
                        {interactiveStrike === 1 && 'Notice dispatched via direct message with infraction evidence.'}
                        {interactiveStrike === 2 && 'Automatic 1-hour Discord communication timeout enforced.'}
                        {interactiveStrike === 3 && 'THRESHOLD BREACHED: Automatic permanent ban & message purge!'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-mono text-neutral-400">
                  Commands: <code className="text-white font-bold">!warn</code>, <code className="text-white font-bold">!timeout</code>, <code className="text-white font-bold">!ban</code>, <code className="text-white font-bold">!purge</code>
                </span>
                <button
                  onClick={onOpenDashboard}
                  className="text-xs font-mono font-semibold text-white flex items-center gap-1.5 hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Open Moderation Tab
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 2: Autonomous Anti-Nuke (1 col) */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.1, ease: 'easeOut' }}
            className="flex"
          >
            <SpotlightCard className="w-full p-8 flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
                    <ShieldAlert className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-semibold px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                    Anti-Nuke Matrix
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold font-serif text-white tracking-wide">
                    Military Raid Shields
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mt-2">
                    Autonomous protection against compromised administrator accounts and malicious bot tokens.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2">
                  {[
                    { label: 'Channel Wipe Tripwire', time: '<8ms' },
                    { label: 'Role Stripping Trap', time: '<5ms' },
                    { label: 'Mass Kick/Ban Intercept', time: '<10ms' },
                    { label: 'Owner Emergency DM Alert', time: 'Instant' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-xs font-mono p-2 rounded-lg bg-neutral-900/50 border border-neutral-800">
                      <span className="text-neutral-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        {item.label}
                      </span>
                      <span className="text-emerald-400 font-bold">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-800/80 flex items-center justify-between">
                <span className="text-xs font-mono text-neutral-400">Response: &lt;10ms</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">100% Automated</span>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 3: Real-Time Web Administration Console */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.15, ease: 'easeOut' }}
            className="flex"
          >
            <SpotlightCard className="w-full p-8 flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
                    <Sliders className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-300 font-semibold px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-700">
                    Web Console
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold font-serif text-white tracking-wide">
                    Live Management Dashboard
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mt-2">
                    Inspect server health, configure AutoMod tripwires, manage immune roles, issue sanctions, and track audit history in real-time.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs font-mono space-y-1.5 text-neutral-400">
                  <div className="flex items-center justify-between text-neutral-300">
                    <span>Audit Synchronization:</span>
                    <span className="text-emerald-400">Synchronized</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Console Latency:</span>
                    <span className="text-white">Real-Time WebSockets</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-800/80">
                <button
                  onClick={onOpenDashboard}
                  className="w-full py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white border border-neutral-700 text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>Launch Web Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 4: Intelligent AutoMod & Spam Suppression */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.2, ease: 'easeOut' }}
            className="flex"
          >
            <SpotlightCard className="w-full p-8 flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
                    <Cpu className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    Neural Filter
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold font-serif text-white tracking-wide">
                    Intelligent AutoMod
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mt-2">
                    Heuristic spam detection, phishing URL domain blacklists, mass emoji filters, Discord invite suppression, and zalgo text stripping.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-300">
                    Phishing URLs: Blocked
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-300">
                    Mass Mentions: Blocked
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-300">
                    Raid Invites: Filtered
                  </div>
                  <div className="p-2 rounded-lg bg-neutral-900/60 border border-neutral-800 text-neutral-300">
                    Zalgo Spurt: Suppressed
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Filter Speed: 1.2ms</span>
                <span className="text-emerald-400 font-semibold">Zero False Positives</span>
              </div>
            </SpotlightCard>
          </motion.div>

          {/* Card 5: High-Performance Leveling & XP Economy */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.25, ease: 'easeOut' }}
            className="flex"
          >
            <SpotlightCard className="w-full p-8 flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-300 font-semibold px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-700">
                    Community XP
                  </span>
                </div>

                <div>
                  <h3 className="text-2xl font-bold font-serif text-white tracking-wide">
                    Leveling &amp; Rank Cards
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed mt-2">
                    Drive chat engagement with text and voice chat XP tracking, customized rank cards, guild leaderboards, and milestone rewards.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-semibold">Level 42 Commander</span>
                    <span className="text-neutral-400">7,850 / 8,000 XP</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-950 overflow-hidden border border-neutral-800">
                    <div className="h-full bg-white rounded-full transition-all" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-neutral-800/80 flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Commands: <code className="text-white font-bold">!rank</code>, <code className="text-white font-bold">!lb</code></span>
                <span className="text-white font-semibold">Live XP Rate</span>
              </div>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
