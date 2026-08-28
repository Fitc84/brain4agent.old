---
name: .xay-dung-nao-bo
description: Khởi tạo mới hoặc Tự động Chẩn đoán & Tái cấu trúc (Migration) bộ nhớ Não Bộ brain4agent Đa Tầng V5.0 cho bất kỳ dự án nào. Nếu não đã chuẩn sẽ tự động thông báo OK mà không làm xáo trộn dữ liệu.
---

# Hướng Dẫn Vận Hành Hệ Thống Não Bộ (.xay-dung-nao-bo)

Skill này là **Cổng Điều Phối Não Bộ Duy Nhất (Universal Brain Engine)** áp dụng cho toàn bộ các dự án, tích hợp khả năng **Tự động Chẩn Đoán Thông Minh (Smart Auto-Diagnostic)**:
1. **Dự án mới:** Tự động khởi tạo trọn gói 7 phân vùng + Hot Memory + planning/ + AGENTS.md.
2. **Dự án có não cũ / lệch chuẩn:** Tự động di dời file rác ngoài root (`latest_memory.md`), bổ sung phân vùng thiếu và tái cấu trúc an toàn (không làm mất dữ liệu cũ).
3. **Dự án đã chuẩn 100%:** Tự động kiểm tra và thông báo *"NÃO ĐÃ OK — KHÔNG CẦN NÂNG CẤP THÊM!"*.

---

## 🚀 1. Hướng Dẫn Khởi Chạy

Khi Người dùng gọi `/.xay-dung-nao-bo` hoặc yêu cầu "xây dựng não bộ", "khởi tạo não", "nâng cấp não":

1. Đảm bảo đang ở thư mục gốc của dự án.
2. Chạy lệnh tự động hóa:

```powershell
node C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo\scripts\init_brain.js
```

---

## 🔍 2. Quy Trình Xử Lý Sau Khi Chạy Script:

- **Nếu Script báo "NÃO ĐÃ OK":**
  - Báo cáo ngắn gọn với Người dùng: *"Bộ não dự án đã đạt chuẩn Đa Tầng V5.0 hoàn hảo, không cần thay đổi gì thêm."*
- **Nếu Script tạo mới hoặc nâng cấp:**
  - Agent đọc mã nguồn và điền thông tin thực tế của dự án vào `project-intro.md`, `memory-distill.txt`, `index.md`.
  - Báo cáo với Người dùng kết quả thiết lập/nâng cấp hoàn tất.
