// ==========================================
// WannaCry Analysis Dashboard - Unified Data
// ==========================================

window.glossaryData = {
  "localsystem": {
    "title": "NT AUTHORITY\\SYSTEM (LocalSystem)",
    "cat": "Windows Security Context",
    "def": "Tài khoản dịch vụ đặc quyền tối cao trong Windows NT, vượt trên cả tài khoản Administrator cục bộ.",
    "mech": "Được hệ điều hành nạp sẵn khi khởi động nhân Windows. Tiến trình chạy dưới quyền SYSTEM có toàn quyền can thiệp vào kernel, registry (HKLM), nạp driver thiết bị, và bỏ qua mọi rào cản phân quyền User Account Control (UAC).",
    "abuse": "WannaCry đăng ký dịch vụ mssecsvc2.0 và evmdthrukdvwcqn063 chạy dưới quyền SYSTEM. Điều này giúp bộ mã hóa tasksche.exe có thể can thiệp, đổi tên và mã hóa tệp tin trên toàn hệ thống mà không bao giờ bị báo lỗi Access Denied.",
    "defense": "Giám sát chặt chẽ Event ID 7045 (A new service was installed) và các tiến trình con được sinh ra bất thường từ services.exe hoặc cmd.exe mang token SYSTEM."
  },
  "services": {
    "title": "services.exe (Service Control Manager - SCM)",
    "cat": "Windows OS Core Subsystem",
    "def": "Tiến trình hệ thống cốt lõi quản lý toàn bộ vòng đời của các dịch vụ Windows (Windows Services).",
    "mech": "SCM duy trì cơ sở dữ liệu các dịch vụ tại HKLM\\SYSTEM\\CurrentControlSet\\Services. SCM là tiến trình cha (PPID 644) duy nhất có thẩm quyền khởi tạo, tạm dừng và giám sát trạng thái chạy ngầm của các dịch vụ Windows.",
    "abuse": "Mã độc gọi API CreateServiceA/W để thêm dịch vụ mới, sau đó yêu cầu SCM khởi động dịch vụ. Bằng cách này, mã độc ngụy trang hoàn hảo thành một tiến trình con hợp pháp của services.exe.",
    "defense": "Cấu hình cảnh báo SIEM/EDR khi có dịch vụ mới đăng ký đường dẫn thực thi nằm ngoài C:\\Windows\\System32\\ (ví dụ trỏ vào C:\\ProgramData\\ hoặc thư mục tạm)."
  },
  "flags_m": {
    "title": "Tham số cờ \"-m security\"",
    "cat": "Malware Internal CLI",
    "def": "Cờ dòng lệnh nội bộ độc quyền của WannaCry truyền vào binary ban đầu khi chạy dưới dạng service.",
    "mech": "Khi SCM thực thi Service Binary Path \"C:\\...\\sample.exe -m security\", hàm main() của mã độc đọc argc/argv. Cờ \"-m\" là viết tắt của \"mode\", giá trị \"security\" chỉ thị mã độc chạy ở chế độ Service Worker.",
    "abuse": "Kích hoạt mô-đun Service Worker chạy ngầm không hiển thị cửa sổ console hay GUI, lập tức tạo luồng kết nối cổng SMB TCP 445 để quét mạng nội bộ lây lan sang các máy tính khác qua lỗ hổng MS17-010.",
    "defense": "Nhận diện chữ ký dòng lệnh chứa \"-m security\" để cách ly tiến trình tức thì trên EDR."
  },
  "tasksche_i": {
    "title": "Tham số cờ \"/i\" (tasksche.exe /i)",
    "cat": "Malware Dropper Switch",
    "def": "Tham số dòng lệnh chỉ thị chế độ Install (Cài đặt) của tiến trình giải nén tasksche.exe.",
    "mech": "Mã độc thả C:\\Windows\\tasksche.exe rồi gọi CreateProcess với tham số \"/i\". Trình kiểm tra tham số kích hoạt đoạn mã đọc Resource section (.rsrc) chứa kho lưu trữ ZIP mã hóa.",
    "abuse": "Giải nén toàn bộ kho công cụ tống tiền vào thư mục C:\\ProgramData\\evmdthrukdvwcqn063\\, đăng ký dịch vụ thứ hai và tạo tệp c.wnry, t.wnry, taskhsvc.exe, @WanaDecryptor@.exe.",
    "defense": "Quy tắc Sigma / Sysmon phát hiện tiến trình tasksche.exe chạy với tham số /i sinh ra từ tiến trình không xác định."
  },
  "icacls": {
    "title": "Lệnh \"icacls . /grant Everyone:F /T /C /Q\"",
    "cat": "Windows File Security (ACL)",
    "def": "Công cụ dòng lệnh quản lý Access Control List (ACL) cho hệ thống tệp tin NTFS.",
    "mech": "icacls cập nhật Discretionary Access Control List (DACL) của Security Descriptor đối tượng tệp tin. Cờ /T duyệt đệ quy (traverse subdirectories), /C tiếp tục kể cả khi gặp lỗi, /Q chế độ im lặng, Everyone:F cấp Full Control cho mọi tài khoản.",
    "abuse": "Xóa bỏ mọi rào cản hạn chế quyền đọc/ghi trên thư mục làm việc ProgramData, đảm bảo mọi tiến trình con dù chạy dưới tài khoản nào cũng có quyền tối thượng.",
    "defense": "Khóa khả năng thực thi icacls từ các script không tin cậy; giám sát dòng lệnh thực thi icacls có chứa chuỗi \"Everyone:F\"."
  },
  "attrib": {
    "title": "Lệnh \"attrib +h .\"",
    "cat": "Windows File Attributes",
    "def": "Công cụ quản lý cờ thuộc tính siêu dữ liệu (Metadata Attributes) của tệp và thư mục trên DOS/Windows.",
    "mech": "Gán cờ FILE_ATTRIBUTE_HIDDEN (0x02) trong Master File Table (MFT) của phân vùng NTFS.",
    "abuse": "Che giấu thư mục làm việc C:\\ProgramData\\evmdthrukdvwcqn063\\ khỏi chế độ xem mặc định của Windows Explorer, khiến người dùng thông thường không nhìn thấy thư mục mã độc khi mở máy.",
    "defense": "Bật tùy chọn \"Show hidden files, folders, and drives\" trong Windows Explorer; cảnh báo EDR khi attrib.exe được gọi bởi tiến trình lạ."
  },
  "killswitch": {
    "title": "Cơ chế Kill-Switch (Công tắc Tự hủy)",
    "cat": "Anti-Analysis / Sandbox Evasion",
    "def": "Điều kiện rẽ nhánh nhị phân dựa trên kết nối mạng được cài cắm trong mã độc.",
    "mech": "Mã độc gọi hàm WinINet API (InternetOpenA, InternetOpenUrlA) gửi yêu cầu HTTP GET tới tên miền kill-switch. Nếu InternetOpenUrlA trả về handle hợp lệ (HTTP 200), mã độc gọi ExitProcess(0).",
    "abuse": "Tác giả thiết kế cơ chế này để phát hiện máy ảo sandbox phân tích mã độc (vốn thường phân giải và giả lập trả lời 200 OK cho mọi tên miền). Nhờ Marcus Hutchins đăng ký tên miền này, hàng trăm nghìn máy tính toàn cầu đã được kích hoạt chế độ tự hủy an toàn.",
    "defense": "Lưu ý phương pháp luận: Kill-switch là điều kiện logic nội tại của mã độc, không phải là lỗ hổng của Windows. Không thể dựa vào kill-switch như một biện pháp bảo mật dài hạn."
  },
  "cryptoapi": {
    "title": "Windows CryptoAPI (rsaenh.dll, CRYPTSP.dll)",
    "cat": "Cryptography Subsystem",
    "def": "Giao diện lập trình ứng dụng mật mã tích hợp sẵn trong hệ điều hành Microsoft Windows.",
    "mech": "Cung cấp các hàm CryptAcquireContext, CryptGenRandom, CryptImportKey, CryptEncrypt cho các ứng dụng native thông qua các Cryptographic Service Providers (CSP) như Microsoft Enhanced Cryptographic Provider (rsaenh.dll).",
    "abuse": "WannaCry sử dụng mô hình mã hóa lai (Hybrid Encryption): sinh khóa đối xứng AES-128 ngẫu nhiên qua CryptoAPI để mã hóa tệp cực nhanh, sau đó mã hóa khóa AES bằng khóa công khai RSA-2048 của kẻ tấn công trước khi ghi vào header tệp.",
    "defense": "Giám sát hành vi nạp rsaenh.dll kèm theo tần suất mở/ghi tệp tin hàng loạt trong thời gian ngắn (Ransomware Behavioral Heuristics)."
  },
  "file_lifecycle": {
    "title": "Vòng đời Tệp Tin (.WNCRYT -> .WNCRY)",
    "cat": "Atomic File Operation",
    "def": "Quy trình chuyển đổi tệp tin nguyên tử nhằm đảm bảo tính toàn vẹn của quá trình tống tiền.",
    "mech": "Mã độc đọc tệp gốc -> Mã hóa ra tệp tạm có đuôi mở rộng .WNCRYT -> Ghi header 8-byte WANACRY! -> Xóa tệp gốc -> Gọi lệnh I/O hệ thống SetRenameInformationFile để đổi tên tệp từ .WNCRYT sang .WNCRY.",
    "abuse": "Ngăn chặn việc tệp bị hỏng dở dang nếu hệ thống đột ngột mất điện; đồng thời hỗ trợ tiến trình dọn dẹp taskdl.exe dễ dàng dò quét và xóa tệp thừa.",
    "defense": "Quy tắc phát hiện tệp tin mới được tạo mang phần mở rộng kép hoặc phần mở rộng đáng ngờ .WNCRYT / .WNCRY."
  },
  "wanacry_header": {
    "title": "Header Nhị Phân \"WANACRY!\"",
    "cat": "Binary File Magic Header",
    "def": "Chuỗi định danh 8 byte (\"57 41 4E 41 43 52 59 21\") được ghi vào đầu mỗi tệp tin sau khi mã hóa.",
    "mech": "Nằm tại offset 0x00 của tệp tin bị khóa, theo sau là kích thước khối khóa đã mã hóa và khóa AES được bọc bằng RSA.",
    "abuse": "Giúp mã độc kiểm tra nhanh xem một tệp đã bị mã hóa hay chưa khi quét đĩa, tránh mã hóa 2 lần làm hỏng vĩnh viễn dữ liệu của nạn nhân.",
    "defense": "Sử dụng chữ ký YARA quét định kỳ hệ thống tệp để phát hiện các file mang magic bytes này."
  },
  "lotl": {
    "title": "Living off the Land (cmd.exe, cscript.exe)",
    "cat": "Attack Methodology",
    "def": "Chiến thuật tấn công tận dụng các công cụ và tiện ích quản trị hợp pháp có sẵn trong hệ điều hành Windows.",
    "mech": "Hệ điều hành xem cmd.exe, cscript.exe, icacls.exe, attrib.exe là các tệp nhị phân được Microsoft ký số tin cậy (Trusted Microsoft Binaries).",
    "abuse": "WannaCry không tự nhúng mã tạo shortcut hay sửa thuộc tính file vào binary chính mà gọi các tiện ích này ở chế độ nền để giảm thiểu dung lượng file và né tránh sự nghi ngờ của các công cụ diệt virus đơn giản.",
    "defense": "Giám sát tiến trình cha - con bất thường: Cảnh báo khi một tiến trình lạ trong ProgramData gọi cmd.exe hoặc cscript.exe."
  },
  "ms17010": {
    "title": "Lỗ hổng MS17-010 / EternalBlue",
    "cat": "Remote Code Execution Vulnerability",
    "def": "Lỗ hổng tràn bộ đệm nghiêm trọng trong giao thức chia sẻ tệp SMBv1 (Server Message Block) của Microsoft Windows.",
    "mech": "Lỗi xử lý gói tin SMBv1 FEA (File Extended Attribute) cho phép kẻ tấn công gửi gói tin độc hại qua cổng TCP 445 làm tràn bộ đệm kernel (srv.sys).",
    "abuse": "WannaCry tích hợp mã khai thác EternalBlue để quét toàn bộ dải mạng LAN và Internet, tự động chiếm quyền SYSTEM trên các máy tính chưa vá mà không cần người dùng thao tác.",
    "defense": "Cài đặt bản vá bảo mật khẩn cấp MS17-010 (KB4012212, KB4012215) và vô hiệu hóa hoàn toàn giao thức SMBv1 trên toàn mạng."
  }
};

