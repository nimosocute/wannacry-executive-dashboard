import { useState } from 'react';
import './command.css';

const workingDirectory = 'C:\\ProgramData\\evmdthrukdvwcqn063\\';
const commands = [
  {
    id: 'icacls', label: 'icacls · DACL', target: workingDirectory,
    observation: 'PID 2064, parent 3760: Process Start R1724. SetSecurityFile SUCCESS trên b.wnry tại R1844, Information: DACL.',
    limit: 'Xác nhận ít nhất một DACL được ghi; chưa có ACL cuối đầy đủ. Không chuyển ownership, không cấp quyền toàn máy, không chứng minh UAC bypass.',
    source: 'E05 · README §4.4, §7 · B_unreachable.csv', evidence: 'E05', finding: 'permissions',
    reference: 'https://learn.microsoft.com/windows-server/administration/windows-commands/icacls',
    tokens: [
      ['icacls', 'Tiện ích', 'Xem hoặc sửa DACL của tệp/thư mục.'],
      ['.', 'Mục tiêu', 'Thư mục hiện hành của tiến trình, không phải toàn ổ C.'],
      ['/grant', 'Thao tác', 'Thêm quyền cấp cho principal; không thay toàn bộ DACL.'],
      ['Everyone:F', 'Principal và quyền', 'Yêu cầu Full control cho Everyone (SID S-1-1-0) trên mục tiêu được duyệt.'],
      ['/T', 'Phạm vi', 'Áp dụng cho các tệp và thư mục con trong cây mục tiêu.'],
      ['/C', 'Xử lý lỗi', 'Tiếp tục khi gặp lỗi; không có nghĩa mọi thao tác đều thành công.'],
      ['/Q', 'Đầu ra', 'Không in thông báo thành công; không làm mất log Procmon.'],
    ],
  },
  {
    id: 'attrib', label: 'attrib · Hidden', target: workingDirectory,
    observation: 'PID 5808, parent 3760: Process Start R1721 với attrib +h .; working directory được ghi trong Process Start.',
    limit: 'Dòng lệnh cho biết yêu cầu đặt Hidden; không chứng minh mã hóa nội dung, vượt quyền hoặc ẩn khỏi công cụ giám sát.',
    source: 'E05 · README §4.4, §7 · B_unreachable.csv', evidence: 'E05', finding: 'permissions',
    reference: 'https://learn.microsoft.com/windows-server/administration/windows-commands/attrib',
    tokens: [
      ['attrib', 'Tiện ích', 'Hiển thị hoặc thay đổi thuộc tính tệp/thư mục.'],
      ['+h', 'Thuộc tính', 'Thêm thuộc tính Hidden cho mục tiêu.'],
      ['.', 'Mục tiêu', 'Chỉ thư mục hiện hành; lệnh không có tùy chọn duyệt đệ quy.'],
    ],
  },
  {
    id: 'service', label: 'Service · -m security', target: 'Service mssecsvc2.0; instance PID 5272.',
    observation: 'ImagePath R774 chứa -m security; PID 5272 bắt đầu tại R780, parent services.exe PID 644. Tên executable bên dưới được rút gọn như README.',
    limit: 'Chưa xác định ý nghĩa nội bộ của -m hoặc security. Auto/LocalSystem là cấu hình quan sát; chưa thử reboot.',
    source: 'README §4.2, §7 · persistence_verified.md · B_unreachable.csv. E03 chỉ hỗ trợ cấu hình mssecsvc2.0 tại thời điểm chụp.', evidence: 'E03', finding: 'services',
    tokens: [
      ['C:\\LabLive\\Sample_ready\\24d004...exe', 'Executable (rút gọn)', 'Đường dẫn mẫu trong ImagePath service; không phải tên một tiện ích Windows.'],
      ['-m', 'Tham số quan sát', 'Có trong command line; chưa có diễn giải ngữ nghĩa được xác minh.'],
      ['security', 'Giá trị quan sát', 'Token đứng sau -m; tên này không chứng minh chức năng bảo mật.'],
    ],
  },
  {
    id: 'tasksche', label: 'tasksche · /i', target: 'C:\\WINDOWS\\tasksche.exe',
    observation: 'PID 6724, parent 5152: Process Start R1143 với C:\\WINDOWS\\tasksche.exe /i.',
    limit: 'Chưa chứng minh /i có nghĩa “install”, thuật toán giải nén hoặc API nội bộ.',
    source: 'E05 · README §4.3, §7 · B_verified_attribution.md', evidence: 'E05', finding: 'payload',
    tokens: [
      ['C:\\WINDOWS\\tasksche.exe', 'Executable', 'Tệp thực thi tại đường dẫn quan sát; PID 5152 đã ghi tệp trước khi khởi chạy.'],
      ['/i', 'Tham số quan sát', 'Có trong command line; ý nghĩa nội bộ chưa được xác minh.'],
    ],
  },
  {
    id: 'cmd-service', label: 'cmd · Service', target: 'C:\\ProgramData\\evmdthrukdvwcqn063\\tasksche.exe',
    observation: 'ImagePath service evmdthrukdvwcqn063 chứa đúng lệnh này. SCM khởi chạy cmd.exe PID 1152 tại R1197, sau đó tasksche.exe PID 3760.',
    limit: 'SCM là cầu nối thực thi; đăng ký service không tự vượt kiểm soát quyền. Chưa xác nhận chạy lại sau reboot.',
    source: 'README §4.2–4.3, §7 · persistence_verified.md · services_after.csv · B_unreachable.csv. E03 là ảnh mssecsvc2.0, không chứng minh service thứ hai hoặc dòng lệnh này.', evidence: 'E03', finding: 'services',
    tokens: [
      ['cmd.exe', 'Trình thông dịch', 'Windows Command Processor xử lý chuỗi lệnh.'],
      ['/c', 'Tùy chọn', 'Thực thi chuỗi lệnh rồi kết thúc.'],
      ['"C:\\ProgramData\\evmdthrukdvwcqn063\\tasksche.exe"', 'Lệnh đích', 'Đường dẫn executable được bao trong dấu nháy.'],
    ],
  },
  {
    id: 'batch', label: 'cmd · Batch', target: '116221791435459.bat',
    observation: 'PID 3888, parent 3760: cmd.exe /c 116221791435459.bat tại R2279.',
    limit: 'Không suy ra nội dung mọi nhánh batch hoặc mục đích từng thao tác từ dòng lệnh.',
    source: 'E05 · README §4.6, §6–7 · B_verified_attribution.md', evidence: 'E05', finding: 'ransom',
    tokens: [
      ['cmd.exe', 'Trình thông dịch', 'Windows Command Processor xử lý lệnh batch.'],
      ['/c', 'Tùy chọn', 'Thực thi chuỗi lệnh rồi kết thúc.'],
      ['116221791435459.bat', 'Tệp đích', 'Tên tệp batch tương đối được truyền cho CMD.'],
    ],
  },
  {
    id: 'cscript', label: 'cscript · VBS', target: 'm.vbs',
    observation: 'PID 6096, parent 3888: cscript.exe //nologo m.vbs tại R2425.',
    limit: 'Không chứng minh API bên trong VBS hoặc tác dụng đổi wallpaper. //nologo chỉ tắt banner, không tắt mọi đầu ra.',
    source: 'E05 · README §4.6, §6–7 · B_verified_attribution.md', evidence: 'E05', finding: 'ransom',
    tokens: [
      ['cscript.exe', 'Trình thông dịch', 'Windows Script Host bản dòng lệnh xử lý script.'],
      ['//nologo', 'Tùy chọn', 'Không hiển thị banner Windows Script Host.'],
      ['m.vbs', 'Tệp đích', 'Tên tệp VBScript được truyền cho trình thông dịch.'],
    ],
  },
];

