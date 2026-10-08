import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Radio,
  Clock,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Server,
  Layers,
  ArrowRight,
  HelpCircle,
  FileCode,
  Terminal,
  Activity
} from 'lucide-react';

const DOMAIN_STATUSES = [
  {
    id: 'HTTP_200',
    label: 'HTTP 200 OK',
    sub: 'Sinkhole / Web server trả về mã thành công',
    icon: CheckCircle2,
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    branch: 'A'
  },
  {
    id: 'CONN_REFUSED',
    label: 'Connection Refused (TCP RST)',
    sub: 'Cổng 80 đóng, máy chủ từ chối kết nối',
    icon: XCircle,
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    branch: 'B'
  },
  {
    id: 'TIMEOUT',
    label: 'Timeout 500ms',
    sub: 'Không có phản hồi gói tin SYN (Gói tin bị drop)',
    icon: Clock,
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    branch: 'B'
  },
  {
    id: 'NXDOMAIN',
    label: 'DNS NXDOMAIN',
    sub: 'Tên miền không tồn tại trong hệ thống DNS',
    icon: AlertTriangle,
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    branch: 'B'
  }
];

export function KillSwitchSandbox() {
  const [selectedStatus, setSelectedStatus] = useState('HTTP_200');
  const [latency, setLatency] = useState(50);
  const [targetDomain, setTargetDomain] = useState('www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com');
  const [activeStep, setActiveStep] = useState(0); // 0: Idle, 1: DNS, 2: TCP, 3: HTTP, 4: Eval, 5: Branch
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState('why_check'); // why_check | not_os_vuln | not_uninstalled

  const activeStatusObj = useMemo(
    () => DOMAIN_STATUSES.find((s) => s.id === selectedStatus) || DOMAIN_STATUSES[0],
    [selectedStatus]
  );

  const isBranchA = activeStatusObj.branch === 'A';

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setActiveStep(1);

    const stepInterval = Math.max(400, latency * 8);

    setTimeout(() => {
      setActiveStep(2);
      setTimeout(() => {
        setActiveStep(3);
        setTimeout(() => {
          setActiveStep(4);
          setTimeout(() => {
            setActiveStep(5);
            setIsSimulating(false);
          }, stepInterval);
        }, stepInterval);
      }, stepInterval);
    }, stepInterval);
  };

  const resetSimulation = () => {
    setActiveStep(0);
    setIsSimulating(false);
  };

  return (
    <div className="w-full bg-[#0f1015] border border-[#1e2029] rounded-xl p-6 text-[#f4f4f7] font-sans shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#1e2029] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              Interactive Lab Sandbox
            </span>
            <span className="text-xs font-mono text-zinc-500">WinINet Probe Engine</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 mt-1 tracking-tight">
            WannaCry Kill-Switch Simulation
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Mô phỏng cơ chế phân nhánh nhị phân qua lệnh gọi WinINet InternetOpenA / InternetOpenUrlA
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition ${
              isSimulating
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm hover:shadow'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            {isSimulating ? 'Đang thực thi...' : 'Chạy thử nghiệm'}
          </button>
          <button
            onClick={resetSimulation}
            disabled={isSimulating}
            className="px-3 py-2 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-[#1e2029] transition flex items-center gap-1.5"
            title="Reset về ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Làm mới
          </button>
        </div>
      </div>

      {/* Control Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 my-6">
        {/* Domain status selector */}
        <div className="lg:col-span-2 bg-[#14151c] border border-[#1e2029] rounded-lg p-4">
          <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-2.5">
            <Radio className="w-3.5 h-3.5 text-blue-400" />
            Phản hồi từ Target Domain (Sinkhole / Network Status)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {DOMAIN_STATUSES.map((status) => {
              const Icon = status.icon;
              const isSelected = selectedStatus === status.id;
              return (
                <button
                  key={status.id}
                  onClick={() => {
                    setSelectedStatus(status.id);
                    if (activeStep === 5) setActiveStep(0);
                  }}
                  className={`text-left p-3 rounded-md border transition flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-zinc-900 border-blue-500/60 ring-1 ring-blue-500/20'
                      : 'bg-[#0f1015] border-[#1e2029] hover:border-zinc-700/80 hover:bg-zinc-900/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${status.badgeColor.split(' ')[0]}`} />
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-zinc-200 flex items-center gap-1.5">
                      {status.label}
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                          status.branch === 'A'
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                        }`}
                      >
                        Nhánh {status.branch}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate mt-0.5">{status.sub}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Network & Domain Inputs */}
        <div className="bg-[#14151c] border border-[#1e2029] rounded-lg p-4 flex flex-col justify-between">
          <div>
            <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5 mb-2">
              <Globe className="w-3.5 h-3.5 text-zinc-400" />
              Tên miền Kill-Switch hardcoded
            </label>
            <input
              type="text"
              value={targetDomain}
              onChange={(e) => setTargetDomain(e.target.value)}
              className="w-full bg-[#0f1015] border border-[#1e2029] rounded px-2.5 py-1.5 text-[11px] font-mono text-zinc-300 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-zinc-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" /> Độ trễ mạng (Latency)
              </span>
              <span className="font-mono text-zinc-200 text-xs">{latency} ms</span>
            </div>
            <input
              type="range"
              min="10"
              max="500"
              step="10"
              value={latency}
              onChange={(e) => setLatency(Number(e.target.value))}
              className="w-full accent-blue-500 bg-zinc-800 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-1">
              <span>10ms (LAN)</span>
              <span>250ms</span>
              <span>500ms (Timeout boundary)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual State Transition Diagram */}
      <div className="bg-[#14151c] border border-[#1e2029] rounded-lg p-5 my-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
              Sơ đồ chuyển trạng thái thực thi (Execution State Transition)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            {activeStep === 0 && 'Trạng thái: Sẵn sàng (Idle)'}
            {activeStep === 1 && 'Trạng thái: 1/4 Phân giải tên miền (DNS Query)'}
            {activeStep === 2 && 'Trạng thái: 2/4 Bắt tay 3 bước TCP Handshake'}
            {activeStep === 3 && 'Trạng thái: 3/4 Gửi HTTP GET Probe'}
            {activeStep === 4 && 'Trạng thái: 4/4 Đánh giá mã phản hồi (Evaluation)'}
            {activeStep === 5 && (isBranchA ? 'Hoàn tất: Nhánh A (Thoát an toàn)' : 'Hoàn tất: Nhánh B (Kích hoạt phá hủy)')}
          </span>
        </div>

        {/* Transition Stages Pipeline */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          {/* Stage 1: DNS */}
          <div
            className={`p-3 rounded border transition ${
              activeStep >= 1
                ? 'bg-zinc-900 border-blue-500/50 shadow-sm'
                : 'bg-[#0f1015] border-[#1e2029] opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
              <span>01. DNS Lookup</span>
              {activeStep > 1 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : activeStep === 1 ? (
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              ) : null}
            </div>
            <div className="text-xs font-medium text-zinc-200">Phân giải Host</div>
            <div className="text-[10px] font-mono text-zinc-500 mt-1">
              {selectedStatus === 'NXDOMAIN' && activeStep >= 1 ? 'Lỗi: Host Not Found (11001)' : 'A-Record → Sinkhole IP'}
            </div>
          </div>

          {/* Stage 2: TCP Handshake */}
          <div
            className={`p-3 rounded border transition ${
              activeStep >= 2
                ? 'bg-zinc-900 border-blue-500/50 shadow-sm'
                : 'bg-[#0f1015] border-[#1e2029] opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
              <span>02. TCP Connect</span>
              {activeStep > 2 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : activeStep === 2 ? (
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              ) : null}
            </div>
            <div className="text-xs font-medium text-zinc-200">Port 80 Handshake</div>
            <div className="text-[10px] font-mono text-zinc-500 mt-1">
              {selectedStatus === 'CONN_REFUSED' && activeStep >= 2
                ? 'TCP RST (WSAECONNREFUSED)'
                : selectedStatus === 'TIMEOUT' && activeStep >= 2
                ? 'SYN Drop / Timeout'
                : 'SYN → SYN-ACK → ACK'}
            </div>
          </div>

          {/* Stage 3: HTTP GET Probe */}
          <div
            className={`p-3 rounded border transition ${
              activeStep >= 3
                ? 'bg-zinc-900 border-blue-500/50 shadow-sm'
                : 'bg-[#0f1015] border-[#1e2029] opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
              <span>03. WinINet HTTP</span>
              {activeStep > 3 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : activeStep === 3 ? (
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              ) : null}
            </div>
            <div className="text-xs font-medium text-zinc-200">InternetOpenUrlA</div>
            <div className="text-[10px] font-mono text-zinc-500 mt-1">
              GET / HTTP/1.1 (No Auth)
            </div>
          </div>

          {/* Stage 4: Evaluation */}
          <div
            className={`p-3 rounded border transition ${
              activeStep >= 4
                ? 'bg-zinc-900 border-blue-500/50 shadow-sm'
                : 'bg-[#0f1015] border-[#1e2029] opacity-60'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 mb-1">
              <span>04. Response Eval</span>
              {activeStep > 4 ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : activeStep === 4 ? (
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              ) : null}
            </div>
            <div className="text-xs font-medium text-zinc-200">Kiểm tra con trỏ hFile</div>
            <div className="text-[10px] font-mono text-zinc-500 mt-1">
              {activeStep >= 4 ? (isBranchA ? 'hFile != NULL (Có phản hồi)' : 'hFile == NULL (Mạng lỗi)') : 'Chờ gói tin...'}
            </div>
          </div>
        </div>

        {/* Binary Divergence Branches Result */}
        <div className="mt-5 pt-4 border-t border-[#1e2029]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Branch A Card */}
            <div
              className={`p-4 rounded-lg border transition ${
                isBranchA && activeStep === 5
                  ? 'bg-emerald-950/20 border-emerald-500/40 ring-1 ring-emerald-500/20'
                  : !isBranchA && activeStep === 5
                  ? 'bg-[#0f1015] border-[#1e2029] opacity-40'
                  : 'bg-[#0f1015] border-[#1e2029]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-400">
                    KỊCH BẢN A: THOÁT SẠCH (SAFE EXIT)
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  ExitProcess(0)
                </span>
              </div>
              <ul className="text-xs space-y-1.5 text-zinc-300 mt-3 font-mono">
                <li className="flex items-center justify-between">
                  <span className="text-zinc-500">Mã thoát tiến trình:</span>
                  <span className="text-emerald-400">0 (Success)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-500">Thời gian thực thi:</span>
                  <span className="text-zinc-200">0.89 giây (Lab verified)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-500">Tệp tin bị mã hóa:</span>
                  <span className="text-emerald-400">0 tệp (Nguyên vẹn 100%)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-500">Dịch vụ ngầm mssecsvc2.0:</span>
                  <span className="text-emerald-400">KHÔNG đăng ký</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-500">Kho công cụ tasksche.exe:</span>
                  <span className="text-emerald-400">KHÔNG thả xuống đĩa</span>
                </li>
              </ul>
              <div className="text-[11px] text-zinc-400 mt-3 pt-2.5 border-t border-zinc-800/80 leading-relaxed">
                Khi nhận phản hồi HTTP hợp lệ, hàm xử lý đóng handle WinINet qua{' '}
                <code className="text-zinc-300 bg-zinc-900 px-1 py-0.5 rounded text-[10px]">InternetCloseHandle</code>{' '}
                và kết thúc ngay lập tức.
              </div>
            </div>

            {/* Branch B Card */}
            <div
              className={`p-4 rounded-lg border transition ${
                !isBranchA && activeStep === 5
                  ? 'bg-rose-950/20 border-rose-500/40 ring-1 ring-rose-500/20'
                  : isBranchA && activeStep === 5
                  ? 'bg-[#0f1015] border-[#1e2029] opacity-40'
                  : 'bg-[#0f1015] border-[#1e2029]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <span className="text-xs font-semibold text-rose-400">
                    KỊCH BẢN B: KÍCH HOẠT PHÁ HỦY TOÀN BỘ
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  Full Cascade
                </span>
              </div>
              <ul className="text-xs space-y-1.5 text-zinc-300 mt-3 font-mono">
                <li className="flex items-center justify-between">
                  <span className="text-zinc-500">Vòng lặp kết nối thử lại:</span>
                  <span className="text-amber-400">4 lần thử (~500ms khoảng cách)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-500">Đăng ký dịch vụ Windows:</span>
                  <span className="text-rose-400">mssecsvc2.0 (SYSTEM)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-500">Thả gói cài đặt:</span>
                  <span className="text-rose-400">C:\WINDOWS\tasksche.exe /i</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-500">Mã hóa tệp tin:</span>
                  <span className="text-rose-400">Toàn bộ đĩa (.WNCRY)</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-zinc-500">Giao diện tống tiền:</span>
                  <span className="text-rose-400">Wana Decrypt0r 2.0 hiển thị</span>
                </li>
              </ul>
              <div className="text-[11px] text-zinc-400 mt-3 pt-2.5 border-t border-zinc-800/80 leading-relaxed">
                Sau khi xác nhận mạng thất bại, tiến trình giải phóng socket và gọi các hàm độc hại nội bộ để khởi động chuỗi lây lan và mã hóa dữ liệu.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Breakdown Panel */}
      <div className="bg-[#14151c] border border-[#1e2029] rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2029] mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
              Phân tích kỹ thuật chuyên sâu (Technical Deep-Dive)
            </h3>
          </div>

          {/* Navigation Pills */}
          <div className="flex items-center gap-1 bg-[#0f1015] p-1 rounded-md border border-[#1e2029] text-xs">
            <button
              onClick={() => setActiveTab('why_check')}
              className={`px-2.5 py-1 rounded transition ${
                activeTab === 'why_check'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Mục đích Check
            </button>
            <button
              onClick={() => setActiveTab('not_os_vuln')}
              className={`px-2.5 py-1 rounded transition ${
                activeTab === 'not_os_vuln'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Ranh giới HĐH
            </button>
            <button
              onClick={() => setActiveTab('not_uninstalled')}
              className={`px-2.5 py-1 rounded transition ${
                activeTab === 'not_uninstalled'
                  ? 'bg-zinc-800 text-zinc-100 font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Sai lầm Gỡ bỏ
            </button>
          </div>
        </div>

        {/* Tab 1: Why Check */}
        {activeTab === 'why_check' && (
          <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
            <div className="flex items-start gap-2.5 p-3 rounded bg-[#0f1015] border border-[#1e2029]">
              <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-zinc-200 mb-1">
                  Kỹ thuật chống phân tích động (Sandbox Evasion Heuristic)
                </div>
                <p className="text-zinc-400">
                  Các môi trường Sandbox phân tích mã độc tự động (như Cuckoo Sandbox, Joe Sandbox hay các giải pháp phân tích hành vi tại thời điểm 2017) thường sử dụng cơ chế <span className="text-zinc-200 font-mono">DNS Sinkholing / FakeNet</span>. Khi mã độc trong máy ảo phân tích gửi yêu cầu phân giải bất kỳ tên miền nào, máy chủ DNS giả lập sẽ luôn trả về một địa chỉ IP nội bộ và máy chủ web giả lập sẽ phản hồi <span className="text-emerald-400 font-mono">HTTP 200 OK</span> để theo dõi các gói tin tiếp theo.
                </p>
                <p className="text-zinc-400 mt-2">
                  Tác giả WannaCry đã cố ý đưa tên miền vô nghĩa dài 41 ký tự (<code className="text-zinc-300">www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com</code>) chưa được đăng ký vào mã nguồn. Nếu tên miền này phản hồi 200 OK, mã độc suy luận rằng nó đang bị giam giữ trong một môi trường phân tích phân tích động và chủ động dừng lại để che giấu hành vi phá hoại.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Not OS Vuln */}
        {activeTab === 'not_os_vuln' && (
          <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
            <div className="flex items-start gap-2.5 p-3 rounded bg-[#0f1015] border border-[#1e2029]">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-zinc-200 mb-1">
                  Cơ chế Kill-Switch hoàn toàn KHÔNG PHẢI là lỗ hổng của Windows
                </div>
                <p className="text-zinc-400">
                  Đây là logic điều kiện rẽ nhánh thuần túy ở tầng ứng dụng (Userland Application Logic). Đoạn mã sử dụng trực tiếp các hàm chuẩn Win32 API có sẵn trong thư viện <code className="text-zinc-300">wininet.dll</code>:
                </p>
                <div className="bg-[#090a0f] p-2.5 rounded font-mono text-[11px] text-zinc-300 my-2 border border-zinc-800">
                  HINTERNET hOpen = InternetOpenA(0, 1, 0, 0, 0);<br />
                  HINTERNET hUrl = InternetOpenUrlA(hOpen, "http://www.iuqer...", 0, 0, 0x84000000, 0);<br />
                  if (hUrl) &#123;<br />
                  &nbsp;&nbsp;InternetCloseHandle(hUrl);<br />
                  &nbsp;&nbsp;InternetCloseHandle(hOpen);<br />
                  &nbsp;&nbsp;ExitProcess(0); // Thoát sạch khi có phản hồi HTTP 200<br />
                  &#125;
                </div>
                <p className="text-zinc-400">
                  Hệ điều hành Windows, nhân kernel, ngăn xếp mạng TCP/IP và hệ thống dịch vụ hoạt động hoàn toàn chính xác theo đúng đặc tả kỹ thuật. Lỗ hổng bảo mật thực sự bị WannaCry khai thác để lây lan qua mạng là <span className="text-rose-400 font-mono">MS17-010 (EternalBlue)</span> trong dịch vụ SMBv1, hoàn toàn độc lập với đoạn code kiểm tra tên miền này.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Not Uninstalled */}
        {activeTab === 'not_uninstalled' && (
          <div className="space-y-3 text-xs leading-relaxed text-zinc-300">
            <div className="flex items-start gap-2.5 p-3 rounded bg-[#0f1015] border border-[#1e2029]">
              <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-zinc-200 mb-1">
                  Mã thoát HTTP 200 KHÔNG chứng minh mã độc đã được gỡ bỏ khỏi máy
                </div>
                <p className="text-zinc-400">
                  Khi Marcus Hutchins (MalwareTech) đăng ký tên miền sinkhole, việc các máy tính nhận được phản hồi HTTP 200 chỉ làm cho tiến trình gọi lệnh <code className="text-zinc-300">ExitProcess(0)</code> để kết thúc phiên chạy hiện tại.
                </p>
                <ul className="list-disc pl-4 space-y-1 text-zinc-400 mt-2">
                  <li>Tệp thực thi PE của mã độc vẫn nằm nguyên vẹn 100% trên đĩa cứng (<code className="text-zinc-300">C:\LabLive\Sample_ready\...</code>).</li>
                  <li>Không có tệp nào bị xóa, không có cách ly (quarantine), không có tác vụ dọn dẹp nào được hệ điều hành hay mã độc thực thi.</li>
                  <li>Nếu kết nối mạng bị gián đoạn, DNS sinkhole gặp sự cố, hoặc ai đó thực thi lại mẫu trong môi trường offline, toàn bộ chuỗi mã hóa Kịch bản B sẽ lập tức bị kích hoạt.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default KillSwitchSandbox;
