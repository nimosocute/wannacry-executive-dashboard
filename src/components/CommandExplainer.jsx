import React, { useState, useMemo } from 'react';
import {
  Terminal,
  Code,
  Shield,
  Layers,
  FileText,
  Copy,
  Check,
  ChevronRight,
  Info,
  Cpu,
  AlertCircle,
  Eye,
  CornerDownRight
} from 'lucide-react';

const COMMANDS_DATA = [
  {
    id: 'icacls',
    fullCommand: 'icacls . /grant Everyone:F /T /C /Q',
    label: 'icacls Quyền hạn',
    category: 'Defense Evasion & Permission Escalation',
    context: 'Thực thi bởi tiến trình mã hóa tasksche.exe (PID 3760) dưới quyền NT AUTHORITY\\SYSTEM',
    tokens: [
      {
        token: 'icacls',
        type: 'binary',
        syntax: 'icacls <target_path> [options]',
        osHandling: 'Tiện ích dòng lệnh Win32 thao tác trực tiếp với Security Descriptor và Discretionary Access Control Lists (DACLs) thông qua Advapi32.dll (SetNamedSecurityInfoW).',
        attackerObjective: 'Living off the Land (LotL). Vô hiệu hóa mọi rào cản phân quyền trên cây thư mục, đảm bảo mã độc không bị lỗi Access Denied khi ghi đè hoặc đổi tên tệp.',
        forensicArtifact: 'Procmon: Operation "Process Create" (PID 2064, PPID 3760). Sysmon Event ID 1 / Security Event ID 4688 với dòng lệnh hoàn chỉnh.'
      },
      {
        token: '.',
        type: 'path',
        syntax: 'Đường dẫn tương đối trỏ tới thư mục hiện hành (Current Working Directory).',
        osHandling: 'Hệ thống Win32 giải quyết đường dẫn thành C:\\ProgramData\\evmdthrukdvwcqn063\\ (thư mục chứa mã độc vừa giải nén).',
        attackerObjective: 'Nhắm mục tiêu trực tiếp vào không gian làm việc của mã độc và toàn bộ cây con bên dưới để cấp quyền sở hữu tuyệt đối.',
        forensicArtifact: 'Procmon: Path "C:\\ProgramData\\evmdthrukdvwcqn063" được truy vấn và mở với cờ MAXIMUM_ALLOWED.'
      },
      {
        token: '/grant',
        type: 'flag',
        syntax: '/grant[:r] <Account_or_SID>:<Permission>',
        osHandling: 'Thêm một Access Allowed ACE (Access Control Entry) mới vào cấu trúc DACL của đối tượng tệp tin trong nhân NT kernel.',
        attackerObjective: 'Cấp quyền truy cập cụ thể cho đối tượng người dùng mà không cần xóa các quyền cũ đã có từ trước.',
        forensicArtifact: 'Procmon: Ghi nhận sự kiện "SetSecurityFile" với các cờ DACL_SECURITY_INFORMATION.'
      },
      {
        token: 'Everyone:F',
        type: 'argument',
        syntax: 'Everyone (Well-Known SID S-1-1-0) : F (Full Control / Quyền kiểm soát toàn bộ).',
        osHandling: 'Cấp cờ GENERIC_ALL (0x1F01FF) bao gồm quyền Đọc, Ghi, Thực thi, Xóa, Thay đổi quyền và Chiếm quyền sở hữu cho mọi tài khoản trên máy.',
        attackerObjective: 'Bảo đảm rằng dù mã độc chuyển đổi ngữ cảnh người dùng hay chạy tiến trình con, nó vẫn có quyền xóa và mã hóa không hạn chế.',
        forensicArtifact: 'Kiểm tra Security Descriptor hiển thị ACE dạng "D:(A;;FA;;;WD)" (Full Access cho World SID).'
      },
      {
        token: '/T',
        type: 'flag',
        syntax: '/T (Traverse / Đệ quy qua tất cả các thư mục con và tệp tin).',
        osHandling: 'Duyệt đệ quy theo chiều sâu (depth-first traversal) toàn bộ cây thư mục để áp dụng Security Descriptor cho từng tệp con.',
        attackerObjective: 'Đảm bảo không một tệp tin hay thư mục con nào trong kho mã độc bị bỏ sót ngoài quyền hạn kiểm soát toàn phần.',
        forensicArtifact: 'Procmon ghi nhận hàng loạt sự kiện "SetSecurityFile" kế tiếp nhau trên mọi tệp trong thư mục làm việc.'
      },
      {
        token: '/C',
        type: 'flag',
        syntax: '/C (Continue / Tiếp tục hoạt động kể cả khi gặp lỗi truy cập đơn lẻ).',
        osHandling: 'Cờ điều khiển logic của icacls: bỏ qua ngoại lệ ERROR_ACCESS_DENIED hoặc chia sẻ tệp để không làm gián đoạn toàn bộ lệnh.',
        attackerObjective: 'Khả năng chịu lỗi cao: ngăn ngừa việc tiến trình bị crash hoặc dừng đột ngột nếu có 1 tệp tin đang bị khóa bởi trình khác.',
        forensicArtifact: 'Không có sự kiện thoát bất thường (Non-zero exit code) khi gặp tệp bị khóa.'
      },
      {
        token: '/Q',
        type: 'flag',
        syntax: '/Q (Quiet / Chế độ im lặng, không in thông báo thành công ra stdout).',
        osHandling: 'Chặn việc ghi chuỗi văn bản vào bộ đệm Console Output Buffer thông qua Win32 WriteConsoleW.',
        attackerObjective: 'Che giấu hành vi (Stealth): không làm xuất hiện các dòng chữ thông báo trên màn hình console, giảm khả năng bị người dùng phát hiện.',
        forensicArtifact: 'Procmon ghi nhận không có luồng I/O ghi stdout lớn từ tiến trình icacls.exe.'
      }
    ]
  },
  {
    id: 'attrib',
    fullCommand: 'attrib +h .',
    label: 'attrib Ẩn thư mục',
    category: 'Defense Evasion & Antivirus Evasion',
    context: 'Thực thi bởi tasksche.exe (PID 3760) để ẩn thư mục hoạt động C:\\ProgramData\\evmdthrukdvwcqn063',
    tokens: [
      {
        token: 'attrib',
        type: 'binary',
        syntax: 'attrib [{+|-}r] [{+|-}a] [{+|-}s] [{+|-}h] [<path>]',
        osHandling: 'Tiện ích Win32 gọi trực tiếp hàm Kernel32.dll!SetFileAttributesW để cập nhật cờ thuộc tính siêu dữ liệu của tệp trong hệ thống tệp NTFS.',
        attackerObjective: 'Living off the Land (LotL). Sử dụng công cụ mặc định của hệ điều hành Windows để ngụy trang và ẩn tệp mà không cần dùng mã nhị phân lạ.',
        forensicArtifact: 'Procmon: Operation "Process Create" (PID 5808, PPID 3760). Event ID 4688 / Sysmon Event ID 1.'
      },
      {
        token: '+h',
        type: 'flag',
        syntax: '+h (+Hidden / Thiết lập thuộc tính ẩn FILE_ATTRIBUTE_HIDDEN = 0x00000002).',
        osHandling: 'Cập nhật bản ghi $STANDARD_INFORMATION trong NTFS Master File Table ($MFT) gắn cờ Hidden.',
        attackerObjective: 'Ẩn thư mục hoạt động của mã độc khỏi giao diện Windows Explorer mặc định (khi người dùng chưa bật "Show hidden files").',
        forensicArtifact: 'Procmon: Operation "SetBasicInformationFile" với thuộc tính FileAttributes: H (Hidden) được thiết lập.'
      },
      {
        token: '.',
        type: 'path',
        syntax: 'Thư mục hiện hành (Current Working Directory).',
        osHandling: 'Được phân giải thành C:\\ProgramData\\evmdthrukdvwcqn063\\.',
        attackerObjective: 'Áp dụng thuộc tính ẩn trực tiếp cho thư mục cha chứa toàn bộ kho công cụ tống tiền.',
        forensicArtifact: 'Procmon: Path "C:\\ProgramData\\evmdthrukdvwcqn063" nhận lệnh SetBasicInformationFile.'
      }
    ]
  },
  {
    id: 'tasksche_i',
    fullCommand: 'C:\\WINDOWS\\tasksche.exe /i',
    label: 'tasksche.exe /i Cài đặt',
    category: 'Unpacker & Dropper Staging',
    context: 'Tiến trình gốc (PID 5152) kích hoạt C:\\WINDOWS\\tasksche.exe (PID 6724) để giải nén kho tài nguyên ZIP',
    tokens: [
      {
        token: 'C:\\WINDOWS\\tasksche.exe',
        type: 'binary',
        syntax: 'Đường dẫn tuyệt đối tới tệp thực thi tasksche.exe nằm trong thư mục Windows.',
        osHandling: 'Windows PE Loader nạp tệp nhị phân vào bộ nhớ, ánh xạ các section (.text, .rdata, .rsrc) và cấp phát bảng IAT.',
        attackerObjective: 'Thực thi gói tiện ích dropper từ thư mục hệ thống có độ tin cậy cao C:\\Windows để giảm khả năng bị phần mềm bảo mật nghi ngờ.',
        forensicArtifact: 'Procmon: Image Load "C:\\WINDOWS\\tasksche.exe" từ PID 6724. Event ID 4688 ghi nhận PPID 5152.'
      },
      {
        token: '/i',
        type: 'flag',
        syntax: 'Cờ tham số dòng lệnh nội bộ "/i" (Install / Khởi tạo cài đặt).',
        osHandling: 'Hàm WinMain của tasksche.exe phân tích argv[1]. Khi phát hiện chuỗi "/i", mã độc rẽ nhánh sang hàm cài đặt môi trường tống tiền.',
        attackerObjective: 'Kích hoạt đoạn mã đọc Resource section (.rsrc), giải nén kho ZIP chứa c.wnry, t.wnry và công cụ giải mã bằng mật khẩu "WNcry@2ol7".',
        forensicArtifact: 'Sysmon Event ID 1 ghi nhận CommandLine chứa tham số "/i". Procmon ghi nhận thao tác đọc Resource và giải nén tệp tin.'
      }
    ]
  },
  {
    id: 'batch_exec',
    fullCommand: 'cmd.exe /c 116221791435459.bat',
    label: 'cmd.exe Chạy Script Batch',
    category: 'Script Execution & Environment Setup',
    context: 'Tiến trình mã hóa chính (PID 3760) sinh ra cmd.exe (PID 3888) dưới quyền SYSTEM để chạy tệp batch ngẫu nhiên',
    tokens: [
      {
        token: 'cmd.exe',
        type: 'binary',
        syntax: 'Trình thông dịch lệnh chuẩn Windows Command Processor (%SystemRoot%\\System32\\cmd.exe).',
        osHandling: 'Tạo tiến trình giao diện dòng lệnh mới (PID 3888) dưới quyền NT AUTHORITY\\SYSTEM, gắn với Console Host (PID 3472 conhost.exe).',
        attackerObjective: 'Thực thi script tự động hóa với quyền tối cao SYSTEM mà không cần tạo tiến trình độc hại phức tạp.',
        forensicArtifact: 'Procmon: Process Create PID 3888. Sysmon Event ID 1 ghi nhận ParentImage trỏ về C:\\ProgramData\\...\\tasksche.exe.'
      },
      {
        token: '/c',
        type: 'flag',
        syntax: '/c (Carry out and terminate / Thực thi chuỗi lệnh rồi tự động thoát).',
        osHandling: 'Chỉ thị cho cmd.exe nạp lệnh, chạy hết nội dung của tệp script và lập tức giải phóng tiến trình.',
        attackerObjective: 'Không để lại cửa sổ dòng lệnh treo trên màn hình, kết thúc nhanh chóng sau khi hoàn tất tác vụ.',
        forensicArtifact: 'Procmon ghi nhận thời gian tồn tại của PID 3888 rất ngắn (chỉ vài giây).'
      },
      {
        token: '116221791435459.bat',
        type: 'argument',
        syntax: 'Tệp kịch bản batch với tên định danh là chuỗi số ngẫu nhiên / dấu thời gian.',
        osHandling: 'cmd.exe mở tệp tệp batch trong thư mục hiện hành, đọc từng dòng lệnh và chuyển tiếp cho hệ điều hành xử lý.',
        attackerObjective: 'Tạo shortcut @WanaDecryptor@.exe lên Desktop của tất cả người dùng và khởi chạy script thay đổi hình nền tống tiền.',
        forensicArtifact: 'Procmon ghi nhận sự kiện CreateFile, ReadFile trên đường dẫn C:\\ProgramData\\evmdthrukdvwcqn063\\116221791435459.bat.'
      }
    ]
  },
  {
    id: 'cscript_vbs',
    fullCommand: 'cscript.exe //nologo m.vbs',
    label: 'cscript.exe Đổi Wallpaper',
    category: 'Ransom Demand & User Notification',
    context: 'Tiến trình cmd.exe (PID 3888) gọi cscript.exe (PID 6096) để chạy script VBS đổi hình nền máy tính',
    tokens: [
      {
        token: 'cscript.exe',
        type: 'binary',
        syntax: 'Windows Script Host Console Engine (%SystemRoot%\\System32\\cscript.exe).',
        osHandling: 'Nạp máy ảo VBScript (vbscript.dll, scrobj.dll) để thực thi kịch bản độc hại trong không gian tiến trình không giao diện.',
        attackerObjective: 'Living off the Land. Dùng trình thông dịch VBScript hợp pháp của Windows để thay đổi Registry mà không bị phần mềm diệt virus chặn.',
        forensicArtifact: 'Procmon: Process Create PID 6096 dưới quyền NT AUTHORITY\\SYSTEM. Sysmon Event ID 1.'
      },
      {
        token: '//nologo',
        type: 'flag',
        syntax: '//nologo (Tắt dòng thông tin bản quyền và biểu ngữ Windows Script Host).',
        osHandling: 'Bỏ qua việc xuất chuỗi Microsoft (R) Windows Script Host ra luồng tiêu chuẩn stdout.',
        attackerObjective: 'Che giấu vết tích (Defense Evasion): Giữ cho cửa sổ dòng lệnh hoàn toàn im lặng nếu có ai đó đang quan sát console.',
        forensicArtifact: 'Dòng lệnh CommandLine trong Event ID 4688 lưu giữ chính xác cờ //nologo.'
      },
      {
        token: 'm.vbs',
        type: 'argument',
        syntax: 'Tệp kịch bản VBScript m.vbs nằm trong thư mục làm việc của WannaCry.',
        osHandling: 'Được thông dịch để gọi COM Object WScript.Shell, cập nhật Registry và ép hệ thống làm mới giao diện Desktop Wallpaper.',
        attackerObjective: 'Ép hình nền máy tính của nạn nhân đổi sang bức ảnh tống tiền @WanaDecryptor@.bmp để gây hoang mang và tống tiền.',
        forensicArtifact: 'Procmon: RegSetValue trên HKCU\\Control Panel\\Desktop\\Wallpaper thành tệp BMP của mã độc.'
      }
    ]
  }
];

