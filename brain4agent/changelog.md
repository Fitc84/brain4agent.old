# Changelog & Semantic Releases

Tất cả các quyết định kiến trúc và lịch sử nâng cấp phiên bản của **brain4agent**.

## [v1.1.0] - 2026-08-31: Dual Entry-Point Invariant (CLAUDE.md Shim Fix)
### Fixed
- **Lỗi nghiêm trọng đã xác minh:** Claude Code CHỈ tự động nạp `CLAUDE.md`, KHÔNG đọc `AGENTS.md` (theo docs chính thức code.claude.com/docs/en/memory.md). `init_brain.js` cũ chỉ sinh `AGENTS.md` → mọi dự án mới khởi tạo qua skill này bị Claude Code bỏ qua toàn bộ luật quản trị một cách im lặng.
- Sửa dòng sai sự thật trong sơ đồ cây thư mục (`index.md` template, `README.md`, `brain4agent/index.md`): bỏ câu khẳng định sai "AGENTS.md nạp tự động khi khởi động phiên".

### Added
- **Luật J / LUẬT 9 — Bất Biến Hai Điểm Nạp (Dual Entry-Point Invariant):** nhúng vào `AGENTS.md`, `CORE_GOVERNANCE_RULES.md` và template governance sinh bởi `init_brain.js`. Quy định `AGENTS.md` là nguồn chân lý DUY NHẤT, `CLAUDE.md` là shim mỏng ≤10 dòng chỉ chứa `@AGENTS.md`.
- `init_brain.js`: sinh/vá tự động `CLAUDE.md` (idempotent), thêm `hasClaudeMd` vào chẩn đoán và điều kiện `isFullyStandard` để phát hiện + tự sửa các dự án cũ thiếu shim.
- Dogfooding: tạo `CLAUDE.md` ở root chính repo `brain4agent.old`.
- Kế hoạch chi tiết & bằng chứng kiểm chứng: [`planning/02_2026-08-31_dual-entry-point-claude-shim/plan.md`](file:///planning/02_2026-08-31_dual-entry-point-claude-shim/plan.md).

## [v1.0.1] - 2026-08-28: Single Skill Vault Alignment & Project Identity Standard
### Added
- Khởi tạo `package.json` định danh chính thức dự án **`brain4agent v1.0.1`** (Single Source of Version Truth).
- Thêm npm scripts: `npm run init-brain` và `npm run deploy`.

### Changed
- Di dời toàn bộ skills gốc (`.xay-dung-nao-bo`, `.compact`) vào kho chuẩn `.agents/skills/`.
- Cập nhật `scripts/deploy_skills.ps1` đồng bộ từ `.agents/skills/` sang Global Config.
- Cập nhật toàn bộ tài liệu dự án, `AGENTS.md`, `README.md` theo chuẩn định danh `brain4agent v1.0.1`.

---

## [v1.0.0] - 2026-08-28: Universal Brain Governance Hub Modernization
### Added
- Trang bị hệ thống Bộ Nhớ Đa Tầng `brain4agent/` và `AGENTS.md` cho chính Workspace Hub.
- Thêm thư mục `archive/legacy-skills/` lưu trữ các phiên bản tiền thân (`.brain-build`, `.update-brain`).
- Bổ sung quy chuẩn **Spec-First Planning Framework** và **Model Tiering Tagging (🔴/🟠/🟢)** vào `CORE_GOVERNANCE_RULES.md`.
- Thêm cơ chế kiểm tra an toàn tự động (Safe Validation) vào `scripts/deploy_skills.ps1`.
- Cập nhật mã nguồn `.compact/SKILL.md` tuân thủ nghiêm ngặt 100% Root Clean.
- Cập nhật `.xay-dung-nao-bo/scripts/init_brain.js` đồng bộ trọn gói các luật quản trị tinh hoa mới nhất.
