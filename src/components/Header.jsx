import React from 'react';

export default function Header({ menuOpen, onToggleMenu }) {
  return <header className="site-header">
    <a className="brand" href="#overview" aria-label="WannaCry — về tổng quan"><span className="brand-mark" aria-hidden="true">W</span><strong>WannaCry</strong><span className="brand-divider" aria-hidden="true">/</span><span className="brand-type">Hồ sơ nghiên cứu</span></a>
    <div className="header-actions"><a href="https://github.com/nimosocute/wannacry-executive-dashboard/blob/main/README.md" target="_blank" rel="noreferrer">Bản đầy đủ <span aria-hidden="true">↗</span><span className="sr-only"> (tab mới)</span></a><button type="button" className="menu-toggle" onClick={onToggleMenu} aria-expanded={menuOpen} aria-controls="report-navigation">Mục lục</button></div>
  </header>;
}
