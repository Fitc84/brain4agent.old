# Roadmap & Active Tasks

File này chứa danh sách các tính năng, mục tiêu sắp tới và tình trạng công việc hiện tại của **brain4agent (v1.2.1)**.

## Mục tiêu hiện tại (Active)
- [ ] **Rollout #04 — phần còn treo chờ user:** (a) 9 repo Nhóm A bị bỏ qua vì working tree bẩn (`GramPilot`, `control-cloudflare`, `control-codex`, `control-discord`, `control-gpm`, `control-keypassxc`, `control-router`, `control-syncthing`, `control-tailscale`) — user dọn sạch rồi chạy lại engine từng repo; (b) `teamworkflow` — repo chưa có commit nào + `AGENTS.md` là Next.js tooling notice, chờ user quyết; (c) 6 repo Nhóm C chưa có `AGENTS.md` — quyết định riêng từng dự án; (d) bản script cũ lạc `Agent to Product/.agents/skills/.brain-build/scripts/init_brain.js` — chờ user xử.
- [x] Phát hành phiên bản chính thức **brain4agent v1.2.0** (Brain Version Marker) + hotfix **v1.2.1** (POSIX newline).

## Tương lai (Upcoming)
- [ ] Nghiên cứu cơ chế Vector Memory & Semantic Search tích hợp cho Brain V2.0.
- [ ] Xây dựng test suite tự động kiểm tra tính tương thích của Brain Engine trên cả Windows / Linux / macOS.

## 💡 Kho Ý Tưởng & Backlog (Idea Vault)
*Nơi lưu trữ các ý tưởng hay, kiến trúc mở rộng chưa ưu tiên làm ngay nhưng cần giữ lại để tham khảo.*
- [ ] **AI Multi-Model Benchmark Suite:** Script tự động đánh giá chất lượng khôi phục ngữ cảnh của Claude vs GPT vs Gemini khi nạp `today.md`.
- [ ] **Cross-OS Path Normalizer:** Chuẩn hóa đường dẫn tương đối xuyên suốt giữa môi trường Windows PowerShell và Linux Bash.

## Đã hoàn thành (Done)
- [x] **Rollout khung não v1.2.0 ra hệ sinh thái — đợt 1 (v1.2.1, kế hoạch #04):** Vá + commit local 9/18 repo Nhóm A (pilot `control-claude-code` được user duyệt trước khi rollout); sửa hotfix `init_brain.js` thiếu newline cuối `state.json` (user phát hiện, thêm `hasStateJsonTrailingNewline` vào chẩn đoán); xác nhận thực chiến fallback phụ lục P09 trên 2 repo `AGENTS.md` phi chuẩn. KHÔNG push. Bằng chứng: `planning/04_2026-08-31_rollout-ecosystem/plan.md`.
- [x] **Brain Version Marker — nhìn thấy ngay phiên bản khung não ở root (v1.2.0):** Thêm `brain_template_version` vào `state.json` (nguồn chân lý máy đọc), sinh marker `brain4agent-v<x.y.z>.md` ở root (bản soi cho người, cưỡng chế đúng 1 file, tự xoá bản cũ khi bump), thêm ngoại lệ vào Luật Root Clean (§5.G/LUẬT 6), cập nhật chẩn đoán `init_brain.js` (`hasBrainVersionMarker`). Đợt kiểm chứng độc lập phát hiện thêm lỗi báo-ổn-sai: script không vá ngoại lệ §5.G lẫn Luật J (Dual Entry-Point Invariant) vào `AGENTS.md` ĐÃ TỒN TẠI của dự án cũ (chỉ nhúng khi sinh mới) — đã vá bổ sung `hasRootMarkerException` + `hasDualEntryPointLawInAgentsMd`, kiểm chứng qua Ca A/B/C.
- [x] **Dual Entry-Point Invariant — CLAUDE.md shim fix (v1.1.0):** Phát hiện & vá lỗi Claude Code không nạp luật (chỉ đọc `CLAUDE.md`, không đọc `AGENTS.md`). Thêm Luật J/9, cập nhật `init_brain.js` tự sinh/vá `CLAUDE.md`, sửa toàn bộ sơ đồ cây thư mục sai trong repo.
- [x] **Phát hành brain4agent v1.0.1 (v1.0.1):** Chuẩn hóa toàn diện Single Skill Vault (`.agents/skills/`), Root Clean 100%, bổ sung `package.json` và đồng bộ tài liệu toàn dự án.
- [x] **Dọn dẹp rác cấu trúc & Archive Legacy Skills (v1.0.0):** Xóa bỏ thư mục lồng nhau rác, đưa `.brain-build` và `.update-brain` vào `archive/legacy-skills/`.
- [x] **Chuẩn hóa mã nguồn `.compact` & `.xay-dung-nao-bo` (v1.0.0):** 100% Root Clean, lưu trữ Hot Memory tại `today.md` & `state.json`.
- [x] **Trang bị Bộ Não Đa Tầng cho chính Hub (v1.0.0):** Thiết lập `AGENTS.md`, `brain4agent/`, `planning/`, `.agents/skills/`.
- [x] **Nâng cấp Bộ Hiến Pháp `CORE_GOVERNANCE_RULES.md` (v1.0.0):** Bổ sung Spec-First Framework, Model Tiering (🔴/🟠/🟢) và Ma trận Đồng bộ 6 điểm.
