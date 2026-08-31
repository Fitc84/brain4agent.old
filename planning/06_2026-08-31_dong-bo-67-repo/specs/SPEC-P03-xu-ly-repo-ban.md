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

## Nghiệm thu — ✅ HOÀN THÀNH 2026-08-31 17:55

**Sai lệch khảo sát:** lúc thực thi kho có **16** repo bẩn, không phải 15. `control-chatgpt-web` đã tự sạch (user commit `33b8c1c`), nhưng xuất hiện thêm `ai-news-radar`(3) và `fitc84.com`(2) — **do phiên agent KHÁC đang chạy song song trong workspace** (commit lúc 17:36–17:45). Hai repo này bị loại khỏi Bậc 1 vì đó là việc đang dở của phiên khác.

| Repo | Bậc | Hành động | Secret-scan | Não hóa ở P04? |
| :--- | :---: | :--- | :--- | :--- |
| Bugbounty-Hunter (3) | 1 | commit `58177db` — 3 tài liệu governance của workspace `keycrop/` | CLEAN (quét cả NỘI DUNG: 0 khớp key/token) | ✅ có (lô 4c) |
| control-cloudflare (1) | 1 | commit `d20eab6` — plan #01 Cloudflare dashboard | CLEAN | ✅ có → `d5f667a` |
| control-codex (2) | 1 | commit `c509120` — 2 SPEC kiến trúc CC-ARCH-001 + coordinator prompt | CLEAN | ✅ có → `0ede7ed` |
| control-LDplayer (1) | 1 | commit `1c25d8b` — README.MD | CLEAN | ⛔ HOÃN (xem lô 4d) |
| jina-proxy (1) | 1 | commit `606d559` — hướng dẫn tích hợp Jina reverse proxy | CLEAN | ✅ có |
| ai-news-radar (3) | 2 | **chỉ báo cáo** | — | ⛔ không (đã FULL sẵn) |
| fitc84.com (2) | 2 | **chỉ báo cáo** | — | ⛔ không (đã FULL sẵn) |
| CV (4) | 2 | **chỉ báo cáo** | — | ⛔ HOÃN (bẩn giao với `AGENTS.md`) |
| openclaw-pro-studio (2) | 2 | **chỉ báo cáo** | — | ⛔ HOÃN |
| Token-Calcultor (3) | 2 | **chỉ báo cáo** | — | ⛔ HOÃN |
| convert-json-to-9router-from-keycrop (9) | 2 | **chỉ báo cáo** | — | ⛔ HOÃN |
| FITC84-WorkOs- (7) | 2 | **chỉ báo cáo** | — | ⛔ HOÃN |
| GramPilot (15) | 2 | **chỉ báo cáo** | — | ⛔ HOÃN (bẩn GIAO với `AGENTS.md` + `brain4agent/`) |
| control-gpm (59) | 3 | **chỉ chẩn đoán** | — | ⛔ HOÃN (bẩn GIAO với `brain4agent/`) |
| ViDiaNorm (294) | 3 | **chỉ chẩn đoán** | — | ⛔ HOÃN (bẩn + `Plan/` hoa) |

- [x] 0 commit nào chứa secret. Bậc 1 kiểm 3 lớp: tên file (§3), **nội dung** (regex `api_key|bearer|token|sk-|jina_|ghp_|AIza` trên mọi file sắp commit → 0 khớp), và `git show --name-only` sau commit.
- [x] 0 message chung chung ở Bậc 1 — mỗi message viết sau khi đọc nội dung file thật.

### Báo cáo Bậc 2 (đủ 4 ý: số file · phân loại · tiêu biểu · khuyến nghị)

