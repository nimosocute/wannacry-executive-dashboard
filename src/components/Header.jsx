import React from 'react';
import { BookOpen, Github, Terminal, Search } from 'lucide-react';

export default function Header({ onOpenGlossary }) {
  return (
    <header className="sticky top-0 z-40 bg-[#090a0f]/90 backdrop-blur-md border-b border-[#1e2029] px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center font-mono text-xs font-semibold text-zinc-200">
            WC
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight text-zinc-100">WannaCry Interactive Report</span>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider hidden sm:inline">IAM302 &bull; Self-Explanatory Technical Docs</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenGlossary}
            className="px-2.5 py-1.5 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 font-medium transition flex items-center gap-1.5 shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span>Tra cứu HĐH</span>
            <kbd className="text-[10px] font-mono bg-zinc-800 px-1 rounded text-zinc-400 border border-zinc-700 hidden sm:inline">⌘K</kbd>
          </button>
          <a
            href="https://github.com/nimosocute/wannacry-executive-dashboard"
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition"
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
