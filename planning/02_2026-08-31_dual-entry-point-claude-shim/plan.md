# KẾ HOẠCH VÁ LỖI: DUAL ENTRY-POINT INVARIANT — CLAUDE.md SHIM FIX (#02)

- **STT KẾ HOẠCH:** #02
- **TRẠNG THÁI:** ✅ COMPLETED
- **THỜI GIAN BẮT ĐẦU:** 2026-08-31 (không ghi rõ giờ trong phiên gốc)
- **THỜI GIAN HOÀN TẤT:** 2026-08-31
- **PHIÊN BẢN MỤC TIÊU:** v1.1.0 (SemVer 2.0.0)

---

## 🎯 1. Mục Tiêu Nghiệp Vụ
1. Vá lỗi im lặng nghiêm trọng: Claude Code CHỈ auto-load `CLAUDE.md`, KHÔNG đọc `AGENTS.md` (theo docs chính thức code.claude.com/docs/en/memory.md) — phát hiện từ dự án `aiedu4vn`, ảnh hưởng trực tiếp tới mọi dự án được khởi tạo bằng skill `.xay-dung-nao-bo` của repo này.
2. Sửa `init_brain.js` để tự sinh/vá `CLAUDE.md` (shim ≤10 dòng, chỉ chứa `@AGENTS.md`, không bọc backtick) một cách idempotent, kèm chẩn đoán `hasClaudeMd`.
3. Nhúng luật mới — Luật J / LUẬT 9 (Dual Entry-Point Invariant) — vào `AGENTS.md`, `CORE_GOVERNANCE_RULES.md` và template `fullAgentsMdContent` sinh bởi `init_brain.js`, để mọi dự án mới khởi tạo cũng thừa hưởng luật.
4. Sửa các sơ đồ cây thư mục và tài liệu còn khẳng định sai "AGENTS.md nạp tự động khi khởi động phiên" (`README.md`, `brain4agent/index.md`, template trong `init_brain.js`).
5. Dogfooding: tự tạo `CLAUDE.md` cho chính repo `brain4agent.old`.
6. Đồng bộ bản deploy sang `C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo\` qua `scripts/deploy_skills.ps1`, đảm bảo byte-identical với nguồn.
7. Kiểm chứng bằng 3 ca chạy thật (không chỉ đọc code) trước khi coi là hoàn tất.

---

## 📋 2. Checklist Thực Thi (Model Tier Tagged)

- [x] **P01 🔴 [Architecture]:** Thêm Luật J / LUẬT 9 — Bất Biến Hai Điểm Nạp (Dual Entry-Point Invariant) vào `AGENTS.md` và `CORE_GOVERNANCE_RULES.md`.
- [x] **P02 🔴 [Brain Engine Core Fix]:** Sửa `.agents/skills/.xay-dung-nao-bo/scripts/init_brain.js` để tự sinh/vá `CLAUDE.md` idempotent, thêm `hasClaudeMd` vào chẩn đoán và điều kiện `isFullyStandard`.
- [x] **P03 🟠 [Template Governance]:** Nhúng Luật J vào template `fullAgentsMdContent` sinh bởi `init_brain.js` để dự án mới thừa hưởng luật ngay từ đầu.
- [x] **P04 🟠 [Doc Accuracy]:** Sửa sơ đồ cây thư mục và câu khẳng định sai "AGENTS.md nạp tự động khi khởi động phiên" trong `README.md`, `brain4agent/index.md` và template `init_brain.js`.
- [x] **P05 🟢 [Dogfooding]:** Tự tạo `CLAUDE.md` ở root chính repo `brain4agent.old`.
- [x] **P06 🟠 [Multi-Agent Deploy Sync]:** Chạy `scripts/deploy_skills.ps1` đồng bộ bản vá sang `C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo\`, xác nhận byte-identical với nguồn.
- [x] **P07 🔴 [Verification Gate]:** Chạy 3 ca kiểm chứng thật (dự án trắng, xoá CLAUDE.md rồi chạy lại, chạy lần 3) — không chỉ đọc code mà chạy thật `init_brain.js`.
- [x] **P08 🟢 [Cross-Repo Test]:** Xác nhận bên dự án `aiedu4vn` đã có 7 test pytest canh Luật J (commit `53e1a8d`), làm bằng chứng regression-proof cho phát hiện gốc.
- [x] **P09 🔴 [Commit]:** Commit toàn bộ thay đổi vào `94a4506`, nâng version `package.json` `1.0.1` → `1.1.0`.

---

## 🛡️ 3. Cổng Nghiệm Thu
- [x] **Ca 1 — Dự án trắng:** Chạy `init_brain.js` trên thư mục trống → sinh cả `AGENTS.md` lẫn `CLAUDE.md` (8 dòng, `@AGENTS.md` KHÔNG bọc backtick); `AGENTS.md` sinh ra có chứa Luật J.
- [x] **Ca 2 — Dự án cũ thiếu shim:** Xoá `CLAUDE.md` rồi chạy lại `init_brain.js` → tự tạo lại `CLAUDE.md`; diff `AGENTS.md` rỗng (không phá nội dung đã có).
- [x] **Ca 3 — Idempotency:** Chạy `init_brain.js` lần thứ 3 liên tiếp → không nhân đôi nội dung, exit code 0.
- [x] **Đồng bộ deploy:** Bản tại `C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo\` byte-identical với bản nguồn trong repo sau khi chạy `scripts/deploy_skills.ps1`.
- [x] **Regression-proof liên repo:** Dự án `aiedu4vn` đã bổ sung 7 test pytest canh giữ Luật J (commit `53e1a8d`), đảm bảo lỗi không tái diễn ở tầng downstream.
- [x] **Commit xác nhận:** Toàn bộ thay đổi đã nằm trong commit `94a4506` (`package.json` v1.0.1 → v1.1.0).
- [x] Toàn bộ mã nguồn đã commit; **chưa push** (chờ quyết định của user cho hành động ảnh hưởng remote).

---

## 📌 Ghi Chú Phạm Vi
- `archive/legacy-skills/` **CỐ Ý không sửa** trong đợt vá này — đây là hồ sơ đóng băng (frozen snapshot) lưu bản `init_brain.js` cũ còn lỗi (chỉ sinh `AGENTS.md`, không có shim `CLAUDE.md`), giữ lại để tra cứu lịch sử, không đại diện cho hành vi hiện hành của skill.
