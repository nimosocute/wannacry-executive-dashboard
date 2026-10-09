import React, { useEffect, useRef, useState } from 'react';
import { evidence } from '../data/evidence';
import './evidence.css';

const repo = 'https://github.com/nimosocute/wannacry-executive-dashboard/blob/main/public/screenshots/';
const imageUrl = (item) => `${import.meta.env.BASE_URL}screenshots/${item.file}`;
const findingNames = {
  network: 'Nhánh mạng',
  services: 'Dịch vụ',
  payload: 'Payload',
  permissions: 'Quyền và thuộc tính',
  files: 'Ba decoy',
  ransom: 'Ransom GUI',
};
const explanations = [
  ['observed', 'Quan sát trực tiếp'],
  ['focus', 'Vùng cần đọc'],
  ['meaning', 'Ý nghĩa'],
  ['supports', 'Kết luận được hỗ trợ'],
  ['limit', 'Giới hạn'],
];
const itemFromHash = () => evidence.find((item) => location.hash === `#evidence-${item.id}`);

export function EvidenceCard({ item, inRepository = false }) {
  const [highlight, setHighlight] = useState(true);

  return (
    <figure className={`ev-card${inRepository ? ' ev-card-repo' : ' ev-card-inline'}`}>
      <div className="ev-card-media">
        <div className="ev-image-wrapper">
          <a
            className="ev-image-link"
            href={`#evidence-${item.id}`}
            aria-label={`Mở ${item.id}: ${item.title}`}
            title="Nhấn để phóng to toàn màn hình"
          >
            <img
              src={imageUrl(item)}
              alt={`${item.id}: ${item.title}`}
              loading="lazy"
              width="2560"
              height="1528"
            />
            {highlight && item.region && (
              <span
                aria-hidden="true"
                className="ev-region"
                style={{
                  left: `${item.region.x}%`,
                  top: `${item.region.y}%`,
                  width: `${item.region.w}%`,
                  height: `${item.region.h}%`,
                }}
              />
            )}
          </a>
        </div>

        <div className="ev-media-toolbar">
          {item.region ? (
            <label className="ev-toggle">
              <input
                type="checkbox"
                checked={highlight}
                onChange={(e) => setHighlight(e.target.checked)}
              />
              <span>Đánh dấu vùng cần đọc</span>
            </label>
          ) : <span />}
          <a
            className="ev-zoom-btn"
            href={`#evidence-${item.id}`}
            aria-label={`Phóng to ${item.id}: ${item.title}`}
          >
            <span aria-hidden="true">⛶</span> Phóng to / Toàn màn hình
          </a>
        </div>
      </div>

      <div className="ev-card-content">
        <header className="ev-card-header">
          <div className="ev-card-title-row">
            <span className="ev-id-badge">{item.id}</span>
            <h4 className="ev-card-title">
              <a className="ev-title" href={`#evidence-${item.id}`}>
                {item.id} · {item.title}
              </a>
            </h4>
          </div>
        </header>

        <dl className="ev-explanations">
          {explanations.map(([key, label]) => (
            <div key={key} className={`ev-exp-item ev-exp-${key}`}>
              <dt>{label}</dt>
              <dd>{item[key]}</dd>
            </div>
          ))}
        </dl>

        <div className="ev-card-footer">
          <p className="ev-source">
            <strong>Nguồn đối chiếu:</strong> {item.source}
          </p>
          <div className="ev-actions-links">
            <a href={imageUrl(item)} download={item.file} className="ev-action-link">
              Tải ảnh gốc
            </a>
            <a href={`${repo}${item.file}`} target="_blank" rel="noreferrer" className="ev-action-link">
              Ảnh trong repository (tab mới) ↗
            </a>
            {!inRepository && (
              <a href={`#evidence-${item.id}`} className="ev-action-link ev-link-repo">
                Xem trong danh mục bằng chứng ↓
              </a>
            )}
            {inRepository && item.findingIds && item.findingIds.map((fId) => (
              <a key={fId} href={`#finding-${fId}`} className="ev-action-link ev-link-finding">
                Về hành vi: {findingNames[fId]} ↑
              </a>
            ))}
          </div>
        </div>
      </div>
    </figure>
  );
}

