# KẾ HOẠCH NÂNG CẤP: NÃO HÓA NHÓM C — TÁI CẤU TRÚC 6 DỰ ÁN THEO SCHEMA KHUNG NÃO v1.2.0 (#05)

- **STT KẾ HOẠCH:** #05
- **TRẠNG THÁI:** 📝 DRAFT — CHỜ USER DUYỆT (chưa thực thi bất kỳ thay đổi nào lên repo đích)
- **THỜI GIAN BẮT ĐẦU:** 2026-08-31 (lập kế hoạch)
- **THỜI GIAN HOÀN TẤT:** (chưa)
- **PHIÊN BẢN MỤC TIÊU:** không bump version repo hub (đây là chiến dịch rollout, không đổi engine); mỗi repo đích nhận khung não template v1.2.0

---

## 🎯 1. Mục Tiêu Nghiệp Vụ

1. **Não hóa 6 repo Nhóm C** (có `brain4agent/` nhưng KHÔNG có `AGENTS.md` — đứng ngoài đợt rollout #04): `block-ads-fb-v2`, `dreamteam4vn`, `Audit`, `reverse Claude`, `Agent to Product`, `CausalAgent`.
2. **Tái cấu trúc theo đúng schema mới** (7 phân vùng + `memory/hot/` + Dual Entry-Point + Brain Version Marker) — KHÔNG chỉ chạy engine đè lên: mỗi repo phải được **di trú nội dung não cũ vào đúng phân vùng mới TRƯỚC**, rồi mới chạy `init_brain.js`, để tránh gãy logic vận hành (engine chỉ sinh file THIẾU, không hiểu nội dung cũ nằm sai chỗ).
3. **Mỗi dự án một SPEC riêng** (SPEC-P01 → SPEC-P06) vì hiện trạng 6 repo khác nhau hoàn toàn — từ "gần chuẩn sẵn" (block-ads-fb-v2) đến "hệ điều hành não legacy đang sống" (Agent to Product).
4. Sau khi hoàn tất: cả 6 repo chạy `init_brain.js` phải báo `🎉 NÃO ĐÃ HOÀN HẢO` và Claude Code nạp được luật qua `CLAUDE.md`.

### Khảo sát hiện trạng (đo 2026-08-31 — căn cứ lập kế hoạch)

| Repo | Git | Hiện trạng não | Lớp di trú | Độ khó |
| :--- | :--- | :--- | :--- | :--- |
| block-ads-fb-v2 | sạch, `master` ahead 1 | 7 phân vùng ĐÃ đúng tên chuẩn, thiếu `memory/hot/` + AGENTS/CLAUDE/marker | **A — gần chuẩn** | 🟢 |
| dreamteam4vn | sạch, `master` ahead 1 | 7 phân vùng chuẩn + 5 file docs module `-src-modules-*` nằm SAI CHỖ trong não; chưa có `docs/` | **A+ — chuẩn nhưng docs lạc chỗ** | 🟢 |
| Audit | sạch, `master` | Não lồng thư mục phi chuẩn `core/`, `modules/`, `setup/`; `memory-distill.txt` nằm trong `core/` | **B — lồng phi chuẩn** | 🟠 |
| reverse Claude | sạch, `main` | Não gần rỗng (chỉ `memory-distill.txt`); có hệ `planning/` + 9 skill riêng ĐANG SỐNG; root rác (`task.md`, `memory-distill.md`, transcript) | **B+ — não rỗng, governance riêng sống** | 🟠 |
| Agent to Product | sạch, `main` ahead 2 | **Brain OS legacy đầy đủ đang sống**: `specs/` registry, `tasks/` state machine, `memory/graph.db` SQLite, governance riêng (`rules.md`, `SOP_WORKFLOW.md`); chứa script lạc `.brain-build` | **C — hệ legacy sống** | 🔴 |
| CausalAgent | **34 file untracked, CHƯA CÓ COMMIT NÀO** (unborn `main`) | Não kiểu cũ (docs `-*` + distill); root ngập 20 file `scratch_*.py` vi phạm Root Clean | **D — bị chặn bởi git** | 🔴 (gate) |

---

## 📋 2. Checklist Thực Thi (Model Tier Tagged)

- [x] **P00 🔴 [Khảo sát & Lập kế hoạch]:** Khảo sát read-only 6 repo (root, não, skills, git, thư mục hoa) — bảng hiện trạng ở trên; viết bộ specs này. Hoàn thành 2026-08-31.
- [ ] **P00b 🔴 [USER APPROVAL GATE]:** User duyệt kế hoạch + trả lời 3 câu hỏi mở ở mục 4. **Không thực thi trước khi duyệt.**
- [ ] **P01 🟢 [block-ads-fb-v2]:** Lớp A — theo [specs/SPEC-P01-block-ads-fb-v2.md](specs/SPEC-P01-block-ads-fb-v2.md).
- [ ] **P02 🟢 [dreamteam4vn]:** Lớp A+ — theo [specs/SPEC-P02-dreamteam4vn.md](specs/SPEC-P02-dreamteam4vn.md).
- [ ] **P03 🟠 [Audit]:** Lớp B — theo [specs/SPEC-P03-audit.md](specs/SPEC-P03-audit.md).
- [ ] **P04 🟠 [reverse Claude]:** Lớp B+ — theo [specs/SPEC-P04-reverse-claude.md](specs/SPEC-P04-reverse-claude.md).
- [ ] **P05 🔴 [Agent to Product]:** Lớp C — theo [specs/SPEC-P05-agent-to-product.md](specs/SPEC-P05-agent-to-product.md). Làm CUỐI CÙNG trong các repo không bị gate.
- [ ] **P06 🔴 [CausalAgent — GATED]:** Lớp D — theo [specs/SPEC-P06-causalagent.md](specs/SPEC-P06-causalagent.md). **Điều kiện tiên quyết: user tự tạo commit đầu tiên** (repo unborn, agent không được tự tạo mốc lịch sử — bài học P04c kế hoạch #04).
- [ ] **P07 🟢 [Đóng kế hoạch]:** Báo cáo tổng (bảng 6 repo + SHA commit từng repo + việc treo), Sync Cascade 6 điểm vào `brain4agent/` hub, đóng plan ✅.

**Thứ tự thực thi:** P01 → P02 → P03 → P04 → P05, mỗi repo XONG VÀ COMMIT rồi mới sang repo kế; P06 chạy bất kỳ lúc nào SAU khi user mở gate. Repo đầu tiên (P01) đóng vai pilot của chiến dịch — dừng lại đưa user xem kết quả trước khi làm P02 nếu user yêu cầu.

---

## 🛡️ 3. Cổng Nghiệm Thu (Acceptance Gate — áp cho TỪNG repo)

Điền bằng chứng thật vào SPEC tương ứng khi thực thi. Một repo chỉ được coi là xong khi đủ 7 điều:

1. `git status` sạch TRƯỚC khi bắt đầu (trừ P06 theo gate riêng).
2. Nội dung não cũ được di trú theo đúng **bảng ánh xạ trong SPEC** — kiểm bằng danh sách file trước/sau: **0 file nội dung bị mất** (di chuyển ≠ xóa; mọi file cũ phải truy vết được vị trí mới hoặc lý do archive).
3. `init_brain.js` chạy lần 1 hoàn tất; chạy **lần 2 báo `🎉 NÃO ĐÃ HOÀN HẢO`** (idempotent).
4. `AGENTS.md` + `CLAUDE.md` (shim `@AGENTS.md`) + đúng 1 marker `brain4agent-v1.2.0.md` + `state.json` có `brain_template_version: "1.2.0"` và tail byte `0a`.
5. Nếu repo có luật/quy ước riêng đang sống (P04, P05): luật riêng được BẢO TỒN trong `AGENTS.md` mới (phần phụ lục riêng của dự án) — kiểm bằng grep các chuỗi định danh nêu trong SPEC.
6. Commit riêng trong repo đích (Conventional Commits, TIẾNG ANH), ghi SHA vào SPEC. **KHÔNG PUSH.**
7. Không đụng: `aiedu4vn`, các repo ngoài danh sách, và không sửa file nào ngoài phạm vi SPEC.

---

## ❓ 4. Câu Hỏi Mở Chờ User Quyết (trả lời trước khi thực thi)

1. **Agent to Product (SPEC-P05):** Brain OS legacy (specs registry, tasks state machine, graph.db) là hệ ĐANG SỐNG. Phương án đề xuất trong SPEC là **cộng sinh** (giữ nguyên hệ legacy, thêm lớp chuẩn mới lên trên, KHÔNG archive) — user xác nhận hay muốn **thay thế hẳn** (archive toàn bộ legacy)?
2. **Script lạc `.brain-build`** trong `Agent to Product`: SPEC đề xuất di chuyển vào `archive/legacy-skills/` của chính repo đó (không xóa). Đồng ý?
3. **CausalAgent (SPEC-P06):** user tạo commit đầu tiên trước, hay muốn agent làm luôn cả việc đó (trái khuyến nghị P04c — cần lệnh tường minh)?

---

## 📌 Ghi Chú Phạm Vi

- Kế hoạch này CHỈ lập hồ sơ — chưa có repo đích nào bị sửa tại thời điểm DRAFT.
- 2 repo pending của #04 (`control-discord`, `teamworkflow`) KHÔNG thuộc kế hoạch này — chúng đã có `AGENTS.md`/shim, chỉ chờ user xử lý git (xem roadmap).
- Tên 2 repo chứa dấu cách (`Agent to Product`, `reverse Claude`) — mọi lệnh trong SPEC phải bọc ngoặc kép đường dẫn.
- Backup bắt buộc trước di trú: toàn bộ `brain4agent/` của repo đích copy vào scratchpad (dù có git — di trú là thao tác nhiều file, revert bằng backup nhanh và an toàn hơn dò từng file).
