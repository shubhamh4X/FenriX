import React, { useState, useMemo } from 'react';
import { Search, Terminal, ShieldAlert, Shield, Award, Wrench, Copy, Check, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BOT_COMMANDS } from '../../data/botCommands.js';
import { BotCommandDefinition } from '../../types.js';

export const LandingCommands: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Commands', icon: Terminal },
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'antinuke', label: 'Anti-Nuke & Defense', icon: ShieldAlert },
    { id: 'leveling', label: 'Leveling & XP', icon: Award },
    { id: 'utility', label: 'Utility & Config', icon: Wrench },
  ];

  const filteredCommands = useMemo(() => {
    return BOT_COMMANDS.filter((cmd) => {
      const matchesCategory =
        activeCategory === 'all' || cmd.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        cmd.name.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.syntax.toLowerCase().includes(q) ||
        (cmd.prefixAlias && cmd.prefixAlias.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const copyCommand = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <section id="commands" className="py-28 relative z-10 bg-[#07080a] border-t border-neutral-900">
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
            <Terminal className="w-3.5 h-3.5 text-white" />
            Command Suite
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-bold font-serif text-white tracking-tight mb-4"
          >
            Every Command, Precision-Crafted
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.15 }}
            className="text-neutral-400 text-sm sm:text-base font-sans"
          >
            Full support for both modern Discord Slash Commands (<code className="text-white font-mono">/</code>) and traditional prefix triggers (<code className="text-white font-mono">!</code>).
          </motion.p>
        </div>

        {/* Filter Controls & Live Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.2 }}
          className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-8"
        >
          {/* Category Tabs with Animated Spring Pill */}
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
                    isSelected ? 'text-black' : 'text-neutral-400 hover:text-white bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  {isSelected && (
                    <motion.div
                      layoutId="commandActiveCategory"
                      className="absolute inset-0 bg-white rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search commands, syntax, tags..."
              className="w-full bg-neutral-950/90 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-white placeholder:text-neutral-600 focus:outline-none focus:border-white transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>
        </motion.div>

        {/* Command Count Badge */}
        <div className="text-xs font-mono text-neutral-500 mb-6 flex items-center justify-between">
          <span>
            Showing <strong className="text-white">{filteredCommands.length}</strong> command{filteredCommands.length === 1 ? '' : 's'}
          </span>
          <span className="text-[11px] text-neutral-500">
            Click any command to copy syntax
          </span>
        </div>

        {/* Command Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredCommands.map((cmd) => {
              const isCopied = copiedCmd === cmd.syntax;
              return (
                <motion.div
                  key={cmd.name}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => copyCommand(cmd.syntax)}
                  className="p-5 rounded-2xl bg-[#090a0d] border border-neutral-800/80 hover:border-neutral-600 transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-[0_8px_25px_rgba(0,0,0,0.6)]"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                          /{cmd.name}
                        </span>
                        {cmd.prefixAlias && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400">
                            {cmd.prefixAlias}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isCopied
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-neutral-500 group-hover:text-white group-hover:bg-neutral-800'
                        }`}
                        title="Copy command syntax"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                      {cmd.description}
                    </p>
                  </div>

                  <div className="space-y-2 pt-3 border-t border-neutral-900">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <code className="text-neutral-300 bg-neutral-950 px-2 py-1 rounded border border-neutral-800 truncate max-w-[200px]">
                        {cmd.syntax}
                      </code>
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                          cmd.permissions === 'Admin' || cmd.permissions === 'Server Owner'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : cmd.permissions === 'Moderator'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                        }`}
                      >
                        {cmd.permissions}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredCommands.length === 0 && (
          <div className="p-12 text-center rounded-2xl bg-neutral-950 border border-neutral-800">
            <p className="text-sm font-mono text-neutral-400">No commands match &ldquo;{searchQuery}&rdquo;</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-3 text-xs font-mono text-white underline"
            >
              Clear filter
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
