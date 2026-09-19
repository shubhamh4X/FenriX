import React, { useState, useEffect } from 'react';
import { X, Check, Copy, ExternalLink, ShieldCheck, HelpCircle, Bot, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
}

export const FENRIS_OFFICIAL_CLIENT_ID = '1550746964151242793';

interface PermissionOption {
  id: string;
  name: string;
  description: string;
  bit: bigint;
  recommended: boolean;
}

const PERMISSION_OPTIONS: PermissionOption[] = [
  {
    id: 'admin',
    name: 'Administrator (Recommended for Anti-Nuke)',
    description: 'Grants full security authority to intercept rogue admin bots and restore channels',
    bit: 8n,
    recommended: true,
  },
  {
    id: 'manage_guild',
    name: 'Manage Server',
    description: 'Required to audit server settings and configure welcome integrations',
    bit: 32n,
    recommended: true,
  },
  {
    id: 'manage_roles',
    name: 'Manage Roles',
    description: 'Needed to assign quarantine roles and grant leveling rewards',
    bit: 268435456n,
    recommended: true,
  },
  {
    id: 'manage_channels',
    name: 'Manage Channels',
    description: 'Required for anti-nuke channel restoration and lockdown',
    bit: 16n,
    recommended: true,
  },
  {
    id: 'kick_members',
    name: 'Kick Members',
    description: 'Used by AutoMod to remove spammers and raid accounts',
    bit: 2n,
    recommended: true,
  },
  {
    id: 'ban_members',
    name: 'Ban Members',
    description: 'Required to auto-ban mass-nukers and malicious raiders',
    bit: 4n,
    recommended: true,
  },
  {
    id: 'moderate_members',
    name: 'Moderate Members (Timeouts)',
    description: 'Allows Fenris to issue timeouts, quarantine offenders, and enforce strike thresholds',
    bit: 1099511627776n,
    recommended: true,
  },
  {
    id: 'send_messages',
    name: 'Send Messages & Embed Links',
    description: 'Allows Fenris to post case embeds, security alerts, and command receipts',
    bit: 68672n,
    recommended: true,
  },
];

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, clientId }) => {
  const getValidId = (id?: string) => {
    if (id && id.length > 5 && id !== '1340000000000000000' && id !== 'DISCORD_CLIENT_ID') {
      return id;
    }
    return FENRIS_OFFICIAL_CLIENT_ID;
  };

  const [activeClientId, setActiveClientId] = useState<string>(() => getValidId(clientId));
  const [selectedBits, setSelectedBits] = useState<bigint[]>(
    PERMISSION_OPTIONS.map((p) => p.bit)
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (clientId) {
      setActiveClientId(getValidId(clientId));
    }
  }, [clientId]);

  const totalPermissionValue = selectedBits.reduce((acc, bit) => acc | bit, 0n).toString();
  const trimmedId = activeClientId.trim() || FENRIS_OFFICIAL_CLIENT_ID;
  const inviteUrl = `https://discord.com/oauth2/authorize?client_id=${trimmedId}&permissions=${totalPermissionValue}&scope=bot%20applications.commands`;

  const toggleBit = (bit: bigint) => {
    if (selectedBits.includes(bit)) {
      setSelectedBits(selectedBits.filter((b) => b !== bit));
    } else {
      setSelectedBits([...selectedBits, bit]);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-[#090a0d] border border-neutral-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-800/80 flex items-center justify-between bg-neutral-900/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold font-serif shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                  F
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif text-white tracking-wide flex items-center gap-2">
                    Authorize Fenris Sentinel
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Verified Bot
                    </span>
                  </h2>
                  <p className="text-xs text-neutral-400 font-sans">
                    Configure server authority permissions and generate instant authorization link.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {/* Permission Checklist */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Select Required Permissions
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      onClick={() => setSelectedBits(PERMISSION_OPTIONS.map((p) => p.bit))}
                      className="text-neutral-400 hover:text-white underline font-mono text-[11px] cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-neutral-600">•</span>
                    <button
                      onClick={() => setSelectedBits([PERMISSION_OPTIONS[0].bit])}
                      className="text-neutral-400 hover:text-white underline font-mono text-[11px] cursor-pointer"
                    >
                      Admin Only
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {PERMISSION_OPTIONS.map((perm) => {
                    const isChecked = selectedBits.includes(perm.bit);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => toggleBit(perm.bit)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                          isChecked
                            ? 'bg-neutral-900/90 border-white/20'
                            : 'bg-neutral-950 border-neutral-800/60 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs">{perm.name}</span>
                            {perm.recommended && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                                Recommended
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-neutral-400 font-sans">{perm.description}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors mt-0.5 shrink-0 ${
                            isChecked
                              ? 'bg-white border-white text-black'
                              : 'border-neutral-700 bg-neutral-900'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Target Bot Application ID */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-neutral-300 flex items-center gap-1.5 font-medium">
                    <Bot className="w-3.5 h-3.5 text-white" />
                    Discord Application ID (Client ID)
                  </span>
                  {trimmedId !== FENRIS_OFFICIAL_CLIENT_ID && (
                    <button
                      type="button"
                      onClick={() => setActiveClientId(FENRIS_OFFICIAL_CLIENT_ID)}
                      className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Reset to Official Bot
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={activeClientId}
                    onChange={(e) => setActiveClientId(e.target.value)}
                    placeholder="1550746964151242793"
                    className="w-full bg-black/80 border border-neutral-700/80 rounded-lg px-3 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-white transition-colors"
                  />
                  <span className="px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono whitespace-nowrap">
                    {trimmedId === FENRIS_OFFICIAL_CLIENT_ID ? 'Verified Bot' : 'Custom App'}
                  </span>
                </div>
              </div>

              {/* Generated URL & Quick Copy */}
              <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>OAuth2 Authorization Link</span>
                  <span className="text-neutral-500">Bit: {totalPermissionValue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="w-full bg-black/80 border border-neutral-700/80 rounded-lg px-3 py-2 text-xs font-mono text-neutral-200 focus:outline-none select-all"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Security note */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900/80 border border-neutral-800 text-xs text-neutral-300">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-sans">
                  <strong>Recommendation:</strong> In Discord Server Settings &gt; Roles, place the <code className="bg-neutral-950 px-1.5 py-0.5 rounded text-white font-mono border border-neutral-800">Fenris</code> role higher than moderator roles so that Anti-Nuke and AutoMod can instantly intercept compromised accounts.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-neutral-800/80 bg-neutral-900/40 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800/60 font-medium text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <a
                href={inviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl bg-white text-black font-semibold text-xs flex items-center gap-2 hover:bg-neutral-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] cursor-pointer"
              >
                Authorize on Discord
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
