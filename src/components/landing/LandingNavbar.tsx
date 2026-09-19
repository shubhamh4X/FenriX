import React, { useState, useEffect } from 'react';
import { Shield, Gavel, Menu, X, ArrowRight, ExternalLink, Terminal, ShieldAlert, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BotStatus } from '../../types.js';

interface LandingNavbarProps {
  status: BotStatus | null;
  onOpenDashboard: () => void;
  onOpenInvite: () => void;
}

export const LandingNavbar: React.FC<LandingNavbarProps> = ({
  status,
  onOpenDashboard,
  onOpenInvite,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    const sections = ['features', 'showcase', 'commands', 'status', 'pricing', 'faq'];
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const scrollPos = window.scrollY + 220;
      let current = '';
      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            current = sections[i];
            break;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isOnline = status?.status === 'online';
  const ping = status?.ping || 18;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#07080a]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3.5'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo with micro-hover physics */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-b from-neutral-800 to-neutral-950 border border-neutral-700/80 flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.08)] group-hover:border-white/80 transition-colors duration-300">
            <Shield className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-6" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-black animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-lg tracking-wider text-white">
              FENRIS
            </span>
            <span className="text-[10px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full bg-neutral-900/90 text-neutral-300 border border-neutral-700/80">
              SENTINEL
            </span>
          </div>

          {/* Real-time Status Badge */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-neutral-900/60 border border-neutral-800/80 text-[11px] font-mono text-neutral-300 ml-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
            <span>{isOnline ? 'Online' : 'Operational'}</span>
            <span className="text-neutral-600">•</span>
            <span className="text-emerald-400 font-semibold">{ping}ms</span>
          </div>
        </motion.div>

        {/* Center Desktop Navigation with refined animated indicator pill */}
        <nav className="hidden md:flex items-center gap-1 bg-neutral-950/60 p-1.5 rounded-full border border-white/[0.06] backdrop-blur-md">
          {[
            { id: 'features', label: 'Capabilities' },
            { id: 'showcase', label: 'Moderation Console' },
            { id: 'commands', label: 'Commands' },
            { id: 'status', label: 'Telemetry' },
            { id: 'pricing', label: 'Perks' },
            { id: 'faq', label: 'FAQ' },
          ].map((item) => {
            const isActive = item.id === activeSection;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-mono uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                  isActive ? 'text-white font-medium' : 'text-neutral-400 hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navActivePill"
                    className="absolute inset-0 bg-white/10 rounded-full border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Action CTA Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenDashboard}
            className="px-4 py-2 rounded-xl text-xs font-mono font-medium uppercase tracking-wider text-neutral-300 border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-900 hover:text-white hover:border-neutral-700 transition-all flex items-center gap-2"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onOpenInvite}
            className="px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider bg-white text-black hover:bg-neutral-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            <span>Invite Bot</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </motion.button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={onOpenDashboard}
            className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold bg-neutral-900 border border-neutral-800 text-white"
          >
            Console
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-900 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-white" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0a0a0d] border-b border-neutral-800 px-6 py-5 space-y-4 text-sm font-mono uppercase tracking-wider text-neutral-300"
          >
            <div className="flex flex-col gap-2">
              {[
                { id: 'features', label: 'Capabilities' },
                { id: 'showcase', label: 'Moderation Console' },
                { id: 'commands', label: 'Commands Directory' },
                { id: 'status', label: 'Telemetry & Uptime' },
                { id: 'pricing', label: 'Perks' },
                { id: 'faq', label: 'FAQ' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left py-2 px-3 rounded-lg hover:bg-white/[0.05] hover:text-white transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-neutral-800/80 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenDashboard();
                }}
                className="w-full py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                Open Live Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInvite();
                }}
                className="w-full py-2.5 rounded-xl bg-white text-black text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
              >
                Invite Fenris to Discord
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
