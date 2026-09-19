import React from 'react';
import { Check, Sparkles, ShieldCheck, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { SpotlightCard } from './SpotlightCard.js';

interface PricingSectionProps {
  onOpenInvite: () => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({ onOpenInvite }) => {
  return (
    <section id="pricing" className="py-28 relative z-10 border-t border-neutral-900 bg-[#07080a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-neutral-300 uppercase tracking-widest mb-4">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            Transparent Model
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight mb-4">
            100% Free Core. Zero Paywalls.
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-sans">
            Every moderation command, anti-nuke tripwire defense, and automated enforcement feature is completely free for all Discord servers.
          </p>
        </motion.div>

        {/* Pricing Cards with Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Community Free Tier */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="flex"
          >
            <SpotlightCard className="w-full p-8 flex flex-col justify-between shadow-2xl">
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Standard Guild
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-white mt-1">Community Free</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-bold font-serif text-white">$0</span>
                    <span className="text-neutral-500 text-xs font-mono">/ forever</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2 font-sans">
                    Full access to every core defense, disciplinary moderation, and real-time incident tripwire. No credit card required.
                  </p>
                </div>

                <div className="space-y-3 pt-5 border-t border-neutral-800/80 text-xs text-neutral-300">
                  {[
                    'Enterprise Disciplinary Suite (!ban, !softban, !timeout)',
                    'Automated 3-Tier Warn Strike Escalation Engine',
                    'High-Speed Purge Engine with Message & User Filters',
                    'Military-Grade Anti-Nuke & Permission Tripwires',
                    'Sub-10ms Incident Interception & Lockdown',
                    'Intelligent AutoMod with Phishing & Spam Suppression',
                    'Leveling, Text & Voice XP, Rank Cards',
                    'Real-Time Web Management & Cases Dashboard',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenInvite}
                className="mt-8 w-full py-3.5 rounded-xl border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-white font-mono text-xs uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Add to Discord Free</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </motion.button>
            </SpotlightCard>
          </motion.div>

          {/* Sentinel Pro Tier */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.55, delay: 0.2 }}
            className="flex"
          >
            <SpotlightCard className="w-full p-8 flex flex-col justify-between relative shadow-2xl border-white/30">
              <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white text-black text-[10px] font-mono font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                Supporter
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                    Guild Powerhouse
                  </span>
                  <h3 className="text-2xl font-bold font-serif text-white mt-1">Sentinel Pro</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-5xl font-bold font-serif text-white">$4.99</span>
                    <span className="text-neutral-500 text-xs font-mono">/ month</span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2 font-sans">
                    For large server networks seeking dedicated shard instances, white-label bot avatars, and extended audit logs.
                  </p>
                </div>

                <div className="space-y-3 pt-5 border-t border-neutral-800/80 text-xs text-neutral-300">
                  {[
                    'Everything in Community Free (All Core Defense)',
                    'Custom Bot Branding (Name, Avatar, Bio, Status)',
                    'Dedicated Isolated Shard with 0.00ms Priority Gateway',
                    'Unlimited Multi-Year Audit Case Retention',
                    'Multi-Server Whitelist Sync across up to 10 Guilds',
                    'VIP Access to Beta Sentinel Security Algorithms',
                    'Private Support Channel with Core Developers',
                  ].map((feat) => (
                    <div key={feat} className="flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-white shrink-0" />
                      <span className="text-neutral-200">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenInvite}
                className="mt-8 w-full py-3.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.25)] cursor-pointer"
              >
                <span>Get Sentinel Pro</span>
                <Sparkles className="w-3.5 h-3.5" />
              </motion.button>
            </SpotlightCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