export function CommandExplainer() {
  const [commandIndex, setCommandIndex] = useState(0);
  const [tokenIndex, setTokenIndex] = useState(0);
  const command = commands[commandIndex];
  const [token, role, meaning] = command.tokens[tokenIndex];

  return (
    <section className="cmd-explainer" aria-labelledby="cmd-heading">
      <h2 id="cmd-heading">Đọc từng token lệnh</h2>
      <p className="cmd-muted">Chọn lệnh, chọn token. Chỉ giải thích chứng cứ; không thực thi.</p>
      <div className="cmd-choices">
        <label htmlFor="cmd-select">Chọn lệnh</label>
        <select id="cmd-select" value={commandIndex}
          onChange={(event) => { setCommandIndex(Number(event.target.value)); setTokenIndex(0); }}>
          {commands.map((item, index) => <option key={item.id} value={index}>{item.label}</option>)}
        </select>
      </div>
      <div className="cmd-tokens" role="group" aria-label="Chọn token để đọc giải thích">
        {command.tokens.map(([text], index) => (
          <button key={index} type="button" aria-pressed={index === tokenIndex}
            aria-label={`Giải thích token ${text}`} onClick={() => setTokenIndex(index)}>
            <code>{text}</code>
          </button>
        ))}
      </div>
      <div className="cmd-explanation" aria-live="polite" aria-atomic="true">
        <h3><code>{token}</code></h3>
        <dl>
          <div><dt>Vai trò</dt><dd>{role}</dd></div>
          <div><dt>Đích của lệnh</dt><dd><code>{command.target}</code></dd></div>
          <div><dt>Ngữ nghĩa tham chiếu</dt><dd>{meaning}</dd></div>
        </dl>
      </div>
      <details key={command.id} className="cmd-depth">
        <summary>Đối chiếu nguồn và phạm vi</summary>
        <p><strong>Quan sát:</strong> {command.observation}</p>
        <p><strong>Giới hạn:</strong> {command.limit}</p>
        <p className="cmd-source">Nguồn: {command.source}</p>
        <p><a href={`#evidence-${command.evidence}`}>Đối chiếu {command.evidence}</a></p>
        <p>Ngữ nghĩa mô tả cách đọc cú pháp, không chứng minh API đã được gọi. R là chỉ số bản ghi dữ liệu CSV, bắt đầu từ 1, không tính header.</p>
        <a href={`#finding-${command.finding}`}>Đọc phát hiện liên quan</a>
        {command.reference && <p><a href={command.reference}>Tài liệu Microsoft · {command.id}</a></p>}
      </details>
    </section>
  );
}

export default CommandExplainer;
