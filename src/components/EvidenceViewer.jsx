import React, { useEffect, useRef, useState } from 'react';
import { evidence } from '../data/evidence';
import './evidence.css';

const repo = 'https://github.com/nimosocute/wannacry-executive-dashboard/blob/main/public/screenshots/';
const imageUrl = (item) => `${import.meta.env.BASE_URL}screenshots/${item.file}`;
const findingNames = {
  network: 'Nhánh mạng', services: 'Dịch vụ', payload: 'Payload',
  permissions: 'Quyền và thuộc tính', files: 'Ba decoy', ransom: 'Ransom GUI',
};
const explanations = [
  ['observed', 'Quan sát trực tiếp'], ['focus', 'Vùng cần đọc'],
  ['meaning', 'Ý nghĩa'], ['supports', 'Kết luận được hỗ trợ'], ['limit', 'Giới hạn'],
];
const itemFromHash = () => evidence.find((item) => location.hash === `#evidence-${item.id}`);
const inlineCaptions = {
  E01: ['GET /, HTTP 200, Content-Length: 3.', 'Request/response HTTP cục bộ ở A.', 'Burp không có PID; cần log/CSV để quy thuộc.'],
  E02: ['PID 6520: exited=true, exit_code=0.', 'Tiến trình kết thúc trong lần chạy A.', 'Transcript không chứng minh toàn hệ thống bất biến.'],
  E03: ['mssecsvc2.0: Auto, Running, PID 5272, LocalSystem.', 'Persistence ở mức cấu hình service.', 'Chưa thử reboot; binary path trong ảnh bị cắt.'],
  E04: ['tasksche.exe PID 3760, parent 1152, SYSTEM.', 'Ngữ cảnh tiến trình của sự kiện Procmon.', 'Không xác nhận hash hoặc identity của parent.'],
  E05: ['attrib 5808 và icacls 2064 dưới tasksche 3760.', 'Quan hệ cha–con của hai utility Windows.', 'Lệnh icacls bị cắt; không thấy ACL cuối cùng.'],
  E06: ['Rename .WNCRYT thành .WNCRY: SUCCESS.', 'Bước đổi tên inventory.csv trong chuỗi I/O.', 'Rename không tự chứng minh mã hóa hay wipe.'],
  E07: ['Explorer hiển thị đúng ba tên decoy .WNCRY.', 'Trạng thái tên/path sau thử nghiệm.', 'Nội dung cần hash/header; không suy rộng toàn máy.'],
  E08: ['GUI đòi $300; hai deadline và nút Decrypt.', 'Ransom presentation sau capture B.', 'Không chứng minh thanh toán hay giải mã thành công.'],
};

function EvidenceCard({ item, compact = false }) {
  const [observed, supports, limit] = inlineCaptions[item.id];
  return (
    <figure className={`ev-card${compact ? ' ev-card-compact' : ''}`}>
      <a className="ev-image-link" href={`#evidence-${item.id}`} aria-label={`Mở ${item.id}: ${item.title}`}>
        <img src={imageUrl(item)} alt={item.title} loading="lazy" width="2560" height="1528" />
      </a>
      <figcaption>
        <a className="ev-title" href={`#evidence-${item.id}`}>{item.id} · {item.title}</a>
        {compact && <>
          <dl className="ev-inline-claims">
            <div><dt>Quan sát</dt><dd>{observed}</dd></div>
            <div><dt>Hỗ trợ</dt><dd>{supports}</dd></div>
            <div><dt>Giới hạn</dt><dd>{limit}</dd></div>
          </dl>
          <details className="ev-reading-guide">
            <summary>Vùng đọc và ý nghĩa</summary>
            <p><strong>Vùng đọc:</strong> {item.focus}</p>
            <p><strong>Ý nghĩa:</strong> {item.meaning}</p>
          </details>
        </>}
        <a className="ev-source-link" href={`${repo}${item.file}`} target="_blank" rel="noreferrer">Ảnh trong repository (tab mới)</a>
      </figcaption>
    </figure>
  );
}

export function EvidenceInline({ ids = [] }) {
  return (
    <div className="ev-inline" aria-label="Ảnh chứng cứ liên quan">
      {ids.map((id) => evidence.find((item) => item.id === id)).filter(Boolean)
        .map((item) => <EvidenceCard key={item.id} item={item} compact />)}
    </div>
  );
}

