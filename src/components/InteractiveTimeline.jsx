import { useState } from 'react';
import { timeline } from '../data/timeline';
import './timeline.css';

const milestones = {
  A: ['A-R343', 'A-R461', 'A-R464', 'A-R475', 'A-R478', 'A-R479'],
  B: ['B-R326', 'B-R413', 'B-R772', 'B-R1209', 'B-R1724', 'B-R2617', 'B-R279026'],
};
const labels = {
  'A-R343': 'Khởi chạy', 'A-R461': 'Kết nối', 'A-R464': 'Gửi 100 byte',
  'A-R475': 'Nhận 155 byte', 'A-R478': 'Ngắt kết nối', 'A-R479': 'Thoát 0',
  'B-R326': 'Khởi chạy', 'B-R413': 'Reconnect', 'B-R772': 'Service Auto',
  'B-R1209': 'Payload', 'B-R1724': 'Lệnh ACL', 'B-R2617': 'Rename .WNCRY',
  'B-R279026': 'Original sang Temp',
};

function RecordLinks({ record }) {
  return (
    <span className="time-links">
      <a href={`#finding-${record.findingId}`}>Đọc phát hiện liên quan</a>
      {record.evidenceIds.map(id => <a key={id} href={`#evidence-${id}`}>Ảnh {id}</a>)}
    </span>
  );
}

export default function InteractiveTimeline() {
  const [scenario, setScenario] = useState('A');
  const [selectedId, setSelectedId] = useState('A-R343');
  const records = timeline.filter(record => record.scenario === scenario);
  const selected = records.find(record => record.id === selectedId);
  const keys = records.filter(record => milestones[scenario].includes(record.id));

  function changeScenario(value) {
    setScenario(value);
    setSelectedId(milestones[value][0]);
  }

  return (
    <section className="time-view" aria-label="Dòng thời gian chứng cứ">
      <p className="time-note">08/10/2026 · UTC+7. Chọn một mốc để đọc record; thứ tự thời gian không tự chứng minh nhân quả.</p>
      <fieldset className="time-scenarios">
        <legend>Kịch bản quan sát</legend>
        <label><input type="radio" name="timeline-scenario" value="A" checked={scenario === 'A'} onChange={() => changeScenario('A')} /> A · Responder trả HTTP 200</label>
        <label><input type="radio" name="timeline-scenario" value="B" checked={scenario === 'B'} onChange={() => changeScenario('B')} /> B · Responder không tới được</label>
      </fieldset>
      <ol className="time-milestones" aria-label={`Các mốc chính kịch bản ${scenario}`}>
        {keys.map(record => (
          <li key={record.id}>
            <button type="button" aria-pressed={selectedId === record.id} aria-controls="time-selected-record" onClick={() => setSelectedId(record.id)}>
              <span>{labels[record.id]}</span>
              <time dateTime={`2026-10-08T${record.time}+07:00`}>{record.time.slice(0, 8)}</time>
            </button>
          </li>
        ))}
      </ol>
      <div id="time-selected-record" className="time-detail" aria-live="polite" aria-atomic="true">
        <h3>{labels[selected.id]}</h3>
        <p><time dateTime={`2026-10-08T${selected.time}+07:00`}>{selected.time}</time> · PID <strong>{selected.pid}</strong> · <strong>{selected.source}</strong></p>
        <p>{selected.event}</p>
        <RecordLinks record={selected} />
      </div>
      <details className="time-all" key={scenario}>
        <summary>Toàn bộ {records.length} record kịch bản {scenario} · 38 record cho A + B</summary>
        <p className="time-note">R là chỉ số data record 1-based, không tính header; không phải số dòng vật lý. CSV là nguồn từng sự kiện; ảnh minh họa phát hiện liên quan, không thay thế record.</p>
        <ol className="time-records">
          {records.map(record => (
            <li key={record.id}>
              <p><time dateTime={`2026-10-08T${record.time}+07:00`}>{record.time}</time> · PID <strong>{record.pid}</strong> · {record.source}</p>
              <p>{record.event}</p>
              <RecordLinks record={record} />
            </li>
          ))}
        </ol>
      </details>
      {scenario === 'B' && (
        <aside className="time-after" aria-label="Ranh giới capture và quan sát muộn">
          <p><strong>Cuối CSV B · <time dateTime="2026-10-08T11:58:47.7389115+07:00">11:58:47.7389115</time></strong> — PID 3760/5272 còn qua cuối trace. Đây là ranh giới cửa sổ, không phải Process Exit.</p>
          <p><strong>Sau capture · <time dateTime="2026-10-08T12:00:10+07:00">12:00:10</time></strong> — GUI PID 1752 theo <code>preserve_current.log</code>; không có record Procmon trong cửa sổ B, không thuộc tập 15 PID được quy thuộc.</p>
          <span className="time-links"><a href="#finding-ransom">Đọc phát hiện GUI</a><a href="#evidence-E08">Ảnh E08</a></span>
        </aside>
      )}
    </section>
  );
}
