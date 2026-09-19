import React, { useState } from 'react';
import {
  Terminal,
  Search,
  Copy,
  Check,
  Play,
  ShieldAlert,
  Radio,
  Sliders,
  Sparkles,
  Lock,
  Flame,
  Send,
  HelpCircle,
  Clock,
  Key,
} from 'lucide-react';
import { BotCommandDefinition } from '../../types.js';
import { BOT_COMMANDS } from '../../data/botCommands.js';

interface CommandsTabProps {
  onExecuteCommand: (command: string, args: string[]) => Promise<{ embed?: any; text?: string; resultData?: any }>;
}

export const CommandsTab: React.FC<CommandsTabProps> = ({ onExecuteCommand }) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'antinuke' | 'moderation' | 'utility'>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  // Live Terminal Test Console State
  const [terminalInput, setTerminalInput] = useState('!ban @RaidBot Phishing raid protection');
  const [isExecuting, setIsExecuting] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<{
    commandRun: string;
    timestamp: string;
    embed?: any;
    text?: string;
  } | null>({
    commandRun: '!ban @RaidBot Phishing raid protection',
    timestamp: 'Ready for execution',
    text: 'Type any command above (e.g. !ban, !softban, !timeout, !purge, !antinuke, !status) or click "Test Command" on any card below to simulate Discord bot responses.',
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleRunCommand = async (fullCmdText: string) => {
    const raw = fullCmdText.trim();
    if (!raw) return;

    setIsExecuting(true);
    const clean = raw.replace(/^[!/.]/, '');
    const parts = clean.split(/\s+/);
    const cmdName = parts[0];
    const args = parts.slice(1);

    try {
      const response = await onExecuteCommand(cmdName, args);
      setTerminalOutput({
        commandRun: raw,
        timestamp: new Date().toLocaleTimeString(),
        embed: response.embed,
        text: response.text,
      });
    } catch (e: any) {
      setTerminalOutput({
        commandRun: raw,
        timestamp: new Date().toLocaleTimeString(),
        text: 'Error executing command: ' + (e?.message || 'Execution failed'),
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const filteredCommands = BOT_COMMANDS.filter((cmd) => {
    const matchesCat = selectedCategory === 'all' || cmd.category === selectedCategory;
    const matchesQuery =
      cmd.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      cmd.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
      cmd.syntax.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-black border border-neutral-800 p-6 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-white" />
            <span className="text-xs font-mono uppercase tracking-widest text-neutral-400">
              DISCORD BOT PROTOCOL DIRECTORY
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/10 text-neutral-200 border border-white/20">
              SLASH &amp; PREFIX READY
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-sans">
            Fenris Commands &amp; Interactive Terminal
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl">
            Browse all Discord slash commands and prefix aliases. Test any command right from the dashboard to preview exact embeds sent to Discord.
          </p>
        </div>
      </div>

      {/* Live Interactive Command Tester Terminal */}
      <div className="rounded-xl bg-neutral-950 border border-neutral-800 p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-neutral-300 font-bold">
              LIVE DISCORD COMMAND SIMULATOR &amp; TERMINAL
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500">
            Supports: !play, /247, /radio, /np, /queue, /antinuke, /ping, /help
          </span>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500 font-mono text-sm">
              &gt;
            </div>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRunCommand(terminalInput);
              }}
              placeholder="Enter Discord command (e.g. !np, !play lofi, !247, !radio synthwave, !antinuke)"
              className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-8 pr-4 py-2.5 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-white transition-colors"
            />
          </div>
          <button
            onClick={() => handleRunCommand(terminalInput)}
            disabled={isExecuting || !terminalInput.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-black font-semibold text-xs transition-all hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(255,255,255,0.2)]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isExecuting ? 'Running...' : 'Execute'}</span>
          </button>
        </div>

        {/* Terminal Output Screen */}
        <div className="rounded-lg bg-black border border-neutral-800 p-4 space-y-3 font-mono text-xs shadow-inner">
          <div className="flex items-center justify-between text-[11px] text-neutral-500 pb-2 border-b border-neutral-800/80">
            <span className="text-neutral-400">Target: #bot-commands in Discord</span>
            <span>{terminalOutput?.timestamp}</span>
          </div>

          {/* Simple text message */}
          {terminalOutput?.text && (
            <p className="text-neutral-300 leading-relaxed">
              {terminalOutput.text}
            </p>
          )}

          {/* Discord Styled Embed Preview */}
          {terminalOutput?.embed && (
            <div className="rounded-lg border-l-4 border-l-white bg-neutral-900/90 border border-neutral-800 p-4 space-y-3 max-w-xl shadow-lg">
              {/* Embed Author */}
              {terminalOutput.embed.data?.author && (
                <div className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">
                  {terminalOutput.embed.data.author.name}
                </div>
              )}

              {/* Embed Title */}
              {terminalOutput.embed.data?.title && (
                <h4 className="text-sm font-bold text-white">
                  {terminalOutput.embed.data.title}
                </h4>
              )}

              {/* Embed Description */}
              {terminalOutput.embed.data?.description && (
                <p className="text-neutral-300 text-xs whitespace-pre-line leading-relaxed">
                  {terminalOutput.embed.data.description}
                </p>
              )}

              {/* Embed Fields */}
              {terminalOutput.embed.data?.fields && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {terminalOutput.embed.data.fields.map((f: any, idx: number) => (
                    <div key={idx} className="p-2 rounded bg-neutral-950/80 border border-neutral-800/80">
                      <div className="text-[10px] uppercase font-bold text-neutral-400">{f.name}</div>
                      <div className="text-xs text-neutral-200 mt-0.5">{f.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Embed Footer */}
              {terminalOutput.embed.data?.footer && (
                <div className="pt-2 border-t border-neutral-800/60 text-[10px] text-neutral-500">
                  {terminalOutput.embed.data.footer.text}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Commands' },
            { id: 'moderation', label: 'Moderation Suite' },
            { id: 'antinuke', label: 'Anti-Nuke' },
            { id: 'utility', label: 'Utility & Status' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap border transition-all ${
                selectedCategory === cat.id
                  ? 'bg-white text-black border-white font-semibold shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                  : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white hover:border-neutral-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
          <input
            type="text"
            placeholder="Search commands..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
          />
        </div>
      </div>

      {/* Commands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCommands.map((cmd) => {
          const isCopied = copiedCmd === cmd.name;
          return (
            <div
              key={cmd.name}
              className="rounded-xl bg-neutral-950 border border-neutral-800 p-5 space-y-3.5 hover:border-neutral-700 transition-all duration-200 shadow-lg group"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold font-mono text-white group-hover:text-indigo-400 transition-colors">
                      /{cmd.name}
                    </h3>
                    {cmd.prefixAlias && (
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                        {cmd.prefixAlias}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {cmd.description}
                  </p>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase border whitespace-nowrap ${
                    cmd.permissions === 'Server Owner'
                      ? 'bg-neutral-800 text-white border-white'
                      : cmd.permissions === 'Admin'
                      ? 'bg-neutral-900 text-neutral-200 border-neutral-700'
                      : cmd.permissions === 'Moderator'
                      ? 'bg-neutral-900 text-blue-300 border-blue-800/40'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800'
                  }`}
                >
                  {cmd.permissions}
                </span>
              </div>

              {/* Syntax & Example Box */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                  <span className="truncate">{cmd.syntax}</span>
                  <button
                    onClick={() => handleCopy(cmd.syntax, cmd.name)}
                    className="ml-2 p-1 text-neutral-500 hover:text-white transition-colors"
                    title="Copy command syntax"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-[11px] text-neutral-500 px-1 truncate">
                  Example: <code className="text-neutral-400">{cmd.example}</code>
                </div>
              </div>

              {/* Options Table (if any) */}
              {cmd.options && cmd.options.length > 0 && (
                <div className="pt-2 border-t border-neutral-800/80 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-neutral-500">Parameters:</div>
                  <div className="space-y-1">
                    {cmd.options.map((opt) => (
                      <div
                        key={opt.name}
                        className="flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-neutral-900/40 px-2 py-1 rounded"
                      >
                        <span className="text-neutral-200">
                          {opt.name} {opt.required ? '<req>' : '[opt]'}
                        </span>
                        <span className="text-[10px] text-neutral-500">{opt.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Test Button */}
              <div className="pt-1 flex items-center justify-end">
                <button
                  onClick={() => {
                    setTerminalInput(cmd.example);
                    handleRunCommand(cmd.example);
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 hover:text-white transition-colors px-2 py-1 rounded hover:bg-neutral-900 border border-transparent hover:border-neutral-800"
                >
                  <Play className="w-3 h-3 text-white fill-current" />
                  <span>Test Run In Console</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
