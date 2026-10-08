import React, { useState, useMemo } from 'react';
import {
  Cpu,
  Shield,
  User,
  ShieldAlert,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Terminal,
  Activity,
  Layers,
  FileText,
  Copy,
  Check,
  Maximize2,
  FolderTree,
  ListFilter
} from 'lucide-react';

const VERIFIED_PROCESSES = [
  {
    pid: 5152,
    name: "24d004a1...exe",
    ppid: 4872,
    parent: "powershell.exe",
    rows: 32,
    user: "bachdeptrai",
    cmd: "C:\\LabLive\\Sample_ready\\24d004a104d4d54034dbcffc2a4b19a11f39008a575aa614ea04703480b1022c.exe",
    role: "Mẫu thực thi gốc (Root runner / Dropper)",
    desc: "Mẫu độc hại ban đầu được kích hoạt trực tiếp trong lab. Hành vi đầu tiên là kết nối mạng TCP cổng 80 để kiểm tra kill-switch. Khi mạng không phản hồi (thử lại 4 lần), tiến trình này lập tức rẽ nhánh sang Kịch bản B: đăng ký dịch vụ mssecsvc2.0, thả tệp C:\\Windows\\tasksche.exe và khởi chạy tiến trình cài đặt PID 6724.",
    impact: "Tạo kết nối mạng tới 127.0.0.1:80; đăng ký dịch vụ Windows ngầm; thả tệp thực thi vào thư mục hệ thống C:\\Windows\\.",
    insight: "Mắt xích khởi động toàn bộ chiến dịch tấn công. Quyết định sự phân nhánh nhị phân giữa tự hủy an toàn (Kịch bản A) hay phá hủy toàn bộ hệ thống (Kịch bản B).",
    flags: [{ flag: "[Mặc định]", meaning: "Không truyền tham số dòng lệnh; tiến trình chạy chế độ phân nhánh ban đầu." }]
  },
  {
    pid: 5272,
    name: "24d004a1...exe",
    ppid: 644,
    parent: "services.exe",
    rows: 60,
    user: "NT AUTHORITY\\SYSTEM",
    cmd: "C:\\LabLive\\Sample_ready\\24d004a1...exe -m security",
    role: "Dịch vụ mssecsvc2.0 (Lan truyền mạng SMB)",
    desc: "Được Windows Service Control Manager (services.exe) khởi chạy tự động dưới quyền SYSTEM tối cao. Cờ \"-m security\" báo hiệu chế độ Service Worker chạy ngầm không giao diện. Mục đích chính là khởi động mô-đun quét mạng nội bộ cổng SMB 445 để khai thác lỗ hổng MS17-010 lây lan sang máy khác (bị chặn lại do card mạng bị cô lập).",
    impact: "Thiết lập cơ chế tự khởi động vĩnh viễn (Start = 2) trong HKLM\\SYSTEM\\CurrentControlSet\\Services\\mssecsvc2.0.",
    insight: "Cơ chế Persistence sống sót sau Reboot. Dù người dùng có đăng xuất hay khởi động lại máy, dịch vụ này vẫn tự động nạp lại dưới quyền SYSTEM.",
    flags: [{ flag: "-m security", meaning: "Chế độ Service Worker chạy ngầm không giao diện, kích hoạt module quét mạng SMB 445 lây lan qua MS17-010." }]
  },
  {
    pid: 6724,
    name: "tasksche.exe",
    ppid: 5152,
    parent: "24d004a1...exe",
    rows: 8,
    user: "bachdeptrai",
    cmd: "C:\\WINDOWS\\tasksche.exe /i",
    role: "Bộ giải nén tệp độc hại (Installer)",
    desc: "Được tiến trình gốc PID 5152 gọi với cờ cài đặt \"/i\". Tiến trình này đọc dữ liệu tài nguyên Resource (.rsrc) nhúng bên trong tệp nhị phân, giải mã kho lưu trữ ZIP và giải nén toàn bộ công cụ mã hóa vào C:\\ProgramData\\evmdthrukdvwcqn063\\, đồng thời tạo tệp thực thi tasksche.exe tại đây.",
    impact: "Thả kho vũ khí mã hóa hoàn chỉnh (c.wnry, t.wnry, taskhsvc.exe, @WanaDecryptor@.exe) vào thư mục ProgramData ẩn.",
    insight: "Đóng vai trò là cầu nối giải mã payload cấp hai (Second-stage Payload Stager). Hoạt động rất ngắn gọn rồi tự thoát.",
    flags: [{ flag: "/i", meaning: "Tham số chỉ thị chế độ Cài đặt (Install mode), đọc Resource ZIP và giải nén payload." }]
  },
  {
    pid: 1152,
    name: "cmd.exe",
    ppid: 644,
    parent: "services.exe",
    rows: 11,
    user: "NT AUTHORITY\\SYSTEM",
    cmd: "cmd.exe /c \"C:\\ProgramData\\evmdthrukdvwcqn063\\tasksche.exe\"",
    role: "Vỏ bọc kích hoạt dịch vụ (Service Wrapper)",
    desc: "Được SCM (services.exe) sinh ra khi dịch vụ evmdthrukdvwcqn063 khởi động dưới quyền SYSTEM. Sử dụng cmd.exe /c để bọc lệnh thực thi tệp tasksche.exe trong thư mục ProgramData.",
    impact: "Cầu nối chuyển giao quyền lực tối cao NT AUTHORITY\\SYSTEM từ SCM sang bộ mã hóa tasksche.exe mà không cần hiển thị màn hình.",
    insight: "Kỹ thuật ngụy trang thực thi (Indirect Execution via cmd wrapper), giúp tiến trình con thừa hưởng trọn vẹn đặc quyền SYSTEM mà không vướng kiểm duyệt UAC.",
    flags: [{ flag: "/c", meaning: "Chỉ thị cmd.exe thực thi chuỗi lệnh được truyền và tự động thoát sau khi tiến trình con kết thúc." }]
  },
  {
    pid: 3760,
    name: "tasksche.exe",
    ppid: 1152,
    parent: "cmd.exe",
    rows: 271536,
    user: "NT AUTHORITY\\SYSTEM",
    cmd: "C:\\ProgramData\\evmdthrukdvwcqn063\\tasksche.exe",
    role: "Bộ mã hóa cốt lõi (Core Encryptor)",
    desc: "Trái tim của toàn bộ đợt tấn công mã hóa tống tiền. Chạy dưới quyền NT AUTHORITY\\SYSTEM với hơn 271.536 dòng nhật ký trong Procmon. Tiến trình này quét tất cả các ổ đĩa, mã hóa tệp tin bằng AES-128 (khóa mã hóa được bọc bởi RSA-2048), đổi tên tệp thành phần mở rộng .WNCRY, đồng thời sinh ra các tiến trình phụ trợ dọn dẹp và giao diện tống tiền.",
    impact: "Phá hủy toàn bộ dữ liệu người dùng trên máy; mã hóa tệp tin; chiếm dụng tài nguyên CPU/Disk I/O ở mức tối đa.",
    insight: "Tác nhân gây thiệt hại chính. Sở hữu các Named Mutex độc quyền (Global\\MsWinZonesCacheCounterMutexA) và nạp thư viện CryptoAPI (rsaenh.dll, cryptsp.dll).",
    flags: [{ flag: "[Chạy trực tiếp]", meaning: "Chạy như một engine xử lý độc lập, khởi tạo luồng mã hóa đa phân luồng trên toàn bộ hệ thống tệp." }]
  },
  {
    pid: 2064,
    name: "icacls.exe",
    ppid: 3760,
    parent: "tasksche.exe",
    rows: 216,
    user: "NT AUTHORITY\\SYSTEM",
    cmd: "icacls . /grant Everyone:F /T /C /Q",
    role: "Phân toàn quyền thư mục (ACL Manipulation)",
    desc: "Công cụ quản lý quyền hệ thống Windows (icacls) được triệu hồi bởi tasksche.exe dưới quyền SYSTEM để cấp quyền Kiểm soát Toàn phần (Full Control - F) cho nhóm người dùng Everyone trên toàn bộ thư mục ProgramData hiện tại.",
    impact: "Gỡ bỏ mọi hạn chế quyền truy cập NTFS; đảm bảo mã độc không bao giờ gặp lỗi 'Access is denied' khi sửa đổi, mã hóa hoặc xóa tệp tin.",
    insight: "Kỹ thuật Phòng thủ Né tránh (Defense Evasion) & Thao túng quyền hạn (T1222.001 - File and Directory Permissions Modification).",
    flags: [
      { flag: "/grant Everyone:F", meaning: "Cấp quyền Full Control cho nhóm Everyone (toàn bộ tài khoản người dùng)." },
      { flag: "/T", meaning: "Duyệt đệ quy qua tất cả thư mục và tệp tin con." },
      { flag: "/C", meaning: "Tiếp tục thực thi bất chấp lỗi truy cập cá lẻ." },
      { flag: "/Q", meaning: "Chế độ yên lặng, không in thông báo thành công ra stdout." }
    ]
  },
  {
    pid: 5808,
    name: "attrib.exe",
    ppid: 3760,
    parent: "tasksche.exe",
    rows: 7,
    user: "NT AUTHORITY\\SYSTEM",
    cmd: "attrib +h .",
    role: "Ẩn thư mục payload (Defense Evasion)",
    desc: "Sử dụng lệnh attrib có sẵn của Windows để gắn thuộc tính Ẩn (+h) cho thư mục hiện hành C:\\ProgramData\\evmdthrukdvwcqn063\\.",
    impact: "Che giấu thư mục chứa công cụ tống tiền khỏi mắt người dùng bình thường khi mở File Explorer.",
    insight: "Living off the Land (LotL) - Tận dụng công cụ quản trị hệ thống hợp pháp để thực hiện hành vi che giấu (T1564.001 - Hidden Files and Directories).",
    flags: [{ flag: "+h", meaning: "Thiết lập thuộc tính Ẩn (Hidden Attribute) cho thư mục hiện tại (.)." }]
  },
  {
    pid: 3888,
    name: "cmd.exe",
    ppid: 3760,
    parent: "tasksche.exe",
    rows: 20,
    user: "NT AUTHORITY\\SYSTEM",
    cmd: "cmd.exe /c 116221791435459.bat",
    role: "Thực thi kịch bản dọn dẹp (Script Launcher)",
    desc: "Khởi chạy một tệp lệnh Batch tạm thời với tên số ngẫu nhiên do tasksche.exe sinh ra. Tệp này có nhiệm vụ tạo shortcut @WanaDecryptor@.exe trên Desktop và triệu hồi cscript.exe để chạy script VBS.",
    impact: "Tạo lối tắt tống tiền trên màn hình chính và khởi động script đổi hình nền máy tính.",
    insight: "Sử dụng kịch bản trung gian để tách rời các hành vi hiển thị giao diện khỏi tiến trình mã hóa chính.",
    flags: [{ flag: "/c", meaning: "Thực thi kịch bản batch và giải phóng tiến trình ngay khi hoàn tất." }]
  },
  {
    pid: 6096,
    name: "cscript.exe",
    ppid: 3888,
    parent: "cmd.exe",
    rows: 3,
    user: "NT AUTHORITY\\SYSTEM",
    cmd: "cscript.exe //nologo m.vbs",
    role: "Tạo shortcut Desktop (VBScript Runner)",
    desc: "Trình thông dịch Windows Script Host dạng console thực thi tệp m.vbs dưới quyền SYSTEM. Đoạn mã VBScript này gọi API WScript.Shell để thay đổi hình nền Desktop thành hình cảnh báo WannaCry.",
    impact: "Ghi đè hình nền màn hình máy tính của nạn nhân thành tệp hình ảnh @WanaDecryptor@.bmp.",
    insight: "Gây áp lực tâm lý (Psychological extortion) - biến đổi ngay lập tức diện mạo máy tính để nạn nhân biết họ đã bị tấn công.",
    flags: [{ flag: "//nologo", meaning: "Không hiển thị biểu ngữ bản quyền Microsoft ra màn hình." }]
  },
  {
    pid: 3252,
    name: "taskdl.exe",
    ppid: 3760,
    parent: "tasksche.exe",
    rows: 48,
    user: "NT AUTHORITY\\SYSTEM",
    cmd: "taskdl.exe",
    role: "Dọn dẹp tệp tạm thời (Temp Cleaner Instance 1)",
    desc: "Tiến trình chuyên biệt do WannaCry sinh ra nhằm quét và xóa bỏ vĩnh viễn các tệp sao lưu tạm thời (*.WNCRYT) được tạo ra trong quá trình mã hóa tệp dữ liệu.",
    impact: "Xóa dấu vết và ngăn cản khả năng phục hồi dữ liệu từ các tệp đệm tạm thời.",
    insight: "Chống giám định kỹ thuật số (Anti-forensics). Chạy song song nhiều phiên bản để dọn dẹp đĩa kịp thời theo tiến độ mã hóa.",
    flags: [{ flag: "[Không tham số]", meaning: "Tiến trình chạy nền liên tục quét thư mục làm việc và xóa tệp .WNCRYT." }]
  },
  {
    pid: 1532,
    name: "taskdl.exe",
    ppid: 3760,
    parent: "tasksche.exe",
    rows: 24,
    user: "NT AUTHORITY\\SYSTEM",
    cmd: "taskdl.exe",
    role: "Dọn dẹp tệp tạm thời (Temp Cleaner Instance 2)",
    desc: "Phiên bản quét dọn thứ hai được sinh ra để hỗ trợ dọn dẹp các tệp tạm thời ở các phân vùng ổ đĩa hoặc luồng xử lý khác.",
    impact: "Hỗ trợ xóa triệt để tệp đệm, giải phóng dung lượng đĩa cho quá trình mã hóa tiếp theo.",
    insight: "Cơ chế đa tiến trình độc lập tăng tốc độ hoàn tất chiến dịch tấn công.",
    flags: [{ flag: "[Không tham số]", meaning: "Tiến trình worker dọn dẹp phụ trợ." }]
  },
  {
    pid: 6776,
    name: "taskdl.exe",
    ppid: 3760,
    parent: "tasksche.exe",
    rows: 12,
    user: "NT AUTHORITY\\SYSTEM",
    cmd: "taskdl.exe",
    role: "Dọn dẹp tệp tạm thời (Temp Cleaner Instance 3)",
    desc: "Phiên bản quét dọn thứ ba tiếp tục dọn dẹp các tệp tạm sót lại trong các thư mục sau khi các lô tệp được đổi tên.",
    impact: "Ngăn chặn các công cụ khôi phục dữ liệu (file carving) tìm thấy tệp chưa hoàn tất.",
    insight: "Hoàn tất chu kỳ xóa dấu vết tạm thời.",
    flags: [{ flag: "[Không tham số]", meaning: "Tiến trình worker dọn dẹp phụ trợ." }]
  },
  {
    pid: 2952,
    name: "Conhost.exe",
    ppid: 3760,
    parent: "tasksche.exe",
    rows: 5,
    user: "NT AUTHORITY\\SYSTEM",
    cmd: "\\??\\C:\\Windows\\system32\\conhost.exe 0xffffffff -ForceV1",
    role: "Cửa sổ Console hệ thống (Console Host 1)",
    desc: "Tiến trình lưu trữ giao diện dòng lệnh của Windows được hệ thống tự động sinh ra để phục vụ các yêu cầu I/O dòng lệnh của tasksche.exe.",
    impact: "Quản lý cửa sổ đệm dòng lệnh cho các tác vụ con.",
    insight: "Tiến trình hợp pháp của Windows nhưng bị mã độc kích hoạt dưới quyền SYSTEM.",
    flags: [{ flag: "0xffffffff -ForceV1", meaning: "Tham số nội bộ Windows liên kết console với tiến trình cha." }]
  },
  {
    pid: 3472,
    name: "Conhost.exe",
    ppid: 3888,
    parent: "cmd.exe",
    rows: 4,
    user: "NT AUTHORITY\\SYSTEM",
    cmd: "\\??\\C:\\Windows\\system32\\conhost.exe 0xffffffff -ForceV1",
    role: "Cửa sổ Console hệ thống (Console Host 2)",
    desc: "Tiến trình conhost phục vụ cửa sổ console cho cmd.exe PID 3888 khi chạy tệp kịch bản batch.",
    impact: "Lưu trữ phiên giao diện cho trình thông dịch dòng lệnh cmd.exe.",
    insight: "Tiến trình hệ thống phụ thuộc.",
    flags: [{ flag: "-ForceV1", meaning: "Chế độ tương thích phiên bản console V1 của Windows NT." }]
  },
  {
    pid: 1752,
    name: "@WanaDecryptor@.exe",
    ppid: 3760,
    parent: "tasksche.exe",
    rows: 450,
    user: "bachdeptrai",
    cmd: "C:\\ProgramData\\evmdthrukdvwcqn063\\@WanaDecryptor@.exe",
    role: "Giao diện Đòi tiền chuộc (Ransomware GUI)",
    desc: "Cửa sổ đồ họa tống tiền chính xuất hiện trên màn hình máy tính của người dùng. Mặc dù được sinh ra bởi tasksche.exe (đang chạy quyền SYSTEM), tiến trình này chuyển giao phiên hoạt động về phiên người dùng đăng nhập (bachdeptrai) để có thể hiển thị cửa sổ đồ họa tương tác trên desktop.",
    impact: "Hiển thị đồng hồ đếm ngược tăng giá tiền chuộc, địa chỉ ví Bitcoin và hướng dẫn thanh toán; cung cấp chức năng giải mã thử một vài tệp miễn phí.",
    insight: "Kỹ thuật tương tác phiên người dùng (Session 1 Desktop Interaction) từ dịch vụ Session 0. Định danh sinh viên được xác minh trực tiếp trên thanh tiêu đề trong lab.",
    flags: [{ flag: "[Chạy GUI]", meaning: "Nạp tài nguyên đa ngôn ngữ và tạo cửa sổ hiển thị đồ họa tương tác cho người dùng." }]
  }
];

