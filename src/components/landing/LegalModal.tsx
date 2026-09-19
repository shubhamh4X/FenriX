import React, { useState } from 'react';
import { X, ShieldCheck, Lock, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LegalModalProps {
  isOpen: boolean;
  initialTab?: 'terms' | 'privacy';
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  initialTab = 'terms',
  onClose,
}) => {
  const [tab, setTab] = useState<'terms' | 'privacy'>(initialTab);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[#090a0d] border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center">
                  {tab === 'terms' ? (
                    <FileText className="w-5 h-5 text-white" />
                  ) : (
                    <Lock className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif text-white tracking-wide">
                    {tab === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Official Fenris Sentinel governance &amp; privacy compliance
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex border-b border-neutral-800 bg-neutral-950 px-6 pt-3 gap-6 text-xs font-mono uppercase tracking-wider">
              <button
                onClick={() => setTab('terms')}
                className={`pb-3 border-b-2 font-semibold transition-all cursor-pointer ${
                  tab === 'terms'
                    ? 'border-white text-white'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Terms of Service
              </button>
              <button
                onClick={() => setTab('privacy')}
                className={`pb-3 border-b-2 font-semibold transition-all cursor-pointer ${
                  tab === 'privacy'
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Privacy Policy
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-neutral-300 leading-relaxed font-sans">
              {tab === 'terms' ? (
                <>
                  <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800 mb-4 font-mono">
                    <p className="text-neutral-200 font-semibold mb-1">Last Updated: September 2026</p>
                    <p className="text-neutral-400">
                      By adding Fenris to your Discord server or accessing its web dashboard, you agree to these Terms of Service.
                    </p>
                  </div>

                  <h4 className="text-sm font-semibold text-white font-serif mt-4">1. Authorized Usage</h4>
                  <p>
                    Fenris is provided for legitimate Discord server administration, automated moderation, and server defense infrastructure. You agree not to reverse-engineer, overload, or use the bot to violate Discord&apos;s Developer Terms of Service or Community Guidelines.
                  </p>

                  <h4 className="text-sm font-semibold text-white font-serif mt-4">2. Anti-Nuke Protective Actions</h4>
                  <p>
                    When armed, the Anti-Nuke module autonomously intercepts unauthorized channel deletions, mass kicks, or token leaks. Fenris administrators and server owners retain the ability to whitelist users and modify action thresholds at any time through the web dashboard or slash commands.
                  </p>

                  <h4 className="text-sm font-semibold text-white font-serif mt-4">3. Disciplinary Sanctions &amp; Enforcement</h4>
                  <p>
                    Fenris provides automated and manual sanction execution (bans, softbans, kicks, timeouts, warnings). Server administrators remain solely responsible for moderating their communities in compliance with Discord&apos;s Community Guidelines.
                  </p>

                  <h4 className="text-sm font-semibold text-white font-serif mt-4">4. Availability &amp; SLA</h4>
                  <p>
                    While Fenris maintains a 99.99% uptime target with cluster redundancy, services are provided &quot;as is&quot; without liability for third-party Discord API outages or gateway disruptions.
                  </p>
                </>
              ) : (
                <>
                  <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 mb-4 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-emerald-300 font-semibold mb-0.5">Zero Message Logging Guarantee</p>
                      <p className="text-emerald-200/80">
                        Fenris never stores, reads, or retains your server members&apos; private chats, personal messages, or voice calls on external disks.
                      </p>
                    </div>
                  </div>

                  <h4 className="text-sm font-semibold text-white font-serif mt-4">1. Data We Collect</h4>
                  <p>
                    To provide moderation and leveling services, Fenris collects only standard Discord IDs: Server ID, Channel ID, Role IDs, and User IDs for moderation logs and XP level records.
                  </p>

                  <h4 className="text-sm font-semibold text-white font-serif mt-4">2. In-Memory Security Processing</h4>
                  <p>
                    Message inspection for spam, invite links, and caps filter occurs strictly in volatile memory. Messages that do not violate security rules are discarded immediately.
                  </p>

                  <h4 className="text-sm font-semibold text-white font-serif mt-4">3. Data Deletion &amp; Export</h4>
                  <p>
                    Server owners can export all bot configuration data and audit log entries as clean JSON at any time using the Export tab or request complete server purge upon removing the bot.
                  </p>

                  <h4 className="text-sm font-semibold text-white font-serif mt-4">4. Compliance</h4>
                  <p>
                    Fenris complies fully with GDPR, CCPA, and Discord&apos;s Developer Data Policy.
                  </p>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-900/40 flex justify-end">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Acknowledge &amp; Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
