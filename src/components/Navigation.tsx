import React from 'react';
import {
  LayoutDashboard,
  Gavel,
  Terminal,
  ShieldAlert,
  Bot,
  BellRing,
  ScrollText,
  KeyRound,
  FlaskConical,
  DownloadCloud,
  Award,
} from 'lucide-react';

export type TabId =
  | 'overview'
  | 'moderation'
  | 'commands'
  | 'leveling'
  | 'anti-nuke'
  | 'automod'
  | 'admin-dm'
  | 'audit-logs'
  | 'setup'
  | 'simulator'
  | 'export';

interface NavigationProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  threatCount: number;
  isOnline: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onChangeTab,
  threatCount,
}) => {
  const tabs = [
    {
      id: 'overview' as TabId,
      label: 'Server Overview',
      icon: LayoutDashboard,
    },
    {
      id: 'moderation' as TabId,
      label: 'Moderation & Cases',
      icon: Gavel,
    },
    {
      id: 'automod' as TabId,
      label: 'AutoMod & Filters',
      icon: Bot,
    },
    {
      id: 'anti-nuke' as TabId,
      label: 'Anti-Nuke & Raid',
      icon: ShieldAlert,
    },
    {
      id: 'commands' as TabId,
      label: 'Bot Commands',
      icon: Terminal,
    },
    {
      id: 'leveling' as TabId,
      label: 'Leveling & XP',
      icon: Award,
    },
    {
      id: 'audit-logs' as TabId,
      label: 'Audit Timeline',
      icon: ScrollText,
      badge: threatCount > 0 ? `${threatCount}` : undefined,
    },
    {
      id: 'admin-dm' as TabId,
      label: 'Staff Alerts',
      icon: BellRing,
    },
    {
      id: 'setup' as TabId,
      label: 'Bot Settings',
      icon: KeyRound,
    },
    {
      id: 'simulator' as TabId,
      label: 'Threat Simulator',
      icon: FlaskConical,
    },
    {
      id: 'export' as TabId,
      label: 'Source Code',
      icon: DownloadCloud,
    },
  ];

  return (
    <nav className="border-b border-neutral-800/80 bg-black/95 backdrop-blur-md px-4 sm:px-8 overflow-x-auto no-scrollbar sticky top-[61px] z-30 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center gap-2 py-2.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`shine-hover flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-sm -translate-y-0.5'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent hover:border-neutral-800 hover:-translate-y-0.5'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 transition-all duration-200 ${
                  isActive ? 'text-black' : 'text-neutral-400'
                }`}
              />
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full border shadow-sm ${
                    isActive
                      ? 'bg-black text-white border-black'
                      : 'bg-neutral-800 text-neutral-200 border-neutral-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
