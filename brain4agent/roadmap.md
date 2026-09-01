# Roadmap & Active Tasks

File này chứa danh sách các tính năng, mục tiêu sắp tới và tình trạng công việc hiện tại của **brain4agent (v1.5.0)**.

## Mục tiêu hiện tại (Active)
- [ ] **Lan luật SPEC PACKAGE ra 66 repo đã não hóa (v1.5.0, 01/09):** luật đã vào `AGENTS.md` Hub + `CORE_GOVERNANCE_RULES.md` + template & **patcher** trong `init_brain.js` (đã test thật: vá đúng, idempotent). Repo cũ nhận luật khi chạy `init_brain` lần kế tiếp — CHƯA chạy hàng loạt. Cần: (a) `npm run deploy` đẩy skill sang Global AI Skills; (b) quyết có quét lại 66 repo ngay hay để tự vá dần theo phiên làm việc.
- [ ] **Kế hoạch #06 — Đồng bộ cấu trúc 67 repo (DRAFT chờ user duyệt):** trục GIT trước (9 repo git-init + 13 first-commit + 14 xử bẩn bậc thang) → trục NÃO sau (4 lô não hóa). Đã kiểm kê 67/67; 15 repo có secret ở root → Giao Thức Chống Lộ Key bắt buộc; 2 ca cách ly (`brain4agent` mới — nghi hub thế hệ kế nhiệm đang dở 38 file, `aiedu4vn`). 3 câu hỏi chờ user tại `planning/06_2026-08-31_dong-bo-67-repo/plan.md` mục 5. Kế hoạch này KẾ THỪA + ĐÓNG mọi mục treo của #04/#05.
- [ ] **Kế hoạch #05 — phần còn treo:** (a) `CausalAgent` Giai đoạn 2 (dọn 18 `scratch_*.py` + 8 file dữ liệu ở root) — cần user tạo commit đầu tiên "as-is" mới mở gate; (b) `Audit`: `security_platform.db` mồ côi ở root do `db.py` dùng path tương đối theo CWD + `requirements.txt` có dòng cuối UTF-16LE (đã nạp vào não repo đó, chưa sửa code); (c) `reverse Claude`: gate `verify-documentation-integrity.js` FAIL do 2 broken link trỏ `output/target_corpus/` — lỗi có TRƯỚC đợt não hóa.
- [ ] **Rollout #04 — 6 repo còn treo chờ user (13/19 đã xử lý):** (a) 4 repo working tree bẩn sẵn: `GramPilot` (15 file), `control-gpm` (59), `control-codex` (2), `control-cloudflare` (1) — dọn sạch rồi chạy lại engine; (b) 2 repo CHƯA có commit nào (unborn `main`, không phải detached): `control-discord`, `teamworkflow` — cần user tạo mốc commit đầu tiên trước; riêng `teamworkflow` còn phải quyết có não hóa không (`AGENTS.md` của nó là Next.js tooling notice).
- [ ] **Rollout #04 — việc ngoài phạm vi:** (c) 6 repo Nhóm C chưa có `AGENTS.md` — quyết định riêng từng dự án; (d) bản script cũ lạc `Agent to Product/.agents/skills/.brain-build/scripts/init_brain.js` — chờ user xử; (e) 4 repo `control-keypassxc|router|syncthing|tailscale` KHÔNG có git riêng (nằm trong vùng bị repo cha ignore) — user cân nhắc `git init` để có đường revert.
- [x] Phát hành phiên bản chính thức **brain4agent v1.2.0** (Brain Version Marker) + hotfix **v1.2.1** (POSIX newline).

## Tương lai (Upcoming)
- [ ] Nghiên cứu cơ chế Vector Memory & Semantic Search tích hợp cho Brain V2.0.
- [ ] Xây dựng test suite tự động kiểm tra tính tương thích của Brain Engine trên cả Windows / Linux / macOS.


## 🔴 Active — việc còn lại chờ user (sau khi #06 đóng)