export function EvidenceInline({ ids = [] }) {
  const items = ids
    .map((id) => evidence.find((item) => item.id === id))
    .filter(Boolean);

  if (!items.length) return null;

  return (
    <div className="ev-inline" aria-label="Ảnh chứng cứ liên quan">
      {items.map((item) => (
        <EvidenceCard
          key={item.id}
          item={item}
          inRepository={false}
        />
      ))}
    </div>
  );
}

export function EvidenceViewer() {
  const [query, setQuery] = useState('');
  const [finding, setFinding] = useState('');
  const [selected, setSelected] = useState(null);
  const [highlight, setHighlight] = useState(true);
  const dialog = useRef(null);
  const returnTo = useRef(null);
  const repositoryHeading = useRef(null);

  useEffect(() => {
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
        setHighlight(true);
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
    if (selected && dialog.current && !dialog.current.open) {
      dialog.current.showModal();
    }
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
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ID, PID, tên tệp, quan sát…"
          />
        </label>
        <label>Lọc theo hành vi
          <select value={finding} onChange={(event) => setFinding(event.target.value)}>
            <option value="">Tất cả hành vi</option>
            {Object.entries(findingNames).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="ev-count" role="status">{matches.length} / {evidence.length} chứng cứ</p>
      <div className="ev-grid">
        {matches.map((item) => (
          <EvidenceCard
            key={item.id}
            item={item}
            inRepository={true}
          />
        ))}
      </div>
      {!matches.length && <p className="ev-no-matches">Không có chứng cứ phù hợp. Thử tên tệp, PID hoặc bỏ bộ lọc.</p>}

      <dialog ref={dialog} className="ev-dialog" aria-labelledby="ev-dialog-title" onClose={finishClose}>
        {selected && (
          <>
            <header className="ev-dialog-header">
              <h2 id="ev-dialog-title">{selected.id} · {selected.title}</h2>
              <button
                type="button"
                className="ev-close-btn"
                autoFocus
                onClick={() => dialog.current.close()}
              >
                Đóng ✕
              </button>
            </header>
            <div className="ev-dialog-body">
              <div className="ev-actions">
                {selected.region && (
                  <label className="ev-toggle">
                    <input
                      type="checkbox"
                      checked={highlight}
                      onChange={(event) => setHighlight(event.target.checked)}
                    />
                    Đánh dấu vùng cần đọc
                  </label>
                )}
                <a href={imageUrl(selected)} download={selected.file} className="ev-action-link">
                  Tải ảnh nguyên gốc
                </a>
                <a href={imageUrl(selected)} target="_blank" rel="noreferrer" className="ev-action-link">
                  Mở ảnh kích thước gốc (tab mới) ↗
                </a>
                <a href={`${repo}${selected.file}`} target="_blank" rel="noreferrer" className="ev-action-link">
                  {selected.file} · repository (tab mới) ↗
                </a>
              </div>
              <figure className="ev-full-image">
                <img
                  src={imageUrl(selected)}
                  alt={`${selected.title}. ${selected.observed}`}
                  width="2560"
                  height="1528"
                />
                {highlight && selected.region && (
                  <span
                    aria-hidden="true"
                    className="ev-region"
                    style={{
                      left: `${selected.region.x}%`,
                      top: `${selected.region.y}%`,
                      width: `${selected.region.w}%`,
                      height: `${selected.region.h}%`,
                    }}
                  />
                )}
              </figure>
              <p className="ev-image-note">
                Ảnh nguyên khung VMware, không cắt. Khung đánh dấu chỉ là lớp hiển thị, không sửa ảnh.
              </p>
              <dl className="ev-explanations">
                {explanations.map(([key, label]) => (
                  <div key={key} className={`ev-exp-item ev-exp-${key}`}>
                    <dt>{label}</dt>
                    <dd>{selected[key]}</dd>
                  </div>
                ))}
              </dl>
              <p className="ev-source">
                <strong>Nguồn đối chiếu:</strong> {selected.source}
              </p>
              <nav className="ev-return" aria-label="Trở về phân tích liên quan">
                {selected.findingIds.map((id) => (
                  <a key={id} href={`#finding-${id}`} onClick={finishClose}>
                    Về hành vi: {findingNames[id]} ↑
                  </a>
                ))}
              </nav>
            </div>
          </>
        )}
      </dialog>
    </div>
  );
}

export default EvidenceViewer;
