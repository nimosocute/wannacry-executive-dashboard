import React, { useState } from 'react';
import { Image as ImageIcon, ExternalLink, X, ZoomIn } from 'lucide-react';

export default function EvidenceViewer({ items = [] }) {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#1f2128]">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">Kho Bằng Chứng Đa Công Cụ (8 Ảnh Uncropped)</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Bằng chứng thực nghiệm chụp trực tiếp từ môi trường máy ảo VMware không qua cắt gọt.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedItem(item)}
            className="group cursor-pointer rounded bg-zinc-900/40 border border-zinc-800/80 hover:border-zinc-700 transition overflow-hidden flex flex-col"
          >
            <div className="aspect-video bg-zinc-950 relative overflow-hidden flex items-center justify-center">
              <img
                src={item.file}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                loading="lazy"
              />
              <div className="absolute top-1.5 left-1.5 font-mono text-[9px] px-1.5 py-0.5 rounded bg-black/80 text-zinc-300 border border-zinc-800">
                {item.id}
              </div>
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <ZoomIn className="w-5 h-5 text-zinc-200" />
              </div>
            </div>

            <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1 text-xs">
              <div>
                <h4 className="font-medium text-zinc-200 text-[11px] truncate">{item.title}</h4>
                <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-tight">{item.caption}</p>
              </div>
              <div className="text-[9px] font-mono text-zinc-500 pt-1 border-t border-zinc-800/60 truncate">
                {item.source}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal high-res inspector */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="max-w-4xl w-full bg-[#0d0e12] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3 border-b border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                  {selectedItem.id}
                </span>
                <span className="font-medium text-zinc-200">{selectedItem.title}</span>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-auto p-2 bg-zinc-950 flex items-center justify-center min-h-[300px]">
              <img
                src={selectedItem.file}
                alt={selectedItem.title}
                className="max-w-full max-h-[60vh] object-contain rounded"
              />
            </div>

            <div className="p-3.5 border-t border-zinc-800 bg-[#0f1015] space-y-2 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                  Phân tích tại chỗ
                </span>
                <p className="text-zinc-300 text-xs leading-relaxed mt-0.5">{selectedItem.caption}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-zinc-400 pt-1 border-t border-zinc-800/60">
                <span>Nguồn đối chiếu: {selectedItem.source}</span>
                <a
                  href={selectedItem.file}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-zinc-300 hover:text-white"
                >
                  <span>Mở ảnh gốc</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