window.behaviorsData = [
  {
    "id": "behavior-01",
    "num": "01",
    "cat": "Network Branching & Evasion",
    "title": "Cơ Chế Công Tắc Hủy (Kill-Switch) & Rẽ Nhánh Thực Thi",
    "badge": "HTTP 200 OK → Exit Code 0",
    "step1_concept": "Kill-switch là một điều kiện rẽ nhánh logic do tác giả cài đặt vào mã độc. Nhiều nhà nghiên cứu nhận định tính năng này ban đầu được dùng như cơ chế chống máy ảo/sandbox phân tích tự động (Anti-Analysis): trong môi trường lab tự động, các công cụ phân tích thường phân giải và giả lập trả lời 200 OK cho mọi yêu cầu mạng, khiến mã độc lầm tưởng nó đang bị theo dõi và lập tức tự kết thúc để giấu hành vi.",
    "step2_params": "Mã độc gọi WinINet API gửi yêu cầu HTTP GET tới tên miền: www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com (chưa từng được đăng ký trước ngày 12/05/2017).",
    "step3_os": "Hệ điều hành Windows xử lý qua wininet.dll. Nếu hàm InternetOpenUrlA thành công và nhận mã phản hồi HTTP 200, luồng điều khiển nhảy tới lời gọi ExitProcess(0). Nếu kết nối thất bại hoặc Timeout (thử lại 4 lần), hàm trả về NULL và kích hoạt Kịch bản B.",
    "step4_cause": "Quyết định rẽ nhánh nhị phân tối hậu: Nhận HTTP 200 OK -> PID 6520 tự hủy sạch trong 0.89 giây, 0 tệp bị đổi. Mất kết nối mạng -> ngay lập tức khởi tạo Dịch vụ mssecsvc2.0 và bắt đầu chuỗi phá hủy.",
    "evidence_a": {
      "tool": "Burp Suite Pro",
      "title": "Burp Suite Pro: Bắt gói tin Kill-switch HTTP 200",
      "file": "screenshots/A_burp_item4_host_verified_vmware.png",
      "caption": "Item #4 lúc 11:44:17. Gói tin HTTP 200 OK (155 bytes) chặn đứng đợt tấn công từ PID 6520.",
      "breakdown": [
        {
          "field": "Target URL",
          "val": "www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com"
        },
        {
          "field": "HTTP Method",
          "val": "GET / HTTP/1.1 (Cổng 80)"
        },
        {
          "field": "Response",
          "val": "HTTP/1.1 200 OK (Mock Server)"
        },
        {
          "field": "Content-Length",
          "val": "155 bytes"
        }
      ]
    },
    "evidence_b": {
      "tool": "Process Monitor",
      "title": "Procmon: Tiến trình tự hủy với Exit Code 0",
      "file": "screenshots/A_run_direct_launch_1143_vmware.png",
      "caption": "Bản ghi Procmon xác minh PID 6520 kết thúc với Exit Status: 0, thời gian sống tổng cộng 0.8922 giây.",
      "breakdown": [
        {
          "field": "Process Name",
          "val": "24d004a1...exe (PID 6520)"
        },
        {
          "field": "Event",
          "val": "Process Exit"
        },
        {
          "field": "Exit Status",
          "val": "0 (SUCCESS)"
        },
        {
          "field": "Total Lifetime",
          "val": "0.8922 giây (11:44:16 -> 11:44:17)"
        }
      ]
    },
    "boundary_proven": "Chứng minh mã độc hoàn toàn phụ thuộc vào phản hồi mạng từ URL trên. Có HTTP 200 là tự dừng ngay mà không sinh thêm bất kỳ tiến trình nào hay mã hóa file.",
    "boundary_limit": "Kill-switch là điều kiện logic của mã độc, KHÔNG PHẢI là lỗ hổng của Windows. Việc tiến trình thoát mã 0 không chứng minh mã độc đã bị xóa khỏi đĩa cứng hay hệ thống đã an toàn tuyệt đối.",
    "terms": [
      "killswitch",
      "localsystem"
    ]
  },
  {
    "id": "behavior-02",
    "num": "02",
    "cat": "System Persistence",
    "title": "Đăng Ký Dịch Vụ Windows Ngầm (mssecsvc2.0 Quyền SYSTEM)",
    "badge": "Start Type = Auto Start (2)",
    "step1_concept": "Thay vì dùng khóa Run trong Registry dễ bị Antivirus phát hiện, WannaCry sử dụng API của Windows Service Control Manager (SCM) để đăng ký dịch vụ hệ thống chạy vĩnh viễn dưới tài khoản quyền lực nhất: NT AUTHORITY\\SYSTEM.",
    "step2_params": "Dịch vụ gọi binary: C:\\LabLive\\Sample_ready\\24d004a1...exe -m security. Cờ \"-m security\" chỉ thị chạy ở chế độ Service Worker ngầm và kích hoạt luồng quét mạng lây lan SMB.",
    "step3_os": "Cấu hình được ghi trực tiếp vào HKLM\\SYSTEM\\CurrentControlSet\\Services\\mssecsvc2.0 với thuộc tính Start = 2 (SERVICE_AUTO_START). SCM (services.exe) sẽ tự động nạp tiến trình này mỗi khi máy tính khởi động trước khi người dùng đăng nhập.",
    "step4_cause": "Xảy ra ngay sau khi kết nối mạng tới kill-switch thất bại 4 lần. Dịch vụ này đóng vai trò máy chủ điều phối cấp cao để sinh ra tiến trình thả payload tasksche.exe.",
    "evidence_a": {
      "tool": "Process Hacker",
      "title": "Process Hacker: Thuộc tính dịch vụ mssecsvc2.0",
      "file": "screenshots/B_service_mssecsvc_properties_vmware.png",
      "caption": "Xác minh đường dẫn binary chứa cờ -m security, tài khoản thực thi LocalSystem và chế độ Auto start.",
      "breakdown": [
        {
          "field": "Service Name",
          "val": "mssecsvc2.0 (Display: Microsoft Security Center (2.0))"
        },
        {
          "field": "Binary Path",
          "val": "C:\\LabLive\\Sample_ready\\24d004a1...exe -m security"
        },
        {
          "field": "Service Account",
          "val": "NT AUTHORITY\\LocalSystem"
        },
        {
          "field": "Start Type",
          "val": "Auto start (2)"
        }
      ]
    },
    "evidence_b": {
      "tool": "Process Hacker",
      "title": "Process Hacker: Trạng thái Running của mssecsvc2.0",
      "file": "screenshots/B_service_mssecsvc_selected_vmware.png",
      "caption": "Tab Services hiển thị dịch vụ độc hại ngụy trang với trạng thái Running, PID 5272.",
      "breakdown": [
        {
          "field": "Status",
          "val": "Running (Đang thực thi ngầm)"
        },
        {
          "field": "PID Assigned",
          "val": "5272"
        },
        {
          "field": "Parent Process",
          "val": "services.exe (PID 644)"
        },
        {
          "field": "Registry Key",
          "val": "HKLM\\SYSTEM\\CurrentControlSet\\Services\\mssecsvc2.0"
        }
      ]
    },
    "boundary_proven": "Chứng minh cơ chế Persistence sống sót sau Reboot: Dù máy tính khởi động lại, dịch vụ vẫn tự chạy lại với quyền SYSTEM.",
    "boundary_limit": "Do máy ảo bị cô lập mạng vật lý, nhánh quét SMB port 445 của service này không phát tán sang máy khác được.",
    "terms": [
      "localsystem",
      "services",
      "flags_m",
      "ms17010"
    ]
  },
  {
    "id": "behavior-03",
    "num": "03",
    "cat": "Dropper & Payload Extraction",
    "title": "Thả Payload & Giải Nén Vào Thư Mục Hệ Thống (tasksche.exe /i)",
    "badge": "Dropped → C:\\ProgramData\\evmdthruk...",
    "step1_concept": "Mẫu ban đầu không trực tiếp mã hóa mà đóng vai trò \"Dropper\" (Bộ giải nén chứa payload). Nó chứa một kho tệp nén ZIP mã hóa mật khẩu trong tài nguyên (.rsrc) chứa toàn bộ công cụ tống tiền.",
    "step2_params": "Tiến trình gọi: C:\\WINDOWS\\tasksche.exe /i. Cờ \"/i\" là cờ cài đặt (Install), hướng dẫn mã độc giải nén toàn bộ payload vào thư mục C:\\ProgramData\\evmdthrukdvwcqn063\\ và đăng ký dịch vụ thứ hai.",
    "step3_os": "Hệ điều hành cấp phát không gian trong ProgramData (thư mục chia sẻ toàn hệ thống không yêu cầu quyền riêng của từng user) để mọi tài khoản trên máy đều bị ảnh hưởng.",
    "step4_cause": "Sau khi giải nén xong, tệp tasksche.exe trong ProgramData (PID 3760) được kích hoạt dưới quyền SYSTEM thông qua vỏ bọc cmd.exe. Đây chính là tiến trình chịu trách nhiệm quét và mã hóa file.",
    "evidence_a": {
      "tool": "Process Monitor",
      "title": "Procmon: Cây tiến trình mở rộng 15 nhánh",
      "file": "screenshots/B_procmon_tree_expanded_vmware.png",
      "caption": "Nhánh thực thi từ services.exe -> PID 5272 -> tasksche.exe /i (PID 6724) -> tasksche.exe (PID 3760).",
      "breakdown": [
        {
          "field": "Dropper Path",
          "val": "C:\\WINDOWS\\tasksche.exe"
        },
        {
          "field": "Command Flag",
          "val": "/i (Install)"
        },
        {
          "field": "Extracted Dir",
          "val": "C:\\ProgramData\\evmdthrukdvwcqn063\\"
        },
        {
          "field": "Installer PID",
          "val": "6724 (Parent: 5152)"
        }
      ]
    },
    "evidence_b": {
      "tool": "Process Monitor",
      "title": "Procmon: Bản ghi định danh tiến trình PID 3760 SYSTEM",
      "file": "screenshots/B_procmon_event_process_identity_vmware.png",
      "caption": "Bản ghi chi tiết sự kiện của PID 3760 xác minh User: NT AUTHORITY\\SYSTEM.",
      "breakdown": [
        {
          "field": "Core Encryptor",
          "val": "tasksche.exe (PID 3760)"
        },
        {
          "field": "User Context",
          "val": "NT AUTHORITY\\SYSTEM"
        },
        {
          "field": "Integrity Level",
          "val": "System Integrity"
        },
        {
          "field": "Session ID",
          "val": "0 (Non-interactive Service Session)"
        }
      ]
    },
    "boundary_proven": "Chứng minh quá trình chuyển giao vai trò từ Dropper ban đầu sang Payload độc lập trong ProgramData.",
    "boundary_limit": "Không thể đọc trực tiếp mật khẩu giải nén ZIP tài nguyên nếu chỉ nhìn log Procmon (cần dịch ngược tĩnh file nhị phân).",
    "terms": [
      "tasksche_i",
      "localsystem",
      "services"
    ]
  },
  {
    "id": "behavior-04",
    "num": "04",
    "cat": "Defense Evasion & Privilege Escalation",
    "title": "Thao Túng Thuộc Tính Ẩn & Quyền Hệ Thống (icacls & attrib)",
    "badge": "icacls Everyone:F & attrib +h",
    "step1_concept": "Để ngăn chặn người dùng hoặc phần mềm bảo vệ xóa thư mục mã hóa hoặc truy cập tệp cấu hình, mã độc sử dụng công cụ dòng lệnh có sẵn của Windows (Living off the Land) để ẩn mình và mở rộng quyền truy cập.",
    "step2_params": "Mã độc thực thi 2 lệnh đồng thời: 1) attrib +h . (gán thuộc tính Ẩn cho thư mục hiện tại); 2) icacls . /grant Everyone:F /T /C /Q (cấp toàn quyền Full Control đệ quy cho nhóm Everyone).",
    "step3_os": "Windows áp dụng Access Control Entry (ACE) mới vào Security Descriptor của thư mục và gán cờ FILE_ATTRIBUTE_HIDDEN vào Master File Table (MFT), đảm bảo mọi tiến trình con không bị lỗi Access Denied.",
    "step4_cause": "Lệnh này chạy ngay trước khi đợt mã hóa hàng loạt bắt đầu, dọn đường cho việc ghi đè dữ liệu diễn ra trơn tru mà không bị xung đột phân quyền.",
    "evidence_a": {
      "tool": "Process Hacker",
      "title": "Process Hacker: Danh sách Handles của tasksche.exe",
      "file": "screenshots/B_processhacker_tasksche_handles_vmware.png",
      "caption": "Mutant MsWinZonesCacheCounterMutexA, Mutex và File handles đang mở bởi tasksche.exe.",
      "breakdown": [
        {
          "field": "Mutant Handle",
          "val": "MsWinZonesCacheCounterMutexA"
        },
        {
          "field": "Directory Handle",
          "val": "C:\\ProgramData\\evmdthrukdvwcqn063\\"
        },
        {
          "field": "Access Mask",
          "val": "All Access / Full Control"
        },
        {
          "field": "Sub-processes",
          "val": "icacls.exe (PID 2064), attrib.exe (PID 5808)"
        }
      ]
    },
    "evidence_b": {
      "tool": "Process Monitor",
      "title": "Procmon: Chuỗi sự kiện can thiệp tệp tin và lệnh",
      "file": "screenshots/B_procmon_decoy_events_vmware.png",
      "caption": "Nhật ký Procmon ghi nhận các sự kiện CreateFile, WriteFile trên thư mục mã độc và thư mục Decoys.",
      "breakdown": [
        {
          "field": "icacls Syntax",
          "val": "icacls . /grant Everyone:F /T /C /Q"
        },
        {
          "field": "attrib Syntax",
          "val": "attrib +h ."
        },
        {
          "field": "Console Host",
          "val": "conhost.exe 0xffffffff -ForceV1"
        },
        {
          "field": "Procmon Records",
          "val": "216 rows (icacls) + 7 rows (attrib)"
        }
      ]
    },
    "boundary_proven": "Chứng minh mã độc tận dụng các công cụ hệ thống hợp pháp (LotL) để thao túng quyền tệp và né tránh phát hiện.",
    "boundary_limit": "Lệnh icacls này chỉ tác động lên thư mục của mã độc trong ProgramData, không tác động trực tiếp lên toàn bộ ổ đĩa C.",
    "terms": [
      "icacls",
      "attrib",
      "lotl",
      "localsystem"
    ]
  },
  {
    "id": "behavior-05",
    "num": "05",
    "cat": "Cryptographic Impact",
    "title": "Vòng Đời Mã Hóa Tệp Mồi Decoy & Header Nhị Phân WANACRY!",
    "badge": "SetRenameInformationFile (.WNCRY)",
    "step1_concept": "Lưu ý phương pháp luận: Cần phân biệt rõ giữa \"Quan sát thấy tệp bị thay đổi\" và \"Chứng minh thuật toán/quản lý khóa mã hóa\". Qua phân tích động (Dynamic), ta xác minh được vòng đời biến đổi tệp tin; còn cấu trúc khóa AES-128 / RSA-2048 phải kiểm chứng qua các thư viện CryptoAPI được nạp (rsaenh.dll, CRYPTSP.dll).",
    "step2_params": "Mã độc quét đĩa, đọc file gốc -> mã hóa trong bộ nhớ -> ghi ra file tạm .WNCRYT chứa header 8-byte WANACRY! -> xóa file gốc -> gọi SetRenameInformationFile đổi tên sang .WNCRY.",
    "step3_os": "Hệ điều hành Windows xử lý thao tác đổi tên nguyên tử (Atomic Rename) qua I/O Manager, đảm bảo dữ liệu không bị hỏng nếu hệ thống mất điện giữa chừng.",
    "step4_cause": "100% tệp mồi Decoy (inventory.csv, lab_document.rtf, student_notes.txt) bị mã hóa trong chưa đầy 12 mili-giây. Kích thước file tăng lên đúng bằng khối header metadata WANACRY! cộng thêm padding AES.",
    "evidence_a": {
      "tool": "Process Monitor",
      "title": "Procmon: Thuộc tính đổi tên sang đuôi .WNCRY",
      "file": "screenshots/B_procmon_rename_properties_vmware.png",
      "caption": "Chi tiết sự kiện SetRenameInformationFile: FileName đổi từ inventory.csv.WNCRYT sang inventory.csv.WNCRY.",
      "breakdown": [
        {
          "field": "Operation",
          "val": "SetRenameInformationFile"
        },
        {
          "field": "Source Path",
          "val": "C:\\LabLive\\Decoys\\inventory.csv.WNCRYT"
        },
        {
          "field": "Target Path",
          "val": "C:\\LabLive\\Decoys\\inventory.csv.WNCRY"
        },
        {
          "field": "Process",
          "val": "tasksche.exe (PID 3760 SYSTEM)"
        }
      ]
    },
    "evidence_b": {
      "tool": "Windows Explorer",
      "title": "Explorer: 3 Tệp mồi bị khóa và đổi hình nền",
      "file": "screenshots/B_decoys_encrypted_host_verified_vmware.png",
      "caption": "File Explorer xác minh 3 tệp mồi mang biểu tượng khóa .WNCRY kèm file @Please_Read_Me@.txt và hình nền đen.",
      "breakdown": [
        {
          "field": "Decoys Affected",
          "val": "3/3 tệp (inventory.csv, lab_doc.rtf, notes.txt)"
        },
        {
          "field": "Ransom Note",
          "val": "@Please_Read_Me@.txt"
        },
        {
          "field": "Magic Header",
          "val": "WANACRY! (Offset 0x00)"
        },
        {
          "field": "Wallpaper",
          "val": "Đổi sang màu đen cảnh báo nạn nhân"
        }
      ]
    },
    "boundary_proven": "Chứng minh vòng đời tệp tin nguyên tử, header WANACRY! và thiệt hại 100% dữ liệu mồi.",
    "boundary_limit": "Không thể khôi phục dữ liệu nếu không có Private Key RSA-2048 của kẻ tấn công (hoặc công cụ phục hồi bộ nhớ wanakiwi khi chưa reboot).",
    "terms": [
      "file_lifecycle",
      "wanacry_header",
      "cryptoapi"
    ]
  },
  {
    "id": "behavior-06",
    "num": "06",
    "cat": "Extortion & Impact",
    "title": "Giao Diện Tống Tiền Wana Decrypt0r 2.0 & Đòi Tiền Chuộc",
    "badge": "Wana Decrypt0r 2.0 & $300 BTC",
    "step1_concept": "Sau khi hoàn tất mã hóa các tài liệu quan trọng, mã độc thông báo cho nạn nhân biết dữ liệu đã bị khóa và hướng dẫn cách nộp tiền chuộc để kẻ tấn công thu lợi bất chính.",
    "step2_params": "Tiến trình @WanaDecryptor@.exe (PID 1752) được khởi chạy. Nạp các thư viện giao diện MFC42.DLL, COMCTL32.dll, RICHED20.dll.",
    "step3_os": "Mã độc gọi API SystemParametersInfoW(SPI_SETDESKWALLPAPER) trỏ vào tệp bitmap tạo sẵn để đổi hình nền toàn hệ thống. Đồng thời gọi cscript.exe //nologo m.vbs tạo shortcut @WanaDecryptor@.exe.lnk trên Desktop.",
    "step4_cause": "Mắt xích cuối cùng của chiến dịch tấn công trên máy tính nạn nhân, tạo áp lực tâm lý bằng 2 đồng hồ đếm ngược.",
    "evidence_a": {
      "tool": "Ransomware GUI",
      "title": "Ransom GUI: Giao diện Wana Decrypt0r 2.0 kèm nhãn sinh viên",
      "file": "screenshots/B_ransom_gui_final_identity_vmware.png",
      "caption": "Cửa sổ Wana Decrypt0r 2.0 hiển thị 2 đồng hồ đếm ngược, đòi 300$ Bitcoin về ví 115p7UMM... kèm nhãn Nguyen Van Bach (DE200409).",
      "breakdown": [
        {
          "field": "Ransom Amount",
          "val": "$300 USD (bằng Bitcoin)"
        },
        {
          "field": "BTC Wallet",
          "val": "115p7UMMngoj1pMvkpHijcRdfJNXj6LrLn"
        },
        {
          "field": "Timer 1 (Double price)",
          "val": "3 ngày (Tăng lên $600)"
        },
        {
          "field": "Timer 2 (Delete files)",
          "val": "7 ngày (Xóa vĩnh viễn)"
        },
        {
          "field": "Student Tag",
          "val": "Nguyen Van Bach (DE200409)"
        }
      ]
    },
    "evidence_b": {
      "tool": "Process Hacker",
      "title": "Process Hacker: Loaded Modules CryptoAPI và GUI MFC",
      "file": "screenshots/B_processhacker_tasksche_modules_vmware.png",
      "caption": "Process Hacker xác minh danh mục DLLs: rsaenh.dll, CRYPTSP.dll, MFC42.DLL nạp vào bộ nhớ.",
      "breakdown": [
        {
          "field": "Crypto Providers",
          "val": "rsaenh.dll, CRYPTSP.dll, CRYPTBASE.dll"
        },
        {
          "field": "GUI Libraries",
          "val": "MFC42.DLL, COMCTL32.dll, RICHED20.dll"
        },
        {
          "field": "Process Memory",
          "val": "Working Set ~ 18.4 MB"
        },
        {
          "field": "Window Handle",
          "val": "WanaCrypt0r v2.0 TopMost Window"
        }
      ]
    },
    "boundary_proven": "Chứng minh toàn bộ chuỗi tống tiền diễn ra hoàn chỉnh và tự động trong môi trường lab cô lập.",
    "boundary_limit": "Nút \"Check Payment\" và \"Decrypt\" trên giao diện không thể hoạt động do máy ảo không có kết nối ra mạng Tor/Internet.",
    "terms": [
      "lotl",
      "cryptoapi"
    ]
  }
];

