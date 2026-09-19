import React, { useState } from 'react';
import { BotConfig } from '../../types.js';
import {
  Flame,
  Bot,
  MessageSquareWarning,
  Sliders,
  ShieldCheck,
  Save,
  Check,
  Sparkles,
  Link2,
  AtSign,
  AlertTriangle,
} from 'lucide-react';

interface AutoModTabProps {
  config: BotConfig | null;
  onSaveConfig: (updated: Partial<BotConfig>) => Promise<void>;
  loading: boolean;
}

export const AutoModTab: React.FC<AutoModTabProps> = ({
  config,
  onSaveConfig,
  loading,
}) => {
  // Spam settings
  const [spamFilterEnabled, setSpamFilterEnabled] = useState(
    config?.autoMod.spamFilterEnabled ?? true
  );
  const [maxMessages, setMaxMessages] = useState(
    config?.autoMod.maxMessagesPer5Sec ?? 5
  );
  const [duplicateLimit, setDuplicateLimit] = useState(
    config?.autoMod.duplicateMessageLimit ?? 2
  );
  const [blockInvites, setBlockInvites] = useState(
    config?.autoMod.blockDiscordInvites ?? true
  );
  const [blockLinks, setBlockLinks] = useState(
    config?.autoMod.blockExternalLinks ?? false
  );
  const [mentionsLimit, setMentionsLimit] = useState(
    config?.autoMod.massMentionsThreshold ?? 4
  );
  const [capsThreshold, setCapsThreshold] = useState(
    config?.autoMod.capsPercentageThreshold ?? 75
  );
  const [zalgoFilter, setZalgoFilter] = useState(
    config?.autoMod.zalgoFilter ?? true
  );
  const [spamAction, setSpamAction] = useState(
    config?.autoMod.spamAction ?? 'delete_warn'
  );

  // AI Toxicity settings
  const [aiEnabled, setAiEnabled] = useState(config?.aiToxicity.enabled ?? true);
  const [sensitivity, setSensitivity] = useState<'low' | 'medium' | 'high'>(
    config?.aiToxicity.sensitivity ?? 'medium'
  );
  const [categories, setCategories] = useState(
    config?.aiToxicity.categories || {
      harassment: true,
      hateSpeech: true,
      threats: true,
      severeProfanity: true,
      scams: true,
    }
  );
  const [aiAction, setAiAction] = useState(
    config?.aiToxicity.action ?? 'delete_warn'
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    if (config?.autoMod) {
      setSpamFilterEnabled(config.autoMod.spamFilterEnabled ?? true);
      setMaxMessages(config.autoMod.maxMessagesPer5Sec ?? 5);
      setDuplicateLimit(config.autoMod.duplicateMessageLimit ?? 2);
      setBlockInvites(config.autoMod.blockDiscordInvites ?? true);
      setBlockLinks(config.autoMod.blockExternalLinks ?? false);
      setMentionsLimit(config.autoMod.massMentionsThreshold ?? 4);
      setCapsThreshold(config.autoMod.capsPercentageThreshold ?? 75);
      setZalgoFilter(config.autoMod.zalgoFilter ?? true);
      setSpamAction(config.autoMod.spamAction ?? 'delete_warn');
    }
    if (config?.aiToxicity) {
      setAiEnabled(config.aiToxicity.enabled ?? true);
      setSensitivity(config.aiToxicity.sensitivity ?? 'medium');
      if (config.aiToxicity.categories) {
        setCategories(config.aiToxicity.categories);
      }
      setAiAction(config.aiToxicity.action ?? 'delete_warn');
    }
  }, [config]);

  const toggleCategory = (key: keyof typeof categories) => {
    setCategories({ ...categories, [key]: !categories[key] });
  };

  const handleSave = async () => {
    await onSaveConfig({
      autoMod: {
        spamFilterEnabled,
        maxMessagesPer5Sec: maxMessages,
        duplicateMessageLimit: duplicateLimit,
        blockDiscordInvites: blockInvites,
        blockExternalLinks: blockLinks,
        massMentionsThreshold: mentionsLimit,
        capsPercentageThreshold: capsThreshold,
        zalgoFilter,
        spamAction,
      },
      aiToxicity: {
        enabled: aiEnabled,
        sensitivity,
        categories,
        action: aiAction,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Spam Filters & AI Toxic Language Moderation
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Clean and safe chat automatically: combines high-speed regex & burst rate limiting with Gemini AI
            semantic analysis to eliminate hate speech, toxic harassment, scams, and raid floods.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Gemini 3.8 Flash Engine</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Spam & Anti-Flood */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Spam & Anti-Flood Filters</h3>
            </div>
            <button
              onClick={() => setSpamFilterEnabled(!spamFilterEnabled)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                spamFilterEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  spamFilterEnabled ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Velocity rate limit */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">Message Burst Limit (per 5 seconds)</label>
                <span className="font-mono text-indigo-400 font-bold">{maxMessages} msgs</span>
              </div>
              <input
                type="range"
                min="2"
                max="15"
                value={maxMessages}
                onChange={(e) => setMaxMessages(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
              <p className="text-[11px] text-slate-500">Users exceeding this velocity will be sanctioned.</p>
            </div>

            {/* Duplicate message limit */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">Duplicate Message Threshold</label>
                <span className="font-mono text-indigo-400 font-bold">{duplicateLimit} copies</span>
              </div>
              <input
                type="range"
                min="2"
                max="5"
                value={duplicateLimit}
                onChange={(e) => setDuplicateLimit(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Mass mentions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">Mass Mention Threshold</label>
                <span className="font-mono text-indigo-400 font-bold">{mentionsLimit} mentions</span>
              </div>
              <input
                type="range"
                min="2"
                max="10"
                value={mentionsLimit}
                onChange={(e) => setMentionsLimit(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Caps limit */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-300">Excessive Caps Lock Percentage</label>
                <span className="font-mono text-indigo-400 font-bold">{capsThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={capsThreshold}
                onChange={(e) => setCapsThreshold(parseInt(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>

            {/* Toggle switches */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Block Discord Server Invites</strong>
                  <span className="text-[11px] text-slate-500">Auto-deletes discord.gg and invite links</span>
                </div>
                <input
                  type="checkbox"
                  checked={blockInvites}
                  onChange={(e) => setBlockInvites(e.target.checked)}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Block External Web Links</strong>
                  <span className="text-[11px] text-slate-500">Strict mode: deletes all unverified URLs</span>
                </div>
                <input
                  type="checkbox"
                  checked={blockLinks}
                  onChange={(e) => setBlockLinks(e.target.checked)}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Filter Zalgo / Glitched Characters</strong>
                  <span className="text-[11px] text-slate-500">Strips unicode crash text & visual flood</span>
                </div>
                <input
                  type="checkbox"
                  checked={zalgoFilter}
                  onChange={(e) => setZalgoFilter(e.target.checked)}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
              </label>
            </div>

            {/* Spam Punishment action */}
            <div className="space-y-1.5 pt-2">
              <label className="font-semibold text-slate-300">Spam Enforcement Sanction:</label>
              <select
                value={spamAction}
                onChange={(e: any) => setSpamAction(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="delete_warn">🗑️ Delete Message & Issue Warning</option>
                <option value="timeout_5m">⏳ Delete Message & 5-Minute Timeout</option>
                <option value="timeout_1h">⏳ Delete Message & 1-Hour Timeout</option>
                <option value="kick">👢 Delete Message & Kick Offender</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: AI Toxicity & Community Rules */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquareWarning className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-white">Gemini AI Community Rules</h3>
            </div>
            <button
              onClick={() => setAiEnabled(!aiEnabled)}
              className={`w-10 h-5 rounded-full transition-colors relative ${
                aiEnabled ? 'bg-indigo-600' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  aiEnabled ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            {/* Sensitivity */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">AI Detection Sensitivity:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['low', 'medium', 'high'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setSensitivity(level)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold capitalize transition ${
                      sensitivity === level
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm shadow-indigo-950'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {level === 'low' && 'Low (Definite)'}
                    {level === 'medium' && 'Medium (Balanced)'}
                    {level === 'high' && 'High (Strict)'}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Medium is optimal for public gaming communities. High is suited for family-friendly servers.
              </p>
            </div>

            {/* Monitored Categories */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <span className="font-semibold text-slate-300 block">Monitored Violation Categories:</span>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Violent Threats & Doxxing</strong>
                  <span className="text-[11px] text-slate-500">Physical harm, address leaking, swat threats</span>
                </div>
                <input
                  type="checkbox"
                  checked={categories.threats}
                  onChange={() => toggleCategory('threats')}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Hate Speech & Discriminatory Slurs</strong>
                  <span className="text-[11px] text-slate-500">Racial slurs, identity attacks, hate symbols</span>
                </div>
                <input
                  type="checkbox"
                  checked={categories.hateSpeech}
                  onChange={() => toggleCategory('hateSpeech')}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Severe Harassment & Toxic Bullying</strong>
                  <span className="text-[11px] text-slate-500">Targeted attacks, repeated degradation</span>
                </div>
                <input
                  type="checkbox"
                  checked={categories.harassment}
                  onChange={() => toggleCategory('harassment')}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Scams, Fake Nitro & Phishing</strong>
                  <span className="text-[11px] text-slate-500">Steam gift scams, crypto airdrops, token grabbers</span>
                </div>
                <input
                  type="checkbox"
                  checked={categories.scams}
                  onChange={() => toggleCategory('scams')}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 cursor-pointer">
                <div>
                  <strong className="text-slate-200 block">Severe Explicit Profanity</strong>
                  <span className="text-[11px] text-slate-500">Heavy vulgarity without context</span>
                </div>
                <input
                  type="checkbox"
                  checked={categories.severeProfanity}
                  onChange={() => toggleCategory('severeProfanity')}
                  className="rounded accent-indigo-500 w-4 h-4"
                />
              </label>
            </div>

            {/* AI Punishment action */}
            <div className="space-y-1.5 pt-2">
              <label className="font-semibold text-slate-300">Sanction on AI Violation:</label>
              <select
                value={aiAction}
                onChange={(e: any) => setAiAction(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="delete_warn">🗑️ Purge Message & Issue In-Channel Warning</option>
                <option value="timeout_1h">⏳ Purge Message & 1-Hour Timeout</option>
                <option value="kick">👢 Purge Message & Kick Member</option>
                <option value="ban">🔨 Purge Message & Permanently Ban Offender</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Save Button */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Modifications take effect immediately on all monitored server channels.
        </span>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-indigo-950 transition"
        >
          {savedSuccess ? <Check className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Applied!' : 'Save AutoMod Rules'}</span>
        </button>
      </div>
    </div>
  );
};
