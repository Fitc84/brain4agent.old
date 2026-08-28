# Roadmap & Active Tasks

File này chứa danh sách các tính năng, mục tiêu sắp tới và tình trạng công việc hiện tại của Brain Governance Hub.

## Mục tiêu hiện tại (Active)
- [ ] Hoàn thiện kế hoạch `#01` nâng cấp Hub lên V5.2 và deploy toàn bộ skill sang Global Config.

## Tương lai (Upcoming)
- [ ] Nghiên cứu cơ chế Vector Memory & Semantic Search tích hợp cho Brain V6.0.
- [ ] Xây dựng test suite tự động kiểm tra tính tương thích của Brain Engine trên cả Windows / Linux / macOS.

## 💡 Kho Ý Tưởng & Backlog (Idea Vault)
*Nơi lưu trữ các ý tưởng hay, kiến trúc mở rộng chưa ưu tiên làm ngay nhưng cần giữ lại để tham khảo.*
- [ ] **AI Multi-Model Benchmark Suite:** Script tự động đánh giá chất lượng khôi phục ngữ cảnh của Claude vs GPT vs Gemini khi nạp `today.md`.
- [ ] **Cross-OS Path Normalizer:** Chuẩn hóa đường dẫn tương đối xuyên suốt giữa môi trường Windows PowerShell và Linux Bash.

## Đã hoàn thành (Done)
- [x] **Dọn dẹp rác cấu trúc & Archive Legacy Skills (v5.2.0):** Xóa bỏ thư mục lồng nhau rác, đưa `.brain-build` và `.update-brain` vào `archive/legacy-skills/`.
- [x] **Chuẩn hóa mã nguồn `.compact` & `.xay-dung-nao-bo` (v5.2.0):** 100% Root Clean, lưu trữ Hot Memory tại `today.md` & `state.json`.
- [x] **Trang bị Bộ Não V5.2 cho chính Hub (v5.2.0):** Thiết lập `AGENTS.md`, `brain4agent/`, `planning/`, `.agents/skills/`.
- [x] **Nâng cấp Bộ Hiến Pháp `CORE_GOVERNANCE_RULES.md` (v5.2.0):** Bổ sung Spec-First Framework, Model Tiering (🔴/🟠/🟢) và Ma trận Đồng bộ 6 điểm.
