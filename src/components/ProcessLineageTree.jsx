import React, { useState } from 'react';
import { Cpu, Terminal, Shield, ArrowRight } from 'lucide-react';

export default function ProcessLineageTree() {
  const [selectedPid, setSelectedPid] = useState(3760);

  const processes = [
    {
      pid: 5152,
      ppid: 7180,
      shortName: 'WannaCry.exe',
      name: 'WannaCry.exe (Mẫu gốc)',
      time: '11:57:33.561',
      record: 'R326',
      user: 'Administrator / Desktop',
      session: 'Session 1',
      integrity: 'High',
      desc: 'Mẫu thực thi ban đầu do người dùng kích hoạt trực tiếp từ PowerShell. Kiểm tra kết nối mạng trước khi chuyển nhánh dịch vụ.',
      limit: 'Không tự nâng quyền; chạy với quyền của phiên đăng nhập hiện tại.'
    },
    {
      pid: 5272,
      ppid: 648,
      shortName: 'mssecsvc2.0',
      name: 'mssecsvc2.0 (services.exe)',
      time: '11:57:36.119',
      record: 'R780',
      user: 'NT AUTHORITY\\SYSTEM',
      session: 'Session 0',
      integrity: 'System',
      desc: 'Dịch vụ được Service Control Manager khởi động với cờ -m security sau khi mẫu gốc đăng ký thành công vào Registry (R772).',
      limit: 'Không chứng minh UAC bypass; service được cài đặt từ ngữ cảnh đã có quyền quản trị.'
    },
    {
      pid: 6724,
      ppid: 5272,
      shortName: 'tasksche.exe',
      name: 'tasksche.exe (Trích xuất)',
      time: '11:57:38.606',
      record: 'R1143',
      user: 'NT AUTHORITY\\SYSTEM',
      session: 'Session 0',
      integrity: 'System',
      desc: 'Tập tin nhị phân được dịch vụ ghi xuống đĩa (3,514,368 byte) tại R1137 và kích hoạt ngay sau đó.',
      limit: 'Chưa có phân tích tĩnh để xác định giải nén từ resource hay tải từ mạng.'
    },
    {
      pid: 1152,
      ppid: 6724,
      shortName: 'tasksche.exe',
      name: 'tasksche.exe (Launcher)',
      time: '11:57:38.686',
      record: 'R1197',
      user: 'NT AUTHORITY\\SYSTEM',
      session: 'Session 0',
      integrity: 'System',
      desc: 'Tiến trình đệm thực hiện thiết lập môi trường và cấu hình khóa Registry WanaCrypt0r\\wd (R1213).',
      limit: 'Thời gian sống ngắn, đóng vai trò tạo lập tiến trình con thực thi chính.'
    },
    {
      pid: 3760,
      ppid: 1152,
      shortName: 'tasksche.exe',
      name: 'tasksche.exe (Mã hóa chính)',
      time: '11:57:38.725',
      record: 'R1209',
      user: 'NT AUTHORITY\\SYSTEM',
      session: 'Session 0',
      integrity: 'System',
      desc: 'Tiến trình trung tâm thực hiện đổi tên các tệp thử nghiệm sang đuôi .WNCRY (R2617), gọi icacls và attrib, nạp các thư viện mật mã Windows.',
      limit: 'Việc nạp thư viện rsaenh.dll/bcrypt.dll không chứng minh thuật toán cụ thể nếu không kiểm tra luồng API.'
    },
    {
      pid: 1724,
      ppid: 3760,
      shortName: 'icacls.exe',
      name: 'icacls.exe',
      time: '11:57:39.879',
      record: 'R1724',
      user: 'NT AUTHORITY\\SYSTEM',
      session: 'Session 0',
      integrity: 'System',
      desc: 'Cấp quyền Everyone:F đệ quy cho thư mục làm việc ProgramData.',
      limit: 'Chỉ tác động thư mục con của mã độc; không can thiệp tệp tin nhạy cảm của Windows.'
    },
    {
      pid: 1721,
      ppid: 3760,
      shortName: 'attrib.exe',
      name: 'attrib.exe',
      time: '11:57:39.874',
      record: 'R1721',
      user: 'NT AUTHORITY\\SYSTEM',
      session: 'Session 0',
      integrity: 'System',
      desc: 'Đặt thuộc tính ẩn (+h) cho thư mục ProgramData.',
      limit: 'Hành vi ẩn thông thường (T1564.001); không phải mã hóa.'
    },
    {
      pid: 3888,
      ppid: 3760,
      shortName: 'cmd.exe',
      name: 'cmd.exe',
      time: '11:57:39.984',
      record: 'R2279',
      user: 'NT AUTHORITY\\SYSTEM',
      session: 'Session 0',
      integrity: 'System',
      desc: 'Tiến trình dòng lệnh trung gian thực thi script VBS tạo shortcut cho Wanna Decrypt0r.',
      limit: 'Không thực hiện tương tác dòng lệnh với người dùng.'
    },
    {
      pid: 6096,
      ppid: 3888,
      shortName: 'cscript.exe',
      name: 'cscript.exe',
      time: '11:57:40.082',
      record: 'R2425',
      user: 'NT AUTHORITY\\SYSTEM',
      session: 'Session 0',
      integrity: 'System',
      desc: 'Trình thông dịch VBScript thực thi kịch bản tạo phím tắt giải mã trên màn hình.',
      limit: 'Thực thi nội dung script cục bộ được sinh ra trước đó.'
    }
  ];

  const current = processes.find((p) => p.pid === selectedPid) || processes[4];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2128]">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">Chuỗi Tiến Trình Xác Thực (15 Verified PIDs)</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Nhấp từng tiến trình để xem quan hệ cha - con, ngữ cảnh đặc quyền và mốc thời gian CSV chính xác.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Process list / tree */}
        <div className="lg:col-span-5 space-y-1 font-mono text-xs">
          {processes.map((proc) => {
            const isSelected = selectedPid === proc.pid;
            return (
              <button
                key={proc.pid}
                onClick={() => setSelectedPid(proc.pid)}
                className={`w-full text-left px-2.5 py-1.5 rounded border transition flex items-center justify-between ${
                  isSelected
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-medium'
                    : 'bg-zinc-900/40 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-zinc-500 text-[10px]">PID {proc.pid}</span>
                  <span className="truncate">{proc.shortName}</span>
                </div>
                <span className="text-[10px] text-zinc-500 shrink-0">{proc.record}</span>
              </button>
            );
          })}
        </div>

        {/* Selected process detail */}
        <div className="lg:col-span-7 p-4 rounded bg-zinc-900/50 border border-zinc-800 space-y-3 text-xs font-sans">
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-2 border-b border-zinc-800">
            <div>
              <span className="font-mono text-sm font-semibold text-zinc-200">{current.name}</span>
              <span className="ml-2 font-mono text-xs text-zinc-500">PID: {current.pid} &bull; PPID: {current.ppid}</span>
            </div>
            <span className="font-mono text-[11px] text-zinc-400">{current.time} ({current.record})</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-zinc-500 block text-[10px]">Tài khoản & Phiên</span>
              <span className="text-zinc-300 font-medium">{current.user} ({current.session})</span>
            </div>
            <div className="p-2 rounded bg-zinc-950/60 border border-zinc-800/60">
              <span className="text-zinc-500 block text-[10px]">Mức toàn vẹn</span>
              <span className="text-zinc-300 font-medium">{current.integrity}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">Hành vi quan sát</span>
            <p className="text-zinc-300 text-xs leading-relaxed">{current.desc}</p>
          </div>

          <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/60 text-[11px] text-zinc-400">
            <strong>Giới hạn:</strong> {current.limit}
          </div>
        </div>
      </div>
    </div>
  );
}