window.processesData = [
  {
    "pid": 5152,
    "name": "24d004a1...exe",
    "ppid": 4872,
    "parent": "powershell.exe",
    "rows": 32,
    "user": "bachdeptrai",
    "cmd": "C:\\LabLive\\Sample_ready\\24d004a104d4d54034dbcffc2a4b19a11f39008a575aa614ea04703480b1022c.exe",
    "role": "Mẫu thực thi gốc (Root runner / Dropper)",
    "desc": "Mẫu độc hại ban đầu được kích hoạt trực tiếp trong lab. Hành vi đầu tiên là kết nối mạng TCP cổng 80 để kiểm tra kill-switch. Khi mạng không phản hồi (thử lại 4 lần), tiến trình này lập tức rẽ nhánh sang Kịch bản B: đăng ký dịch vụ mssecsvc2.0, thả tệp C:\\Windows\\tasksche.exe và khởi chạy tiến trình cài đặt PID 6724.",
    "impact": "Tạo kết nối mạng tới 127.0.0.1:80; đăng ký dịch vụ Windows ngầm; thả tệp thực thi vào thư mục hệ thống C:\\Windows\\.",
    "insight": "Mắt xích khởi động toàn bộ chiến dịch tấn công. Quyết định sự phân nhánh nhị phân giữa tự hủy an toàn (Kịch bản A) hay phá hủy toàn bộ hệ thống (Kịch bản B).",
    "flags": [
      {
        "flag": "[Mặc định]",
        "meaning": "Không truyền tham số dòng lệnh; tiến trình chạy chế độ phân nhánh ban đầu."
      }
    ],
    "terms": [
      "killswitch",
      "services"
    ],
    "behavior_ref": "behavior-01"
  },
  {
    "pid": 5272,
    "name": "24d004a1...exe",
    "ppid": 644,
    "parent": "services.exe",
    "rows": 60,
    "user": "NT AUTHORITY\\SYSTEM",
    "cmd": "C:\\LabLive\\Sample_ready\\24d004a1...exe -m security",
    "role": "Dịch vụ mssecsvc2.0 (Lan truyền mạng SMB)",
    "desc": "Được Windows Service Control Manager (services.exe) khởi chạy tự động dưới quyền SYSTEM tối cao. Cờ \"-m security\" báo hiệu chế độ Service Worker chạy ngầm không giao diện. Mục đích chính là khởi động mô-đun quét mạng nội bộ cổng SMB 445 để khai thác lỗ hổng MS17-010 lây lan sang máy khác (bị chặn lại do card mạng bị cô lập).",
    "impact": "Thiết lập cơ chế tự khởi động vĩnh viễn (Start = 2) trong HKLM\\SYSTEM\\CurrentControlSet\\Services\\mssecsvc2.0.",
    "insight": "Cơ chế Persistence sống sót sau Reboot. Dù người dùng có đăng xuất hay khởi động lại máy, dịch vụ này vẫn tự động nạp lại dưới quyền SYSTEM.",
    "flags": [
      {
        "flag": "-m security",
        "meaning": "Chế độ Service Worker chạy ngầm không giao diện, kích hoạt module quét mạng SMB 445 lây lan qua MS17-010."
      }
    ],
    "terms": [
      "localsystem",
      "services",
      "flags_m",
      "ms17010"
    ],
    "behavior_ref": "behavior-02"
  },
  {
    "pid": 6724,
    "name": "tasksche.exe",
    "ppid": 5152,
    "parent": "24d004a1...exe",
    "rows": 8,
    "user": "bachdeptrai",
    "cmd": "C:\\WINDOWS\\tasksche.exe /i",
    "role": "Bộ giải nén tệp độc hại (Installer)",
    "desc": "Được PID 5152 sinh ra từ tệp dropper C:\\Windows\\tasksche.exe với tham số \"/i\" (Install). Nhiệm vụ là giải nén kho tài nguyên ZIP mã hóa trong phần .rsrc của binary vào thư mục chia sẻ C:\\ProgramData\\evmdthrukdvwcqn063\\, đồng thời đăng ký dịch vụ thứ hai để kích hoạt bộ mã hóa chính.",
    "impact": "Tạo thư mục ngẫu nhiên trong ProgramData; giải nén toàn bộ tệp payload tống tiền (.wnry, .pky, .eky, @WanaDecryptor@.exe).",
    "insight": "Cầu nối chuyển giao trách nhiệm từ Dropper ban đầu sang Payload tống tiền độc lập, che giấu đường dẫn tệp thực thi gốc.",
    "flags": [
      {
        "flag": "/i",
        "meaning": "Cờ Install (Cài đặt) kích hoạt giải nén kho tài nguyên mã hóa từ resource section .rsrc ra ProgramData."
      }
    ],
    "terms": [
      "tasksche_i",
      "localsystem",
      "services"
    ],
    "behavior_ref": "behavior-03"
  },
  {
    "pid": 1152,
    "name": "cmd.exe",
    "ppid": 644,
    "parent": "services.exe",
    "rows": 11,
    "user": "NT AUTHORITY\\SYSTEM",
    "cmd": "cmd.exe /c \"C:\\ProgramData\\evmdthrukdvwcqn063\\tasksche.exe\"",
    "role": "Vỏ bọc kích hoạt dịch vụ (Service Wrapper)",
    "desc": "Sinh ra bởi services.exe để làm môi trường vỏ bọc dòng lệnh (Command Shell Wrapper) kích hoạt dịch vụ evmdthrukdvwcqn063. Chạy với tham số /c để thực thi tasksche.exe trong ProgramData dưới quyền SYSTEM.",
    "impact": "Nâng quyền thực thi của payload lên NT AUTHORITY\\SYSTEM thông qua dịch vụ hệ thống.",
    "insight": "Kỹ thuật Living off the Land (LotL) tận dụng cmd.exe chuẩn của Windows để làm đệm kích hoạt mã độc.",
    "flags": [
      {
        "flag": "/c",
        "meaning": "Carries out the command specified by string and then terminates (chạy lệnh xong tự thoát)."
      }
    ],
    "terms": [
      "lotl",
      "localsystem",
      "services"
    ],
    "behavior_ref": "behavior-03"
  },
  {
    "pid": 3760,
    "name": "tasksche.exe",
    "ppid": 1152,
    "parent": "cmd.exe",
    "rows": 271536,
    "user": "NT AUTHORITY\\SYSTEM",
    "cmd": "C:\\ProgramData\\evmdthrukdvwcqn063\\tasksche.exe",
    "role": "Bộ mã hóa cốt lõi (Core Encryptor)",
    "desc": "Tiến trình nguy hiểm và hoạt động mạnh nhất toàn bộ chiến dịch (chiếm 271,536 trên tổng số 271,958 bản ghi Procmon). Nạp các nhà cung cấp mật mã Windows CryptoAPI (rsaenh.dll, CRYPTSP.dll), quét toàn bộ cây thư mục người dùng, mã hóa file thành .WNCRY, ghi header WANACRY! và điều phối toàn bộ các tiến trình con.",
    "impact": "Mã hóa 100% dữ liệu mồi Decoy; tạo file thông điệp @Please_Read_Me@.txt; sinh các tiến trình con icacls, attrib, taskdl, cscript.",
    "insight": "Trọng tâm phá hoại của ransomware. Hoạt động liên tục dưới quyền SYSTEM đảm bảo không bị gián đoạn bởi các chính sách bảo mật thông thường.",
    "flags": [
      {
        "flag": "[Mặc định]",
        "meaning": "Chạy chế độ quét toàn bộ ổ đĩa và mã hóa dữ liệu hàng loạt."
      }
    ],
    "terms": [
      "cryptoapi",
      "file_lifecycle",
      "wanacry_header",
      "localsystem"
    ],
    "behavior_ref": "behavior-05"
  },
  {
    "pid": 2064,
    "name": "icacls.exe",
    "ppid": 3760,
    "parent": "tasksche.exe",
    "rows": 216,
    "user": "NT AUTHORITY\\SYSTEM",
    "cmd": "icacls . /grant Everyone:F /T /C /Q",
    "role": "Phân toàn quyền thư mục (ACL Manipulation)",
    "desc": "Được PID 3760 gọi để thao túng Access Control List (ACL) của thư mục payload hiện tại. Lệnh cấp quyền Full Control (F) đệ quy (/T) cho nhóm \"Everyone\", đảm bảo mọi tiến trình con hoặc dịch vụ chạy dưới bất kỳ tài khoản nào đều có thể đọc/ghi tệp mà không bị lỗi Access Denied.",
    "impact": "Thay đổi Security Descriptor của thư mục ProgramData; vô hiệu hóa hàng rào kiểm soát truy cập tệp.",
    "insight": "MITRE ATT&CK T1222.001 (File Permissions Modification) và T1490 (Inhibit System Recovery). Hành vi phòng thủ né tránh chủ động.",
    "flags": [
      {
        "flag": ".",
        "meaning": "Thư mục làm việc hiện tại (C:\\ProgramData\\evmdthrukdvwcqn063\\)."
      },
      {
        "flag": "/grant Everyone:F",
        "meaning": "Cấp đặc quyền Full Control (F) tối cao cho nhóm Everyone."
      },
      {
        "flag": "/T",
        "meaning": "Duyệt đệ quy (Traverse) áp dụng cho mọi tệp tin và thư mục con."
      },
      {
        "flag": "/C",
        "meaning": "Tiếp tục thực thi kể cả khi gặp lỗi truy cập tệp tạm."
      },
      {
        "flag": "/Q",
        "meaning": "Chế độ im lặng (Quiet), không in banner thông báo ra console."
      }
    ],
    "terms": [
      "icacls",
      "lotl",
      "localsystem"
    ],
    "behavior_ref": "behavior-04"
  },
  {
    "pid": 5808,
    "name": "attrib.exe",
    "ppid": 3760,
    "parent": "tasksche.exe",
    "rows": 7,
    "user": "NT AUTHORITY\\SYSTEM",
    "cmd": "attrib +h .",
    "role": "Ẩn thư mục payload (Defense Evasion)",
    "desc": "Được PID 3760 gọi để gán thuộc tính Ẩn (Hidden +h) cho thư mục hiện hành C:\\ProgramData\\evmdthrukdvwcqn063\\, che giấu sự hiện diện của thư mục chứa bộ mã hóa khỏi tầm nhìn của người dùng khi duyệt File Explorer thông thường.",
    "impact": "Gán cờ FILE_ATTRIBUTE_HIDDEN cho thư mục làm việc của mã độc.",
    "insight": "MITRE ATT&CK T1564.001 (Hide Artifacts). Cố gắng trì hoãn sự phát hiện và ngăn cản người dùng xóa thư mục bằng tay.",
    "flags": [
      {
        "flag": "+h",
        "meaning": "Gán thuộc tính Hidden (ẩn tệp/thư mục) trong File Allocation Table/NTFS MFT."
      },
      {
        "flag": ".",
        "meaning": "Thư mục làm việc hiện hành."
      }
    ],
    "terms": [
      "attrib",
      "lotl"
    ],
    "behavior_ref": "behavior-04"
  },
  {
    "pid": 3888,
    "name": "cmd.exe",
    "ppid": 3760,
    "parent": "tasksche.exe",
    "rows": 20,
    "user": "NT AUTHORITY\\SYSTEM",
    "cmd": "cmd.exe /c 116221791435459.bat",
    "role": "Thực thi kịch bản dọn dẹp (Script Launcher)",
    "desc": "Môi trường đệm dòng lệnh do PID 3760 tạo ra để thực thi tập lệnh batch tạm thời mang tên ngẫu nhiên dạng số. Chịu trách nhiệm gọi cscript.exe để tạo phím tắt tống tiền trên màn hình Desktop của mọi phiên người dùng.",
    "impact": "Khởi chạy cscript.exe thực thi script m.vbs; mở các luồng xử lý kịch bản nội bộ.",
    "insight": "Kỹ thuật Living off the Land (LotL): Tận dụng cmd.exe có sẵn trên Windows để thực thi batch script thay vì nhúng trực tiếp chuỗi lệnh nhạy cảm vào binary mã hóa.",
    "flags": [
      {
        "flag": "/c",
        "meaning": "Carries out the command specified by string and then terminates (Thực thi lệnh trong chuỗi rồi đóng tiến trình ngay lập tức)."
      },
      {
        "flag": "116221791435459.bat",
        "meaning": "Tập lệnh batch giải nén từ payload để kích hoạt VBScript tạo shortcut Desktop."
      }
    ],
    "terms": [
      "lotl",
      "services"
    ],
    "behavior_ref": "behavior-06"
  },
  {
    "pid": 6096,
    "name": "cscript.exe",
    "ppid": 3888,
    "parent": "cmd.exe",
    "rows": 3,
    "user": "NT AUTHORITY\\SYSTEM",
    "cmd": "cscript.exe //nologo m.vbs",
    "role": "Tạo shortcut Desktop (VBScript Runner)",
    "desc": "Sử dụng trình thông dịch dòng lệnh Windows Script Host (cscript.exe) chạy kịch bản m.vbs với cờ //nologo nhằm triệt tiêu hoàn toàn thông tin bản quyền Microsoft trên màn hình. Kịch bản VBS này tạo tệp lối tắt @WanaDecryptor@.exe.lnk đặt thẳng lên màn hình Desktop của người dùng hiện tại.",
    "impact": "Ghi tệp shortcut .lnk đòi tiền chuộc trực tiếp vào Desktop của người dùng.",
    "insight": "MITRE ATT&CK T1059.005 (Command and Scripting Interpreter: Visual Basic). Đảm bảo giao diện giải mã luôn đập vào mắt nạn nhân sau mỗi lần đăng nhập lại.",
    "flags": [
      {
        "flag": "//nologo",
        "meaning": "Ngăn chặn hiển thị biểu ngữ (banner/logo) bản quyền của Windows Script Host trong console."
      },
      {
        "flag": "m.vbs",
        "meaning": "Kịch bản VBScript chứa logic gọi Shell.CreateShortcut trỏ đến @WanaDecryptor@.exe."
      }
    ],
    "terms": [
      "lotl"
    ],
    "behavior_ref": "behavior-06"
  },
  {
    "pid": 3252,
    "name": "taskdl.exe",
    "ppid": 3760,
    "parent": "tasksche.exe",
    "rows": 48,
    "user": "NT AUTHORITY\\SYSTEM",
    "cmd": "taskdl.exe",
    "role": "Dọn dẹp tệp tạm thời (Temp Cleaner Instance 1)",
    "desc": "Được PID 3760 kích hoạt định kỳ trong quá trình mã hóa để quét dọn toàn diện các tệp trung gian mang phần mở rộng .WNCRYT đã hoàn tất quá trình hoán đổi thành .WNCRY, giải phóng dung lượng đĩa và triệt tiêu dấu vết lưu tạm.",
    "impact": "Xóa sạch các tệp tạm thời .WNCRYT trong thư mục hệ thống và hồ sơ người dùng.",
    "insight": "Hành vi dọn dẹp hiện trường nhằm tối ưu hóa hiệu năng I/O đĩa cứng và ngăn ngừa kỹ thuật Carving phục hồi dữ liệu từ file tạm.",
    "flags": [
      {
        "flag": "[Mặc định]",
        "meaning": "Chạy không tham số; tự động duyệt đĩa tìm các tệp .WNCRYT để gọi SetDispositionInformationFile (Delete)."
      }
    ],
    "terms": [
      "file_lifecycle"
    ],
    "behavior_ref": "behavior-05"
  },
  {
    "pid": 1532,
    "name": "taskdl.exe",
    "ppid": 3760,
    "parent": "tasksche.exe",
    "rows": 24,
    "user": "NT AUTHORITY\\SYSTEM",
    "cmd": "taskdl.exe",
    "role": "Dọn dẹp tệp tạm thời (Temp Cleaner Instance 2)",
    "desc": "Đợt chạy thứ 2 của taskdl.exe tiếp tục dọn dẹp các tệp tạm sót lại khi quá trình quét đĩa mở rộng sang các phân vùng ổ đĩa và thư mục con sâu hơn.",
    "impact": "Xóa các tệp tạm .WNCRYT còn sót lại trên phân vùng thứ cấp.",
    "insight": "Thực thi ngầm song song với bộ mã hóa chính để đảm bảo đĩa cứng không bị đầy trong các đợt ghi tệp mã hóa hàng loạt.",
    "flags": [
      {
        "flag": "[Mặc định]",
        "meaning": "Quét dọn đợt 2 các tệp tạm .WNCRYT."
      }
    ],
    "terms": [
      "file_lifecycle"
    ],
    "behavior_ref": "behavior-05"
  },
  {
    "pid": 6776,
    "name": "taskdl.exe",
    "ppid": 3760,
    "parent": "tasksche.exe",
    "rows": 12,
    "user": "NT AUTHORITY\\SYSTEM",
    "cmd": "taskdl.exe",
    "role": "Dọn dẹp tệp tạm thời (Temp Cleaner Instance 3)",
    "desc": "Đợt chạy hoàn tất cuối cùng của taskdl.exe trước khi mã độc chính thức kích hoạt giao diện tống tiền đồ họa trên màn hình nạn nhân.",
    "impact": "Hoàn tất việc dọn sạch tệp tạm thời trên toàn bộ các ổ đĩa.",
    "insight": "Đánh dấu thời điểm chuyển giao kết thúc giai đoạn can thiệp file hàng loạt, chuẩn bị bung giao diện Ransom GUI.",
    "flags": [
      {
        "flag": "[Mặc định]",
        "meaning": "Quét dọn tệp tạm đợt cuối cùng trước khi bật GUI."
      }
    ],
    "terms": [
      "file_lifecycle"
    ],
    "behavior_ref": "behavior-05"
  },
  {
    "pid": 2952,
    "name": "Conhost.exe",
    "ppid": 3760,
    "parent": "tasksche.exe",
    "rows": 5,
    "user": "NT AUTHORITY\\SYSTEM",
    "cmd": "\\??\\C:\\Windows\\system32\\conhost.exe 0xffffffff -ForceV1",
    "role": "Cửa sổ Console hệ thống (Console Host 1)",
    "desc": "Tiến trình chuẩn của Windows gắn liền với các công cụ dòng lệnh (attrib, icacls) được sinh ra để xử lý các luồng I/O console ở chế độ nền mà không hiển thị cửa sổ Command Prompt đen trước mắt người dùng.",
    "impact": "Cung cấp môi trường thực thi console ngầm (Silent execution) cho các tiến trình can thiệp hệ thống.",
    "insight": "Tiến trình OS hợp pháp bị lôi kéo theo chuỗi thực thi; phân tích điều tra cần đối chiếu cha-con để phân biệt với hoạt động quản trị thông thường.",
    "flags": [
      {
        "flag": "0xffffffff",
        "meaning": "Handle console kế thừa ngầm từ tiến trình gọi."
      },
      {
        "flag": "-ForceV1",
        "meaning": "Ép sử dụng phiên bản console v1 truyền thống của Windows Subsystem."
      }
    ],
    "terms": [
      "lotl"
    ],
    "behavior_ref": "behavior-04"
  },
  {
    "pid": 3472,
    "name": "Conhost.exe",
    "ppid": 3888,
    "parent": "cmd.exe",
    "rows": 4,
    "user": "NT AUTHORITY\\SYSTEM",
    "cmd": "\\??\\C:\\Windows\\system32\\conhost.exe 0xffffffff -ForceV1",
    "role": "Cửa sổ Console hệ thống (Console Host 2)",
    "desc": "Gắn liền với phiên thực thi của cmd.exe PID 3888 khi chạy tập lệnh batch tạo phím tắt desktop.",
    "impact": "Cung cấp môi trường thực thi ngầm cho batch script và VBScript.",
    "insight": "Tiến trình phụ trợ tiêu chuẩn của Windows Subsystem.",
    "flags": [
      {
        "flag": "-ForceV1",
        "meaning": "Ép sử dụng kiến trúc console v1 cho batch script."
      }
    ],
    "terms": [
      "lotl"
    ],
    "behavior_ref": "behavior-06"
  },
  {
    "pid": 1752,
    "name": "@WanaDecryptor@.exe",
    "ppid": 3760,
    "parent": "tasksche.exe",
    "rows": 450,
    "user": "bachdeptrai",
    "cmd": "C:\\ProgramData\\evmdthrukdvwcqn063\\@WanaDecryptor@.exe",
    "role": "Giao diện Đòi tiền chuộc (Ransomware GUI)",
    "desc": "Cửa sổ đồ họa tống tiền chính thức của Wana Decrypt0r 2.0. Nạp các thư viện đồ họa MFC42, hiển thị cảnh báo đỏ rực rỡ, hai đồng hồ đếm ngược (3 ngày tăng giá gấp đôi lên 600$, 7 ngày xóa file vĩnh viễn), yêu cầu nộp 300 USD Bitcoin và thay đổi hình nền Desktop thành hình cảnh báo đen chết chóc.",
    "impact": "Chiếm quyền điều khiển màn hình nạn nhân; ghi đè hình nền desktop; hiển thị địa chỉ ví Bitcoin tống tiền 115p7UMMngoj1pMvkpHijcRdfJNXj6LrLn.",
    "insight": "Mục tiêu tài chính cuối cùng của chiến dịch: áp lực tâm lý thời gian thực để buộc nạn nhân thanh toán tiền chuộc giải mã.",
    "flags": [
      {
        "flag": "[Mặc định]",
        "meaning": "Chạy chế độ GUI tương tác trực tiếp với người dùng qua giao diện đồ họa Win32/MFC."
      }
    ],
    "terms": [
      "wanacry_header",
      "cryptoapi"
    ],
    "behavior_ref": "behavior-06"
  }
];

