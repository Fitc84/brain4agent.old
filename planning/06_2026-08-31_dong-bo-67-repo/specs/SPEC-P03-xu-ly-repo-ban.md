# SPEC-P03 — Xử Lý 14 Repo Working Tree Bẩn 🟠

## Phạm vi (đóng khung — `brain4agent` mới ĐÃ LOẠI, sang SPEC-P05)

`Bugbounty-Hunter`(3), `control-chatgpt-web`(1), `control-cloudflare`(1), `control-codex`(2), `control-gpm`(59), `control-LDplayer`(1), `convert-json-to-9router-from-keycrop`(9), `CV`(4), `FITC84-WorkOs-`(7), `GramPilot`(15), `jina-proxy`(1), `openclaw-pro-studio`(2), `Token-Calcultor`(3), `ViDiaNorm`(294)

## Nguyên tắc bậc thang (chờ user chốt ở plan.md câu hỏi 2)

Thay đổi đang dở là CỦA USER — agent không được đoán ý. Xử theo bậc:

- **Bậc 1 — Bẩn nhẹ, lành tính rõ ràng (mặc định chỉ áp cho ≤4 file):** đọc `git diff` + `git status` đầy đủ. Nếu toàn bộ thay đổi tự giải thích được (docs sửa chữ, file log/output mới, config đổi giá trị hiển nhiên) → commit as-is với message MÔ TẢ ĐÚNG nội dung thật (đọc diff rồi viết, cấm message chung chung). Nghi ngờ dù chỉ 1 file → rơi xuống Bậc 2.
- **Bậc 2 — Bẩn nhiều / khó hiểu / đang dở tay thật:** KHÔNG commit hộ. Ghi báo cáo: số file, phân loại nhanh (code/docs/output), 5 đường dẫn tiêu biểu, khuyến nghị. Repo vẫn được não hóa ở P04 **chỉ khi** phần bẩn không giao với file não sẽ đụng (kiểm giao tập trước); có giao → hoãn não hóa repo đó.
- **Bậc 3 — Nghi output/rác hàng loạt** (`ViDiaNorm` 294 file, `control-gpm` 59): chỉ chẩn đoán nguồn gốc (untracked output? line-ending? build?) và đề xuất — không đụng.

## Lưu ý riêng từng repo

| Repo | Lưu ý |
| :--- | :--- |
| control-chatgpt-web(1) | Sạch lúc commit #04 (`e433b55`), bẩn lại 1 file sau đó — soi xem là gì (nghi CRLF normalize hoặc user sửa); nếu là hệ quả line-ending từ đợt vá #04 thì báo rõ |
| control-cloudflare(1), control-codex(2), GramPilot(15), control-gpm(59) | Đang treo vá não từ #04 (thiếu `CLAUDE.md`) — sau khi xử bẩn xong (bậc nào cũng vậy, miễn không giao tập) chạy engine vá ở P04 |
| control-codex, control-LDplayer(2 thư mục hoa), ViDiaNorm | Có `DOCS`/`Plan` viết hoa — KHÔNG chạy engine ở SPEC này; P04 xử lý riêng với grep tham chiếu |
| CV(4), jina-proxy(1) | Có `AGENTS.md` nhưng không có `brain4agent/` — P04 nhóm "A-không-B" |
| GramPilot | có `.env.local` — nếu commit bậc 1 thì secret gate §3 bắt buộc |
| openclaw-pro-studio(2) | có `.env` — như trên |

## Nghiệm thu (điền khi thực thi)

Bảng: repo · bậc áp dụng · hành động (SHA commit / báo cáo) · secret-scan · có được não hóa ở P04 không + lý do.

- [ ] 0 commit nào chứa secret; 0 message chung chung ở bậc 1.
- [ ] Mọi repo bậc 2/3 có mục báo cáo đủ 4 ý (số file, phân loại, tiêu biểu, khuyến nghị).
