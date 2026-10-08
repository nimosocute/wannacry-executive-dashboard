import React, { useState, useEffect } from 'react';
import {
  Layers,
  Activity,
  GitBranch,
  Terminal,
  Shield,
  Image as ImageIcon,
  FileText,
  Search,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  ArrowRight,
  Info,
  Eye,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Lock,
  Network,
  X,
  FileCode,
  CornerDownRight,
  Sparkles
} from 'lucide-react';

import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import KillSwitchSandbox from './components/KillSwitchSandbox.jsx';
import CommandExplainer from './components/CommandExplainer.jsx';
import ProcessLineageTree from './components/ProcessLineageTree.jsx';
import EvidenceViewer from './components/EvidenceViewer.jsx';

import behaviorsData from './data/behaviors.json';
import glossaryData from './data/glossary.json';
import processesData from './data/processes.json';

export default function App() {
  const [activeSection, setActiveSection] = useState('overview');
  const [depthLevel, setDepthLevel] = useState('detailed'); // '30s', 'detailed', 'audit'
  const [expandedBehavior, setExpandedBehavior] = useState('behavior-01');
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const [glossarySearch, setGlossarySearch] = useState('');
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState('localsystem');
  const [copiedText, setCopiedText] = useState(null);

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlossaryOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && glossaryOpen) {
        setGlossaryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [glossaryOpen]);

  useEffect(() => {
    const sections = ['overview', 'sandbox', 'behaviors', 'commands', 'process-tree', 'evidence-gallery', 'recommendations', 'iocs'];
    const handleScroll = () => {
      const scrollY = window.scrollY + 140;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredGlossary = Object.entries(glossaryData).filter(([key, item]) => {
    if (!glossarySearch.trim()) return true;
    const q = glossarySearch.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.cat.toLowerCase().includes(q) ||
      item.def.toLowerCase().includes(q) ||
      item.mech.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#090a0f] text-[#f4f4f7] font-sans selection:bg-blue-500/20 selection:text-white">
      <Header onOpenGlossary={() => setGlossaryOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
        <Sidebar activeSection={activeSection} />

        <main className="flex-1 py-8 min-w-0 max-w-4xl space-y-16">
          <section id="overview" className="scroll-mt-20 space-y-8">
            <div className="space-y-3 pb-6 border-b border-[#1e2029]">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-zinc-400">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">LAB LIVE IAM302</span>
                <span>&bull;</span>
                <span>Mẫu: WannaCry (WanaCrypt0r 2.0)</span>
                <span>&bull;</span>
                <span className="text-zinc-500">SHA-256: 24d004a104d4...80b1022c</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100">
                Phân Tích Động Học Nhị Phân & Hành Vi Mã Độc WannaCry
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">
                Báo cáo kỹ thuật tự giải thích (Self-Explanatory Technical Report) theo mô hình độ sâu tăng dần (Progressive Depth). Bằng chứng thực nghiệm được phân tích tại chỗ bên cạnh từng nhận định, liên kết trực tiếp giữa quan sát mạng, dịch vụ Windows, cây tiến trình và cơ chế mã hóa.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-[#0f1015] border border-[#1e2029] space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Mức độ chi tiết (Progressive Depth):</span>
                </div>
                <div className="inline-flex rounded-md p-1 bg-zinc-900 border border-zinc-800 text-xs">
                  <button
                    onClick={() => setDepthLevel('30s')}
                    className={`px-3 py-1 rounded transition ${depthLevel === '30s' ? 'bg-zinc-800 text-zinc-100 font-medium shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    30 Giây (Executive)
                  </button>
                  <button
                    onClick={() => setDepthLevel('detailed')}
                    className={`px-3 py-1 rounded transition ${depthLevel === 'detailed' ? 'bg-zinc-800 text-zinc-100 font-medium shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    Giải Thích Cơ Chế
                  </button>
                  <button
                    onClick={() => setDepthLevel('audit')}
                    className={`px-3 py-1 rounded transition ${depthLevel === 'audit' ? 'bg-zinc-800 text-zinc-100 font-medium shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    Kiểm Toán Chuyên Sâu
                  </button>
                </div>
              </div>

              {depthLevel === '30s' && (
                <div className="p-3.5 rounded bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 space-y-2 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-blue-400 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tóm tắt 30 giây: Quyết định rẽ nhánh nhị phân</span>
                  </div>
                  <p>
                    Mã độc WannaCry sở hữu cơ chế rẽ nhánh nhị phân phụ thuộc hoàn toàn vào kết nối mạng tới một tên miền đặc biệt. Khi nhận được phản hồi HTTP 200 (Kịch bản A), tiến trình lập tức tự giải phóng và kết thúc an toàn trong <strong>0.89 giây</strong> mà không gây hại. Ngược lại, khi mạng không phản hồi (Kịch bản B), mã độc đăng ký dịch vụ ngầm <code className="text-zinc-200 font-mono">mssecsvc2.0</code> dưới quyền tối cao <code className="text-zinc-200 font-mono">SYSTEM</code>, thả payload <code className="text-zinc-200 font-mono">tasksche.exe</code>, cấp quyền <code className="text-zinc-200 font-mono">icacls Everyone:F</code> và tiến hành mã hóa hàng loạt tệp tin thành đuôi <code className="text-zinc-200 font-mono">.WNCRY</code>.
                  </p>
                </div>
              )}

              {depthLevel === 'detailed' && (
                <div className="p-3.5 rounded bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 space-y-2 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <Info className="w-3.5 h-3.5" />
                    <span>Giải thích cơ chế hệ điều hành & Logic tấn công</span>
                  </div>
                  <p>
                    Khác với giả định phổ biến rằng kill-switch là một lỗ hổng, bản chất đây là một cổng kiểm tra có chủ đích (thường dùng chống sandbox phân tích tự động). Khi kiểm tra thất bại, mã độc tận dụng cơ chế Service Control Manager (SCM PPID 644) để nâng quyền thực thi lên LocalSystem, vượt qua hàng rào UAC. Sau đó, nó áp dụng kỹ thuật Living-off-the-Land (LotL) thông qua các lệnh Win32 hợp pháp như <code className="text-zinc-200 font-mono">icacls</code> và <code className="text-zinc-200 font-mono">attrib</code> để chiếm toàn quyền truy cập trước khi nạp giao diện tống tiền.
                  </p>
                </div>
              )}

              {depthLevel === 'audit' && (
                <div className="p-3.5 rounded bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-300 space-y-2 leading-relaxed">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Dữ liệu thực nghiệm & Ranh giới kiểm toán (Audit Log)</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-1 font-mono text-[11px]">
                    <div className="p-2 rounded bg-black/40 border border-zinc-800/80">
                      <div className="text-zinc-400">Procmon Events</div>
                      <div className="text-zinc-100 font-semibold text-sm">271,958</div>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-zinc-800/80">
                      <div className="text-zinc-400">Verified PIDs</div>
                      <div className="text-zinc-100 font-semibold text-sm">15</div>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-zinc-800/80">
                      <div className="text-zinc-400">Decoy Overwrites</div>
                      <div className="text-rose-400 font-semibold text-sm">3 / 3 (100%)</div>
                    </div>
                    <div className="p-2 rounded bg-black/40 border border-zinc-800/80">
                      <div className="text-zinc-100 font-semibold text-sm">WANACRY!</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-zinc-400 pt-1">
                    *Giới hạn kiểm toán: Dữ liệu mạng Procmon ghi nhận TCP loopback 127.0.0.1:80. Môi trường lab ngắt card mạng vật lý nên không ghi nhận lưu lượng quét SMB TCP 445 ra bên ngoài (đây là giới hạn cách ly an toàn, không phải thiếu hụt tính năng của mẫu).
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Phân cấp nhận thức: 3 Tầng Tri thức trong Báo cáo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-[#0f1015] border border-blue-900/30 space-y-2">
                  <div className="flex items-center gap-1.5 font-medium text-blue-400">
                    <Eye className="w-3.5 h-3.5" />
                    <span>1. Quan sát thực tế</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    Dữ liệu vật lý đo lường trực tiếp: Gói tin HTTP 200 (155 bytes), mã thoát Exit 0, 15 PIDs trong Procmon, 3 file mồi decoy mang 8 byte đầu <code className="text-zinc-300 font-mono">WANACRY!</code>.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0f1015] border border-amber-900/30 space-y-2">
                  <div className="flex items-center gap-1.5 font-medium text-amber-400">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>2. Suy luận kỹ thuật</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    Nhận định logic từ cơ chế: Cờ <code className="text-zinc-300 font-mono">-m security</code> chỉ định chế độ worker ngầm; đăng ký dịch vụ để chiếm quyền SYSTEM; lệnh icacls để tránh lỗi phân quyền.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0f1015] border border-purple-900/30 space-y-2">
                  <div className="flex items-center gap-1.5 font-medium text-purple-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>3. Kiến thức tham khảo</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed text-[11px]">
                    Tri thức ngành bảo mật: Lỗ hổng MS17-010 EternalBlue, thuật toán kết hợp RSA-2048/AES-128, sinkhole tên miền của Marcus Hutchins vào ngày 12/05/2017.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                Đối chiếu Thực nghiệm: Kịch bản A vs Kịch bản B
              </h3>
              <div className="overflow-x-auto rounded-lg border border-[#1e2029]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-zinc-900/80 text-zinc-300 font-mono border-b border-[#1e2029]">
                      <th className="p-3 font-medium">Chỉ số So sánh</th>
                      <th className="p-3 font-medium text-emerald-400">Kịch bản A (Kill-Switch Active)</th>
                      <th className="p-3 font-medium text-rose-400">Kịch bản B (Kill-Switch Unreachable)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e2029] bg-[#0f1015] text-zinc-400 font-mono text-[11px]">
                    <tr>
                      <td className="p-3 font-sans text-zinc-300">Phản hồi HTTP Tên miền</td>
                      <td className="p-3 text-emerald-400">HTTP 200 OK (Sinkhole/Mock)</td>
                      <td className="p-3 text-rose-400">Kết nối Thất bại (TCP RST / Reconnect)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans text-zinc-300">Hành vi Thực thi</td>
                      <td className="p-3">Tự kết thúc sạch (Exit Process)</td>
                      <td className="p-3">Khai sinh chuỗi 15 tiến trình độc hại</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans text-zinc-300">Thời gian sống mẫu gốc</td>
                      <td className="p-3">0.8922 giây (PID 6520)</td>
                      <td className="p-3">Chạy liên tục, chuyển giao cho mssecsvc2.0</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans text-zinc-300">Dịch vụ Windows được tạo</td>
                      <td className="p-3 text-emerald-400">0 dịch vụ</td>
                      <td className="p-3 text-rose-400">2 dịch vụ ngầm (mssecsvc2.0, evmdthrukdvwcqn063)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans text-zinc-300">Tệp mồi Decoy (File Decoys)</td>
                      <td className="p-3 text-emerald-400">Nguyên vẹn 100% (Khớp SHA-256 ban đầu)</td>
                      <td className="p-3 text-rose-400">Bị mã hóa 100% (.WNCRY + WANACRY! header)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-sans text-zinc-300">Giao diện Đòi tiền chuộc</td>
                      <td className="p-3 text-emerald-400">Không xuất hiện</td>
                      <td className="p-3 text-rose-400">Xuất hiện @WanaDecryptor@.exe trên Desktop</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section id="sandbox" className="scroll-mt-20 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Mô phỏng Trực quan Tương tác</span>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span>02. Live Demo: Trình Giả Lập Công Tắc Hủy (Kill-Switch Sandbox)</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Thay đổi điều kiện mạng (HTTP 200, Connection Refused, Timeout, NXDOMAIN) và độ trễ để quan sát luồng quyết định rẽ nhánh logic và sự biến thiên trạng thái của hệ điều hành.
              </p>
            </div>

            <KillSwitchSandbox />
          </section>

          <section id="behaviors" className="scroll-mt-20 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Phân tích Chi tiết Từng Giai đoạn</span>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-purple-400" />
                <span>03. 6 Chuỗi Hành Vi Nhân - Quả & Khung Phân Tích 6 Bước</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Mỗi hành vi được giải phẫu theo cấu trúc chuẩn: Quan sát &rarr; Giải nghĩa &rarr; Cơ chế HĐH &rarr; Mối liên hệ &rarr; Bằng chứng kiểm chứng &rarr; Ranh giới kiểm toán.
              </p>
            </div>

            <div className="space-y-4">
              {behaviorsData.map((b) => {
                const isExpanded = expandedBehavior === b.id;
                return (
                  <div
                    key={b.id}
                    className="rounded-lg border border-[#1e2029] bg-[#0f1015] overflow-hidden transition-all duration-200"
                  >
                    <button
                      onClick={() => setExpandedBehavior(isExpanded ? null : b.id)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-zinc-900/50 transition gap-4"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 font-mono text-xs flex items-center justify-center font-semibold shrink-0">
                          {b.num}
                        </span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-zinc-500">{b.cat}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {b.badge}
                            </span>
                          </div>
                          <h4 className="text-sm font-semibold text-zinc-100 truncate mt-0.5">
                            {b.title}
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono text-zinc-500 hidden sm:inline">
                          {isExpanded ? 'Thu gọn' : 'Xem 6 bước'}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 sm:p-6 border-t border-[#1e2029] bg-[#090a0f]/60 space-y-6 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3.5 rounded bg-[#0f1015] border border-zinc-800/80 space-y-1.5">
                            <div className="font-mono text-zinc-400 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                              <span className="text-blue-400 font-bold">BƯỚC 1</span> &bull; Quan sát Khái niệm
                            </div>
                            <p className="text-zinc-300 leading-relaxed text-xs">
                              {b.step1_concept}
                            </p>
                          </div>

                          <div className="p-3.5 rounded bg-[#0f1015] border border-zinc-800/80 space-y-1.5">
                            <div className="font-mono text-zinc-400 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                              <span className="text-purple-400 font-bold">BƯỚC 2</span> &bull; Lệnh & Tham số Tác động
                            </div>
                            <p className="text-zinc-300 leading-relaxed text-xs font-mono bg-black/40 p-2 rounded border border-zinc-800">
                              {b.step2_params}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3.5 rounded bg-[#0f1015] border border-zinc-800/80 space-y-1.5">
                            <div className="font-mono text-zinc-400 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                              <span className="text-amber-400 font-bold">BƯỚC 3</span> &bull; Cơ chế Xử lý của Hệ Điều Hành
                            </div>
                            <p className="text-zinc-300 leading-relaxed text-xs">
                              {b.step3_os}
                            </p>
                          </div>

                          <div className="p-3.5 rounded bg-[#0f1015] border border-zinc-800/80 space-y-1.5">
                            <div className="font-mono text-zinc-400 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                              <span className="text-emerald-400 font-bold">BƯỚC 4</span> &bull; Mối quan hệ Nhân - Quả
                            </div>
                            <p className="text-zinc-300 leading-relaxed text-xs">
                              {b.step4_cause}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="font-mono text-zinc-400 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <span className="text-blue-400 font-bold">BƯỚC 5</span> &bull; Bằng chứng Thực nghiệm Tại Chỗ (Contextual Dual-Evidence)
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {b.evidence_a && (
                              <div className="p-3.5 rounded bg-[#0f1015] border border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className="text-zinc-300 font-semibold">{b.evidence_a.title}</span>
                                  <span className="text-[10px] text-zinc-500 uppercase">{b.evidence_a.tool}</span>
                                </div>
                                <div className="rounded overflow-hidden border border-zinc-800 bg-black/60 relative group">
                                  <img
                                    src={b.evidence_a.file}
                                    alt={b.evidence_a.title}
                                    className="w-full h-40 object-cover object-top opacity-90 group-hover:opacity-100 transition"
                                  />
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-normal">{b.evidence_a.caption}</p>
                                {b.evidence_a.breakdown && (
                                  <div className="pt-2 border-t border-zinc-800/80 space-y-1 font-mono text-[10px]">
                                    {b.evidence_a.breakdown.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-zinc-400">
                                        <span>{item.field}:</span>
                                        <span className="text-zinc-200">{item.val}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {b.evidence_b && (
                              <div className="p-3.5 rounded bg-[#0f1015] border border-zinc-800 space-y-2">
                                <div className="flex items-center justify-between text-xs font-mono">
                                  <span className="text-zinc-300 font-semibold">{b.evidence_b.title}</span>
                                  <span className="text-[10px] text-zinc-500 uppercase">{b.evidence_b.tool}</span>
                                </div>
                                <div className="rounded overflow-hidden border border-zinc-800 bg-black/60 relative group">
                                  <img
                                    src={b.evidence_b.file}
                                    alt={b.evidence_b.title}
                                    className="w-full h-40 object-cover object-top opacity-90 group-hover:opacity-100 transition"
                                  />
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-normal">{b.evidence_b.caption}</p>
                                {b.evidence_b.breakdown && (
                                  <div className="pt-2 border-t border-zinc-800/80 space-y-1 font-mono text-[10px]">
                                    {b.evidence_b.breakdown.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-zinc-400">
                                        <span>{item.field}:</span>
                                        <span className="text-zinc-200">{item.val}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-4 rounded bg-zinc-900/60 border border-zinc-800 space-y-3 pt-3">
                          <div className="font-mono text-zinc-400 font-medium text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <span className="text-amber-400 font-bold">BƯỚC 6</span> &bull; Ranh Giới Kiểm Toán Khoa Học
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> ĐIỀU ĐÃ CHỨNG MINH ĐƯỢC
                              </span>
                              <p className="text-[11px] text-zinc-300 leading-relaxed">
                                {b.boundary_proven}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> GIỚI HẠN & ĐIỀU CHƯA CHỨNG MINH
                              </span>
                              <p className="text-[11px] text-zinc-400 leading-relaxed">
                                {b.boundary_limits}
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section id="commands" className="scroll-mt-20 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Mô hình Living-off-the-Land (LotL)</span>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <span>04. Trình Giải Thích Từng Token Cờ Lệnh & Cơ Chế Thực Thi</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Nhấp chuột vào từng tham số trong các lệnh hệ thống để xem cú pháp Win32 API, mục đích của kẻ tấn công và bằng chứng pháp y tương ứng.
              </p>
            </div>

            <CommandExplainer />
          </section>

          <section id="process-tree" className="scroll-mt-20 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Cây Tiến trình Thực nghiệm</span>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span>05. Cây Tiến Trình (15 Verified PIDs & Phân cấp Đặc quyền)</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Toàn bộ 15 tiến trình độc hại đã được đối soát qua 271,958 bản ghi Procmon. Phân biệt rõ quyền người dùng bình thường vs NT AUTHORITY\SYSTEM.
              </p>
            </div>

            <ProcessLineageTree />
          </section>

          <section id="evidence-gallery" className="scroll-mt-20 space-y-4">
            <div className="space-y-1">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Kho Lưu Trữ Bằng Chứng Đa Công Cụ</span>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                <span>06. Kho Bằng Chứng Đa Công Cụ (Contextual Evidence Viewer)</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                So sánh chéo ảnh chụp thực tế giữa Burp Suite, Process Hacker, Procmon và màn hình máy ảo VMware. Bấm vào ảnh để phóng to chi tiết.
              </p>
            </div>

            <EvidenceViewer />
          </section>

          <section id="recommendations" className="scroll-mt-20 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Chiến lược Phòng thủ Chiều sâu</span>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>07. Khuyến Nghị Kỹ Thuật & Giải Pháp Khắc Phục</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Đúc kết từ hành vi động học của mẫu phân tích, xây dựng 3 lớp phòng ngự toàn diện từ máy trạm đến biên mạng.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#0f1015] border border-[#1e2029] space-y-3">
                <div className="flex items-center gap-2 font-semibold text-zinc-100">
                  <span className="w-5 h-5 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center font-mono text-xs">1</span>
                  <span>Vá lỗ hổng & Tắt SMBv1</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Ngăn chặn triệt để con đường lây nhiễm ngang của WannaCry qua việc vô hiệu hóa giao thức cổ lỗ SMBv1 trên toàn mạng nội bộ và áp dụng ngay bản vá Microsoft Security Bulletin MS17-010 (KB4012598).
                </p>
                <div className="p-2 rounded bg-black/40 font-mono text-[11px] text-zinc-300 border border-zinc-800">
                  Disable-WindowsOptionalFeature -Online -FeatureName SMB1Protocol
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0f1015] border border-[#1e2029] space-y-3">
                <div className="flex items-center gap-2 font-semibold text-zinc-100">
                  <span className="w-5 h-5 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono text-xs">2</span>
                  <span>Cảnh báo Dịch vụ Ngầm SCM</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Theo dõi sự kiện Windows Event ID 7045 (Dịch vụ mới được cài đặt). Bật cảnh báo tức thì khi phát hiện dịch vụ có Binary Path trỏ ngoài System32 hoặc chứa cờ tham số dị thường như <code className="text-zinc-200 font-mono">-m security</code>.
                </p>
                <div className="p-2 rounded bg-black/40 font-mono text-[11px] text-zinc-300 border border-zinc-800">
                  CommandLine contains "tasksche.exe /i" OR "-m security"
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0f1015] border border-[#1e2029] space-y-3">
                <div className="flex items-center gap-2 font-semibold text-zinc-100">
                  <span className="w-5 h-5 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center font-mono text-xs">3</span>
                  <span>Cảnh báo Lạm dụng LotL (icacls)</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Giám sát tiến trình con được sinh ra từ thư mục tạm hoặc ProgramData. Khóa quyền thực thi và tạo quy tắc EDR phát hiện chuỗi lệnh <code className="text-zinc-200 font-mono">icacls . /grant Everyone:F</code> và <code className="text-zinc-200 font-mono">attrib +h .</code>.
                </p>
                <div className="p-2 rounded bg-black/40 font-mono text-[11px] text-zinc-300 border border-zinc-800">
                  ProcessName == "icacls.exe" AND CommandLine contains "Everyone:F"
                </div>
              </div>
            </div>
          </section>

          <section id="iocs" className="scroll-mt-20 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Chỉ số Nhận diện Nguy cơ</span>
              <h2 className="text-xl font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                <span>08. Chỉ Số IOCs & Ma Trận MITRE ATT&CK Đã Kiểm Chứng</span>
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Bảng thông số định danh duy nhất (IOCs) phục vụ việc điều tra, quét IOC trong mạng và mapping kỹ thuật MITRE.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-lg bg-[#0f1015] border border-[#1e2029] space-y-2">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-sans font-medium">Mã băm Tệp Tin (SHA-256)</span>
                <div className="space-y-2">
                  <div>
                    <div className="text-zinc-400 text-[11px]">Mẫu thực thi gốc:</div>
                    <div className="p-1.5 rounded bg-black/40 border border-zinc-800 text-[10px] text-zinc-200 break-all select-all">
                      24d004a104d4d54034dbcffc2a4b19a11f39008a575aa614ea04703480b1022c
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-[11px]">Decoy Encrypted (.WNCRY):</div>
                    <div className="p-1.5 rounded bg-black/40 border border-zinc-800 text-[10px] text-rose-300 break-all select-all">
                      918F8918E203A7CA3124092C26E0C6F33F920FBEB7A9C67DAFC3705CA6D0D341
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-[#0f1015] border border-[#1e2029] space-y-2">
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider block font-sans font-medium">Dấu hiệu Tên miền & Đường dẫn</span>
                <div className="space-y-2">
                  <div>
                    <div className="text-zinc-400 text-[11px]">Kill-Switch URL:</div>
                    <div className="p-1.5 rounded bg-black/40 border border-zinc-800 text-[10px] text-zinc-200 break-all select-all">
                      http://www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com
                    </div>
                  </div>
                  <div>
                    <div className="text-zinc-400 text-[11px]">Thư mục hoạt động:</div>
                    <div className="p-1.5 rounded bg-black/40 border border-zinc-800 text-[10px] text-zinc-200 break-all select-all">
                      C:\ProgramData\evmdthrukdvwcqn063\
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-[#1e2029]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-zinc-900/80 text-zinc-300 font-mono border-b border-[#1e2029]">
                    <th className="p-3 font-medium">Tactic</th>
                    <th className="p-3 font-medium">Technique ID</th>
                    <th className="p-3 font-medium">Tên Kỹ thuật</th>
                    <th className="p-3 font-medium">Bằng chứng Xác thực trong Lab</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1e2029] bg-[#0f1015] text-zinc-400 font-mono text-[11px]">
                  <tr>
                    <td className="p-3 text-zinc-300">Execution</td>
                    <td className="p-3 text-blue-400">T1059.003</td>
                    <td className="p-3 font-sans text-zinc-200">Windows Command Shell</td>
                    <td className="p-3">cmd.exe /c "icacls . /grant Everyone:F..." (PID 1152, 3888)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">Persistence</td>
                    <td className="p-3 text-blue-400">T1543.003</td>
                    <td className="p-3 font-sans text-zinc-200">Windows Service Creation</td>
                    <td className="p-3">mssecsvc2.0 đăng ký SCM (Event ID 7045)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">Defense Evasion</td>
                    <td className="p-3 text-blue-400">T1222.001</td>
                    <td className="p-3 font-sans text-zinc-200">File Permission Modification</td>
                    <td className="p-3">icacls cấp quyền Everyone:F /T /C /Q (PID 2064)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">Defense Evasion</td>
                    <td className="p-3 text-blue-400">T1027</td>
                    <td className="p-3 font-sans text-zinc-200">Obfuscated Files or Info</td>
                    <td className="p-3">attrib +h . gán cờ ẩn cho thư mục ProgramData (PID 5808)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">Impact</td>
                    <td className="p-3 text-rose-400">T1486</td>
                    <td className="p-3 font-sans text-zinc-200">Data Encrypted for Impact</td>
                    <td className="p-3">3 decoy files đổi thành .WNCRY, header WANACRY!</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">Command & Control</td>
                    <td className="p-3 text-blue-400">T1071.001</td>
                    <td className="p-3 font-sans text-zinc-200">Web Protocols (HTTP)</td>
                    <td className="p-3">WinINet GET port 80 (Burp Item #4 HTTP 200 OK)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <footer className="pt-8 border-t border-[#1e2029] text-xs font-mono text-zinc-500 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span>IAM302 Malware Analysis Lab Report &bull; FPT University FA26</span>
            </div>
            <div>
              <span>Deployed on Vercel &bull; React + Vite + Tailwind CSS</span>
            </div>
          </footer>

        </main>
      </div>

      {glossaryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-[#0f1015] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="p-4 border-b border-[#1e2029] flex items-center justify-between gap-3 bg-zinc-900/50">
              <div className="flex items-center gap-2 flex-1">
                <Search className="w-4 h-4 text-zinc-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Tra cứu cơ chế HĐH, lệnh Win32, tham số (VD: SYSTEM, icacls, killswitch)..."
                  value={glossarySearch}
                  onChange={(e) => setGlossarySearch(e.target.value)}
                  className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2">
                <kbd className="text-[10px] font-mono bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 border border-zinc-700 hidden sm:inline">ESC để đóng</kbd>
                <button
                  onClick={() => setGlossaryOpen(false)}
                  className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-[#1e2029]">
              <div className="w-full sm:w-64 overflow-y-auto custom-scrollbar p-2 space-y-1 shrink-0 max-h-48 sm:max-h-none">
                {filteredGlossary.map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => setActiveGlossaryTerm(key)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition flex flex-col gap-0.5 ${
                      activeGlossaryTerm === key
                        ? 'bg-zinc-800 text-zinc-100 font-medium'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                    }`}
                  >
                    <span className="truncate">{item.title}</span>
                    <span className="text-[10px] font-mono text-zinc-500 truncate">{item.cat}</span>
                  </button>
                ))}
                {filteredGlossary.length === 0 && (
                  <div className="p-4 text-center text-xs text-zinc-500 font-mono">
                    Không tìm thấy thuật ngữ phù hợp.
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4 text-xs">
                {glossaryData[activeGlossaryTerm] && (
                  <>
                    <div className="space-y-1 border-b border-[#1e2029] pb-3">
                      <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block">
                        {glossaryData[activeGlossaryTerm].cat}
                      </span>
                      <h3 className="text-base font-semibold text-zinc-100">
                        {glossaryData[activeGlossaryTerm].title}
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                          Định Nghĩa
                        </span>
                        <p className="text-zinc-300 leading-relaxed">
                          {glossaryData[activeGlossaryTerm].def}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                          Cơ Chế Hệ Điều Hành Xử Lý
                        </span>
                        <p className="text-zinc-300 leading-relaxed bg-black/30 p-3 rounded-lg border border-zinc-800">
                          {glossaryData[activeGlossaryTerm].mech}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider block mb-1">
                          Mục Đích Kẻ Tấn Công Lợi Dụng (Abuse)
                        </span>
                        <p className="text-zinc-300 leading-relaxed">
                          {glossaryData[activeGlossaryTerm].abuse}
                        </p>
                      </div>

                      <div>
                        <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                          Khuyến Nghị Phòng Thủ & Nhận Diện
                        </span>
                        <p className="text-zinc-300 leading-relaxed">
                          {glossaryData[activeGlossaryTerm].defense}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
