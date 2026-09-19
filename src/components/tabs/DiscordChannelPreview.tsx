import React, { useState, useRef } from 'react';
import {
  Hash,
  Bell,
  Pin,
  Users,
  Search,
  Smile,
  PlusCircle,
  Send,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  ThumbsUp,
} from 'lucide-react';

interface MessageReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface DiscordMessage {
  id: string;
  sender: 'user' | 'bot' | 'moderator';
  author: string;
  authorTag: string;
  avatarColor: string;
  timestamp: string;
  content?: string;
  isBot?: boolean;
  reactions?: MessageReaction[];
  embed?: {
    color: string;
    title: string;
    description?: string;
    fields?: { name: string; value: string; inline?: boolean }[];
    footer?: string;
    statusBadge?: string;
  };
}

const INITIAL_MESSAGES: DiscordMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    author: 'spambot_491',
    authorTag: '#2941',
    avatarColor: 'bg-rose-600',
    timestamp: 'Today at 4:08 PM',
    content: '🚨 FREE DISCORD NITRO FOR 3 MONTHS! Claim here: https://discord.gg/claim-nitro-free-gift',
    reactions: [{ emoji: '🚩', count: 3, reacted: false }],
  },
  {
    id: 'msg-2',
    sender: 'bot',
    author: 'Fenris',
    authorTag: '#7583',
    avatarColor: 'bg-indigo-600',
    timestamp: 'Today at 4:08 PM',
    isBot: true,
    reactions: [
      { emoji: '🛡️', count: 5, reacted: true },
      { emoji: '👏', count: 4, reacted: false },
    ],
    embed: {
      color: 'border-l-4 border-rose-500',
      title: '🛡️ Case #104 — Phishing & Invite Suppressed',
      description: 'AutoMod intercepted unauthorized invite link & spam pattern in <#general>.',
      fields: [
        { name: 'Target Member', value: '`@spambot_491` (ID: 984102948)', inline: true },
        { name: 'Enforcer', value: 'Fenris Sentinel AutoMod', inline: true },
        { name: 'Sanction', value: '1 Hour Timeout + Message Purged', inline: true },
        { name: 'Strike Status', value: '⚠️ Strike 2/3 (Next strike = 24h Ban)', inline: false },
      ],
      footer: 'Fenris Sentinel v4.2.0 • Security Pipeline',
    },
  },
  {
    id: 'msg-3',
    sender: 'moderator',
    author: 'Alex (Staff)',
    authorTag: '#0001',
    avatarColor: 'bg-emerald-600',
    timestamp: 'Today at 4:11 PM',
    content: '!warn @crypto_mark Repeated self-promotion in chat after warning',
    reactions: [{ emoji: '👍', count: 2, reacted: true }],
  },
  {
    id: 'msg-4',
    sender: 'bot',
    author: 'Fenris',
    authorTag: '#7583',
    avatarColor: 'bg-indigo-600',
    timestamp: 'Today at 4:11 PM',
    isBot: true,
    reactions: [
      { emoji: '⚖️', count: 3, reacted: false },
      { emoji: '🛡️', count: 6, reacted: true },
    ],
    embed: {
      color: 'border-l-4 border-amber-500',
      title: '⚠️ Case #105 — Warning Strike Logged',
      description: 'Formal disciplinary strike recorded against member.',
      fields: [
        { name: 'Target', value: '`@crypto_mark` (ID: 881029381)', inline: true },
        { name: 'Moderator', value: '@Alex (Staff)', inline: true },
        { name: 'Reason', value: 'Repeated self-promotion in chat after warning', inline: false },
        { name: 'Active Strikes', value: '1 Strike (Expires in 14 days)', inline: true },
      ],
      footer: 'Logged in Audit Database • Case ID #105',
    },
  },
];

