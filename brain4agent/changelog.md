# Changelog & Semantic Releases

Tất cả các quyết định kiến trúc và lịch sử nâng cấp phiên bản của Brain Governance Hub.

## [v5.2.0] - 2026-08-28: Comprehensive Hub Modernization & V5.2 Ecosystem Alignment
### Added
- Trang bị hệ thống Bộ Nhớ Đa Tầng `brain4agent/` và `AGENTS.md` cho chính Workspace Hub.
- Thêm thư mục `archive/legacy-skills/` lưu trữ các phiên bản tiền thân (`.brain-build`, `.update-brain`).
- Bổ sung quy chuẩn **Spec-First Planning Framework** và **Model Tiering Tagging (🔴/🟠/🟢)** vào `CORE_GOVERNANCE_RULES.md`.
- Thêm cơ chế kiểm tra an toàn tự động (Safe Validation) vào `scripts/deploy_skills.ps1`.

### Changed
- Cập nhật mã nguồn `.compact/SKILL.md` tuân thủ nghiêm ngặt 100% Root Clean (chỉ ghi vào `memory/hot/today.md` & `state.json`).
- Cập nhật `.xay-dung-nao-bo/scripts/init_brain.js` đồng bộ trọn gói các luật quản trị tinh hoa mới nhất.
- Cải tiến `README.md` và `docs/BRAIN_ARCHITECTURE_GUIDE.md`.

### Removed
- Xóa bỏ triệt để các thư mục con lồng nhau bất thường (`.compact/.compact`, `.xay-dung-nao-bo/.xay-dung-nao-bo`).

---

## [v5.0.0] - 2026-08-17: Universal Brain Governance Engine Launch
### Added
- Hợp nhất `.brain-build` và `.update-brain` thành Universal Engine `.xay-dung-nao-bo` tích hợp Smart Auto-Diagnostic.
- Ra mắt kiến trúc Hot Memory (`today.md` + `state.json`).
- Ban hành Hiến pháp Quản trị `CORE_GOVERNANCE_RULES.md`.
