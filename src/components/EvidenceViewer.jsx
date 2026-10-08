import React, { useState } from 'react';
import {
  FileCheck2,
  FileX2,
  Maximize2,
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Table,
  Image as ImageIcon,
  ExternalLink,
  ChevronRight,
  Info,
  Layers,
  ZoomIn
} from 'lucide-react';

const EVIDENCE_SOURCES = {
  SOURCE_A: {
    id: 'SOURCE_A',
    label: 'Kịch bản A (Kill-Switch Active)',
    badge: 'Safe Termination',
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    summary: 'Phản hồi HTTP 200 kích hoạt nhánh thoát an toàn. Toàn bộ hệ thống an toàn, 0 tệp tin bị mã hóa.',
    screenshots: [
      {
        id: 'a_burp',
        title: 'Burp Item #4: Bắt gói tin Kill-switch HTTP 200',
        desc: 'Burp Suite chặn và phản hồi HTTP 200 OK cho yêu cầu GET tới tên miền kill-switch.',
        file: 'screenshots/A_burp_item4_host_verified_vmware.png'
      },
      {
        id: 'a_launch',
        title: 'Kịch bản A: Thoát sạch mã 0 trong 0.89 giây',
        desc: 'Xác minh tiến trình kết thúc ngay lập tức với mã thoát 0 sau khi nhận HTTP 200.',
        file: 'screenshots/A_run_direct_launch_1143_vmware.png'
      }
    ],
    telemetry: [
      {
        field: 'Process Exit Code',
        value: '0 (STATUS_SUCCESS)',
        source: 'PowerShell $LASTEXITCODE',
        verified: true,
        threatContext: 'Tiến trình gọi ExitProcess(0), không sinh lỗi hệ thống'
      },
      {
        field: 'Execution Duration',
        value: '0.89 giây',
        source: 'Stopwatch / Procmon Timestamp',
        verified: true,
        threatContext: 'Chỉ kịp gửi 1 gói tin TCP/HTTP rồi lập tức kết thúc'
      },
      {
        field: 'Decoy Files Impact',
        value: '0 / 24 files encrypted (0%)',
        source: 'Get-FileHash SHA-256 Checksum',
        verified: true,
        threatContext: 'Tất cả 24 tệp mồi giữ nguyên mã băm SHA-256 ban đầu'
      },
      {
        field: 'SCM Services Installed',
        value: 'None (0 dịch vụ mới)',
        source: 'Get-Service mssecsvc2.0',
        verified: true,
        threatContext: 'Không có dịch vụ ngầm nào được đăng ký vào Registry'
      },
      {
        field: 'Secondary Payload Drop',
        value: 'None (Không thả tệp)',
        source: 'C:\\Windows\\tasksche.exe check',
        verified: true,
        threatContext: 'Kho mã hóa tasksche.exe không được giải nén ra đĩa'
      },
      {
        field: 'Network Communication',
        value: '1 HTTP GET / Port 80 Probe',
        source: 'Burp Suite HTTP Proxy Log',
        verified: true,
        threatContext: 'Kết nối đóng sạch sẽ qua InternetCloseHandle'
      }
    ],
    auditBoundary: {
      proves: [
        'Mẫu mã độc thực thi truy vấn tới tên miền hardcoded dài 41 ký tự thông qua WinINet API.',
        'Khi nhận được mã phản hồi HTTP 200 OK, mã độc lập tức kết thúc phiên chạy với mã thoát 0.',
        'Trong Kịch bản A, 100% tệp tin mồi (Decoys) được bảo toàn nguyên vẹn, không có hiện tượng đổi tên hay ghi đè.',
        'Hệ thống không ghi nhận bất kỳ tiến trình con nào sinh ra hoặc dịch vụ ngầm nào được cài đặt.'
      ],
      unproven: [
        'KHÔNG chứng minh hệ điều hành đã được miễn nhiễm hoặc tệp độc hại đã bị gỡ bỏ khỏi đĩa cứng.',
        'KHÔNG chứng minh hành vi của mã độc nếu tên miền trả về các mã HTTP khác như 301, 302, 404, hoặc 500.',
        'Lưu lượng mạng được proxy qua Burp Suite nội bộ nên không phản ánh độ trễ thực tế trên mạng Internet công cộng.'
      ]
    }
  },
  SOURCE_B: {
    id: 'SOURCE_B',
    label: 'Kịch bản B (Unreachable / Full Cascade)',
    badge: 'Malicious Cascade',
    badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    summary: 'Tên miền không phản hồi dẫn đến chuỗi kích hoạt đầy đủ: đăng ký dịch vụ SYSTEM, thả kho vũ khí và mã hóa toàn bộ dữ liệu.',
    screenshots: [
      {
        id: 'b_tree',
        title: 'Cây tiến trình Procmon mở rộng (15 Nhánh)',
        desc: '15 tiến trình độc hại vận hành đồng thời dưới quyền SYSTEM và User trong suốt đợt tấn công.',
        file: 'screenshots/B_procmon_tree_expanded_vmware.png'
      },
      {
        id: 'b_pid3760',
        title: 'Tiến trình mã hóa cốt lõi (PID 3760 SYSTEM)',
        desc: 'tasksche.exe thực thi độc quyền dưới token NT AUTHORITY\\SYSTEM với hơn 271,536 bản ghi.',
        file: 'screenshots/B_procmon_event_process_identity_vmware.png'
      },
      {
        id: 'b_decoys',
        title: 'Thư mục Decoys bị mã hóa & Đổi hình nền',
        desc: '100% tệp tin mồi bị đổi tên đuôi .WNCRY và hình nền máy tính bị ép đổi sang ảnh tống tiền.',
        file: 'screenshots/B_decoys_encrypted_host_verified_vmware.png'
      },
      {
        id: 'b_gui',
        title: 'Giao diện Wana Decrypt0r 2.0 (Định danh Sinh viên)',
        desc: 'Cửa sổ đồ họa tống tiền hiện hữu với định danh sinh viên được ghim trực tiếp trên thanh tiêu đề.',
        file: 'screenshots/B_ransom_gui_final_identity_vmware.png'
      }
    ],
    telemetry: [
      {
        field: 'Process Tree Topology',
        value: '15 Verified PIDs',
        source: 'Procmon Process Tree',
        verified: true,
        threatContext: 'Phân nhánh từ cả PowerShell (User) và Services.exe (SYSTEM)'
      },
      {
        field: 'Execution Duration',
        value: '~120 giây (Mã hóa liên tục)',
        source: 'Procmon Session Trace',
        verified: true,
        threatContext: 'Quét toàn bộ hệ thống tệp và ghi đè dữ liệu người dùng'
      },
      {
        field: 'Decoy Files Impact',
        value: '24 / 24 files encrypted (100%)',
        source: 'Get-ChildItem *.WNCRY',
        verified: true,
        threatContext: 'Toàn bộ tệp mồi nhận phần mở rộng .WNCRY và header WANACRY!'
      },
      {
        field: 'SCM Persistence Service',
        value: 'mssecsvc2.0 (Start = 2)',
        source: 'HKLM\\SYSTEM\\CCS\\Services',
        verified: true,
        threatContext: 'Tự động khởi động lại dưới quyền SYSTEM mỗi khi reboot máy'
      },
      {
        field: 'Secondary Staging Service',
        value: 'evmdthrukdvwcqn063',
        source: 'Services Management MMC',
        verified: true,
        threatContext: 'Thực thi cmd.exe bọc ngoài tasksche.exe trong C:\\ProgramData'
      },
      {
        field: 'Ransomware Desktop GUI',
        value: '@WanaDecryptor@.exe (PID 1752)',
        source: 'Interactive Desktop Session',
        verified: true,
        threatContext: 'Chuyển ngữ cảnh sang User bachdeptrai để render cửa sổ GUI'
      }
    ],
    auditBoundary: {
      proves: [
        'Khi tên miền killswitch bị chặn/không phản hồi, mã độc lập tức kích hoạt chuỗi lây nhiễm Kịch bản B.',
        'Mã độc lợi dụng SCM (services.exe) để leo thang và duy trì quyền tối cao NT AUTHORITY\\SYSTEM.',
        '100% tệp tin trong thư mục mồi bị mã hóa bằng thuật toán AES/RSA và gắn đuôi .WNCRY.',
        'Mã độc gọi các tiện ích có sẵn (icacls, attrib, cscript) để cấp quyền kiểm soát và che giấu thư mục.',
        'Giao diện Wana Decrypt0r 2.0 hiển thị trên màn hình với đầy đủ đồng hồ đếm ngược và thông tin tống tiền.'
      ],
      unproven: [
        'Khả năng lây lan qua lỗ hổng MS17-010 (EternalBlue) trên cổng SMB 445 CHƯA ĐƯỢC CHỨNG MINH trực tiếp trong lab vì card mạng VM được cách ly an toàn.',
        'Giao thức trao đổi khóa giải mã với máy chủ C2 qua mạng ẩn danh Tor CHƯA ĐƯỢC THỬ NGHIỆM do VM không có kết nối Internet thật.',
        'Khả năng sống sót sau khi khởi động lại máy tính (Reboot Persistence) mới được kiểm chứng ở mức cấu hình Registry/Service, chưa ghi nhật ký sau khi restart OS.'
      ]
    }
  }
};

