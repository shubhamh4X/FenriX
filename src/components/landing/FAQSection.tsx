import React, { useState } from 'react';
import { ChevronDown, HelpCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I invite Fenris and get started?',
    answer:
      'Click the "Invite Bot" button at the top of the page. Select your desired permissions (Administrator is recommended so the Anti-Nuke shield can protect channels and roles without hierarchy conflicts), pick your server, and authorize. Fenris will join immediately with verified Client ID 1550746964151242793, ready to safeguard your community with sub-10ms moderation and anti-nuke tripwires.',
  },
  {
    question: 'How does the automated Warn Strike and escalation system work?',
    answer:
      'Fenris tracks infractions on a per-user basis with a configurable decay window. When a moderator issues a warning with !warn, strikes accumulate. Crossing preset thresholds triggers automatic enforcements: 2 strikes automatically times out the user for 1 hour, and 3 strikes issues an automated permanent ban. All actions dispatch rich DM infraction notices and immutable case entries.',
  },
  {
    question: 'How does the Anti-Nuke engine prevent false positives?',
    answer:
      'Fenris utilizes a strict multi-tier rate limiter and Whitelist system. Trusted server administrators and specific executive roles can be added to the Whitelist via the web dashboard or /antinuke whitelist add. Whitelisted users can create or modify channels freely, while unauthorized or compromised accounts triggering multiple mass actions in under 10 seconds are quarantined instantly.',
  },
  {
    question: 'Is Fenris really 100% free to use?',
    answer:
      'Yes! Every core feature—including full Disciplinary Moderation, automated Warn Strike escalation, Anti-Nuke threat defense, intelligent AutoMod, leveling, and the real-time web dashboard—is 100% free with zero paywalls. An optional Sentinel Pro tier exists strictly for cosmetic custom bot branding and multi-guild clustering.',
  },
  {
    question: 'Can I use both slash commands and traditional message prefixes?',
    answer:
      'Yes. Fenris fully supports native Discord Slash Commands (e.g. /ban, /antinuke, /purge, /rank) with rich auto-completion, as well as classic message prefix commands (default: !ban, !lock, !antinuke, !rank). You can customize your guild prefix at any time using /prefix.',
  },
  {
    question: 'Does Fenris log or store private user messages?',
    answer:
      'Never. Fenris processes messages strictly in volatile memory for spam, invite link, and caps filtering. Messages that do not violate security rules are immediately dropped. No chat transcripts or voice packets are ever recorded to persistent disks, guaranteeing complete privacy for your members.',
  },
];

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-28 relative z-10 border-t border-neutral-900 bg-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono text-neutral-300 uppercase tracking-widest mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-white" />
            Got Questions?
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-sans">
            Everything you need to know about Fenris Sentinel setup, permissions, and security shields.
          </p>
        </motion.div>

        {/* Accordion List with Motion */}
        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                className="rounded-2xl bg-[#0a0a0d] border border-neutral-800/80 overflow-hidden transition-colors hover:border-neutral-700"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 hover:bg-neutral-900/30 transition-colors cursor-pointer"
                >
                  <span className="font-serif font-bold text-white text-base sm:text-lg">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-white text-black border-white' : 'text-neutral-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-1 text-sm text-neutral-400 font-sans leading-relaxed border-t border-neutral-900/80">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