export function ProcessLineageTree() {
  const [selectedPid, setSelectedPid] = useState(3760);
  const [filterUser, setFilterUser] = useState('ALL'); // ALL | SYSTEM | USER
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Selected Process
  const selectedProcess = useMemo(
    () => VERIFIED_PROCESSES.find((p) => p.pid === selectedPid) || VERIFIED_PROCESSES[4],
    [selectedPid]
  );

  // Filtered list
  const filteredProcesses = useMemo(() => {
    return VERIFIED_PROCESSES.filter((p) => {
      const matchToken =
        filterUser === 'ALL' ||
        (filterUser === 'SYSTEM' && p.user.includes('SYSTEM')) ||
        (filterUser === 'USER' && !p.user.includes('SYSTEM'));

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.pid.toString().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.cmd.toLowerCase().includes(q);

      return matchToken && matchSearch;
    });
  }, [filterUser, searchQuery]);

  const handleCopyCmd = () => {
    navigator.clipboard.writeText(selectedProcess.cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isSystem = (user) => user.includes('SYSTEM');

  return (
    <div className="w-full bg-[#0f1015] border border-[#1e2029] rounded-xl p-6 text-[#f4f4f7] font-sans shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#1e2029] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Verified 15 PIDs Trace
            </span>
            <span className="text-xs font-mono text-zinc-500">Procmon Process Lineage Graph</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 mt-1 tracking-tight">
            Cây Phả hệ Tiến trình Mã độc (Process Lineage Tree)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Mối quan hệ cha - con (PPID &rarr; PID), phân cấp quyền hạn token và dấu vết nhật ký Procmon trong lab
          </p>
        </div>

        {/* Stats Summary */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-[#14151c] border border-[#1e2029] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <span className="text-zinc-400">User Token:</span>
            <span className="text-zinc-200 font-semibold">3 PIDs</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-[#14151c] border border-[#1e2029] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-zinc-400">SYSTEM Token:</span>
            <span className="text-zinc-200 font-semibold">12 PIDs</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="my-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#14151c] p-2 rounded-lg border border-[#1e2029]">
        {/* Token filter pills */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-zinc-500 text-[11px] font-mono px-2 flex items-center gap-1">
            <ListFilter className="w-3.5 h-3.5" /> Lọc Token:
          </span>
          <button
            onClick={() => setFilterUser('ALL')}
            className={`px-3 py-1 rounded-md transition ${
              filterUser === 'ALL'
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            Tất cả (15)
          </button>
          <button
            onClick={() => setFilterUser('SYSTEM')}
            className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
              filterUser === 'SYSTEM'
                ? 'bg-rose-950/60 text-rose-300 font-medium border border-rose-800/50'
                : 'text-zinc-400 hover:text-rose-300 hover:bg-zinc-900'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            SYSTEM (12)
          </button>
          <button
            onClick={() => setFilterUser('USER')}
            className={`px-3 py-1 rounded-md transition flex items-center gap-1.5 ${
              filterUser === 'USER'
                ? 'bg-blue-950/60 text-blue-300 font-medium border border-blue-800/50'
                : 'text-zinc-400 hover:text-blue-300 hover:bg-zinc-900'
            }`}
          >
            <User className="w-3 h-3 text-blue-400" />
            User: bachdeptrai (3)
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo PID, tên, lệnh..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0f1015] border border-[#1e2029] rounded pl-8 pr-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-blue-500/50 placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Main Grid: Interactive Tree View on Left + Detailed Inspector Sheet on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Process Tree Column */}
        <div className="lg:col-span-7 bg-[#14151c] border border-[#1e2029] rounded-lg p-4 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-[#1e2029] mb-3">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Cây phân cấp tiến trình (Hierarchical Tree)
              </span>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">
              {filteredProcesses.length} / 15 hiển thị
            </span>
          </div>

          {/* Process Tree List */}
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {/* Visual Root Branch 1: User Session */}
            <div className="text-[10px] font-mono uppercase tracking-wider text-blue-400/80 px-2 py-1 bg-blue-500/5 rounded border border-blue-500/10 mb-1 flex items-center justify-between">
              <span>Phân nhánh A & Khởi đầu: User Shell (powershell.exe PPID 4872)</span>
              <span className="text-zinc-500">User Session</span>
            </div>

            {filteredProcesses
              .filter((p) => p.pid === 5152 || p.pid === 6724)
              .map((p) => {
                const isSelected = selectedPid === p.pid;
                const isChild = p.pid === 6724;
                return (
                  <div
                    key={p.pid}
                    onClick={() => setSelectedPid(p.pid)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                      isChild ? 'ml-6 border-l-2 border-l-blue-500/40' : ''
                    } ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/60 ring-1 ring-blue-500/20'
                        : 'bg-[#0f1015] border-[#1e2029] hover:border-zinc-700/80 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Cpu
                        className={`w-4 h-4 shrink-0 ${
                          isSystem(p.user) ? 'text-rose-400' : 'text-blue-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-zinc-100">
                            PID {p.pid}
                          </span>
                          <span className="text-xs text-zinc-300 truncate font-mono">{p.name}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                              isSystem(p.user)
                                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                            }`}
                          >
                            {isSystem(p.user) ? 'SYSTEM' : p.user}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate mt-0.5">{p.role}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2 font-mono text-[11px]">
                      <span className="text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {p.rows.toLocaleString()} rows
                      </span>
                    </div>
                  </div>
                );
              })}

            {/* Visual Root Branch 2: SYSTEM Service Session */}
            <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400/80 px-2 py-1 bg-rose-500/5 rounded border border-rose-500/10 my-2 flex items-center justify-between">
              <span>Phân nhánh B: Dịch vụ Windows (services.exe PPID 644)</span>
              <span className="text-zinc-500">NT AUTHORITY\SYSTEM</span>
            </div>

            {filteredProcesses
              .filter((p) => p.pid !== 5152 && p.pid !== 6724)
              .map((p) => {
                const isSelected = selectedPid === p.pid;
                // Compute indentation level
                let indent = '';
                if (p.pid === 3760) indent = 'ml-4 border-l-2 border-l-rose-500/40';
                else if (
                  [2064, 5808, 3888, 3252, 1532, 6776, 2952, 1752].includes(p.pid)
                ) {
                  indent = 'ml-8 border-l border-zinc-800';
                } else if ([3472, 6096].includes(p.pid)) {
                  indent = 'ml-12 border-l border-zinc-800';
                }

                return (
                  <div
                    key={p.pid}
                    onClick={() => setSelectedPid(p.pid)}
                    className={`p-2.5 rounded-lg border transition cursor-pointer flex items-center justify-between ${indent} ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/60 ring-1 ring-blue-500/20'
                        : 'bg-[#0f1015] border-[#1e2029] hover:border-zinc-700/80 hover:bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Cpu
                        className={`w-4 h-4 shrink-0 ${
                          isSystem(p.user) ? 'text-rose-400' : 'text-blue-400'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-zinc-100">
                            PID {p.pid}
                          </span>
                          <span className="text-xs text-zinc-300 truncate font-mono">{p.name}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                              isSystem(p.user)
                                ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                                : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                            }`}
                          >
                            {isSystem(p.user) ? 'SYSTEM' : p.user}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate mt-0.5">{p.role}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-2 font-mono text-[11px]">
                      <span className="text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        {p.rows.toLocaleString()} rows
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right: Detailed Inspector Sheet Column */}
        <div className="lg:col-span-5 bg-[#14151c] border border-[#1e2029] rounded-lg p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#1e2029] mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  Thanh tra Tiến trình (Process Inspector)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                PPID {selectedProcess.ppid} &rarr; PID {selectedProcess.pid}
              </span>
            </div>

            {/* Header info */}
            <div className="bg-[#0f1015] border border-[#1e2029] rounded-lg p-3.5 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold font-mono text-zinc-100">
                    PID {selectedProcess.pid}
                  </span>
                  <span className="text-sm font-mono text-zinc-300">{selectedProcess.name}</span>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border ${
                    isSystem(selectedProcess.user)
                      ? 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                      : 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  {selectedProcess.user}
                </span>
              </div>
              <div className="text-xs font-medium text-emerald-400 mt-1">{selectedProcess.role}</div>
            </div>

            {/* Command Line Card */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1.5">
                <span className="flex items-center gap-1 font-mono text-[11px]">
                  <Terminal className="w-3.5 h-3.5 text-zinc-500" /> Command Line:
                </span>
                <button
                  onClick={handleCopyCmd}
                  className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-zinc-200 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Đã sao chép' : 'Copy'}
                </button>
              </div>
              <div className="bg-[#090a0f] border border-zinc-800 rounded p-2.5 font-mono text-[11px] text-zinc-300 break-all leading-relaxed">
                {selectedProcess.cmd}
              </div>
            </div>

            {/* Telemetry details */}
            <div className="space-y-2.5 text-xs">
              <div className="bg-[#0f1015] border border-[#1e2029] p-3 rounded-lg">
                <div className="font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-400" /> Mô tả Hành vi Kỹ thuật
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">{selectedProcess.desc}</p>
              </div>

              <div className="bg-[#0f1015] border border-[#1e2029] p-3 rounded-lg">
                <div className="font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Tác động An ninh Hệ thống
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">{selectedProcess.impact}</p>
              </div>

              <div className="bg-[#0f1015] border border-[#1e2029] p-3 rounded-lg">
                <div className="font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Nhận định Giám định (Forensic Insight)
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">{selectedProcess.insight}</p>
              </div>
            </div>
          </div>

          {/* Footer Procmon rows badge */}
          <div className="mt-4 pt-3 border-t border-[#1e2029] flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">Procmon Trace Count:</span>
            <span className="text-blue-400 font-semibold bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
              {selectedProcess.rows.toLocaleString()} sự kiện ghi nhận
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProcessLineageTree;
