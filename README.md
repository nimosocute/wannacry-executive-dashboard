# 🛡️ BÁO CÁO ĐIỀU HÀNH: PHÂN TÍCH HÀNH VI RANSOMWARE WANNACRY
> **Dành cho Lãnh đạo & Ban Giám đốc (Bản tóm tắt TL;DR đọc trong 30 giây)**  
> *Được thực hiện qua phân tích động cô lập trên môi trường lab thực tế bởi: Nguyen Van Bach (DE200409)*

[![Live Demo](https://img.shields.io/badge/Vercel-Live_Dashboard-blue?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Status](https://img.shields.io/badge/Security_Status-ANALYZED-success?style=for-the-badge)](https://github.com)
[![Threat Level](https://img.shields.io/badge/Threat_Level-CRITICAL-red?style=for-the-badge)](https://attack.mitre.org)

---

## ⚡ 1. TÓM TẮT ĐIỀU HÀNH (EXECUTIVE BRIEFING — ĐỌC TRONG 30 GIÂY)

| Chỉ số rủi ro | Kịch bản A (Có công tắc hủy) | Kịch bản B (Bị tấn công thực tế) | Ý nghĩa đối với Doanh nghiệp |
| :--- | :---: | :---: | :--- |
| **Tình trạng hệ thống** | 🟢 **AN TOÀN 100%** | 🔴 **TÊ LIỆT TOÀN BỘ** | Mã độc có tính năng tự hủy nếu đáp ứng điều kiện mạng. |
| **Thời gian phá hoại** | `0.89 giây` (Tự tắt) | `< 3.0 giây` (Mã hóa xong) | Tốc độ lây lan cực nhanh, con người không kịp trở tay. |
| **Thiệt hại tài chính** | **0 USD** | **$300 USD / máy** (bằng Bitcoin) | Sẽ tăng gấp đôi ($600) sau 3 ngày; mất dữ liệu sau 7 ngày. |
| **Tệp dữ liệu bị khóa** | **0%** (Tệp nguyên vẹn) | **100%** (Đổi đuôi `.WNCRY`) | Mất toàn bộ tài liệu Word, Excel, hợp đồng, kế toán. |
| **Tự khởi động ngầm** | ❌ Không | ⚠️ **2 Dịch vụ Windows bí mật** | Khởi động lại máy tính vẫn bị nhiễm mã độc. |

### 📌 Điểm mấu chốt sếp cần biết:
1. **WannaCry là gì?** Là mã độc tống tiền tự động. Khi lọt vào máy tính, nó âm thầm khóa toàn bộ tài liệu quan trọng và đòi tiền chuộc 300$ bằng Bitcoin để mở khóa.
2. **"Công tắc hủy" (Kill-Switch) thần kỳ:** Trước khi phá hoại, mã độc sẽ bí mật "gọi điện" hỏi thăm một tên miền bí mật.
   - Nếu tên miền này **có phản hồi**: Mã độc tưởng mình đang bị chuyên gia bảo mật theo dõi -> **Nó lập tức tự hủy và thoát trong 0.89 giây** (Kịch bản A).
   - Nếu tên miền **không phản hồi (mất mạng)**: Nó lập tức kích hoạt bộ máy phá hủy, khóa sạch dữ liệu và thay hình nền tống tiền (Kịch bản B).
3. **Bài học sống còn cho công ty:** Không chặn bừa bãi tên miền kill-switch nội bộ, và phải vá lỗ hổng Windows ngay lập tức.

---

## 🎯 2. BA HÀNH ĐỘNG ĐỀ XUẤT CHO BAN GIÁM ĐỐC (ACTION ITEMS)

- [x] **Hành động 1 (Khẩn cấp):** Phê duyệt cho bộ phận IT rà soát và cài đặt ngay bản vá **MS17-010** trên toàn bộ máy tính Windows trong công ty.
- [x] **Hành động 2:** Khóa cổng chia sẻ file nội bộ (`SMB Port 445`) không cho phép truy cập trực tiếp từ Internet vào mạng công ty.
- [x] **Hành động 3:** Cấu hình sao lưu (Backup) dữ liệu quan trọng ra ổ cứng rời / đám mây độc lập định kỳ hàng tuần.

---

## 🖥️ 3. SO SÁNH TRỰC QUAN 2 KỊCH BẢN THỰC NGHIỆM

### 🟢 Kịch bản A: Kích hoạt Công tắc Hủy (HTTP 200 OK)
- **Thao tác:** Máy ảo giả lập mạng phản hồi HTTP 200 OK cho tên miền kill-switch.
- **Kết quả:** Mã độc gửi 1 truy vấn HTTP, nhận phản hồi, và tự động tắt sạch sau **0.89 giây** (PID 6520). Toàn bộ file thử nghiệm nguyên vẹn 100%.

### 🔴 Kịch bản B: Mất mạng & Kích hoạt Ransomware Toàn diện
- **Thao tác:** Máy ảo bị ngắt kết nối mạng (Connection Refused).
- **Kết quả:**
  1. Mã độc thử kết nối lại 4 lần (~500ms/lần), thấy thất bại liền bắt đầu tấn công.
  2. Tự cài 2 Dịch vụ hệ thống: `mssecsvc2.0` (ngụy trang Trung tâm bảo mật Microsoft) và `evmdthrukdvwcqn063`.
  3. Sinh 15 tiến trình phá hoại ngầm dưới quyền cao nhất hệ thống (`SYSTEM`).
  4. Quét và mã hóa toàn bộ tệp tin mồi: ghi header độc quyền `WANACRY!` và đổi đuôi tệp thành `.WNCRY`.
  5. Đổi hình nền màn hình thành màu đen cảnh báo, bật cửa sổ **Wana Decrypt0r 2.0** đếm ngược đòi 300 USD Bitcoin.

---

## 🔍 4. BẢNG CHỈ SỐ NHẬN DIỆN MÃ ĐỘC (IOC CHO ĐỘI KỸ THUẬT)

| Loại chỉ số | Giá trị nhận diện | Cách xử lý |
| :--- | :--- | :--- |
| **Mã băm SHA-256** | `24D004A104D4D54034DBCFFC2A4B19A11F39008A575AA614EA04703480B1022C` | Chặn trong Antivirus/EDR |
| **Tên miền Kill-switch** | `www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com` | Trỏ loopback nội bộ để kích hoạt tự hủy |
| **Dịch vụ độc hại** | `mssecsvc2.0`, `evmdthrukdvwcqn063` | Xóa bỏ ngay trong Service Manager (`sc delete`) |
| **Đuôi tệp mã hóa** | `.WNCRY` (Header: `WANACRY!`) | Dấu hiệu nhận biết máy bị lây nhiễm |
| **Ví Bitcoin tống tiền** | `115p7UMMngoj1pMvkpHijcRdfJNXj6LrLn` | Báo cáo cơ quan điều tra an ninh mạng |

---

## 🚀 5. HƯỚNG DẪN TRIỂN KHAI TRÊN VERCEL (1 PHÚT)

Dự án này là một **SPA Dashboard hoàn chỉnh** chuẩn SaaS:
1. **Cách 1: Triển khai qua GitHub (Khuyên dùng)**
   - Đẩy toàn bộ thư mục `spa_dashboard` lên GitHub repository của bạn.
   - Truy cập [Vercel Dashboard](https://vercel.com/new) -> Chọn **Import Git Repository**.
   - Vercel sẽ tự động nhận diện và triển khai tức thì (Zero Config).
2. **Cách 2: Triển khai trực tiếp qua Vercel CLI**
   ```bash
   cd spa_dashboard
   npm i -g vercel
   vercel --prod
   ```
