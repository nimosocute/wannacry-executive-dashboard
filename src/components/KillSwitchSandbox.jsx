import React, { useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

export default function KillSwitchSandbox() {
  const [responseType, setResponseType] = useState('200'); // '200' | 'timeout'

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1f2128]">
        <div>
          <h3 className="text-sm font-medium text-zinc-200">Mô phỏng Phân nhánh Kill Switch (Safe Lab Model)</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Thay đổi phản hồi của tên miền thử nghiệm để quan sát rẽ nhánh logic nội bộ được kiểm chứng trong Lab.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-0.5 rounded text-xs shrink-0">
          <button
            onClick={() => setResponseType('200')}
            className={`px-2.5 py-1 rounded transition ${
              responseType === '200'
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            HTTP 200 OK (Kịch bản A)
          </button>
          <button
            onClick={() => setResponseType('timeout')}
            className={`px-2.5 py-1 rounded transition ${
              responseType === 'timeout'
                ? 'bg-zinc-800 text-zinc-100 font-medium'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Không phản hồi (Kịch bản B)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
        <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">1. Trạng thái Socket</div>
          <div className="text-zinc-300 font-medium">
            {responseType === '200' ? 'TCP Connect & Receive' : 'TCP Reconnect (8 lần)'}
          </div>
          <div className="text-[11px] text-zinc-500 font-sans">
            {responseType === '200'
              ? 'Nhận 155 byte TCP (R475). Phản hồi từ proxy giả lập cục bộ.'
              : '8 lần thử kết nối lại tới 127.0.0.1:80 không nhận được ACK/phản hồi.'}
          </div>
        </div>

        <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">2. Rẽ nhánh Logic</div>
          <div className="text-zinc-300 font-medium">
            {responseType === '200' ? 'Thoát tiến trình (Exit 0)' : 'Chuyển sang nhánh lây nhiễm'}
          </div>
          <div className="text-[11px] text-zinc-500 font-sans">
            {responseType === '200'
              ? 'PID 6520 kết thúc tại R479 sau 0.89 giây kể từ khi khởi chạy.'
              : 'Tiến trình tiếp tục gọi OpenSCManagerW tạo dịch vụ mssecsvc2.0 (R772).'}
          </div>
        </div>

        <div className="p-3 rounded bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
          <div className="text-[10px] text-zinc-500 uppercase tracking-wider">3. Tác động hệ thống</div>
          <div className="text-zinc-300 font-medium">
            {responseType === '200' ? '0 Decoy bị mã hóa' : '3 Decoy đổi tên .WNCRY'}
          </div>
          <div className="text-[11px] text-zinc-500 font-sans">
            {responseType === '200'
              ? 'Hash 3 tệp mẫu trong Documents giữ nguyên. Không sinh tệp .WNCRY.'
              : 'tasksche.exe mã hóa decoy, ghi mã độc vào ProgramData và khởi động GUI.'}
          </div>
        </div>
      </div>

      <div className="p-2.5 rounded bg-zinc-950 border border-zinc-800/60 text-[11px] text-zinc-400 font-sans flex items-start gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
        <span>
          <strong>Giới hạn kiểm chứng:</strong> Sự đối lập A/B chứng minh mối tương quan thực nghiệm trong môi trường lab. Không có API hook để trích xuất hàm if/else trong nhị phân, và không thể suy rộng rằng mẫu không bao giờ chạy lại nếu khởi động lại máy.
        </span>
      </div>
    </div>
  );
}