export const DiscordChannelPreview: React.FC<{
  botPing?: number;
  serverName?: string;
  channelName?: string;
}> = ({ botPing = 24, serverName = 'Private Server', channelName = 'mod-logs' }) => {
  const [messages, setMessages] = useState<DiscordMessage[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Gentle cozy synthesized audio feedback (Web Audio API)
  const playCozyChime = (type: 'send' | 'receive' | 'reaction') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'send') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      } else if (type === 'receive') {
        osc.frequency.setValueAtTime(660, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(520, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else {
        osc.frequency.setValueAtTime(580, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      }
    } catch {
      // AudioContext not allowed or supported
    }
  };

  const handleToggleReaction = (msgId: string, emoji: string) => {
    playCozyChime('reaction');
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== msgId) return msg;
        const existing = msg.reactions || [];
        const found = existing.find((r) => r.emoji === emoji);

        if (found) {
          return {
            ...msg,
            reactions: existing.map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.reacted ? r.count - 1 : r.count + 1,
                    reacted: !r.reacted,
                  }
                : r
            ).filter((r) => r.count > 0),
          };
        } else {
          return {
            ...msg,
            reactions: [...existing, { emoji, count: 1, reacted: true }],
          };
        }
      })
    );
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim()) return;

    const trimmed = inputVal.trim();
    const newMsg: DiscordMessage = {
      id: `user-${Date.now()}`,
      sender: 'moderator',
      author: 'You (Admin)',
      authorTag: '#0001',
      avatarColor: 'bg-violet-600',
      timestamp: 'Just now',
      content: trimmed,
      reactions: [],
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputVal('');
    playCozyChime('send');

    // Show Fenris typing indicator
    setIsBotTyping(true);

    // Simulate bot reply with typing delay
    setTimeout(() => {
      setIsBotTyping(false);
      let botReply: DiscordMessage;

      if (trimmed.startsWith('/ping') || trimmed.startsWith('!ping')) {
        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          author: 'Fenris',
          authorTag: '#7583',
          avatarColor: 'bg-indigo-600',
          timestamp: 'Just now',
          isBot: true,
          reactions: [{ emoji: '⚡', count: 1, reacted: false }],
          embed: {
            color: 'border-l-4 border-emerald-500',
            title: '🏓 Pong! Gateway Latency',
            description: `**WebSocket Ping**: \`${botPing}ms\`\n**API Response Time**: \`18ms\`\n**Uptime**: 99.99% operational across all shards.`,
            footer: 'Fenris Sentinel Real-time Telemetry',
          },
        };
      } else if (trimmed.startsWith('/warn') || trimmed.startsWith('!warn')) {
        const parts = trimmed.split(' ');
        const target = parts[1] || '@Member';
        const reason = parts.slice(2).join(' ') || 'Disciplinary violation noted by admin';
        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          author: 'Fenris',
          authorTag: '#7583',
          avatarColor: 'bg-indigo-600',
          timestamp: 'Just now',
          isBot: true,
          reactions: [{ emoji: '🛡️', count: 2, reacted: false }],
          embed: {
            color: 'border-l-4 border-amber-500',
            title: `⚠️ Case #${Math.floor(100 + Math.random() * 900)} — Warning Strike Issued`,
            fields: [
              { name: 'Target User', value: `\`${target}\``, inline: true },
              { name: 'Moderator', value: 'You (Admin)', inline: true },
              { name: 'Reason', value: reason, inline: false },
              { name: 'DM Notification', value: '✅ Sent DM infraction receipt to user', inline: false },
            ],
            footer: 'Case saved to audit log • Automatic escalation enabled',
          },
        };
      } else if (trimmed.startsWith('/lockdown') || trimmed.startsWith('!lockdown')) {
        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          author: 'Fenris',
          authorTag: '#7583',
          avatarColor: 'bg-indigo-600',
          timestamp: 'Just now',
          isBot: true,
          reactions: [{ emoji: '🔒', count: 3, reacted: false }],
          embed: {
            color: 'border-l-4 border-rose-500',
            title: '🔒 Emergency Channel Lockdown Engaged',
            description: '`@everyone` send permissions have been revoked across public text channels.',
            fields: [
              { name: 'Triggered by', value: 'You (Admin)', inline: true },
              { name: 'Channels Locked', value: '5 text channels', inline: true },
              { name: 'Status', value: 'Awaiting !unlockdown command', inline: false },
            ],
            footer: 'Fenris Sentinel Raid Protocol',
          },
        };
      } else {
        botReply = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          author: 'Fenris',
          authorTag: '#7583',
          avatarColor: 'bg-indigo-600',
          timestamp: 'Just now',
          isBot: true,
          reactions: [{ emoji: '🐺', count: 1, reacted: false }],
          embed: {
            color: 'border-l-4 border-indigo-500',
            title: '🤖 Command Recognized',
            description: `Fenris processed: \`${trimmed}\`\n\nTry testing moderation commands like:\n• \`/warn @user spamming\`\n• \`/ping\`\n• \`/lockdown\``,
            footer: 'Fenris Sentinel Interactive Test Channel',
          },
        };
      }

      setMessages((prev) => [...prev, botReply]);
      playCozyChime('receive');
    }, 650);
  };

  const handleSimulateScenario = (type: 'spam' | 'raid' | 'strike') => {
    setActivePreset(type);
    setTimeout(() => setActivePreset(null), 1500);

    if (type === 'spam') {
      const uMsg: DiscordMessage = {
        id: `u-${Date.now()}`,
        sender: 'user',
        author: 'suspicious_guest',
        authorTag: '#9102',
        avatarColor: 'bg-orange-600',
        timestamp: 'Just now',
        content: 'Check this crazy link: http://steanncommuniity-gift.ru/login?ref=free',
      };
      const bMsg: DiscordMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        author: 'Fenris',
        authorTag: '#7583',
        avatarColor: 'bg-indigo-600',
        timestamp: 'Just now',
        isBot: true,
        reactions: [
          { emoji: '🛡️', count: 4, reacted: true },
          { emoji: '🚫', count: 2, reacted: false },
        ],
        embed: {
          color: 'border-l-4 border-rose-500',
          title: '🛡️ Malicious Link Blocked by AutoMod',
          description: 'Blocked domain matching high-confidence credential harvester heuristics.',
          fields: [
            { name: 'Target', value: '`@suspicious_guest`', inline: true },
            { name: 'Action', value: 'Message deleted & 1h timeout', inline: true },
            { name: 'Domain', value: '`steanncommuniity-gift.ru`', inline: false },
          ],
          footer: 'Zero-tolerance phishing engine',
        },
      };
      setMessages((prev) => [...prev, uMsg, bMsg]);
      playCozyChime('receive');
    } else if (type === 'raid') {
      const bMsg: DiscordMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        author: 'Fenris',
        authorTag: '#7583',
        avatarColor: 'bg-indigo-600',
        timestamp: 'Just now',
        isBot: true,
        reactions: [{ emoji: '🚨', count: 5, reacted: true }],
        embed: {
          color: 'border-l-4 border-rose-600',
          title: '🚨 ANTI-NUKE TRIPWIRE TRIGGERED',
          description: 'Attempted unauthorized mass deletion of 3 channels in 5 seconds was detected and suppressed.',
          fields: [
            { name: 'Offending User', value: '`@compromised_mod` (Role revoked)', inline: true },
            { name: 'Action Taken', value: 'User banned & channels restored', inline: true },
            { name: 'Admin DM Alert', value: 'Dispatched to 1 server owner', inline: false },
          ],
          footer: 'Sub-10ms tripwire execution • Server is safe',
        },
      };
      setMessages((prev) => [...prev, bMsg]);
      playCozyChime('receive');
    } else if (type === 'strike') {
      const bMsg: DiscordMessage = {
        id: `b-${Date.now()}`,
        sender: 'bot',
        author: 'Fenris',
        authorTag: '#7583',
        avatarColor: 'bg-indigo-600',
        timestamp: 'Just now',
        isBot: true,
        reactions: [{ emoji: '⚡', count: 3, reacted: true }],
        embed: {
          color: 'border-l-4 border-red-600',
          title: '⚡ 3-Strike Threshold Reached: Automated Ban',
          description: 'Member has accumulated 3 active warning strikes within the 14-day window.',
          fields: [
            { name: 'User', value: '`@chronic_offender`', inline: true },
            { name: 'Escalation Level', value: 'Tier 3 (Automated 7-Day TempBan)', inline: true },
            { name: 'Case Reference', value: '#101, #103, #106', inline: false },
          ],
          footer: 'Automated strike escalation system',
        },
      };
      setMessages((prev) => [...prev, bMsg]);
      playCozyChime('receive');
    }
  };

  return (
    <div className="sleek-card rounded-2xl overflow-hidden flex flex-col border border-neutral-800 shadow-2xl transition-all duration-300 bg-black">
      {/* Discord Header Bar */}
      <div className="h-12 bg-black px-4 flex items-center justify-between border-b border-neutral-800 select-none">
        <div className="flex items-center gap-2 text-neutral-200">
          <Hash className="w-4 h-4 text-neutral-400" />
          <span className="font-semibold text-sm text-white tracking-wide">{channelName}</span>
          <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400 ml-2 pl-2 border-l border-neutral-800">
            <span>Live channel feed for {serverName}</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 text-neutral-400 text-xs">
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Mute audio chimes' : 'Enable audio chimes'}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-white text-black border-white shadow-sm'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 text-neutral-300 font-mono text-[11px] border border-neutral-800 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
            <span>Bot Live: {botPing}ms</span>
          </div>

          <button
            onClick={() => setMessages(INITIAL_MESSAGES)}
            title="Reset simulated chat"
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 hover:text-white border border-neutral-800 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Interactive Scenarios Bar with sleek monochrome buttons */}
      <div className="bg-neutral-950 px-3.5 py-2.5 border-b border-neutral-800 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-400 font-medium text-[11px] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-white" />
          <span>Interactive Scenarios:</span>
        </span>
        <button
          onClick={() => handleSimulateScenario('spam')}
          className="shine-hover px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white text-[11px] font-medium border border-neutral-800 hover:border-neutral-600 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <Flame className="w-3 h-3 text-neutral-300" />
          <span>Spam Interception</span>
        </button>
        <button
          onClick={() => handleSimulateScenario('raid')}
          className="shine-hover px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white text-[11px] font-medium border border-neutral-800 hover:border-neutral-600 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <AlertTriangle className="w-3 h-3 text-neutral-300" />
          <span>Anti-Nuke Tripwire</span>
        </button>
        <button
          onClick={() => handleSimulateScenario('strike')}
          className="shine-hover px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white text-[11px] font-medium border border-neutral-800 hover:border-neutral-600 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-neutral-300" />
          <span>3-Strike AutoBan</span>
        </button>
      </div>

      {/* Messages Scroll View */}
      <div className="p-4 space-y-4 max-h-[390px] min-h-[260px] overflow-y-auto bg-[#0a0a0a] select-text">
        <div className="flex items-center gap-3 my-2 text-[11px] text-neutral-500 font-medium select-none">
          <div className="flex-1 h-px bg-neutral-800" />
          <span>Today</span>
          <div className="flex-1 h-px bg-neutral-800" />
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className="flex items-start gap-3 hover:bg-neutral-900/60 -mx-2 px-2.5 py-1.5 rounded-xl transition-all group relative"
          >
            {/* Hover quick reaction pill */}
            <div className="absolute right-3 top-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-black border border-neutral-800 rounded-lg p-1 shadow-md z-10">
              <button
                onClick={() => handleToggleReaction(msg.id, '❤️')}
                className="hover:scale-125 transition-transform p-0.5 text-xs cursor-pointer"
                title="React with heart"
              >
                ❤️
              </button>
              <button
                onClick={() => handleToggleReaction(msg.id, '🛡️')}
                className="hover:scale-125 transition-transform p-0.5 text-xs cursor-pointer"
                title="React with shield"
              >
                🛡️
              </button>
              <button
                onClick={() => handleToggleReaction(msg.id, '👍')}
                className="hover:scale-125 transition-transform p-0.5 text-xs cursor-pointer"
                title="React with thumbs up"
              >
                👍
              </button>
            </div>

            {/* Avatar with sleek monochrome styling */}
            <div
              className={`w-8 h-8 rounded-full ${msg.isBot ? 'bg-white text-black' : 'bg-neutral-800 text-white border border-neutral-700'} flex items-center justify-center font-bold text-xs shrink-0 shadow-md`}
            >
              {msg.author.slice(0, 1).toUpperCase()}
            </div>

            {/* Content & Embed */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-semibold text-sm text-white hover:underline cursor-pointer">
                  {msg.author}
                </span>
                {msg.isBot && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-white text-black tracking-wide uppercase shadow-sm">
                    APP
                  </span>
                )}
                <span className="text-[11px] text-neutral-400 font-normal">{msg.timestamp}</span>
              </div>

              {msg.content && (
                <p className="text-neutral-200 text-sm mt-0.5 leading-relaxed break-words font-sans">
                  {msg.content}
                </p>
              )}

              {/* Discord Embed with sleek monochrome card */}
              {msg.embed && (
                <div
                  className="mt-2 p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 border-l-2 border-l-white max-w-xl shadow-lg space-y-2 transition-all hover:border-neutral-700"
                >
                  <h4 className="font-semibold text-sm text-white">{msg.embed.title}</h4>
                  {msg.embed.description && (
                    <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                      {msg.embed.description}
                    </p>
                  )}

                  {msg.embed.fields && msg.embed.fields.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {msg.embed.fields.map((f, i) => (
                        <div key={i} className={f.inline ? 'col-span-1' : 'col-span-full'}>
                          <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                            {f.name}
                          </span>
                          <span className="text-xs text-neutral-200 font-medium font-mono">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {msg.embed.footer && (
                    <div className="pt-2 border-t border-neutral-800 text-[10px] text-neutral-400 flex items-center justify-between">
                      <span>{msg.embed.footer}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Message Reactions row */}
              {msg.reactions && msg.reactions.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {msg.reactions.map((r, ri) => (
                    <button
                      key={ri}
                      onClick={() => handleToggleReaction(msg.id, r.emoji)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs transition-all cursor-pointer border ${
                        r.reacted
                          ? 'bg-neutral-800 border-neutral-600 text-white font-medium shadow-sm'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white'
                      }`}
                    >
                      <span>{r.emoji}</span>
                      <span className="font-mono text-[11px]">{r.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Realistic Discord Typing indicator */}
        {isBotTyping && (
          <div className="flex items-center gap-2 px-3 py-1 text-xs text-neutral-400 select-none animate-fade-in">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
            <span className="text-[11px] font-medium text-neutral-300">
              <strong className="text-white">Fenris</strong> is typing...
            </span>
          </div>
        )}
      </div>

      {/* Discord Input Box with sleek black style */}
      <form onSubmit={handleSendMessage} className="p-3 bg-black border-t border-neutral-800">
        <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2 text-neutral-200 shadow-inner focus-within:border-neutral-600 transition-all">
          <PlusCircle className="w-5 h-5 text-neutral-400 hover:text-white cursor-pointer transition shrink-0 hover:scale-105" />
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Message #mod-logs (Try /warn @user, /ping, /lockdown)..."
            className="flex-1 bg-transparent text-sm text-white placeholder-neutral-400 outline-none font-sans"
          />
          <div className="flex items-center gap-2 text-neutral-400 shrink-0">
            <Smile className="w-5 h-5 hover:text-white cursor-pointer transition hidden sm:block hover:scale-105" />
            <button
              type="submit"
              disabled={!inputVal.trim()}
              className="shine-hover p-1.5 rounded-lg bg-white disabled:opacity-20 text-black transition-all shadow-md cursor-pointer active:scale-95 font-bold"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
