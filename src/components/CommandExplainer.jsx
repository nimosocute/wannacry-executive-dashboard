import React, { useState } from 'react';
import { Terminal, Info, ShieldAlert } from 'lucide-react';

export default function CommandExplainer() {
  const [activeCmd, setActiveCmd] = useState('icacls');
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);

  const icaclsTokens = [
    {
      token: 'icacls',
      role: 'Chương trình thực thi',
      mechanism: 'Tiện ích chuẩn Windows (%SystemRoot%\\System32\\icacls.exe) dùng để xem hoặc sửa đổi Access Control Lists (ACLs).',
      limit: 'Không phải malware binary; đây là công cụ hợp pháp của hệ điều hành.'
    },
    {
      token: '.',
      role: 'Đường dẫn mục tiêu',
      mechanism: 'Đại diện cho thư mục làm việc hiện thời: C:\\ProgramData\\evmdthrukdvwcqn063\\ (ghi nhận tại hai Process Start).',
      limit: 'Chỉ tác động thư mục giải nén cục bộ của mã độc, KHÔNG tác động toàn bộ ổ C:.'
    },
    {
      token: '/grant',
      role: 'Tham số sửa đổi quyền',
      mechanism: 'Thêm Access Control Entry (ACE) cho phép vào DACL hiện hữu mà không xóa bỏ các ACE thừa kế khác.',
      limit: 'Không vô hiệu hóa hệ thống bảo vệ Windows; không chuyển Ownership.'
    },
    {
      token: 'Everyone:F',
      role: 'Đối tượng & Quyền',
      mechanism: 'Cấp toàn quyền (Full Control - F) cho nhóm SID S-1-1-0 (Everyone) trên cây thư mục hiện tại.',
      limit: 'Không nâng quyền tiến trình lên SYSTEM; tiến trình gọi đã là SYSTEM từ trước.'
    },
    {
      token: '/T',
      role: 'Đệ quy cây thư mục',
      mechanism: 'Duyệt đệ quy (Traverse) áp dụng thay đổi lên mọi tệp và thư mục con bên trong thư mục hiện hành.',
      limit: 'Chỉ duyệt trong phạm vi thư mục ProgramData của mẫu.'
    },
    {
      token: '/C',
      role: 'Tiếp tục khi lỗi',
      mechanism: 'Bỏ qua lỗi truy cập tệp đang bị khóa và tiếp tục xử lý các đối tượng tiếp theo.',
      limit: 'Không bảo đảm mọi tệp đều được cấp quyền thành công 100%.'
    },
    {
      token: '/Q',
      role: 'Chế độ im lặng (Quiet)',
      mechanism: 'Ngăn in thông báo thành công ra màn hình console chuẩn (stdout).',
      limit: 'Không ẩn tiến trình khỏi Sysinternals Procmon hay Windows Event Log.'
    }
  ];

  const attribTokens = [
    {
      token: 'attrib',
      role: 'Chương trình thực thi',
      mechanism: 'Tiện ích quản lý thuộc tính tệp của Windows (%SystemRoot%\\System32\\attrib.exe).',
      limit: 'Chương trình hệ thống chuẩn, được gọi từ tiến trình cha tasksche.exe.'
    },
    {
      token: '+h',
      role: 'Thêm thuộc tính',
      mechanism: 'Ghi cờ FILE_ATTRIBUTE_HIDDEN (0x02) vào Master File Table (MFT) của hệ thống tệp NTFS.',
      limit: 'Chỉ ẩn giao diện với người dùng mặc định; không mã hóa, không bảo vệ chống đọc/xóa.'
    },
    {
      token: '.',
      role: 'Mục tiêu thư mục',
      mechanism: 'Áp dụng cho thư mục làm việc hiện hành trong ProgramData.',
      limit: 'Chỉ ẩn thư mục thực thi của WannaCry để tránh bị người dùng phát hiện bằng mắt thường.'
    }
  ];

  const currentTokens = activeCmd === 'icacls' ? icaclsTokens : attribTokens;
  const currentToken = currentTokens[selectedTokenIndex] || currentTokens[0];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2128]">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">Trình Giải Thích Cờ Lệnh Hệ Thống</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Nhấp từng thành phần lệnh để xem cơ chế nhân Windows và giới hạn kiểm chứng thực tế.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-0.5 rounded text-xs shrink-0">
          <button
            onClick={() => {
              setActiveCmd('icacls');
              setSelectedTokenIndex(0);
            }}
            className={`px-2.5 py-1 rounded transition font-mono ${
              activeCmd === 'icacls'
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Lệnh icacls
          </button>
          <button
            onClick={() => {
              setActiveCmd('attrib');
              setSelectedTokenIndex(0);
            }}
            className={`px-2.5 py-1 rounded transition font-mono ${
              activeCmd === 'attrib'
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Lệnh attrib
          </button>
        </div>
      </div>

      {/* Interactive Command Bar */}
      <div className="p-3.5 rounded bg-zinc-900/80 border border-zinc-800 flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="text-zinc-500 select-none">$</span>
        {currentTokens.map((item, idx) => {
          const isSelected = selectedTokenIndex === idx;
          return (
            <button
              key={idx}
              onClick={() => setSelectedTokenIndex(idx)}
              className={`px-2 py-1 rounded border transition cursor-pointer ${
                isSelected
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-semibold shadow-sm'
                  : 'bg-zinc-950/60 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
              }`}
            >
              {item.token}
            </button>
          );
        })}
      </div>

      {/* Detail explanation of selected token */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded bg-zinc-900/50 border border-zinc-800/80 space-y-1">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Vai trò cú pháp</div>
          <div className="font-medium text-zinc-200">{currentToken.role}</div>
          <div className="text-[11px] font-mono text-zinc-400">{currentToken.token}</div>
        </div>

        <div className="p-3 rounded bg-zinc-900/50 border border-zinc-800/80 space-y-1 md:col-span-2">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">Cơ chế Nhân Windows</div>
          <p className="text-zinc-300 leading-relaxed text-[11px]">{currentToken.mechanism}</p>
          <div className="text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/60">
            <strong>Giới hạn:</strong> {currentToken.limit}
          </div>
        </div>
      </div>
    </div>
  );
}