- **`ai-news-radar` (3)** — 2 file não sửa (`brain4agent/index.md` +2, `roadmap.md` +10/-2) + thư mục `planning/09_2026-08-31_dedup-health-backup/` mới. *Tiêu biểu:* `planning/09_.../`. *Khuyến nghị:* đây là kế hoạch đang viết dở của phiên agent khác — để phiên đó tự đóng.
- **`fitc84.com` (2)** — mã nguồn thật: `src/components/sections/Hero.astro` (+43/-8), `src/styles/global.css` (+17/-9). *Khuyến nghị:* phiên khác đang sửa UI hero, commit `786ec6f` vừa xong lúc 17:42 — không đụng.
- **`CV` (4)** — `D agent.md` (xoá 34 dòng), `?? AGENTS.md` (8 KB, KHÔNG phải bản đổi tên của `agent.md`), `?? memory.md` (18 KB), `?? NKC/` (13 file: 8 md, 2 pdf, 2 html — hồ sơ ứng tuyển cá nhân). *Khuyến nghị:* việc xoá `agent.md` là quyết định nội dung của chủ dự án; cần user xác nhận `AGENTS.md` mới có thay thế nó không rồi mới commit.
- **`openclaw-pro-studio` (2)** — `M Token-Calcultor` là **thay đổi con trỏ gitlink** (submodule), `?? cross_ai_bridge/.gitignore`; repo còn 3 thư mục git lồng (`cross_ai_bridge`, `Token-Calcultor`, `Token-Calcultor/wikiultra`). *Khuyến nghị:* đổi con trỏ submodule không bao giờ là "lành tính" — user tự commit.
- **`Token-Calcultor` (3)** — `MM .gitignore` (+15/-1, đã có phần staged sẵn từ trước), `D wikiultra` (gitlink bị xoá khỏi index) + `?? wikiultra/` (thư mục git lồng còn trên đĩa). *Khuyến nghị:* repo đang ở giữa một thao tác gỡ submodule dở dang — user hoàn tất trước.
- **`convert-json-to-9router-from-keycrop` (9)** — 5 file governance sửa thật (`.agent/task-contract.md` +112/-25, `plan/README.md`, `ROADMAP.md`, `SPEC-TEMPLATE.md`, `WORKLOG.md`) + 4 SPEC mới (`plan/specs/SPEC-0003..0005`, `plan/EXECUTION-GUIDE.md`). Tổng +232/-54. *Khuyến nghị:* một phiên làm việc governance hoàn chỉnh đang dở — chủ dự án tự đóng bằng message đúng ngữ cảnh.
- **`FITC84-WorkOs-` (7)** — `M .gitignore` (binary diff 286→482 byte), `D server.pid`, + 5 thư mục untracked mà **4 trong số đó là repo git lồng**: `Design/`, `Practice-WS3/`, `login-kiro-render/` (còn lồng tiếp `kiro-login-helper/`), `testhackathon/`. *Khuyến nghị:* xử 4 repo lồng trước (submodule thật hay gitignore), rồi mới commit.
- **`GramPilot` (15)** — 13 file sửa: mã extension (`apps/extension/src/background.ts` +10, `chrome.d.ts`, `sidepanel/index.html`), CI (`.github/workflows/ci.yml`), `package.json`, và **6 file não** (`AGENTS.md` +1, `brain4agent/changelog.md` +62, `memory-distill.txt`, `state.json`, `today.md`, `roadmap.md`, `-known-gotchas.md`) + `planning/09_2026-08-30_footer-declutter-privacy/` + `scripts/check-plan-spec.mjs`. *Khuyến nghị:* phần bẩn GIAO trực tiếp với file não → không thể vá não mà không trộn việc của user. Chờ user commit trước.

### Báo cáo Bậc 3 (chẩn đoán nguồn gốc)

- **`control-gpm` (59)** = 49 sửa + 2 xoá + 8 mới. Phân bố: `module-tools/` 42 (38 file `.py`), `brain4agent/` 6, `docs/` 3, `planning/` 3, `src-tauri/` 3, `.gitignore`, `package.json`. Diff `1085+/1079-`; bỏ qua khoảng trắng vẫn `1073+/1067-` ⇒ **KHÔNG phải artefact line-ending/CRLF, là công việc dev Python thật**. Vẫn treo vá `CLAUDE.md` từ #04 nhưng phần bẩn giao với `brain4agent/` → không vá được. *Khuyến nghị:* user commit đợt refactor `module-tools` trước, rồi chạy engine.
- **`ViDiaNorm` (294)** = 51 sửa + 243 mới. Phân bố file mới: `reports/` 142, `data/` 106 — đa số **không có phần mở rộng** (184) hoặc `.json`/`.jsonl` ⇒ đúng là **output của pipeline**, nên gitignore chứ không commit. 51 file sửa là code/spec thật (`Plan/` 14, `scripts/` 12, `src/` 9, `tests/` 6; `2571+/299-`, không đổi khi bỏ qua khoảng trắng). *Khuyến nghị:* (1) thêm `reports/` + `data/` vào `.gitignore`; (2) user commit 51 file dev; (3) sau đó mới não hóa — repo còn `Plan/` VIẾT HOA, engine sẽ tự đổi tên nên phải grep tham chiếu trước.

### Ghi nhận thêm: secret ĐÃ tracked từ trước (§3.5 — không đụng)

- **Một repo proxy (tên ở hồ sơ chỉ-lưu-máy)**: `AGENTS.md` của chính repo ghi rõ *"khoá API được lưu cứng theo thiết kế"*. Đây là lựa chọn kiến trúc có sẵn của user, nằm trong commit cũ — #06 KHÔNG untrack hộ, chỉ báo cáo để user cân nhắc chuyển sang cơ chế secret binding của nhà cung cấp.
