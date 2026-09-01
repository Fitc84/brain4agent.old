# Roadmap & Active Tasks

File này chứa danh sách các tính năng, mục tiêu sắp tới và tình trạng công việc hiện tại của **brain4agent (v1.5.1)**.

## 🔴 Active — chờ user (không còn vướng kỹ thuật)

- [ ] **🔒 XOAY KHOÁ (ưu tiên cao nhất)** — 6 chỗ có secret nằm sẵn trong lịch sử git hoặc lộ ra client, sửa code KHÔNG đủ: danh sách 6 vị trí giữ ở hồ sơ chỉ-lưu-máy ngoài git.
- [ ] **Tìm và tắt tiến trình NHÂN BẢN ngoài git** đang chép repo top-level vào các thư mục lồng (12 cặp) — xem gotcha #9. Nó làm `git status` của `openclaw-pro-studio` gãy `bad object HEAD`.
- [ ] **Quyết cách xử 12 cặp repo lồng nhau** (hiện đã `.gitignore` để đi tiếp): submodule thật cần URL remote, hay gỡ một tầng thư mục.
- [ ] **`aiedu4vn`** — nếu gỡ luật ⛔ từ #04 thì đạt chuẩn v1.3.0 chỉ bằng 1 lần chạy engine.
- [ ] **`brain4agent` (mới)** — repo còn lại chưa não hóa; 3 câu hỏi ở `planning/06_*/specs/SPEC-P05-ca-dac-biet.md` mục 1.
- [ ] **`control-gpm`, `GramPilot`, `CV`** — commit việc đang dở rồi chạy lại `init_brain.js` để nhận nốt luật SPEC PACKAGE + `brain_template_version` (hiện mới nhận marker).
- [ ] **`ViDiaNorm`** — gitignore output pipeline (`reports/` 117 + `data/` 105) rồi commit 51 file dev thật.
- [ ] **`FITC84-WorkOs-`** — `.gitignore` có BOM UTF-8 + một dòng lưu dạng UTF-16 nên `server.pid` không được ignore; repo còn tracked file tên bắt đầu bằng dấu cách (` test.pid`).
- [ ] **`manage-fitc84`** — cân nhắc gitignore `data/fitc84.db*` (SQLite WAL đang chạy, đã vào lịch sử git kèm dữ liệu khách hàng).
- [ ] **`CausalAgent`** — dọn root cần sửa `scratch_*.py` cho độc-lập-vị-trí (`Path(__file__).resolve().parents[1]`) trước.
- [ ] **`openclaw-pro-studio`** — bỏ track `admin_server.log`; cân nhắc gộp `AGENT_GUIDELINES.md` vào `AGENTS.md`.
- [ ] **Nghiệm thu môi trường thật** — mọi Exit Gate của #07 mới đạt ở mức `local`; chưa xác nhận trên máy/tài khoản khác.
- [ ] **`Audit` (treo từ #05):** `security_platform.db` mồ côi ở root do `db.py` dùng path tương đối theo CWD; `requirements.txt` có dòng cuối mã hoá UTF-16LE. Đã nạp vào não repo đó, CHƯA sửa code.
- [ ] **`reverse Claude` (treo từ #05):** gate `verify-documentation-integrity.js` FAIL do 2 broken link trỏ `output/target_corpus/` — lỗi có TRƯỚC đợt não hóa, chưa sửa.
- [ ] **`Agent to Product` (treo từ #04):** còn bản script engine cũ lạc ở `.agents/skills/.brain-build/scripts/init_brain.js` (không nhắc `CLAUDE.md`) — chỉ mới báo cáo, chưa xử.


> **Ghi chú chống lỗi thời (2026-09-02):** mục Active cũ đã được gộp vào đây. Các việc trong đó nay
> ĐÃ XONG nên bị gỡ khỏi danh sách chờ: lan luật SPEC PACKAGE ra hệ sinh thái + `deploy_skills.ps1`
> (xong ở #07) · kế hoạch #06 duyệt & đóng · 6 repo treo của #04 (`GramPilot`, `control-gpm`,
> `control-codex`, `control-cloudflare`, `control-discord`, `teamworkflow`) · 4 repo không có git
> riêng (`control-keypassxc|router|syncthing|tailscale`) · 6 repo Nhóm C chưa có `AGENTS.md`.

## Tương lai (Upcoming)
- [ ] Nghiên cứu cơ chế Vector Memory & Semantic Search tích hợp cho Brain V2.0.
- [ ] Xây dựng test suite tự động kiểm tra tính tương thích của Brain Engine trên cả Windows / Linux / macOS.


## 💡 Kho Ý Tưởng & Backlog (Idea Vault)
*Nơi lưu trữ các ý tưởng hay, kiến trúc mở rộng chưa ưu tiên làm ngay nhưng cần giữ lại để tham khảo.*
- [ ] **AI Multi-Model Benchmark Suite:** Script tự động đánh giá chất lượng khôi phục ngữ cảnh của Claude vs GPT vs Gemini khi nạp `today.md`.
- [ ] **Cross-OS Path Normalizer:** Chuẩn hóa đường dẫn tương đối xuyên suốt giữa môi trường Windows PowerShell và Linux Bash.

## Đã hoàn thành (Done)
- [x] **Phủ template v1.3.0 ra toàn kho + vá bug nhân đôi luật (v1.5.1, kế hoạch #07, 2026-09-02):** 92 commit local. Não đạt chuẩn v1.3.0 **2/67 → 65/67**. Vá 3 lỗi engine/vận hành: regex `\n` trần trượt trên CRLF gây nhân đôi khối luật ở 33 repo; `isFullyStandard` không phát hiện tình trạng đó; bản engine deploy global kẹt `1.2.0` (nguy cơ thoái lui thầm lặng toàn hệ sinh thái). Sinh 2 gotcha mới (#11, #12).
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
