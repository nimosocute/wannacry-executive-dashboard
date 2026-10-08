import React from 'react';
import { Github, FileText, ExternalLink } from 'lucide-react';

export default function Header({ depthLevel, setDepthLevel }) {
  return (
    <header className="sticky top-0 z-30 bg-[#08090a]/80 backdrop-blur-md border-b border-[#1f2128] px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700/60 flex items-center justify-center font-mono text-[11px] font-semibold text-zinc-300">
            W
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium tracking-tight text-zinc-200">WannaCry Research Report</span>
            <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">IAM302 &bull; Lab Live Evidence</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Linear Mode Switch */}
          <div className="flex items-center p-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-[11px]">
            <button
              onClick={() => setDepthLevel('minimal')}
              className={`px-2.5 py-1 rounded transition ${
                depthLevel === 'minimal'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Tối giản
            </button>
            <button
              onClick={() => setDepthLevel('detailed')}
              className={`px-2.5 py-1 rounded transition ${
                depthLevel === 'detailed'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Cơ chế
            </button>
            <button
              onClick={() => setDepthLevel('evidence')}
              className={`px-2.5 py-1 rounded transition ${
                depthLevel === 'evidence'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Bằng chứng
            </button>
          </div>

          <a
            href="https://github.com/nimosocute/wannacry-executive-dashboard"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 text-zinc-400 hover:text-zinc-200 transition"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
