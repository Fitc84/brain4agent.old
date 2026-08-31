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

## Nghiệm thu — ✅ HOÀN THÀNH 2026-08-31

- [x] **`brain4agent` (mới): 0 thay đổi.** TRƯỚC `head=e01fdbf, dirty=38` → SAU `head=e01fdbf, dirty=38`. `git reflog -1` vẫn là `e01fdbf commit: test: add safe local model smoke automation`; commit gần nhất `2026-08-12 19:51:41` ⇒ không có thao tác ghi nào trong phiên #06. Không commit hộ 38 file, không chạy engine, không đổi `Plan/`.
- [x] **`aiedu4vn`: 0 thay đổi.** TRƯỚC `head=a37ca3e dirty=0` → SAU `head=a37ca3e dirty=0`. (Lưu ý: commit `a37ca3e` lúc `17:33:03` là của **phiên agent khác**, không phải #06.)
- [x] **Câu trả lời của user cho mục 1: CHƯA CÓ.** Chiến dịch chạy theo quyết định mặc định đã chốt ở `plan.md` mục 5.1 (cách ly tuyệt đối). 3 câu hỏi ở mục 1 của SPEC này VẪN TREO chờ user.
- [x] **Test Unicode path cho `Công cụ phân tích partern`:** `node -e "console.log(process.argv[1])" "D:\Data\Repositories\.My-Repositories\Công cụ phân tích partern"` → in lại **đúng nguyên văn có dấu**, không lỗi encode. Repo não hóa bình thường: commit `88f533e`, `NÃO ĐÃ OK`. **Không cần đổi tên thư mục.**
- [x] **`Agent to Product` / `reverse Claude`:** không cần đụng (đã chuẩn não từ #05, git sạch, không rơi vào nhóm nào của #06). Mọi lệnh trong chiến dịch đều bọc ngoặc kép — không repo tên-có-dấu-cách nào lỗi.

### Ca đặc biệt PHÁT SINH khi thực thi (không có trong SPEC gốc)

**Có phiên agent KHÁC đang chạy song song trên cùng workspace.** Đo được bằng dấu thời gian commit nằm GIỮA phiên #06 (bắt đầu ~17:35):

| Repo | Commit của phiên khác | Thời điểm |
| :--- | :--- | :--- |
| `brain4agent.old` (chính hub này) | `8846338 docs(plan): close out plan #05 record and session log` | 17:40:58 |
| `control-claude-code` | `9f7cf03` → `7718a6e` (plan #11 SPEC-04/05) | 17:42:54 → 17:45:26 |
| `fitc84.com` | `786ec6f fix(ui): replay hero reveal…` | 17:42:20 |
| `aiedu4vn` | `a37ca3e docs(planning): draft plan #17` | 17:33:03 |

**Hệ quả đã xử:** `ai-news-radar`(3) và `fitc84.com`(2) bẩn lên GIỮA CHỪNG so với khảo sát → **loại khỏi Bậc 1 của P03, chỉ báo cáo**, tránh commit đè việc đang dở của phiên khác. Đã ghi thành gotcha #8 trong `brain4agent/-known-gotchas.md` của hub.
