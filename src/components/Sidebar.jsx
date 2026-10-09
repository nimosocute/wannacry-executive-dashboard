import React from 'react';

const navigation = [['overview','Tổng quan'],['experiment','Thí nghiệm'],['analysis','Phân tích tương tác'],['evidence','Bằng chứng & đối chiếu'],['conclusions','Kết luận'],['appendix','Tham khảo & phụ lục']];
export default function Sidebar({ activeSection, open, onNavigate }) {
  return <aside id="report-navigation" className={`sidebar${open ? ' is-open' : ''}`}>
    <div className="sidebar-label">Nội dung báo cáo</div>
    <nav aria-label="Mục lục chính" onClick={onNavigate}>{navigation.map(([id,label],index)=><a href={`#${id}`} key={id} aria-current={activeSection===id?'location':undefined}><span className="nav-number">{String(index+1).padStart(2,'0')}</span>{label}</a>)}</nav>
    <div className="sidebar-meta"><p>IAM302 · Windows 10</p><p>Quan sát ngày 08.10.2026</p><span>Đọc kết quả. Thử mô hình.<br/>Đối chiếu nguồn.</span></div>
  </aside>;
}
