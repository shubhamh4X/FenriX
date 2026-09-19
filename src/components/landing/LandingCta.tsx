import React from 'react';
import { ExternalLink, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { SpotlightCard } from './SpotlightCard.js';

interface LandingCtaProps {
  onOpenInvite: () => void;
  onOpenDashboard: () => void;
}

export const LandingCta: React.FC<LandingCtaProps> = ({
  onOpenInvite,
  onOpenDashboard,
}) => {
  return (
    <section className="py-28 relative z-10 overflow-hidden border-t border-neutral-900 bg-[#07080a]">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <SpotlightCard className="p-10 sm:p-16 relative overflow-hidden shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900/90 border border-neutral-700 text-[11px] font-mono text-neutral-300 uppercase tracking-widest mb-6">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              Zero Configuration Setup
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight mb-6 max-w-2xl mx-auto leading-tight">
              Protect and Elevate Your Discord Server in 60 Seconds
            </h2>

            <p className="text-neutral-400 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed font-sans">
              Join thousands of communities protected by Fenris Sentinel&apos;s enterprise moderation strike escalation and sub-10ms anti-nuke tripwires.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onOpenInvite}
                className="px-8 py-4 rounded-xl bg-white text-black font-mono font-bold text-sm uppercase tracking-wider hover:bg-neutral-200 transition-all flex items-center gap-2.5 shadow-[0_0_25px_rgba(255,255,255,0.3)] cursor-pointer"
              >
                <span>Add to Discord</span>
                <ExternalLink className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenDashboard}
                className="px-7 py-4 rounded-xl bg-neutral-950 border border-neutral-700 text-white font-mono font-semibold text-sm uppercase tracking-wider hover:bg-neutral-900 transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <span>Launch Live Dashboard</span>
                <ArrowRight className="w-4 h-4 text-neutral-400" />
              </motion.button>
            </div>
          </SpotlightCard>
        </motion.div>
      </div>
    </section>
  );
};
