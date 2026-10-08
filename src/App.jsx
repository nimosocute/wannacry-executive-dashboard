import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  Terminal,
  Activity,
  Cpu,
  Image,
  ArrowRight
} from 'lucide-react';

import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import KillSwitchSandbox from './components/KillSwitchSandbox.jsx';
import CommandExplainer from './components/CommandExplainer.jsx';
import ProcessLineageTree from './components/ProcessLineageTree.jsx';
import EvidenceViewer from './components/EvidenceViewer.jsx';

import IntroMDX from './content/Introduction.mdx';
import { chapters } from './content/chapters.js';

export default function App() {
  const [depthLevel, setDepthLevel] = useState('minimal'); // 'minimal' | 'detailed' | 'evidence'
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedChapters, setExpandedChapters] = useState({});

  // Toggle single chapter expansion
  const toggleChapter = (id) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Collect all unique evidence items across chapters
  const allEvidence = chapters.reduce((acc, ch) => {
    (ch.evidence || []).forEach((ev) => {
      if (!acc.some((item) => item.file === ev.file)) {
        acc.push(ev);
      }
    });
    return acc;
  }, []);

  // Track active section on scroll
  useEffect(() => {
    const sectionIds = [
      'overview',
      'summary-cards',
      ...chapters.map((c) => c.id),
      'interactive-killswitch',
      'interactive-commands',
      'interactive-tree',
      'evidence-gallery',
      'audit-matrix'
    ];

    const handleScroll = () => {
      const scrollY = window.scrollY + 100;
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#08090a] text-[#ededef] font-sans selection:bg-indigo-500/20 selection:text-white">
      <Header depthLevel={depthLevel} setDepthLevel={setDepthLevel} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
        <Sidebar activeSection={activeSection} chapters={chapters} />

        <main className="flex-1 py-10 min-w-0 max-w-3xl space-y-16">
          {/* Section: Overview & MDX */}
          <section id="overview" className="scroll-mt-16 space-y-6">
            <div className="space-y-2">
              <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                08/10/2026 &bull; IAM302 LAB LIVE
              </div>
              <div className="prose prose-invert max-w-none text-zinc-300 text-sm leading-relaxed">
                <IntroMDX />
              </div>
            </div>

            {/* 3 Core takeaways (Linear Cards) */}
            <div id="summary-cards" className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded bg-zinc-900/40 border border-zinc-800/80 space-y-1.5">
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">A &bull; Thoát sớm</div>
                <div className="text-zinc-200 font-medium">Nhận HTTP 200 &rarr; Thoát 0</div>
                <p className="text-[11px] text-zinc-400 font-sans leading-snug">
                  PID 6520 nhận 155 byte TCP từ responder rồi kết thúc sau 0.89s. 3 decoy không đổi.
                </p>
              </div>

              <div className="p-3.5 rounded bg-zinc-900/40 border border-zinc-800/80 space-y-1.5">
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">B &bull; Tiếp tục</div>
                <div className="text-zinc-200 font-medium">Socket thất bại &rarr; Chuỗi lây nhiễm</div>
                <p className="text-[11px] text-zinc-400 font-sans leading-snug">
                  8 lần Reconnect lỗi; SCM khởi tạo mssecsvc2.0; tasksche mã hóa decoy thành .WNCRY.
                </p>
              </div>

              <div className="p-3.5 rounded bg-zinc-900/40 border border-zinc-800/80 space-y-1.5">
                <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">Phạm vi & Giới hạn</div>
                <div className="text-zinc-200 font-medium">Chỉ kết luận trong quan sát</div>
                <p className="text-[11px] text-zinc-400 font-sans leading-snug">
                  Không suy diễn C2, reboot persistence hay thuật toán mật mã ngoài dữ liệu Procmon/Burp.
                </p>
              </div>
            </div>
          </section>

          {/* 6 Chapters */}
          <section className="space-y-12">
            <div className="pb-3 border-b border-[#1f2128]">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-200 uppercase font-mono tracking-wider">
                Sáu Chương Hành Vi & Bằng Chứng Tại Chỗ
              </h2>
            </div>

            {chapters.map((ch) => {
              const isExpanded = depthLevel !== 'minimal' || expandedChapters[ch.id];
              const showEvidence = depthLevel === 'evidence' || isExpanded;

              return (
                <article
                  key={ch.id}
                  id={ch.id}
                  className="scroll-mt-16 space-y-4 pt-2 border-b border-[#181a20] pb-10"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] text-zinc-500 uppercase tracking-widest">
                        {ch.number} / {ch.category}
                      </span>

                      <button
                        onClick={() => toggleChapter(ch.id)}
                        className="text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition flex items-center gap-1"
                      >
                        <span>{isExpanded ? 'Thu gọn' : 'Xem chi tiết cơ chế'}</span>
                        {isExpanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                      </button>
                    </div>

                    <h3 className="text-base font-semibold text-zinc-100 tracking-tight">{ch.title}</h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">{ch.summary}</p>
                  </div>

                  {/* Progressive Expanded Content */}
                  {isExpanded && (
                    <div className="space-y-5 pt-3 text-xs leading-relaxed border-t border-zinc-800/60">
                      {/* Observed vs Mechanism */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                            Quan sát thực tế trong Lab
                          </span>
                          <p className="text-zinc-300 text-[11px] leading-relaxed">{ch.observed}</p>
                        </div>

                        <div className="space-y-1.5">
                          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                            Giải thích cơ chế hệ điều hành Windows
                          </span>
                          <p className="text-zinc-300 text-[11px] leading-relaxed">{ch.mechanism}</p>
                        </div>
                      </div>

                      {/* Inference & Limits */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-zinc-800/40 text-[11px]">
                        <div className="space-y-1">
                          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                            Suy luận & Quan hệ Nhân - Quả
                          </span>
                          <p className="text-zinc-300 leading-relaxed">{ch.inference}</p>
                        </div>

                        <div className="space-y-1">
                          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                            Giới hạn bằng chứng
                          </span>
                          <p className="text-zinc-400 leading-relaxed">{ch.limit}</p>
                        </div>
                      </div>

                      {/* Contextual Evidence Screenshots */}
                      {showEvidence && ch.evidence && ch.evidence.length > 0 && (
                        <div className="space-y-3 pt-3 border-t border-zinc-800/60">
                          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                            Bằng chứng đối chiếu tại chỗ
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ch.evidence.map((ev, evIdx) => (
                              <div
                                key={evIdx}
                                className="rounded bg-zinc-900/50 border border-zinc-800 overflow-hidden flex flex-col"
                              >
                                <a
                                  href={ev.file}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="aspect-video bg-zinc-950 block overflow-hidden group relative"
                                >
                                  <img
                                    src={ev.file}
                                    alt={ev.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                  />
                                  <div className="absolute top-1.5 left-1.5 font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/80 text-zinc-300 border border-zinc-800">
                                    {ev.id}
                                  </div>
                                </a>
                                <div className="p-2.5 space-y-1.5 flex-1 flex flex-col justify-between">
                                  <div>
                                    <div className="font-medium text-zinc-200 text-[11px]">{ev.title}</div>
                                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">{ev.caption}</p>
                                  </div>
                                  <div className="text-[9px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60">
                                    {ev.source}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Exact CSV Records */}
                      {ch.records && ch.records.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-zinc-800/40">
                          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                            Mốc thời gian CSV (1-based data index)
                          </span>
                          <div className="space-y-1 font-mono text-[11px]">
                            {ch.records.map((rec, recIdx) => (
                              <div
                                key={recIdx}
                                className="px-2.5 py-1 rounded bg-zinc-900/40 border border-zinc-800/60 flex items-baseline justify-between gap-3 text-zinc-300"
                              >
                                <div className="flex items-baseline gap-2">
                                  <span className="text-zinc-500 text-[10px]">{rec.time}</span>
                                  <span>{rec.event}</span>
                                </div>
                                <span className="text-[10px] text-zinc-500 shrink-0">{rec.source}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Term Explanations if present */}
                      {ch.terms && ch.terms.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-zinc-800/40">
                          <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider block">
                            Thuật ngữ & Tham số lệnh liên quan
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                            {ch.terms.map((term, tIdx) => (
                              <div
                                key={tIdx}
                                className="p-2 rounded bg-zinc-900/30 border border-zinc-800/50 space-y-0.5"
                              >
                                <span className="font-mono text-zinc-300 font-medium">{term.token}</span>
                                <p className="text-zinc-400 text-[10px] leading-tight">{term.meaning}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          {/* Interactive Tools */}
          <section className="space-y-12">
            <div className="pb-3 border-b border-[#1f2128]">
              <h2 className="text-sm font-semibold tracking-tight text-zinc-200 uppercase font-mono tracking-wider">
                Công Cụ Tương Tác Học Tập
              </h2>
            </div>

            <div id="interactive-killswitch" className="scroll-mt-16">
              <KillSwitchSandbox />
            </div>

            <div id="interactive-commands" className="scroll-mt-16">
              <CommandExplainer />
            </div>

            <div id="interactive-tree" className="scroll-mt-16">
              <ProcessLineageTree />
            </div>
          </section>

          {/* Evidence Gallery */}
          <section id="evidence-gallery" className="scroll-mt-16 space-y-4">
            <EvidenceViewer items={allEvidence} />
          </section>

          {/* Audit Matrix & Limitations */}
          <section id="audit-matrix" className="scroll-mt-16 space-y-4 pb-12">
            <div className="pb-3 border-b border-[#1f2128]">
              <h3 className="text-sm font-medium text-zinc-200">Ma Trận Kiểm Toán Thực Nghiệm & Ranh Giới Chứng Minh</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Ranh giới giữa sự kiện quan sát được và những điều chưa thể chứng minh ngoài phạm vi dữ liệu lab.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Xác nhận thực tế</span>
                </span>
                <ul className="space-y-1 text-zinc-300 text-[11px] list-disc list-inside leading-relaxed">
                  <li>Khả năng tới endpoint tương quan với việc thoát 0 hay tiếp tục lây nhiễm.</li>
                  <li>mssecsvc2.0 được cấu hình Auto start dưới tài khoản LocalSystem.</li>
                  <li>3 decoy bị đổi tên thành .WNCRY sau khi ghi đè phần đầu tệp.</li>
                  <li>Giao diện Wanna Decrypt0r 2.0 hiển thị đòi $300 Bitcoin.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded bg-zinc-900/40 border border-zinc-800/80 space-y-2">
                <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Không khẳng định ngoài quan sát</span>
                </span>
                <ul className="space-y-1 text-zinc-400 text-[11px] list-disc list-inside leading-relaxed">
                  <li>Không khẳng định request mạng là C2 hay tải payload bổ sung.</li>
                  <li>Không chứng minh mã độc tồn tại qua reboot khi chưa khởi động lại máy.</li>
                  <li>Không chứng minh thuật toán RSA/AES cụ thể chỉ từ đuôi .WNCRY.</li>
                  <li>Không khẳng định UAC bị bypass khi môi trường lab đã tắt UAC.</li>
                </ul>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
