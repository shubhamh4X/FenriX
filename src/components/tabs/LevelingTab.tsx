import React, { useState } from 'react';
import { Award, Sparkles, Sliders, Users, ShieldCheck, Plus, Trash2, CheckCircle2, MessageSquare, Mic, Trophy } from 'lucide-react';

interface RoleReward {
  id: string;
  level: number;
  roleName: string;
  roleColor: string;
}

export const LevelingTab: React.FC = () => {
  const [levelingEnabled, setLevelingEnabled] = useState(true);
  const [textXpRate, setTextXpRate] = useState(1.5);
  const [voiceXpRate, setVoiceXpRate] = useState(2.0);
  const [announceChannel, setAnnounceChannel] = useState('current');
  const [announceTemplate, setAnnounceTemplate] = useState('GG {user}, you leveled up to **Level {level}**! 🎉');
  const [saved, setSaved] = useState(false);

  const [roleRewards, setRoleRewards] = useState<RoleReward[]>([
    { id: '1', level: 5, roleName: 'Active Member', roleColor: '#34d399' },
    { id: '2', level: 15, roleName: 'Server Veteran', roleColor: '#60a5fa' },
    { id: '3', level: 30, roleName: 'Elite Vanguard', roleColor: '#a78bfa' },
    { id: '4', level: 50, roleName: 'Fenris Champion', roleColor: '#f59e0b' },
  ]);

  const [newLevel, setNewLevel] = useState(10);
  const [newRole, setNewRole] = useState('');

  const handleAddReward = () => {
    if (!newRole.trim()) return;
    setRoleRewards([
      ...roleRewards,
      {
        id: Date.now().toString(),
        level: newLevel,
        roleName: newRole.trim(),
        roleColor: '#ffffff',
      },
    ].sort((a, b) => a.level - b.level));
    setNewRole('');
  };

  const handleRemoveReward = (id: string) => {
    setRoleRewards(roleRewards.filter((r) => r.id !== id));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const leaderboardMembers = [
    { rank: 1, name: 'ValkyrieCommander', level: 64, xp: 14250, messages: 4210, voiceHours: 124 },
    { rank: 2, name: 'Nightshade', level: 58, xp: 11980, messages: 3890, voiceHours: 98 },
    { rank: 3, name: 'CyberWolf', level: 49, xp: 9540, messages: 3120, voiceHours: 85 },
    { rank: 4, name: 'Aegis_Prime', level: 42, xp: 7850, messages: 2450, voiceHours: 62 },
    { rank: 5, name: 'Kitsune_7', level: 36, xp: 6200, messages: 1980, voiceHours: 49 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-700 text-[11px] font-mono text-neutral-300">
            <Award className="w-3.5 h-3.5 text-white" />
            <span>XP &amp; Leveling Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-wide">
            Member Engagement &amp; Rank Rewards
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl font-sans leading-relaxed">
            Reward server activity across text channels and voice rooms with dynamic XP scaling, automated role milestone unlocks, and high-resolution rank cards.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={() => setLevelingEnabled(!levelingEnabled)}
            className={`px-5 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2 ${
              levelingEnabled
                ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                levelingEnabled ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'
              }`}
            />
            {levelingEnabled ? 'Engine Active' : 'Disabled'}
          </button>

          <button
            onClick={handleSave}
            className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-white font-mono text-xs uppercase tracking-wider font-semibold transition-all flex items-center gap-2"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Saved!
              </>
            ) : (
              'Save Config'
            )}
          </button>
        </div>
      </div>

      {/* Grid: XP Config + Milestone Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: XP Rates & Announcements */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-6">
            <h3 className="text-lg font-bold font-serif text-white tracking-wide flex items-center gap-2">
              <Sliders className="w-4 h-4 text-white" />
              XP Multipliers &amp; Rates
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-neutral-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-neutral-400" />
                    Text Message XP Multiplier
                  </span>
                  <span className="font-bold text-white">{textXpRate}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={textXpRate}
                  onChange={(e) => setTextXpRate(parseFloat(e.target.value))}
                  className="w-full accent-white h-2 bg-neutral-800 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                  Base rate: 15-25 XP per qualifying message with a 60s cooldown.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono text-neutral-300 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5 text-neutral-400" />
                    Voice Channel XP Multiplier
                  </span>
                  <span className="font-bold text-white">{voiceXpRate}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={voiceXpRate}
                  onChange={(e) => setVoiceXpRate(parseFloat(e.target.value))}
                  className="w-full accent-white h-2 bg-neutral-800 rounded-lg cursor-pointer"
                />
                <p className="text-[11px] text-neutral-500 mt-1 font-mono">
                  Earns XP every minute spent in an active voice room (unmuted).
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-900 space-y-4">
              <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold">
                Level-Up Announcement
              </h4>

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1.5">
                  Announcement Channel
                </label>
                <select
                  value={announceChannel}
                  onChange={(e) => setAnnounceChannel(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                >
                  <option value="current">Current Channel (where user typed)</option>
                  <option value="dm">Direct Message to User</option>
                  <option value="bot-logs">Dedicated #level-ups Channel</option>
                  <option value="disabled">Silent (No Announcement)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 block mb-1.5">
                  Message Format Template
                </label>
                <input
                  type="text"
                  value={announceTemplate}
                  onChange={(e) => setAnnounceTemplate(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                />
                <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
                  Supported tokens: {'{user}'}, {'{level}'}, {'{xp}'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Milestone Role Rewards */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-serif text-white tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-white" />
                Milestone Role Rewards
              </h3>
              <span className="text-[11px] font-mono text-neutral-400">
                {roleRewards.length} configured
              </span>
            </div>

            <p className="text-xs text-neutral-400">
              When members cross these level thresholds, Fenris automatically awards these Discord roles without moderator intervention.
            </p>

            {/* Role Rewards List */}
            <div className="space-y-2.5">
              {roleRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 rounded-lg bg-black text-white font-mono text-xs font-bold border border-neutral-800">
                      LVL {reward.level}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: reward.roleColor }}
                      />
                      <span className="font-semibold text-white text-xs">@{reward.roleName}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveReward(reward.id)}
                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Milestone Form */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800/80 space-y-3">
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 font-semibold block">
                Add Milestone Role
              </span>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <input
                    type="number"
                    min={1}
                    max={150}
                    placeholder="Level"
                    value={newLevel}
                    onChange={(e) => setNewLevel(parseInt(e.target.value, 10))}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
                <div className="col-span-6">
                  <input
                    type="text"
                    placeholder="Role name (e.g. Master)"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <button
                    onClick={handleAddReward}
                    className="w-full h-full rounded-xl bg-white text-black flex items-center justify-center hover:bg-neutral-200 transition-colors font-bold text-xs"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guild Top-5 Leaderboard Snapshot */}
      <div className="p-6 sm:p-8 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-serif text-white tracking-wide flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Live Guild Leaderboard Snapshot
            </h3>
            <p className="text-xs text-neutral-400 mt-1 font-sans">
              Members can view this leaderboard directly in Discord using <code className="text-white">/leaderboard</code> or <code className="text-white">!top</code>.
            </p>
          </div>
          <span className="text-xs font-mono text-neutral-400">Total Ranked: 1,420</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-500 uppercase tracking-wider">
                <th className="pb-3 pl-2">Rank</th>
                <th className="pb-3">Member</th>
                <th className="pb-3">Level</th>
                <th className="pb-3">Total XP</th>
                <th className="pb-3">Chat Messages</th>
                <th className="pb-3">Voice Hours</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {leaderboardMembers.map((member) => (
                <tr key={member.rank} className="hover:bg-neutral-900/40 transition-colors">
                  <td className="py-3.5 pl-2 font-bold text-white">
                    {member.rank === 1 ? '🥇 #1' : member.rank === 2 ? '🥈 #2' : member.rank === 3 ? '🥉 #3' : `#${member.rank}`}
                  </td>
                  <td className="py-3.5 text-white font-semibold flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-neutral-800 border border-neutral-700 overflow-hidden shrink-0">
                      <img
                        src={`https://api.dicebear.com/7.x/bottts/svg?seed=${member.name}`}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>{member.name}</span>
                  </td>
                  <td className="py-3.5 text-emerald-400 font-bold">LVL {member.level}</td>
                  <td className="py-3.5 text-neutral-300">{member.xp.toLocaleString()} XP</td>
                  <td className="py-3.5 text-neutral-400">{member.messages.toLocaleString()} msgs</td>
                  <td className="py-3.5 text-neutral-400">{member.voiceHours} hrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