Chi tiết + bằng chứng ở [`planning/06_2026-08-31_dong-bo-67-repo/plan.md`](file:///planning/06_2026-08-31_dong-bo-67-repo/plan.md) mục 6-7.

- [ ] **🔒 XOAY KHOÁ (ưu tiên cao nhất)** — 6 chỗ có secret nằm sẵn trong lịch sử git hoặc lộ ra client, sửa code KHÔNG đủ:
  Danh sách 6 vị trí (repo · đường dẫn · loại khoá) được giữ ở hồ sơ chỉ-lưu-máy ngoài git, không đưa lên kho công khai.
- [ ] **Tìm và tắt tiến trình NHÂN BẢN ngoài git** đang chép repo top-level vào các thư mục lồng (12 cặp). Đây là thứ làm `git status` của `openclaw-pro-studio` gãy. Xem gotcha #9.
- [ ] **Quyết cách xử 12 cặp repo lồng nhau** — hiện đã `.gitignore` để đi tiếp; hướng dứt điểm là biến thành submodule thật (cần URL remote), hoặc gỡ một tầng thư mục.
- [ ] **`brain4agent` (mới)** — repo DUY NHẤT chưa não hóa. Trả lời 3 câu hỏi ở `planning/06_*/specs/SPEC-P05-ca-dac-biet.md` mục 1 (quan hệ với hub `.old`, có chờ chuẩn mới không, 38 file đang dở).
- [ ] **Commit việc đang dở rồi chạy `init_brain.js`** ở `control-gpm` và `GramPilot` để bổ sung field `brain_template_version` còn thiếu trong `state.json`.
- [ ] **`ViDiaNorm`:** gitignore output pipeline (`reports/` 117 file + `data/` 105 file) rồi commit 51 file dev thật.
- [ ] **`FITC84-WorkOs-`:** sửa `.gitignore` bị BOM UTF-8 + dòng UTF-16 (khiến `server.pid` không được ignore); repo còn tracked một file tên bắt đầu bằng dấu cách (` test.pid`).
- [ ] **`manage-fitc84`:** cân nhắc gitignore `data/fitc84.db*` — SQLite WAL đang chạy đã vào lịch sử git kèm dữ liệu khách hàng.
- [ ] **`CausalAgent` dọn root:** cần sửa `scratch_*.py` cho độc-lập-vị-trí (`Path(__file__).resolve().parents[1]`) trước, rồi mới di chuyển được.
- [ ] **`openclaw-pro-studio`:** bỏ track `admin_server.log`; cân nhắc gộp `AGENT_GUIDELINES.md` vào `AGENTS.md` để chỉ còn MỘT nguồn chân lý.

## 💡 Kho Ý Tưởng & Backlog (Idea Vault)
*Nơi lưu trữ các ý tưởng hay, kiến trúc mở rộng chưa ưu tiên làm ngay nhưng cần giữ lại để tham khảo.*
- [ ] **AI Multi-Model Benchmark Suite:** Script tự động đánh giá chất lượng khôi phục ngữ cảnh của Claude vs GPT vs Gemini khi nạp `today.md`.
- [ ] **Cross-OS Path Normalizer:** Chuẩn hóa đường dẫn tương đối xuyên suốt giữa môi trường Windows PowerShell và Linux Bash.

## Đã hoàn thành (Done)
- [x] **Đóng nốt chiến dịch #06 (v1.4.0, 2026-09-01):** 20 commit nữa → tổng 76 commit local, 0 push. `PARENT_GIT 0` · `UNBORN 0` · **não chuẩn 66/67**. Điều phối 4 subagent Opus song song; orchestrator kiểm chứng độc lập lại toàn bộ (secret-scan 84 commit → 0 vi phạm). Sinh 2 gotcha mới (#9 nhân bản ngoài git, #10 não hóa repo đang bẩn bằng stage tường minh).
- [x] **Đồng bộ cấu trúc 67 repo (v1.4.0, kế hoạch #06):** GIT TRƯỚC — NÃO SAU. Kết quả đo bằng script kiểm kê chạy 2 lần: `PARENT_GIT 9→0`, `UNBORN 13→5`, não chuẩn `21→52`, 56 commit local (0 push), 0 secret lọt vào bất kỳ commit nào (kiểm 3 lớp độc lập). Thực thi bằng 4 subagent song song cho phần điền nội dung não + orchestrator kiểm chứng độc lập lại toàn bộ. Sinh 3 gotcha mới (#6 biến PowerShell ghi đè hằng regex, #7 repo git lồng nhau, #8 phiên agent song song).
- [x] **Não hóa Nhóm C — 6 dự án (v1.4.0, kế hoạch #05):** Spec-First 6 SPEC theo lớp di trú A/A+/B/B+/C/D, thực thi bằng 6 subagent song song 2 đợt + orchestrator kiểm chứng độc lập. Kết quả 6/6: `block-ads-fb-v2` `1c0569e`, `dreamteam4vn` `79efb93`+`cb2bcfa`, `Audit` `451f1ac`, `reverse Claude` `bf7e959`, `Agent to Product` `a7c6ce4`, `CausalAgent` GĐ1 (không commit — repo unborn, đúng thiết kế). Sinh 2 mẫu tái dùng: "di trú ngữ nghĩa trước — engine sau" và "cộng sinh + pointer file" cho dự án có Brain OS legacy. Kèm hotfix engine "vá Bước 0 giả".
- [x] **Rollout khung não v1.2.0 ra hệ sinh thái — đợt 1 (v1.2.1, kế hoạch #04):** Vá + commit local 9/18 repo Nhóm A (pilot `control-claude-code` được user duyệt trước khi rollout); sửa hotfix `init_brain.js` thiếu newline cuối `state.json` (user phát hiện, thêm `hasStateJsonTrailingNewline` vào chẩn đoán); xác nhận thực chiến fallback phụ lục P09 trên 2 repo `AGENTS.md` phi chuẩn. KHÔNG push. Bằng chứng: `planning/04_2026-08-31_rollout-ecosystem/plan.md`.
- [x] **Brain Version Marker — nhìn thấy ngay phiên bản khung não ở root (v1.2.0):** Thêm `brain_template_version` vào `state.json` (nguồn chân lý máy đọc), sinh marker `brain4agent-v<x.y.z>.md` ở root (bản soi cho người, cưỡng chế đúng 1 file, tự xoá bản cũ khi bump), thêm ngoại lệ vào Luật Root Clean (§5.G/LUẬT 6), cập nhật chẩn đoán `init_brain.js` (`hasBrainVersionMarker`). Đợt kiểm chứng độc lập phát hiện thêm lỗi báo-ổn-sai: script không vá ngoại lệ §5.G lẫn Luật J (Dual Entry-Point Invariant) vào `AGENTS.md` ĐÃ TỒN TẠI của dự án cũ (chỉ nhúng khi sinh mới) — đã vá bổ sung `hasRootMarkerException` + `hasDualEntryPointLawInAgentsMd`, kiểm chứng qua Ca A/B/C.
- [x] **Dual Entry-Point Invariant — CLAUDE.md shim fix (v1.1.0):** Phát hiện & vá lỗi Claude Code không nạp luật (chỉ đọc `CLAUDE.md`, không đọc `AGENTS.md`). Thêm Luật J/9, cập nhật `init_brain.js` tự sinh/vá `CLAUDE.md`, sửa toàn bộ sơ đồ cây thư mục sai trong repo.
- [x] **Phát hành brain4agent v1.0.1 (v1.0.1):** Chuẩn hóa toàn diện Single Skill Vault (`.agents/skills/`), Root Clean 100%, bổ sung `package.json` và đồng bộ tài liệu toàn dự án.
- [x] **Dọn dẹp rác cấu trúc & Archive Legacy Skills (v1.0.0):** Xóa bỏ thư mục lồng nhau rác, đưa `.brain-build` và `.update-brain` vào `archive/legacy-skills/`.
- [x] **Chuẩn hóa mã nguồn `.compact` & `.xay-dung-nao-bo` (v1.0.0):** 100% Root Clean, lưu trữ Hot Memory tại `today.md` & `state.json`.
- [x] **Trang bị Bộ Não Đa Tầng cho chính Hub (v1.0.0):** Thiết lập `AGENTS.md`, `brain4agent/`, `planning/`, `.agents/skills/`.
- [x] **Nâng cấp Bộ Hiến Pháp `CORE_GOVERNANCE_RULES.md` (v1.0.0):** Bổ sung Spec-First Framework, Model Tiering (🔴/🟠/🟢) và Ma trận Đồng bộ 6 điểm.
