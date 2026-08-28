# Changelog & Semantic Releases

Tất cả các quyết định kiến trúc và lịch sử nâng cấp phiên bản của **brain4agent**.

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
