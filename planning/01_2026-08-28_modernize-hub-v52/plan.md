# KẾ HOẠCH NÂNG CẤP: HIỆN ĐẠI HÓA BRAIN4AGENT (v1.0.1) (#01)

- **STT KẾ HOẠCH:** #01
- **TRẠNG THÁI:** ✅ COMPLETED
- **THỜI GIAN BẮT ĐẦU:** 2026-08-28 13:41:00
- **THỜI GIAN HOÀN TẤT:** 2026-08-28 14:06:00
- **PHIÊN BẢN MỤC TIÊU:** v1.0.1 (SemVer 2.0.0)

---

## 🎯 1. Mục Tiêu Nghiệp Vụ
1. Dọn dẹp triệt để các thư mục con rác lồng nhau (`.compact/.compact`, `.xay-dung-nao-bo/.xay-dung-nao-bo`).
2. Lưu trữ các skill cũ (`.brain-build`, `.update-brain`) vào `archive/legacy-skills/`.
3. Chuẩn hóa mã nguồn gốc `.compact` và `.xay-dung-nao-bo` vào kho `.agents/skills/` theo chuẩn Single Skill Vault.
4. Bổ sung Spec-First Planning, Model Tiering (🔴/🟠/🟢), và Ma trận Đồng bộ 6 điểm vào `CORE_GOVERNANCE_RULES.md`.
5. Trang bị Bộ Não Đa Tầng `brain4agent/`, `AGENTS.md`, `planning/`, `.agents/skills/` cho chính Workspace Hub.
6. Thiết lập `package.json` định danh chính thức dự án `brain4agent (v1.0.1)`.
7. Nâng cấp script triển khai `scripts/deploy_skills.ps1` hỗ trợ đa nền tảng (Gemini, Antigravity, Claude Code, Codex).
8. Xây dựng cẩm nang chỉ dẫn toàn diện từ A-Z cho mọi AI Agent (`docs/UNIVERSAL_AGENT_GUIDE.md`).

---

## 📋 2. Checklist Thực Thi (Model Tier Tagged)

- [x] **P01 🔴 [Architecture]:** Thiết lập `AGENTS.md` và `CORE_GOVERNANCE_RULES.md` V5.2.
- [x] **P02 🟠 [Cleanup]:** Xóa duplicate folders và di chuyển legacy skills vào `archive/legacy-skills/`.
- [x] **P03 🟠 [Skill Modernization]:** Cập nhật `.compact/SKILL.md` và `.xay-dung-nao-bo/scripts/init_brain.js`.
- [x] **P04 🟠 [Single Skill Vault]:** Di dời toàn bộ skills vào `.agents/skills/` để giữ root sạch 100%.
- [x] **P05 🟠 [Brain Provisioning]:** Khởi tạo đầy đủ 7 phân vùng `brain4agent/` và Hot Memory (`today.md`, `state.json`).
- [x] **P06 🟢 [Package & Identity]:** Tạo `package.json` định danh `brain4agent v1.0.1` và cấu hình npm scripts.
- [x] **P07 🟢 [Universal Guide]:** Biên soạn `docs/UNIVERSAL_AGENT_GUIDE.md` và nâng cấp CLI target argument trong `init_brain.js`.
- [x] **P08 🔴 [Multi-Agent Deploy]:** Nâng cấp `scripts/deploy_skills.ps1` tự động deploy sang Global Skills và Claude Code Commands.
- [x] **P09 🔴 [Verification Gate]:** Chạy kiểm thử chẩn đoán (`npm run init-brain`) và deploy (`npm run deploy`) xác nhận 100% OK.

---

## 🛡️ 3. Cổng Nghiệm Thu
- [x] Root Clean 100% (Không file rác ngoài root, skills nằm trong `.agents/skills/`).
- [x] Single Source of Version Truth (`package.json` = `1.0.1`).
- [x] Deploy script chạy thành công cho cả Gemini/Antigravity và Claude Code.
- [x] Smart Diagnostic báo trạng thái `NÃO ĐÃ OK — KHÔNG CẦN NÂNG CẤP THÊM`.
- [x] Toàn bộ mã nguồn đã commit và push lên GitHub `Fitc84/brain4agent.old`.
