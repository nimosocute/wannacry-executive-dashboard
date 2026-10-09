import { useState } from 'react';
import './killswitch.css';

export function KillSwitchSandbox() {
  const [reachable, setReachable] = useState(true);

  return (
    <section className="ks-explorer" aria-labelledby="ks-title">
      <header>
        <h4 id="ks-title">Khám phá điều kiện kill switch</h4>
        <p>Chỉ đổi giao diện; không chạy mẫu, kết nối mạng, thao tác tệp hoặc thực thi lệnh.</p>
      </header>

      <fieldset className="ks-controls">
        <legend>Điều kiện giả định của endpoint cục bộ</legend>
        <label>
          <input type="radio" name="ks-reachability" value="reachable" checked={reachable} onChange={() => setReachable(true)} />
          Tới được, có phản hồi
        </label>
        <label>
          <input type="radio" name="ks-reachability" value="unreachable" checked={!reachable} onChange={() => setReachable(false)} />
          Không tới được, không có phản hồi
        </label>
      </fieldset>

      <div className="ks-diagram" aria-label="Sơ đồ điều kiện — diễn giải mô hình">
        <p className="ks-condition"><strong>Diễn giải mô hình:</strong> endpoint cục bộ có phản hồi?</p>
        <div className="ks-branches">
          <div className={`ks-branch${reachable ? ' ks-selected' : ''}`}>
            <strong>Có — nhánh A</strong>
            <span>Nhận dữ liệu rồi thoát</span>
            {reachable && <span className="ks-selection">Đang chọn</span>}
          </div>
          <div className={`ks-branch${!reachable ? ' ks-selected' : ''}`}>
            <strong>Không — nhánh B</strong>
            <span>Tiếp tục chuỗi service–payload</span>
            {!reachable && <span className="ks-selection">Đang chọn</span>}
          </div>
        </div>
      </div>
      <p className="ks-reason" role="status">
        <strong>Lý do trong mô hình: </strong>
        {reachable
          ? 'Có phản hồi: mô hình chọn nhánh A, nhận dữ liệu rồi thoát.'
          : 'Không có phản hồi: mô hình chọn nhánh B, tiếp tục chuỗi service–payload.'}
      </p>

      <p>Mô hình reachability; chưa chứng minh nhánh API hoặc điều kiện HTTP 200.</p>
      <details className="ks-observation">
        <summary style={{ minHeight: 44, cursor: 'pointer' }}>Đối chiếu quan sát và giới hạn</summary>
        <h5>Quan sát đã ghi — {reachable ? 'A' : 'B'}</h5>
        {reachable ? (
          <p>PID <code>6520</code>: <code>TCP Receive</code> dài <strong>155 byte</strong>, rồi thoát status <code>0</code>. Ba decoy giữ nguyên path và SHA-256; không có tên service mới. Responder/Burp ghi HTTP 200, <code>Content-Length: 3</code> — không phải 155.</p>
        ) : (
          <p><strong>8 TCP Reconnect</strong>: bốn ở PID <code>5152</code>, bốn ở PID <code>5272</code>, tới <code>127.0.0.1:80</code>. Sau đó có service, payload, ba decoy đổi thành <code>.WNCRY</code>. <code>Result=SUCCESS</code> là kết quả xử lý sự kiện Procmon, không chứng minh kết nối ứng dụng thành công; không đổi thành nhãn lỗi.</p>
        )}
        <div className="ks-links">
          <a href="#evidence-E01">E01 — Burp A</a>
          <a href="#evidence-E02">E02 — transcript PowerShell A</a>
          <a href="#evidence-E03">E03 — quan sát B</a>
        </div>
        <p className="ks-limit"><strong>Giới hạn:</strong> không có hook API hoặc dịch ngược chứng minh mẫu kiểm tra riêng HTTP 200; không suy diễn ACK hay API từ log. <a href="#finding-network">Đọc phân tích và nguồn mạng</a>.</p>
      </details>
    </section>
  );
}

export default KillSwitchSandbox;
