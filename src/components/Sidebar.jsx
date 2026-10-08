import React from 'react';
import { BookOpen, GitBranch, Terminal, Cpu, Image, Activity, FileText } from 'lucide-react';

export default function Sidebar({ activeSection, chapters = [] }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="hidden lg:block w-64 shrink-0 sticky top-12 h-[calc(100vh-3rem)] overflow-y-auto custom-scrollbar py-8 pr-4 text-xs">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2 px-2.5">
            Mục lục Báo cáo
          </span>
          <nav className="space-y-0.5">
            <button
              onClick={() => scrollTo('overview')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center justify-between ${
                activeSection === 'overview'
                  ? 'bg-zinc-800/70 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <span>Giới thiệu & Tổng quan</span>
            </button>
            <button
              onClick={() => scrollTo('summary-cards')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center justify-between ${
                activeSection === 'summary-cards'
                  ? 'bg-zinc-800/70 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <span>3 Kết luận cốt lõi</span>
            </button>
          </nav>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2 px-2.5">
            6 Chương Hành vi
          </span>
          <nav className="space-y-0.5">
            {chapters.map((ch) => {
              const isActive = activeSection === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => scrollTo(ch.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-zinc-800/70 text-zinc-100 font-medium'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <span className="font-mono text-[10px] text-zinc-500">{ch.number}</span>
                  <span className="truncate">{ch.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2 px-2.5">
            Công cụ Tương tác
          </span>
          <nav className="space-y-0.5">
            <button
              onClick={() => scrollTo('interactive-killswitch')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center gap-2 ${
                activeSection === 'interactive-killswitch'
                  ? 'bg-zinc-800/70 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Kill Switch Sandbox</span>
            </button>
            <button
              onClick={() => scrollTo('interactive-commands')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center gap-2 ${
                activeSection === 'interactive-commands'
                  ? 'bg-zinc-800/70 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Giải thích Cờ lệnh</span>
            </button>
            <button
              onClick={() => scrollTo('interactive-tree')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center gap-2 ${
                activeSection === 'interactive-tree'
                  ? 'bg-zinc-800/70 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Cây 15 Tiến trình</span>
            </button>
          </nav>
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 block mb-2 px-2.5">
            Chứng cứ & Kiểm chứng
          </span>
          <nav className="space-y-0.5">
            <button
              onClick={() => scrollTo('evidence-gallery')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center gap-2 ${
                activeSection === 'evidence-gallery'
                  ? 'bg-zinc-800/70 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <Image className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Kho Bằng chứng (8 Ảnh)</span>
            </button>
            <button
              onClick={() => scrollTo('audit-matrix')}
              className={`w-full text-left px-2.5 py-1.5 rounded transition flex items-center gap-2 ${
                activeSection === 'audit-matrix'
                  ? 'bg-zinc-800/70 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Ma trận Kiểm toán</span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