window.iocList = [
  {
    "type": "SHA-256",
    "val": "24D004A104D4D54034DBCFFC2A4B19A11F39008A575AA614EA04703480B1022C",
    "note": "Mã băm thực thi gốc của WannaCry"
  },
  {
    "type": "Domain",
    "val": "www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com",
    "note": "Tên miền Kill-switch"
  },
  {
    "type": "Service",
    "val": "mssecsvc2.0",
    "note": "Dịch vụ ngụy trang Microsoft Security Center"
  },
  {
    "type": "Service",
    "val": "evmdthrukdvwcqn063",
    "note": "Dịch vụ khởi chạy bộ mã hóa tasksche"
  },
  {
    "type": "Path",
    "val": "C:\\ProgramData\\evmdthrukdvwcqn063\\tasksche.exe",
    "note": "Đường dẫn bộ mã hóa tệp chính"
  },
  {
    "type": "BTC Wallet",
    "val": "115p7UMMngoj1pMvkpHijcRdfJNXj6LrLn",
    "note": "Địa chỉ ví Bitcoin đòi tiền chuộc ($300)"
  }
];

window.evidenceGalleryData = [
  {
    "id": "ev_procmon_1",
    "tool": "Process Monitor",
    "tool_badge": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "tool_code": "procmon",
    "title": "Cây tiến trình Procmon mở rộng (15 Nhánh)",
    "desc": "Xác minh toàn bộ quan hệ cha - con (PPID - PID) của 15 tiến trình độc hại chạy dưới quyền SYSTEM.",
    "file": "screenshots/B_procmon_tree_expanded_vmware.png"
  },
  {
    "id": "ev_procmon_2",
    "tool": "Process Monitor",
    "tool_badge": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "tool_code": "procmon",
    "title": "Tiến trình mã hóa cốt lõi (PID 3760 SYSTEM)",
    "desc": "Bản ghi Procmon xác minh tasksche.exe thực thi độc quyền dưới tài khoản NT AUTHORITY\\SYSTEM.",
    "file": "screenshots/B_procmon_event_process_identity_vmware.png"
  },
  {
    "id": "ev_procmon_3",
    "tool": "Process Monitor",
    "tool_badge": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "tool_code": "procmon",
    "title": "Nhật ký can thiệp tệp Decoy trong Lab",
    "desc": "Procmon ghi nhận chuỗi sự kiện CreateFile, WriteFile, SetRenameInformationFile trên thư mục Decoys.",
    "file": "screenshots/B_procmon_decoy_events_vmware.png"
  },
  {
    "id": "ev_procmon_4",
    "tool": "Process Monitor",
    "tool_badge": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "tool_code": "procmon",
    "title": "Thuộc tính sự kiện đổi tên sang đuôi .WNCRY",
    "desc": "Bản ghi chi tiết thao tác đổi tên từ inventory.csv.WNCRYT thành inventory.csv.WNCRY.",
    "file": "screenshots/B_procmon_rename_properties_vmware.png"
  },
  {
    "id": "ev_procmon_5",
    "tool": "Process Monitor",
    "tool_badge": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "tool_code": "procmon",
    "title": "Kịch bản A: Thoát sạch mã 0 trong 0.89 giây",
    "desc": "Procmon xác minh PID 6520 tự kết thúc sạch sẽ sau khi nhận HTTP 200 OK từ Burp Suite.",
    "file": "screenshots/A_run_direct_launch_1143_vmware.png"
  },
  {
    "id": "ev_ph_1",
    "tool": "Process Hacker",
    "tool_badge": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "tool_code": "processhacker",
    "title": "Dịch vụ ngầm mssecsvc2.0 đang chạy",
    "desc": "Process Hacker Services tab hiển thị dịch vụ độc hại ngụy trang với trạng thái Running và Start type Auto.",
    "file": "screenshots/B_service_mssecsvc_selected_vmware.png"
  },
  {
    "id": "ev_ph_2",
    "tool": "Process Hacker",
    "tool_badge": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "tool_code": "processhacker",
    "title": "Thuộc tính dịch vụ mssecsvc2.0 (LocalSystem)",
    "desc": "Xác nhận đường dẫn binary chứa cờ -m security và tài khoản thực thi LocalSystem duy trì persistence.",
    "file": "screenshots/B_service_mssecsvc_properties_vmware.png"
  },
  {
    "id": "ev_ph_3",
    "tool": "Process Hacker",
    "tool_badge": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "tool_code": "processhacker",
    "title": "Danh sách Named Handles của tasksche.exe",
    "desc": "Process Hacker liệt kê toàn bộ Mutant MsWinZonesCacheCounterMutexA, Mutex và File handles đang mở.",
    "file": "screenshots/B_processhacker_tasksche_handles_vmware.png"
  },
  {
    "id": "ev_ph_4",
    "tool": "Process Hacker",
    "tool_badge": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "tool_code": "processhacker",
    "title": "Danh mục Loaded Modules DLLs của tasksche.exe",
    "desc": "Xác minh các thư viện mật mã nạp vào bộ nhớ: CRYPTSP.dll, rsaenh.dll, CRYPTBASE.dll, bcryptPrimitives.dll.",
    "file": "screenshots/B_processhacker_tasksche_modules_vmware.png"
  },
  {
    "id": "ev_ph_5",
    "tool": "Process Hacker",
    "tool_badge": "bg-blue-500/10 text-blue-400 border-blue-500/20",
    "tool_code": "processhacker",
    "title": "Tổng quan tiến trình Process Hacker Host Verified",
    "desc": "Giao diện Process Hacker toàn màn hình giám sát toàn bộ các tiến trình độc hại trong VM.",
    "file": "screenshots/B_processhacker_host_verified_vmware.png"
  },
  {
    "id": "ev_burp_1",
    "tool": "Burp Suite Pro",
    "tool_badge": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "tool_code": "burpsuite",
    "title": "Burp Item #4: Bắt gói tin Kill-switch HTTP 200",
    "desc": "Toàn văn HTTP Request GET / và HTTP Response 200 OK giả lập môi trường chặn đứng đợt tấn công.",
    "file": "screenshots/A_burp_item4_host_verified_vmware.png"
  },
  {
    "id": "ev_explorer_1",
    "tool": "Explorer & Desktop",
    "tool_badge": "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    "tool_code": "explorer",
    "title": "Thư mục Decoys bị mã hóa & Đổi hình nền",
    "desc": "Windows Explorer hiển thị 3 tệp mồi bị đổi đuôi .WNCRY kèm văn bản tống tiền và hình nền desktop chuyển sang màu đen.",
    "file": "screenshots/B_decoys_encrypted_host_verified_vmware.png"
  },
  {
    "id": "ev_ransom_1",
    "tool": "Ransomware GUI",
    "tool_badge": "bg-red-500/10 text-red-400 border-red-500/20",
    "tool_code": "ransomgui",
    "title": "Giao diện Wana Decrypt0r 2.0 (Định danh Sinh viên)",
    "desc": "Cửa sổ tống tiền đòi 300$ Bitcoin, đồng hồ đếm ngược 3 ngày/7 ngày kèm nhãn chứng minh sinh viên Nguyen Van Bach.",
    "file": "screenshots/B_ransom_gui_final_identity_vmware.png"
  },
  {
    "id": "ev_ransom_2",
    "tool": "Ransomware GUI",
    "tool_badge": "bg-red-500/10 text-red-400 border-red-500/20",
    "tool_code": "ransomgui",
    "title": "Giao diện Wana Decrypt0r 2.0 trực tiếp trên VM",
    "desc": "Chụp toàn màn hình máy ảo Windows 10 chứng minh ransomware chiếm quyền điều khiển Desktop hoàn toàn.",
    "file": "screenshots/B_wanadecryptor_host_live_vmware.png"
  }
];