export function EvidenceViewer() {
  const [query, setQuery] = useState('');
  const [finding, setFinding] = useState('');
  const [selected, setSelected] = useState(null);
  const [highlight, setHighlight] = useState(false);
  const dialog = useRef(null);
  const returnTo = useRef(null);
  const repositoryHeading = useRef(null);

  useEffect(() => {
    // Preserve context before native anchor navigation changes the hash or scroll.
    const rememberTrigger = (event) => {
      const link = event.target.closest?.('a[href^="#evidence-E"]');
      if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      returnTo.current = { hash: location.hash || '#evidence', x: scrollX, y: scrollY, trigger: link };
    };
    const syncHash = (event) => {
      const item = itemFromHash();
      if (item) {
        if (!returnTo.current) {
          const oldHash = event?.oldURL ? new URL(event.oldURL).hash : '';
          returnTo.current = {
            hash: oldHash && !oldHash.startsWith('#evidence-E') ? oldHash : '#evidence',
            x: scrollX, y: scrollY, trigger: null,
          };
        }
        setHighlight(false);
        setSelected(item);
      } else {
        if (dialog.current?.open) dialog.current.close();
        setSelected(null);
      }
    };
    document.addEventListener('click', rememberTrigger, true);
    window.addEventListener('hashchange', syncHash);
    syncHash();
    return () => {
      document.removeEventListener('click', rememberTrigger, true);
      window.removeEventListener('hashchange', syncHash);
    };
  }, []);

  useEffect(() => {
    if (selected && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [selected]);

  const finishClose = () => {
    const context = returnTo.current;
    returnTo.current = null;
    setSelected(null);
    if (itemFromHash()) {
      const oldURL = location.href;
      history.replaceState(history.state, '', context?.hash || '#evidence');
      window.dispatchEvent(new HashChangeEvent('hashchange', { oldURL, newURL: location.href }));
      requestAnimationFrame(() => {
        scrollTo(context?.x || 0, context?.y || 0);
        const target = context?.trigger?.isConnected ? context.trigger : repositoryHeading.current;
        target?.focus({ preventScroll: true });
      });
    }
  };

  const search = query.trim().toLocaleLowerCase('vi');
  const matches = evidence.filter((item) =>
    (!finding || item.findingIds.includes(finding)) &&
    [item.id, item.title, item.file, item.observed, item.focus, item.meaning, item.supports, item.limit, item.source]
      .some((text) => text.toLocaleLowerCase('vi').includes(search)));

  return (
    <div className="ev-repository">
      <h3 ref={repositoryHeading} tabIndex={-1}>Danh mục ảnh gốc</h3>
      <p className="ev-intro">8 ảnh nguyên khung VMware. Ảnh hỗ trợ bối cảnh; CSV, log và hash là nguồn định lượng.</p>
      <div className="ev-filters">
        <label>Tìm chứng cứ
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ID, PID, tên tệp, quan sát…" />
        </label>
        <label>Lọc theo hành vi
          <select value={finding} onChange={(event) => setFinding(event.target.value)}>
            <option value="">Tất cả hành vi</option>
            {Object.entries(findingNames).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
        </label>
      </div>
      <p className="ev-count" role="status">{matches.length} / {evidence.length} chứng cứ</p>
      <div className="ev-grid">{matches.map((item) => <EvidenceCard key={item.id} item={item} />)}</div>
      {!matches.length && <p>Không có chứng cứ phù hợp. Thử tên tệp, PID hoặc bỏ bộ lọc.</p>}
      <dialog ref={dialog} className="ev-dialog" aria-labelledby="ev-dialog-title" onClose={finishClose}>
        {selected && <>
          <header className="ev-dialog-header">
            <h2 id="ev-dialog-title">{selected.id} · {selected.title}</h2>
            <button type="button" autoFocus onClick={() => dialog.current.close()}>Đóng</button>
          </header>
          <div className="ev-dialog-body">
            <div className="ev-actions">
              {selected.region && <label className="ev-toggle">
                <input type="checkbox" checked={highlight} onChange={(event) => setHighlight(event.target.checked)} />
                Đánh dấu vùng cần đọc
              </label>}
              <a href={imageUrl(selected)} download={selected.file}>Tải ảnh nguyên gốc</a>
              <a href={imageUrl(selected)} target="_blank" rel="noreferrer">Mở ảnh kích thước gốc (tab mới)</a>
            </div>
            <figure className="ev-full-image">
              <img src={imageUrl(selected)} alt={`${selected.title}. ${selected.observed}`} width="2560" height="1528" />
              {highlight && selected.region && <span aria-hidden="true" className="ev-region" style={{
                left: `${selected.region.x}%`, top: `${selected.region.y}%`,
                width: `${selected.region.w}%`, height: `${selected.region.h}%`,
              }} />}
            </figure>
            <p className="ev-image-note">Ảnh nguyên khung, không cắt. Khung đánh dấu chỉ là lớp hiển thị, không sửa ảnh.</p>
            <dl className="ev-explanations">
              {explanations.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{selected[key]}</dd></div>)}
            </dl>
            <p className="ev-source"><strong>Nguồn đối chiếu:</strong> {selected.source}</p>
            <p className="ev-source"><a href={`${repo}${selected.file}`} target="_blank" rel="noreferrer">{selected.file} · repository (tab mới)</a></p>
            <nav className="ev-return" aria-label="Trở về phân tích liên quan">
              {selected.findingIds.map((id) => <a key={id} href={`#finding-${id}`}>Về hành vi: {findingNames[id]}</a>)}
            </nav>
          </div>
        </>}
      </dialog>
    </div>
  );
}

export default EvidenceViewer;
