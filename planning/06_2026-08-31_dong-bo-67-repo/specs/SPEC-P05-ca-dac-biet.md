# SPEC-P05 — Các Ca Đặc Biệt (cách ly khỏi xử lý hàng loạt) 🔴

## 1. `brain4agent` (KHÔNG `.old`) — ⚠️ CÁCH LY TUYỆT ĐỐI, CHỜ USER

**Hiện trạng đo 2026-08-31:** dự án Python độc lập ĐANG PHÁT TRIỂN DỞ TAY — branch `main` có lịch sử riêng (commit gần nhất `e01fdbf "test: add safe local model smoke automation"`, trước đó `e179d02 "chore: establish canonical Brain4Agent baseline"`), **38 file modified chưa commit** (toàn code/test/docs thật: `scripts/`, `tests/`, `.agent/manifest.json`...). Root có: `AGENTS.md` + `CLAUDE.md` + `GEMINI.md` + `agent.md` + `pro.md` + `CHAT_CONTEXT_DISTILL.md`, thư mục `Plan/` VIẾT HOA, `.env`, KHÔNG có `brain4agent/` (não kiểu template này).

**Nhận định:** nhiều dấu hiệu cho thấy đây là **hub thế hệ mới kế nhiệm `brain4agent.old`** (tên trùng, commit "canonical Brain4Agent baseline", có sẵn hệ entry-point đa agent riêng). Nếu đúng, việc "đồng bộ nó theo chuẩn của hub cũ" là NGƯỢC chiều tiến hóa — chuẩn tương lai có thể nằm ở chính nó.

**Trong #06 TUYỆT ĐỐI KHÔNG:** commit hộ 38 file, đổi `Plan/`→`planning/`, chạy engine, sửa bất kỳ file nào.

**Câu hỏi cần user trả lời (plan.md câu 1):**
1. Quan hệ `brain4agent` mới ↔ `brain4agent.old`? (kế nhiệm / thử nghiệm / dự án khác hẳn?)
2. Nếu kế nhiệm: kế hoạch #06 có nên chờ chuẩn mới, hay cứ phủ chuẩn v1.2.0 hiện hành rồi hub mới migrate sau?
3. 38 file đang dở: user tự commit hay hướng dẫn cụ thể?

## 2. `aiedu4vn` — ⛔ KHÔNG ĐỤNG (luật thường trực từ #04)

Đã chuẩn đầy đủ (A+C+M+B, git sạch) — TÍNH là đạt trong nghiệm thu toàn kho mà không cần chạm. Có `.env` root: không phải việc của #06.

## 3. `brain4agent.old` (hub) — chỉ nhận hồ sơ kế hoạch

Mọi thay đổi trong #06 với hub chỉ giới hạn ở: `planning/06_*/`, sync `brain4agent/` (cascade), và PATCH engine NẾU lộ bug mới trong lúc thực thi (tiền lệ #04 newline, #05 fake step-0 — mỗi lần như vậy bump PATCH + re-deploy + ghi changelog).

## 4. Ba repo tên đặc biệt — không cách ly, nhưng cưỡng chế thủ tục

| Repo | Vấn đề | Thủ tục |
| :--- | :--- | :--- |
| `Agent to Product` | dấu cách | đã chuẩn não (#05) — chỉ xuất hiện lại nếu P03/P06 cần; mọi lệnh bọc `"..."` |
| `reverse Claude` | dấu cách | như trên |
| `Công cụ phân tích partern` | tiếng Việt có dấu + dấu cách | thuộc lô 4c (não hóa mới). Trước khi chạy: xác nhận engine/Node xử lý path Unicode đúng trên PowerShell (test `node -e "console.log(process.argv[2])"` với path đó); lỗi encode → DỪNG, báo user (có thể cần đổi tên thư mục — quyết định của user) |

## Nghiệm thu (điền khi thực thi)

- [ ] `brain4agent` mới: 0 thay đổi (kiểm `git -C ... status --porcelain` trước/sau chiến dịch giống hệt nhau).
- [ ] `aiedu4vn`: 0 thay đổi (kiểm như trên).
- [ ] Câu trả lời của user cho mục 1 ghi tại đây: (điền)
- [ ] Kết quả test Unicode path cho `Công cụ phân tích partern`: (điền)
