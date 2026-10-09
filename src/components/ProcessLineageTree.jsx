import React, { useId, useState } from 'react';
import { verifiedProcesses } from '../data/verifiedProcesses';
import './process.css';

// Native lists/buttons preserve ordinary Tab navigation; not an ARIA tree widget.
function Branch({ parentPid, selectedPid, onSelect, detailId }) {
  return (
    <ul className="proc-branches">
      {verifiedProcesses.filter(process => process.parentPid === parentPid).map(process => (
        <li className="proc-node" key={process.pid}>
          <button type="button" aria-pressed={selectedPid === process.pid}
            aria-controls={detailId} onClick={() => onSelect(process.pid)}>
            <span className="proc-pid">PID {process.pid}</span>
            <span>{process.name}</span>
            <span className="proc-parent">PPID {process.parentPid}</span>
          </button>
          {verifiedProcesses.some(child => child.parentPid === process.pid) && (
            <Branch parentPid={process.pid} selectedPid={selectedPid}
              onSelect={onSelect} detailId={detailId} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default function ProcessLineageTree({ compact = false }) {
  const [selectedPid, setSelectedPid] = useState(3760);
  const detailId = useId();
  const selected = verifiedProcesses.find(process => process.pid === selectedPid);
  const graph = (
    <ul className="proc-roots" aria-label="15 tiến trình, nối theo PPID đã xác minh">
      <li>
        <p className="proc-root-label"><strong>powershell.exe · PID 4872</strong><br />
          Harness ngoài tập 15 PID; không biểu diễn cha của harness vì chưa đối chiếu.</p>
        <Branch parentPid={4872} selectedPid={selectedPid} onSelect={setSelectedPid} detailId={detailId} />
      </li>
      <li>
        <p className="proc-root-label"><strong>services.exe · PID 644 · SCM</strong><br />
          Broker Windows ngoài tập 15 PID; không biểu diễn cha của SCM vì chưa đối chiếu.</p>
        <Branch parentPid={644} selectedPid={selectedPid} onSelect={setSelectedPid} detailId={detailId} />
      </li>
    </ul>
  );
  return (
    <div className={`proc-explorer${compact ? ' proc-compact' : ''}`}>
      <p className="proc-caption">15 PID trong capture B · chọn tiến trình để đọc chứng cứ.</p>
      <p className="proc-note">15 PID trong capture B được nối theo PPID thực tế ghi nhận tại sự kiện Process Start.</p>
      <div className="proc-layout">
        {compact ? (
          <details className="proc-disclosure">
            <summary>Mở cây đầy đủ · 15 PID</summary>
            {graph}
          </details>
        ) : graph}
        <section className="proc-detail" id={detailId} aria-live="polite" aria-atomic="true"
          aria-label={`Chi tiết PID ${selected.pid}`}>
          <h3>PID {selected.pid} · {selected.name}</h3>
          <dl>
            <dt>Cha đã xác minh</dt><dd>PID {selected.parentPid}</dd>
            <dt>Process Start · UTC+7</dt><dd><time>{selected.time}</time> · 08/10/2026</dd>
            <dt>Vai trò / quan sát</dt><dd>{selected.observed}</dd>
            <dt>Nguồn tại máy phân tích</dt><dd>{selected.source}</dd>
            <dt>Giới hạn</dt><dd>{selected.limit}</dd>
          </dl>
          <nav className="proc-links" aria-label={`Nguồn liên quan PID ${selected.pid}`}>
            <a href={`#finding-${selected.findingId}`}>Đọc nhận định</a>
            {selected.evidenceIds.map(id => <a href={`#evidence-${id}`} key={id}>Chứng cứ {id}</a>)}
            <a href={`${import.meta.env.BASE_URL}artifacts/source-records.json`} download>Tải source-records.json</a>
          </nav>
          <p className="proc-disclaimer">Ảnh minh họa hành vi liên quan; PID, PPID và timestamp đối chiếu record CSV.</p>
        </section>
      </div>
      <details className="proc-caveats">
        <summary>Ranh giới đối chiếu và loại trừ tiến trình</summary>
        <p className="proc-caveats-text">
          Đường nối chỉ biểu diễn quan hệ cha–con từ Process Start.
          SCM khởi chạy 5272 và 1152: không có đường cha–con trực tiếp từ 6724 tới 1152.
          R là thứ tự bản ghi dữ liệu 1-based trong B_unreachable.csv, không tính dòng header (R1721/R1724 là số record, không phải PID).
          Các tiến trình cha 4872 (powershell) và 644 (services.exe) chỉ làm ngữ cảnh hệ điều hành, không tính vào 15 PID mã độc.
          PID 1752 xuất hiện sau capture; 4596 là thread ID; 6512 là công cụ phân tích, đều được loại trừ chuẩn xác.
        </p>
      </details>
    </div>
  );
}
