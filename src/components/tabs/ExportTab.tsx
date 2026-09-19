import React, { useState } from 'react';
import {
  DownloadCloud,
  Copy,
  Check,
  Terminal,
  FileCode,
  Server,
  Layers,
  ExternalLink,
} from 'lucide-react';

export const ExportTab: React.FC = () => {
  const [activeFile, setActiveFile] = useState<'env' | 'run' | 'docker'>('run');
  const [copied, setCopied] = useState(false);

  const envSnippet = `# Discord Sentinel Bot Configuration (.env)
DISCORD_BOT_TOKEN="your_discord_bot_token_here"
DISCORD_CLIENT_ID="your_discord_application_client_id"
DISCORD_GUILD_ID="your_primary_server_guild_id"
ADMIN_DISCORD_IDS="your_discord_user_id_here"
GEMINI_API_KEY="your_google_gemini_api_key_here"
`;

  const runCommandsSnippet = `# Step 1: Clone or copy project files into your server
git clone <your-repo>
cd discord-sentinel

# Step 2: Install dependencies
npm install

# Step 3: Run the web dashboard & live bot
npm run dev

# Step 4: Run continuously in production with PM2
npm install -g pm2
npm run build
pm2 start dist/server.cjs --name "discord-sentinel"
pm2 save
pm2 startup
`;

  const dockerSnippet = `# Dockerfile for Discord Sentinel Bot
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
`;

  const currentSnippet =
    activeFile === 'env'
      ? envSnippet
      : activeFile === 'run'
      ? runCommandsSnippet
      : dockerSnippet;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DownloadCloud className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              Self-Host &amp; Production Server Deployment Guide
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            You can keep this web dashboard open in Google AI Studio to run the bot, or self-host it on any
            VPS (Ubuntu, Debian, DigitalOcean, Railway, or Docker) with PM2 for 99.99% uptime.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick File Nav */}
        <div className="space-y-3">
          <button
            onClick={() => setActiveFile('run')}
            className={`w-full p-3.5 rounded-xl border text-left text-xs transition flex items-center gap-3 ${
              activeFile === 'run'
                ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4 text-indigo-400" />
            <div>
              <strong className="block font-semibold">Deploy Commands (PM2)</strong>
              <span className="text-[11px] text-slate-500">Run continuous background process</span>
            </div>
          </button>

          <button
            onClick={() => setActiveFile('env')}
            className={`w-full p-3.5 rounded-xl border text-left text-xs transition flex items-center gap-3 ${
              activeFile === 'env'
                ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4 text-cyan-400" />
            <div>
              <strong className="block font-semibold">.env Configuration</strong>
              <span className="text-[11px] text-slate-500">Bot token & secret keys</span>
            </div>
          </button>

          <button
            onClick={() => setActiveFile('docker')}
            className={`w-full p-3.5 rounded-xl border text-left text-xs transition flex items-center gap-3 ${
              activeFile === 'docker'
                ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <div>
              <strong className="block font-semibold">Dockerfile</strong>
              <span className="text-[11px] text-slate-500">Containerized cloud deployment</span>
            </div>
          </button>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <strong className="text-white block font-semibold">Recommended Hosting Platforms:</strong>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400">
              <li>Railway.app (1-click Node/Docker deploy)</li>
              <li>DigitalOcean Droplet ($4/mo Ubuntu)</li>
              <li>Linode / Akamai Connected Cloud</li>
              <li>Any local home server (Raspberry Pi / Linux)</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Code Viewer */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-mono text-indigo-300 font-semibold">
              {activeFile === 'run' ? 'deploy.sh' : activeFile === 'env' ? '.env' : 'Dockerfile'}
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
            {currentSnippet}
          </pre>
        </div>
      </div>
    </div>
  );
};
