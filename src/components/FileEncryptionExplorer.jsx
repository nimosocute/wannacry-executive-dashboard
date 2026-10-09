import React, { useId, useState } from 'react';
import './encryption.css';

// ponytail: substitution on fixed fictional strings only; no real cryptography or files.
export function toyTransform(text, key, reverse = false) {
  if (typeof text !== 'string' || !/^[A-Z ]{1,40}$/.test(text) ||
      !['A', 'B'].includes(key) || typeof reverse !== 'boolean') {
    throw new TypeError('Expected 1–40 uppercase letters/spaces, key A/B, boolean direction');
  }
  const shift = (key === 'A' ? 1 : 3) * (reverse ? -1 : 1);
  return text.replace(/[A-Z]/g, char =>
    String.fromCharCode(65 + (char.charCodeAt(0) - 65 + shift + 26) % 26));
}

export function assertToyRoundTrip() {
  const text = 'HELLO LAB';
  const encoded = toyTransform(text, 'A');
  if (encoded !== 'IFMMP MBC' || toyTransform(encoded, 'A', true) !== text ||
      toyTransform(encoded, 'B', true) === text) {
    throw new Error('Toy substitution round-trip or wrong-key check failed');
  }
  return 'Toy substitution: PASS';
}

const examples = ['HELLO LAB', 'MY FICTIONAL NOTE', 'CLASS PROJECT'];

export default function FileEncryptionExplorer() {
  const id = useId();
  const [plaintext, setPlaintext] = useState(examples[0]);
  const [encryptKey, setEncryptKey] = useState('A');
  const [decryptKey, setDecryptKey] = useState('A');
  const ciphertext = toyTransform(plaintext, encryptKey);
  const recovered = toyTransform(ciphertext, decryptKey, true);

  return (
    <section className="crypto-explorer" aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`}>Bản rõ, bản mã, khóa</h3>
      <ol className="crypto-diagram" aria-label="Ba bước minh họa">
        <li>Bản rõ <strong>HELLO LAB</strong></li>
        <li>Thay chữ với khóa A <strong>IFMMP MBC</strong></li>
        <li>Đảo phép thay với khóa A <strong>HELLO LAB</strong></li>
      </ol>
      <p>Phép thay chữ đồ chơi minh họa vai trò của khóa; không bảo mật, không phải thuật toán WannaCry.</p>

      <details className="crypto-details">
        <summary>Thử đổi khóa trên văn bản giả lập</summary>
        <div className="crypto-controls">
          <label htmlFor={`${id}-text`}>Bản rõ giả lập
            <select id={`${id}-text`} value={plaintext} onChange={event => setPlaintext(event.target.value)}>
              {examples.map(text => <option key={text}>{text}</option>)}
            </select>
          </label>
          <label htmlFor={`${id}-encrypt`}>Khóa biến đổi
            <select id={`${id}-encrypt`} value={encryptKey} onChange={event => setEncryptKey(event.target.value)}>
              <option value="A">A — dịch 1 chữ</option>
              <option value="B">B — dịch 3 chữ</option>
            </select>
          </label>
          <label htmlFor={`${id}-decrypt`}>Khóa khôi phục
            <select id={`${id}-decrypt`} value={decryptKey} onChange={event => setDecryptKey(event.target.value)}>
              <option value="A">A — lùi 1 chữ</option>
              <option value="B">B — lùi 3 chữ</option>
            </select>
          </label>
        </div>
        <div className="crypto-result" role="status" aria-live="polite" aria-atomic="true">
          <dl>
            <div><dt>Bản rõ</dt><dd>{plaintext}</dd></div>
            <div><dt>Bản mã đồ chơi</dt><dd>{ciphertext}</dd></div>
            <div><dt>Kết quả khôi phục</dt><dd>{recovered}</dd></div>
          </dl>
          <p>{plaintext === recovered
            ? 'Cùng khóa: khôi phục đúng văn bản giả lập.'
            : 'Khác khóa: kết quả không trùng bản rõ.'}</p>
        </div>
        <p>Chỉ thay ký tự A–Z trong ba chuỗi cố định, giữ dấu cách; hết Z quay về A. Không đọc, tải lên hay ghi tệp; không dùng mạng hoặc API mật mã.</p>
      </details>

      <details className="crypto-details">
        <summary>Đối chiếu ba decoy: quan sát khác chứng minh thuật toán</summary>
        <p>Trong A, đúng ba decoy giữ nguyên path và SHA-256. Trong B, ba tệp dưới đây đổi path, SHA-256 và có header nhất quán:</p>
        <ul>
          <li><code>inventory.csv.WNCRY</code> — 328 byte.</li>
          <li><code>lab_document.rtf.WNCRY</code> — 360 byte.</li>
          <li><code>student_notes.txt.WNCRY</code> — 360 byte.</li>
        </ul>
        <p>Header artifact: <code>WANACRY!</code>; offset 8–11 là số 256 little-endian; offset 12–267 chứa block 256 byte. Hash/header lấy từ artifact, không phải raw bytes trong Procmon.</p>
        <p>Đổi đuôi <code>.WNCRY</code> riêng lẻ không đủ chứng minh nội dung đã mã hóa. Path, hash, header và chuỗi ghi/rename hỗ trợ kết luận biến đổi đúng ba decoy; không chứng minh toàn máy bị mã hóa.</p>
        <p>Header và số 256 không chứng minh AES, RSA-2048, kích thước khóa hay API đã gọi. Phép thay chữ ở trên không mô phỏng các thuật toán đó, không giải mã artifact thật.</p>
        <nav className="crypto-links" aria-label="Chứng cứ biến đổi decoy">
          <a href="#evidence-E06">E06 — sự kiện rename</a>
          <a href="#evidence-E07">E07 — ba decoy</a>
        </nav>
      </details>
    </section>
  );
}
