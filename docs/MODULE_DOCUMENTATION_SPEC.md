# 📚 HƯỚNG DẪN KIẾN TRÚC TÀI LIỆU MODULE (MODULE DOCUMENTATION SPECIFICATION)

Tài liệu này định nghĩa tiêu chuẩn và quy tắc quản lý thư mục `docs/` trong hệ thống **Não Bộ Đa Tầng AI Agent**.

---

## 🎯 1. NGUYÊN TẮC ÁNH XẠ 1-1 (1-TO-1 MATCHING INVARIANT)

Mỗi module, sub-package hoặc dịch vụ độc lập trong dự án **BẮT BUỘC** phải có một file tài liệu kỹ thuật tương ứng trong thư mục `docs/` với tên tệp trùng khớp $100\%$ với tên thư mục của module đó:

$$\text{Thư mục: } \texttt{module-tools/<module_name>/} \longleftrightarrow \text{Tài liệu: } \texttt{docs/<module_name>.md}$$

### Ví Dụ:
- `module-tools/python-agent/` $\longrightarrow$ `docs/python-agent.md`
- `module-tools/sync_excel/` $\longrightarrow$ `docs/sync_excel.md`
- `module-tools/xoayproxy/` $\longrightarrow$ `docs/xoayproxy.md`
- `module-tools/bulk_rename/` $\longrightarrow$ `docs/bulk_rename.md`

---

## 📑 2. CẤU TRÚC CHUẨN CỦA MỘT FILE TÀI LIỆU TRONG `docs/`

Một file tài liệu kỹ thuật module chuẩn phải bao gồm các phần sau:

1. **Tổng Quan Về Module (Overview):**
   - ID Module, vị trí thư mục, vai trò nghiệp vụ.
   - Entry Point khởi chạy (CLI / API / Service).
   - Yêu cầu môi trường (Runtime / Dependencies).
2. **Kiến Trúc Kỹ Thuật & Luồng Xử Lý (Architecture & Flow):**
   - Sơ đồ tương tác (Mermaid Flowchart / Sequence Diagram).
   - Danh sách các class / hàm cốt lõi và giao diện public.
3. **Bảng Tham Số CLI & API Endpoints (CLI Flags & Parameters):**
   - Bảng tra cứu các cờ tham số (ví dụ: `--profile`, `--scenario`, `--duration`).
   - Cú pháp mẫu khi chạy từ Terminal / PowerShell.
4. **Ma Trận Edge Cases & Cạm Bẫy Kỹ Thuật (Edge Cases & Gotchas):**
   - Các tình huống lỗi mạng, xung đột cổng, CSP, race conditions và cách xử lý.
5. **Hướng Dẫn Tích Hợp & Mở Rộng (Integration Guide):**
   - Cách module khác hoặc Frontend gọi và sử dụng module này.

---

## 🔄 3. QUY TRÌNH TỰ ĐỘNG ĐỒNG BỘ TÀI LIỆU (MANDATORY SYNC CASCADE)

- Khi Agent tạo một module mới $\rightarrow$ **Bắt buộc tạo ngay file `docs/<module_name>.md`**.
- Khi Agent sửa đổi API, thêm cờ CLI hoặc thay đổi thuật toán $\rightarrow$ **Bắt buộc tự động cập nhật `docs/<module_name>.md`** trước khi kết thúc phiên làm việc.
