# KẾ HOẠCH NÂNG CẤP: HIỆN ĐẠI HÓA BRAIN HUB V5.2 (#01)

- **STT KẾ HOẠCH:** #01
- **TRẠNG THÁI:** ✅ COMPLETED
- **THỜI GIAN BẮT ĐẦU:** 2026-08-28 13:41:00
- **THỜI GIAN HOÀN TẤT:** 2026-08-28 13:45:00
- **PHIÊN BẢN MỤC TIÊU:** v5.2.0 (MAJOR / MINOR / PATCH)

---

## 🎯 1. Mục Tiêu Nghiệp Vụ
1. Dọn dẹp triệt để các thư mục con rác lồng nhau (`.compact/.compact`, `.xay-dung-nao-bo/.xay-dung-nao-bo`).
2. Lưu trữ các skill cũ (`.brain-build`, `.update-brain`) vào `archive/legacy-skills/`.
3. Chuẩn hóa mã nguồn gốc `.compact` và `.xay-dung-nao-bo` theo chuẩn V5.2.
4. Bổ sung Spec-First Planning, Model Tiering (🔴/🟠/🟢), và Ma trận Đồng bộ 6 điểm vào `CORE_GOVERNANCE_RULES.md`.
5. Trang bị Bộ Não Đa Tầng `brain4agent/`, `AGENTS.md`, `planning/`, `.agents/skills/` cho chính Workspace Hub.
6. Nâng cấp script triển khai `scripts/deploy_skills.ps1`.

---

## 📋 2. Checklist Thực Thi (Model Tier Tagged)

- [x] **P01 🔴 [Architecture]:** Thiết lập `AGENTS.md` và `CORE_GOVERNANCE_RULES.md` V5.2.
- [x] **P02 🟠 [Cleanup]:** Xóa duplicate folders và di chuyển legacy skills vào `archive/legacy-skills/`.
- [x] **P03 🟠 [Skill Modernization]:** Cập nhật `.compact/SKILL.md` và `.xay-dung-nao-bo/scripts/init_brain.js`.
- [x] **P04 🟠 [Brain Provisioning]:** Khởi tạo đầy đủ 7 phân vùng `brain4agent/` và Hot Memory (`today.md`, `state.json`).
- [x] **P05 🟢 [Docs & Script]:** Nâng cấp `README.md`, `docs/BRAIN_ARCHITECTURE_GUIDE.md`, và `scripts/deploy_skills.ps1`.
- [x] **P06 🔴 [Verification Gate]:** Kiểm thử chẩn đoán và chạy deploy sang Global Config.

---

## 🛡️ 3. Cổng Nghiệm Thu
- [x] Root Clean 100% (Không file rác ngoài root).
- [x] Deploy script chạy thành công không có lỗi.
- [x] Smart Diagnostic báo trạng thái `NÃO ĐÃ OK`.