export function EvidenceViewer() {
  const [activeSourceId, setActiveSourceId] = useState('SOURCE_A');
  const [modalImage, setModalImage] = useState(null);

  const currentSource = EVIDENCE_SOURCES[activeSourceId];

  return (
    <div className="w-full bg-[#0f1015] border border-[#1e2029] rounded-xl p-6 text-[#f4f4f7] font-sans shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#1e2029] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Dual-Source Forensic Evidence
            </span>
            <span className="text-xs font-mono text-zinc-500">Empirical Audit & Verification</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 mt-1 tracking-tight">
            Trình Giám định Bằng chứng Kỹ thuật (Evidence Viewer)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            So sánh đối chiếu bằng chứng thực nghiệm giữa Kịch bản A (Thoát sạch) và Kịch bản B (Mã hóa toàn bộ)
          </p>
        </div>

        {/* Dual-Evidence Tabs */}
        <div className="flex bg-[#14151c] p-1 rounded-lg border border-[#1e2029]">
          <button
            onClick={() => setActiveSourceId('SOURCE_A')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-2 ${
              activeSourceId === 'SOURCE_A'
                ? 'bg-zinc-800 text-emerald-400 shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Nguồn A (Kill-Switch Active)
          </button>
          <button
            onClick={() => setActiveSourceId('SOURCE_B')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-2 ${
              activeSourceId === 'SOURCE_B'
                ? 'bg-zinc-800 text-rose-400 shadow-sm border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Nguồn B (Unreachable Attack)
          </button>
        </div>
      </div>

      {/* Scenario Overview Banner */}
      <div className="my-5 p-4 rounded-lg bg-[#14151c] border border-[#1e2029] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-200">{currentSource.label}</span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${currentSource.badgeClass}`}
            >
              {currentSource.badge}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">{currentSource.summary}</p>
        </div>
        <span className="text-[11px] font-mono text-zinc-500 shrink-0">
          {currentSource.screenshots.length} ảnh giám định &bull; {currentSource.telemetry.length} trường đo lường
        </span>
      </div>

      {/* Screenshot Gallery with Click-to-Expand */}
      <div className="my-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Ảnh chụp Màn hình Giám định Thực nghiệm (Lab Verified Screenshots)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            Nhấp vào ảnh hoặc nút phóng to để xem kích thước gốc
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {currentSource.screenshots.map((s) => (
            <div
              key={s.id}
              className="bg-[#14151c] border border-[#1e2029] rounded-lg overflow-hidden group hover:border-zinc-700 transition flex flex-col justify-between"
            >
              <div
                className="relative aspect-video bg-zinc-950 cursor-pointer overflow-hidden"
                onClick={() => setModalImage(s)}
              >
                <img
                  src={s.file}
                  alt={s.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <div className="bg-zinc-900/90 text-white text-[11px] px-2.5 py-1 rounded border border-zinc-700 flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5" /> Phóng to
                  </div>
                </div>
              </div>

              <div className="p-3 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-200 line-clamp-1">{s.title}</h4>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-snug">{s.desc}</p>
                </div>
                <button
                  onClick={() => setModalImage(s)}
                  className="mt-3 w-full py-1 px-2 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-800 transition flex items-center justify-center gap-1"
                >
                  <Maximize2 className="w-3 h-3" /> Xem ảnh chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Annotated Key Telemetry Fields Table */}
      <div className="my-6 bg-[#14151c] border border-[#1e2029] rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2029] mb-4">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Bảng Dữ liệu Đo đạc Giám định (Annotated Telemetry Fields)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">Host Verified Evidence</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#1e2029] text-zinc-500 font-mono text-[11px]">
                <th className="pb-2.5 pl-2 font-medium">Trường Đo đạc (Telemetry Field)</th>
                <th className="pb-2.5 font-medium">Giá trị Đo được (Value)</th>
                <th className="pb-2.5 font-medium">Nguồn Kiểm chứng (Source)</th>
                <th className="pb-2.5 pr-2 font-medium">Ý nghĩa An ninh (Threat Context)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2029]/60 font-mono text-[11px]">
              {currentSource.telemetry.map((t, idx) => (
                <tr key={idx} className="hover:bg-zinc-900/40 transition">
                  <td className="py-2.5 pl-2 font-semibold text-zinc-200">{t.field}</td>
                  <td className="py-2.5 font-mono text-cyan-300">{t.value}</td>
                  <td className="py-2.5 text-zinc-400">{t.source}</td>
                  <td className="py-2.5 pr-2 text-zinc-300 font-sans text-xs">{t.threatContext}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Explicit Audit Boundary Card (PROVEN vs UNPROVEN) */}
      <div className="my-6 bg-[#14151c] border border-[#1e2029] rounded-lg p-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#1e2029] mb-4">
          <Layers className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Ranh giới Giám định Khoa học (Audit Boundary Card)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card: What this PROVES */}
          <div className="bg-[#0f1015] border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Những gì Bằng chứng CHỨNG MINH ĐƯỢC (Proven Ground Truth)
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-zinc-300 leading-relaxed">
              {currentSource.auditBoundary.proves.map((p, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold shrink-0 mt-0.5">&bull;</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card: What remains UNPROVEN / LIMITATION */}
          <div className="bg-[#0f1015] border border-amber-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Giới hạn Nghiên cứu & CHƯA THỂ CHỨNG MINH (Unproven / Limitations)
              </h4>
            </div>
            <ul className="space-y-2 text-xs text-zinc-300 leading-relaxed">
              {currentSource.auditBoundary.unproven.map((u, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold shrink-0 mt-0.5">&bull;</span>
                  <span className="text-zinc-400">{u}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Full Screenshot Zoom */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="bg-[#14151c] border border-zinc-700 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3 border-b border-[#1e2029] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">{modalImage.title}</h3>
                <p className="text-[11px] text-zinc-400">{modalImage.desc}</p>
              </div>
              <button
                onClick={() => setModalImage(null)}
                className="p-1 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 bg-zinc-950 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={modalImage.file}
                alt={modalImage.title}
                className="max-w-full max-h-[70vh] object-contain rounded border border-zinc-800"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EvidenceViewer;
