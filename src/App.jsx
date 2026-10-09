import React, { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import KillSwitchSandbox from './components/KillSwitchSandbox.jsx';
import CommandExplainer from './components/CommandExplainer.jsx';
import ProcessLineageTree from './components/ProcessLineageTree.jsx';
import FileEncryptionExplorer from './components/FileEncryptionExplorer.jsx';
import InteractiveTimeline from './components/InteractiveTimeline.jsx';
import EvidenceViewer, { EvidenceInline } from './components/EvidenceViewer.jsx';
import { report } from './content/report.js';

const topics = { network:'Mạng', services:'Dịch vụ', payload:'Tiến trình', permissions:'Lệnh & quyền', files:'Tệp dữ liệu', ransom:'Tống tiền' };
const oldAnchors = { sandbox:'network', behaviors:'network', commands:'permissions', 'process-tree':'payload', 'evidence-gallery':'evidence', recommendations:'conclusions', iocs:'appendix' };
const findingFromHash = () => location.hash.replace('#finding-','');
const artifactBase = `${import.meta.env.BASE_URL}artifacts/`;

function SectionTitle({ number, title, children }) {
  return <div className="section-heading"><span className="eyebrow">{number} / {title}</span><h2>{children}</h2></div>;
}

function Flow({ label, items }) {
  return <ol className="concept-flow" aria-label={label}>{items.map(([title,body],i)=><li key={title}><span className="flow-index">{String(i+1).padStart(2,'0')}</span><strong>{title}</strong><span>{body}</span></li>)}</ol>;
}

function FindingVisual({ id }) {
  if (id==='network') return <KillSwitchSandbox />;
  if (id==='payload') return <><Flow label="Cầu nối thực thi đã xác minh" items={[
    ['5152 · Mẫu','Sinh trực tiếp PID 6724'],['644 · SCM','Khởi chạy cmd.exe PID 1152'],['3760 · Payload','Con của cmd.exe PID 1152']]} /><p className="fine-print">Thứ tự trình bày không phải một cây PPID liền mạch. Mở cây để xem các cạnh đã đối chiếu.</p><ProcessLineageTree compact /></>;
  if (id==='permissions') return <CommandExplainer />;
  if (id==='files') return <FileEncryptionExplorer />;
  if (id==='services') return <><Flow label="Từ cấu hình service tới tiến trình" items={[
    ['SCM','services.exe · PID 644'],['Hai service mới','Auto start · LocalSystem'],['Hai nhánh thực thi','PID 5272 và cmd.exe PID 1152']]} /><p className="scope-note">Auto là cấu hình. Chưa thực hiện reboot để xác nhận chạy lại.</p></>;
  return <><Flow label="Các lớp trình bày tống tiền" items={[
    ['Ransom note','Yêu cầu $300 Bitcoin'],['Shortcut','Liên kết tới giao diện'],['GUI · 12:00:10','Quan sát sau capture B']]} /><p className="scope-note">Thấy yêu cầu thanh toán không chứng minh thanh toán hoặc giải mã hoạt động.</p></>;
}

function Finding({ finding, number }) {
  return <article id={`finding-${finding.id}`} className="finding" aria-labelledby={`title-${finding.id}`}>
    <div className="finding-heading"><span className="eyebrow">Hành vi {number} / {topics[finding.id]}</span><h3 id={`title-${finding.id}`}>{finding.title}</h3><p>{finding.summary}</p></div>
    <div className="finding-visual"><FindingVisual id={finding.id} /></div>
    <div className="context-evidence"><h4>Bằng chứng tại nhận định</h4><EvidenceInline ids={finding.evidenceIds} /></div>
    <details className="reading-level"><summary><span>Giải thích từng bước</span><span className="summary-hint">Cơ chế & khái niệm</span></summary>
      <p className="reading-label">Quan sát thực tế</p><p>{finding.observed}</p>
      <ol className="explanation-steps">{finding.steps.map(step=><li key={step.title}><h4>{step.title}</h4><p>{step.body}</p></li>)}</ol>
      <p className="reading-label">Diễn giải từ quan sát</p><p>{finding.inference}</p>
      <h4>Khái niệm & kiến thức tham chiếu</h4><dl className="term-list">{finding.terms.filter(term=>!term.token.includes('SHA-256')).map(term=><div key={term.token}><dt>{term.token}</dt><dd>{term.meaning}</dd></div>)}</dl>
    </details>
    <details className="reading-level"><summary><span>Kiểm chứng chuyên sâu</span><span className="summary-hint">Record, nguồn & giới hạn</span></summary>
      <h4>Điều chưa được chứng minh</h4><p>{finding.limit}</p>
      <h4>Nguồn định lượng</h4><ul className="source-list">{finding.sources.map(source=><li key={source}>{source}</li>)}</ul>
      <p><a href={`${artifactBase}source-records.json`} download>Trích lục CSV, hash & header (JSON)</a> · <a href={`${artifactBase}manifest.json`} download>Manifest SHA-256</a></p>
      <p className="fine-print">Trích lục chọn lọc, có ghi rõ phần đã ẩn thông tin. Toàn bộ capture gốc lưu tại máy phân tích.</p>
      {finding.terms.some(term=>term.token.includes('SHA-256'))&&<dl className="term-list">{finding.terms.filter(term=>term.token.includes('SHA-256')).map(term=><div key={term.token}><dt>{term.token}</dt><dd>{term.meaning}</dd></div>)}</dl>}
      {!!finding.mitre.length&&<><h4>MITRE ATT&CK · ánh xạ theo bằng chứng</h4><dl className="term-list">{finding.mitre.map(item=><div key={item.id}><dt><a href={`https://attack.mitre.org/techniques/${item.id.replace('.','/')}/`} target="_blank" rel="noreferrer">{item.id} · {item.label}</a></dt><dd>{item.reason}<p className="fine-print">{item.limit}</p></dd></div>)}</dl></>}
    </details>
  </article>;
}

export default function App() {
  const [activeFinding,setActiveFinding]=useState(()=>topics[findingFromHash()]?findingFromHash():'network');
  const [activeSection,setActiveSection]=useState('overview');
  const [menuOpen,setMenuOpen]=useState(false);
  const [glossaryQuery,setGlossaryQuery]=useState('');
  const [glossaryOpen,setGlossaryOpen]=useState(false);
  useEffect(()=>{
    const navigate=()=>{
      let target=location.hash.slice(1);
      if(oldAnchors[target]) { const value=oldAnchors[target]; target=topics[value]?`finding-${value}`:value; history.replaceState(null,'',`#${target}`); }
      const id=target.replace('finding-','');
      if(topics[id]) setActiveFinding(id);
      if(!target.startsWith('evidence-E') && target) requestAnimationFrame(()=>document.getElementById(target)?.scrollIntoView({block:'start'}));
      setMenuOpen(false);
    };
    navigate(); window.addEventListener('hashchange',navigate); window.addEventListener('popstate',navigate);
    const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting); if(visible.length)setActiveSection(visible[0].target.id);},{rootMargin:'-72px 0px -55% 0px',threshold:0});
    document.querySelectorAll('main > section').forEach(section=>observer.observe(section));
    return ()=>{window.removeEventListener('hashchange',navigate);window.removeEventListener('popstate',navigate);observer.disconnect();};
  },[]);
  useEffect(()=>{
    const onKey=event=>{
      if(event.key==='Escape')setMenuOpen(false);
      if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){
        event.preventDefault();setGlossaryOpen(true);location.hash='glossary';requestAnimationFrame(()=>document.getElementById('glossary-search')?.focus());
      }
    };
    window.addEventListener('keydown',onKey);return ()=>window.removeEventListener('keydown',onKey);
  },[]);
  const selectFinding=id=>{setActiveFinding(id);history.pushState(null,'',`#finding-${id}`);};
  const selected=report.findings.find(item=>item.id===activeFinding);
  const terms=report.findings.flatMap(finding=>finding.terms.map(term=>({...term,findingId:finding.id}))).filter(term=>`${term.token} ${term.meaning}`.toLocaleLowerCase('vi').includes(glossaryQuery.toLocaleLowerCase('vi')));

  return <>
    <a className="skip-link" href="#main-content">Bỏ qua mục lục, tới nội dung</a>
    <Header menuOpen={menuOpen} onToggleMenu={()=>setMenuOpen(value=>!value)} />
    <Sidebar activeSection={activeSection} open={menuOpen} onNavigate={()=>setMenuOpen(false)} />
    <div className="document-shell"><main id="main-content" tabIndex={-1}>
      <section id="overview" className="overview">
        <p className="breadcrumb">IAM302 <span>/</span> Phân tích động <span>/</span> WannaCry</p>
        <p className="eyebrow">Hồ sơ thí nghiệm · 08 tháng 10, 2026</p>
        <h1>WannaCry, qua<br className="title-break"/> hai phép thử.</h1>
        <p className="lead">{report.lead}</p>
        <dl className="outcomes"><div><dt>A <span>Endpoint có phản hồi</span></dt><dd>Mẫu thoát. Ba tệp giữ nguyên.<a href="#finding-network">Đối chiếu E01 + E02 <span aria-hidden="true">↗</span></a></dd></div><div><dt>B <span>Endpoint không tới được</span></dt><dd>Hai service mới. Ba tệp biến đổi.<a href="#finding-files">Đối chiếu E06 + E07 <span aria-hidden="true">↗</span></a></dd></div></dl>
        <p className="scope-note">Kết luận giới hạn trong <strong>3 tệp thử nghiệm</strong>. Không chứng minh toàn máy bị mã hóa hoặc xác định thuật toán.</p>
        <a className="text-action" href="#analysis">Khám phá cơ chế <span aria-hidden="true">↓</span></a>
      </section>

      <section id="experiment">
        <SectionTitle number="02" title="Thí nghiệm">Cùng mẫu. Hai điều kiện mạng.</SectionTitle>
        <Flow label="Thiết kế phép thử" items={[
          ['Lấy baseline','Ba decoy có SHA-256 ban đầu'],['So sánh A / B','Đổi khả năng tới responder cục bộ'],['Đối chiếu','Procmon + HTTP + service + artifact']]} />
        <details className="reading-level"><summary><span>Môi trường & phương pháp</span><span className="summary-hint">Phạm vi quan sát</span></summary><p>{report.experiment.summary}</p><ol className="prose-list">{report.experiment.steps.map(step=><li key={step}>{step}</li>)}</ol><h3>Giới hạn phép thử</h3><ul className="prose-list">{report.experiment.limits.map(limit=><li key={limit}>{limit}</li>)}</ul></details>
      </section>

      <section id="analysis">
        <SectionTitle number="03" title="Phân tích tương tác">Chọn một hành vi. Hiểu từng bước.</SectionTitle>
        <p className="section-intro">Mô hình để học; bằng chứng để kiểm chứng. Không có mẫu mã độc hay lệnh hệ thống nào được chạy trên trang.</p>
        <div className="topic-navigation" role="group" aria-label="Chọn hành vi phân tích">{report.findings.map((finding,index)=><button type="button" key={finding.id} aria-pressed={activeFinding===finding.id} aria-controls={`finding-${finding.id}`} onClick={()=>selectFinding(finding.id)}><span>{String(index+1).padStart(2,'0')}</span>{topics[finding.id]}</button>)}</div>
        {report.findings.map((finding,index)=><div key={finding.id} hidden={activeFinding!==finding.id}>{activeFinding===finding.id?<Finding finding={finding} number={String(index+1).padStart(2,'0')} />:<span id={`finding-${finding.id}`} />}</div>)}
        <nav className="finding-pagination" aria-label="Hành vi kế tiếp"><span>{report.findings.indexOf(selected)+1} / 6 hành vi</span><button type="button" onClick={()=>selectFinding(report.findings[(report.findings.indexOf(selected)+1)%6].id)}>Hành vi tiếp theo <span aria-hidden="true">→</span></button></nav>
      </section>

      <section id="evidence">
        <SectionTitle number="04" title="Bằng chứng & đối chiếu">Một nhận định. Nhiều nguồn đối chiếu.</SectionTitle>
        <details className="reading-level timeline-disclosure"><summary><span>Khám phá dòng thời gian</span><span className="summary-hint">38 record · hai kịch bản</span></summary><InteractiveTimeline /></details>
        <EvidenceViewer />
        <p className="artifact-downloads"><a href={`${artifactBase}source-records.json`} download>Tải trích lục dữ liệu</a><a href={`${artifactBase}manifest.json`} download>Đối chiếu manifest SHA-256</a></p>
        <p className="fine-print">Ảnh và trích lục là tài liệu quan sát, không phải dữ liệu do mô hình tạo ra. Capture đầy đủ không được công khai.</p>
      </section>

      <section id="conclusions">
        <SectionTitle number="05" title="Kết luận">Thấy gì, kết luận đến đó.</SectionTitle>
        <ul className="conclusion-list">{report.conclusions.map((conclusion,index)=><li key={conclusion}><span>{String(index+1).padStart(2,'0')}</span><p>{conclusion}</p></li>)}</ul>
        <p className="scope-note">Bài học: đối chiếu tiến trình, thời điểm và artifact; không biến tên tệp, cấu hình Auto hoặc DLL được nạp thành bằng chứng tuyệt đối.</p>
      </section>

      <section id="appendix">
        <SectionTitle number="06" title="Tham khảo & phụ lục">Đi sâu khi cần.</SectionTitle>
        <details className="reading-level" id="glossary" open={glossaryOpen} onToggle={event=>setGlossaryOpen(event.currentTarget.open)}><summary><span>Tra cứu thuật ngữ</span><span className="summary-hint">Ctrl / ⌘ K</span></summary>
          <label className="search-label" htmlFor="glossary-search">Tìm khái niệm hoặc tham số</label><input className="search-input" id="glossary-search" type="search" value={glossaryQuery} onChange={event=>setGlossaryQuery(event.target.value)} placeholder="Ví dụ: LocalSystem, DACL, /i" />
          <dl className="term-list">{terms.map(term=><div key={`${term.findingId}-${term.token}`}><dt>{term.token}</dt><dd>{term.meaning} <a href={`#finding-${term.findingId}`}>Xem trong ngữ cảnh</a></dd></div>)}</dl>{!terms.length&&<p role="status">Không có thuật ngữ phù hợp.</p>}
        </details>
        <details className="reading-level"><summary><span>Chín câu hỏi học phần</span><span className="summary-hint">Không mất nội dung chuyên sâu</span></summary><div className="faq-list">{report.appendix.faqs.map(faq=><div key={faq.question}><h3>{faq.question}</h3><p>{faq.answer}</p></div>)}</div></details>
        <details className="reading-level"><summary><span>IOC & MITRE ATT&CK</span><span className="summary-hint">Liên kết về hành vi</span></summary><p className="fine-print">Chỉ dấu không tự chứng minh một máy bị nhiễm. Mỗi ánh xạ MITRE có lý do và giới hạn trong phần chuyên sâu của hành vi.</p><dl className="term-list">{report.appendix.iocs.map(ioc=><div key={ioc.value}><dt><code>{ioc.value}</code></dt><dd>{ioc.meaning}<p className="fine-print">{ioc.limit}</p><a href={`#finding-${ioc.findingId}`}>Kiểm chứng trong phân tích</a></dd></div>)}</dl><ul className="mitre-index">{report.findings.filter(f=>f.mitre.length).map(f=><li key={f.id}><a href={`#finding-${f.id}`}>{topics[f.id]} · {f.mitre.map(m=>m.id).join(', ')}</a></li>)}</ul></details>
        <details className="reading-level"><summary><span>Tài liệu tham khảo & nguồn đầy đủ</span><span className="summary-hint">Tách kiến thức khỏi thực nghiệm</span></summary><ul className="reference-list">{report.appendix.references.map(reference=><li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title} ↗</a></li>)}<li><a href="https://github.com/nimosocute/wannacry-executive-dashboard/blob/main/README.md" target="_blank" rel="noreferrer">README · báo cáo kỹ thuật và danh mục nguồn đầy đủ ↗</a></li></ul><p>R là chỉ số data record 1-based, không tính header. Trích lục công khai kèm hash nguồn gốc và ghi rõ phần đã che thông tin; không thay thế toàn bộ capture.</p></details>
      </section>
      <footer className="document-footer"><span>IAM302 · Nguyen Van Bach</span><a href="#overview">Về đầu báo cáo ↑</a></footer>
    </main></div>
  </>;
}