export function CommandExplainer() {
  const [selectedCommandId, setSelectedCommandId] = useState('icacls');
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const currentCommand = useMemo(
    () => COMMANDS_DATA.find((c) => c.id === selectedCommandId) || COMMANDS_DATA[0],
    [selectedCommandId]
  );

  const currentToken = useMemo(
    () => currentCommand.tokens[selectedTokenIndex] || currentCommand.tokens[0],
    [currentCommand, selectedTokenIndex]
  );

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(currentCommand.fullCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTokenColorClass = (type, isSelected) => {
    if (isSelected) {
      return 'bg-blue-600 text-white font-semibold ring-2 ring-blue-400/40 shadow-sm';
    }
    switch (type) {
      case 'binary':
        return 'bg-purple-950/40 text-purple-300 border border-purple-800/40 hover:bg-purple-900/40';
      case 'flag':
        return 'bg-amber-950/40 text-amber-300 border border-amber-800/40 hover:bg-amber-900/40';
      case 'path':
        return 'bg-cyan-950/40 text-cyan-300 border border-cyan-800/40 hover:bg-cyan-900/40';
      case 'argument':
        return 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40 hover:bg-emerald-900/40';
      default:
        return 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800';
    }
  };

  return (
    <div className="w-full bg-[#0f1015] border border-[#1e2029] rounded-xl p-6 text-[#f4f4f7] font-sans shadow-2xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-[#1e2029] gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Token-by-Token Disassembler
            </span>
            <span className="text-xs font-mono text-zinc-500">Living-off-the-Land Command Inspector</span>
          </div>
          <h2 className="text-xl font-semibold text-zinc-100 mt-1 tracking-tight">
            Phân tích Cú pháp Lệnh Độc hại (Command Explainer)
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Bóc tách từng token tham số hệ thống mà WannaCry lợi dụng để vượt quyền, ẩn mình và tống tiền
          </p>
        </div>

        {/* Command Selector Tabs */}
        <div className="flex flex-wrap gap-1.5 bg-[#14151c] p-1 rounded-lg border border-[#1e2029]">
          {COMMANDS_DATA.map((cmd) => (
            <button
              key={cmd.id}
              onClick={() => {
                setSelectedCommandId(cmd.id);
                setSelectedTokenIndex(0);
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition flex items-center gap-1.5 ${
                selectedCommandId === cmd.id
                  ? 'bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              <Terminal className="w-3 h-3 text-zinc-500" />
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Command Box */}
      <div className="my-6 bg-[#14151c] border border-[#1e2029] rounded-lg p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono text-zinc-500 text-[11px]">Ngữ cảnh thực thi:</span>
            <span className="text-zinc-300 font-mono text-[11px] bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              {currentCommand.context}
            </span>
          </div>
          <button
            onClick={handleCopyCommand}
            className="flex items-center gap-1 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 transition bg-zinc-900 hover:bg-zinc-800 px-2.5 py-1 rounded border border-zinc-800"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Đã sao chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Sao chép lệnh</span>
              </>
            )}
          </button>
        </div>

        {/* Interactive Token Strip */}
        <div className="bg-[#090a0f] border border-zinc-800/80 rounded-lg p-4">
          <div className="text-[10px] font-mono text-zinc-500 mb-2 flex items-center gap-1">
            <Eye className="w-3 h-3 text-blue-400" />
            Nhấp hoặc di chuột vào từng token bên dưới để xem phân tích chi tiết:
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs md:text-sm">
            {currentCommand.tokens.map((t, idx) => {
              const isSelected = selectedTokenIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedTokenIndex(idx)}
                  className={`px-2.5 py-1.5 rounded transition cursor-pointer select-none ${getTokenColorClass(
                    t.type,
                    isSelected
                  )}`}
                >
                  {t.token}
                </button>
              );
            })}
          </div>

          {/* Quick Category Tag */}
          <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
            <span className="text-zinc-500">Phân loại kỹ thuật:</span>
            <span className="font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              {currentCommand.category}
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Token Explainer Card (4 Core Aspects) */}
      <div className="bg-[#14151c] border border-[#1e2029] rounded-lg p-5">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e2029] mb-4">
          <div className="flex items-center gap-2">
            <CornerDownRight className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-zinc-200">
              Chi tiết Token:{' '}
              <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 ml-1">
                {currentToken.token}
              </span>
            </h3>
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Token {selectedTokenIndex + 1} / {currentCommand.tokens.length}
          </span>
        </div>

        {/* 4 Aspect Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Token Syntax & Parameters */}
          <div className="bg-[#0f1015] border border-[#1e2029] rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-2">
              <Code className="w-3.5 h-3.5 text-blue-400" />
              <span>Cú pháp & Tham số (Syntax & Parameters)</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono bg-zinc-950 p-2.5 rounded border border-zinc-900">
              {currentToken.syntax}
            </p>
          </div>

          {/* Card 2: OS Handling */}
          <div className="bg-[#0f1015] border border-[#1e2029] rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-2">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Cơ chế Hệ điều hành (OS Handling)</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{currentToken.osHandling}</p>
          </div>

          {/* Card 3: Attacker Objective */}
          <div className="bg-[#0f1015] border border-[#1e2029] rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-2">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Mục tiêu của Kẻ tấn công (Attacker Objective)</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">{currentToken.attackerObjective}</p>
          </div>

          {/* Card 4: Forensic Artifact */}
          <div className="bg-[#0f1015] border border-[#1e2029] rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-2">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dấu vết Giám định (Forensic Artifact)</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-mono text-[11px]">
              {currentToken.forensicArtifact}
            </p>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#1e2029] text-xs">
          <button
            disabled={selectedTokenIndex === 0}
            onClick={() => setSelectedTokenIndex((prev) => Math.max(0, prev - 1))}
            className={`px-3 py-1.5 rounded border transition flex items-center gap-1 ${
              selectedTokenIndex === 0
                ? 'opacity-30 cursor-not-allowed bg-zinc-900 border-zinc-800 text-zinc-600'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
            }`}
          >
            &larr; Token trước
          </button>

          <div className="flex gap-1">
            {currentCommand.tokens.map((_, i) => (
              <span
                key={i}
                onClick={() => setSelectedTokenIndex(i)}
                className={`w-2 h-2 rounded-full cursor-pointer transition ${
                  selectedTokenIndex === i ? 'bg-blue-500 scale-125' : 'bg-zinc-800 hover:bg-zinc-600'
                }`}
              />
            ))}
          </div>

          <button
            disabled={selectedTokenIndex === currentCommand.tokens.length - 1}
            onClick={() =>
              setSelectedTokenIndex((prev) => Math.min(currentCommand.tokens.length - 1, prev + 1))
            }
            className={`px-3 py-1.5 rounded border transition flex items-center gap-1 ${
              selectedTokenIndex === currentCommand.tokens.length - 1
                ? 'opacity-30 cursor-not-allowed bg-zinc-900 border-zinc-800 text-zinc-600'
                : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 text-zinc-300'
            }`}
          >
            Token kế tiếp &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommandExplainer;
