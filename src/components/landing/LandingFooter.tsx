import React from 'react';
import { Shield, ExternalLink, Heart, Gavel, Sparkles } from 'lucide-react';
import { BotStatus } from '../../types.js';

interface LandingFooterProps {
  status: BotStatus | null;
  onOpenDashboard: () => void;
  onOpenInvite: () => void;
  onOpenLegal: (tab: 'terms' | 'privacy') => void;
}

export const LandingFooter: React.FC<LandingFooterProps> = ({
  status,
  onOpenDashboard,
  onOpenInvite,
  onOpenLegal,
}) => {
  const isOnline = status?.status === 'online';
  const ping = status?.ping || 18;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-neutral-900 bg-black text-neutral-400 text-xs font-sans py-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-neutral-900">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-black text-lg tracking-wider text-white">
                  FENRIS
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                  SENTINEL X
                </span>
              </div>
            </div>

            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">
              The flagship Discord bot for unbreachable Anti-Nuke defense, enterprise moderation &amp; warning strikes, intelligent AutoMod, leveling, and real-time web administration.
            </p>

            <div className="flex items-center gap-2 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              <span className="text-[11px] font-mono text-neutral-300">
                Cluster Shards: <strong className="text-emerald-400 font-semibold">{isOnline ? 'Active' : 'Operational'} ({ping}ms)</strong>
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
              Platform
            </h4>
            <ul className="space-y-2 text-neutral-400 text-xs">
              <li>
                <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">
                  Core Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('showcase')} className="hover:text-white transition-colors flex items-center gap-1">
                  <Gavel className="w-3 h-3 text-white" />
                  Moderation Suite
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('commands')} className="hover:text-white transition-colors">
                  Command Directory
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('status')} className="hover:text-white transition-colors">
                  Cluster Telemetry
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('pricing')} className="hover:text-white transition-colors">
                  Tiers &amp; Perks
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Resources & Actions */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
              Access
            </h4>
            <ul className="space-y-2 text-neutral-400 text-xs">
              <li>
                <button onClick={onOpenDashboard} className="hover:text-white transition-colors font-medium">
                  Live Web Dashboard
                </button>
              </li>
              <li>
                <button onClick={onOpenInvite} className="hover:text-white transition-colors font-medium">
                  Invite Fenris to Discord
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('faq')} className="hover:text-white transition-colors">
                  Support &amp; FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Governance & Legal */}
          <div className="space-y-3">
            <h4 className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
              Legal &amp; Privacy
            </h4>
            <ul className="space-y-2 text-neutral-400 text-xs">
              <li>
                <button
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <span className="text-neutral-500 text-[11px] block mt-1">
                  100% Discord API &amp; GDPR Compliant
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-neutral-500 text-[11px] font-mono">
          <div>
            &copy; {new Date().getFullYear()} Fenris Sentinel Systems. All rights reserved. Not affiliated with Discord Inc.
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onOpenLegal('terms')} className="hover:text-neutral-300">
              Terms
            </button>
            <span>•</span>
            <button onClick={() => onOpenLegal('privacy')} className="hover:text-neutral-300">
              Privacy
            </button>
            <span>•</span>
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-neutral-300">
              Back to Top ↑
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
