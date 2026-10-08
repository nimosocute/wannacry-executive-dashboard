import React from 'react';
import { Layers, Activity, Terminal, Shield, GitBranch, Image, FileText, CheckCircle2 } from 'lucide-react';

export default function Sidebar({ activeSection }) {
  const navItems = [
    { id: 'overview', label: '01. Giới thiệu & Động học Nhị phân', icon: Layers },
    { id: 'sandbox', label: '02. Live Demo: Kill-Switch Sandbox', icon: Activity },
    { id: 'behaviors', label: '03. 6 Chuỗi Hành vi Nhân - Quả', icon: GitBranch },
    { id: 'commands', label: '04. Trình Giải thích Cờ lệnh (LotL)', icon: Terminal },
    { id: 'process-tree', label: '05. Cây Tiến trình (15 Verified PIDs)', icon: Activity },
    { id: 'evidence-gallery', label: '06. Kho Bằng chứng Đa công cụ', icon: Image },
    { id: 'recommendations', label: '07. Khuyến nghị Kỹ thuật', icon: Shield },
    { id: 'iocs', label: '08. Chỉ số IOCs & Ma trận MITRE', icon: FileText }
  ];

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="hidden lg:block w-64 shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto custom-scrollbar py-6 pr-4 border-r border-[#1e2029]">
      <div className="space-y-4">
        <div>
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block px-3 mb-2">
            Mục lục Báo cáo (TOC)
          </span>
          <nav className="space-y-0.5 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center gap-2.5 transition ${
                    isActive
                      ? 'bg-zinc-800/80 text-zinc-100 font-medium border-l-2 border-blue-500'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-400' : 'text-zinc-500'}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-[#1e2029] px-3 space-y-2">
          <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">
            Nguyên tắc Thiết kế
          </span>
          <ul className="text-[11px] text-zinc-400 space-y-1 font-mono">
            <li>&bull; Clarity over Decoration</li>
            <li>&bull; Explanation over Summary</li>
            <li>&bull; Evidence next to Claims</li>
            <li>&bull; Progressive Depth</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
