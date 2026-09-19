import React from 'react';
import { BotStatus } from '../types.js';
import {
  ShieldCheck,
  ShieldAlert,
  Shield,
  RefreshCw,
  Power,
  Server,
  Zap,
  Globe,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  status: BotStatus | null;
  loading: boolean;
  onRefresh: () => void;
  onStart: () => void;
  onStop: () => void;
  onNavigateToSetup: () => void;
  onSwitchToLanding?: () => void;
  onOpenInvite?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  loading,
  onRefresh,
  onStart,
  onStop,
  onNavigateToSetup,
  onSwitchToLanding,
  onOpenInvite,
}) => {
  const isOnline = status?.status === 'online';
  const isConnecting = status?.status === 'connecting';
  const isError = status?.status === 'error';
  const primaryGuild = status?.guilds?.[0];

  return (
    <header className="border-b border-neutral-800/80 bg-black/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-3 shadow-md shadow-black/40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand & Bot identity */}
        <div className="flex items-center gap-3.5">
          {/* Bot Avatar with soft pulse & hover shine */}
          <div className="relative group cursor-pointer">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white shadow-lg shrink-0 font-bold text-lg group-hover:scale-105 group-hover:border-neutral-500 transition-all duration-200">
              🐺
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-black ${
                isOnline
                  ? 'bg-white ring-2 ring-white/20'
                  : isConnecting
                  ? 'bg-neutral-400 ring-2 ring-neutral-400/20'
                  : 'bg-neutral-600'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-white tracking-tight font-sans hover:text-neutral-300 transition-colors cursor-pointer">
                Fenris
              </span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-white text-black tracking-wider shadow-sm">
                BOT
              </span>
              <span className="text-xs text-neutral-400 font-mono">
                {status?.tag ? `@${status.tag}` : '@FenriX#7583'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline
                      ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]'
                      : isConnecting
                      ? 'bg-neutral-400 animate-ping'
                      : 'bg-neutral-600'
                  }`}
                />
                <span className="text-[11px] font-medium text-neutral-200">
                  {isOnline ? 'Online & Guarding' : isConnecting ? 'Connecting to Discord...' : isError ? 'Token Error' : 'Standby'}
                </span>
              </span>

              {isOnline && typeof status?.ping === 'number' && (
                <>
                  <span className="text-neutral-600">•</span>
                  <span className="text-neutral-400 text-[11px] flex items-center gap-1 font-mono">
                    <Zap className="w-3 h-3 text-neutral-300" />
                    {status.ping}ms
                  </span>
                </>
              )}

              <span className="text-neutral-600">•</span>
              <span className="text-neutral-400 text-[11px]">v4.2.0</span>
            </div>
          </div>
        </div>

        {/* Server Context Pill & Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Active Server Pill with sleek monochrome */}
          {primaryGuild && (
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 shadow-sm transition-all duration-200 cursor-default group">
              <div className="w-5 h-5 rounded-lg bg-neutral-800 text-white border border-neutral-700 flex items-center justify-center font-bold text-[10px] group-hover:scale-105 transition-transform">
                {primaryGuild.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <span className="font-medium text-white text-xs mr-1.5">
                  {primaryGuild.name}
                </span>
                <span className="text-[11px] text-neutral-400 font-mono">
                  ({primaryGuild.memberCount} members)
                </span>
              </div>
            </div>
          )}

          {/* Switch to Public Landing Website */}
          {onSwitchToLanding && (
            <button
              onClick={onSwitchToLanding}
              className="shine-hover flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 text-xs font-medium transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
              title="View Public Documentation & Landing Website"
            >
              <Globe className="w-3.5 h-3.5 text-neutral-400" />
              <span>Landing Page</span>
            </button>
          )}

          {/* Add to Discord (Sleek high contrast white) */}
          {onOpenInvite && (
            <button
              onClick={onOpenInvite}
              className="shine-hover flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all shadow-md shadow-white/10 hover:shadow-lg cursor-pointer active:scale-95 hover:-translate-y-0.5"
              title="Add Fenris to your Discord Server"
            >
              <span>Invite Bot</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 transition-all shadow-sm hover:shadow cursor-pointer active:scale-95"
            title="Refresh bot status and audit logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-white' : ''}`} />
          </button>

          {/* Start/Stop Toggle */}
          {isOnline ? (
            <button
              onClick={onStop}
              disabled={loading}
              className="shine-hover flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-800 hover:border-neutral-700 text-xs font-medium transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <Power className="w-3.5 h-3.5 text-neutral-400" />
              <span>Stop Bot</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              disabled={loading}
              className="shine-hover flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-semibold transition-all shadow-md shadow-white/10 hover:shadow-lg cursor-pointer active:scale-95 hover:-translate-y-0.5"
            >
              <Power className="w-3.5 h-3.5" />
              <span>Start Bot</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
