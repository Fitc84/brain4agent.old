# KẾ HOẠCH NÂNG CẤP: NÃO HÓA NHÓM C — TÁI CẤU TRÚC 6 DỰ ÁN THEO SCHEMA KHUNG NÃO v1.2.0 (#05)

- **STT KẾ HOẠCH:** #05
- **TRẠNG THÁI:** ✅ ĐÃ HOÀN THÀNH — 6/6 repo não hóa (5 commit local + 1 không commit đúng thiết kế). Duy nhất Giai đoạn 2 của SPEC-P06 (dọn root `CausalAgent`) hoãn chờ user tạo commit đầu tiên.
- **THỜI GIAN BẮT ĐẦU:** 2026-08-31 (lập kế hoạch)
- **THỜI GIAN HOÀN TẤT:** 2026-08-31 (thực thi bằng 6 subagent song song, orchestrator kiểm chứng độc lập sau)
- **PHIÊN BẢN MỤC TIÊU:** repo hub bump **v1.2.2** (PATCH — hotfix engine phát sinh trong lúc thực thi); mỗi repo đích nhận khung não template v1.2.0 (giữ nguyên, không bump để tránh churn marker trên 19 repo đã vá)

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
- [x] **P01 🟢 [block-ads-fb-v2]:** Lớp A — SHA `1c0569e` @`master`.
- [x] **P02 🟢 [dreamteam4vn]:** Lớp A+ — SHA `79efb93` + `cb2bcfa` @`master`.
- [x] **P03 🟠 [Audit]:** Lớp B — SHA `451f1ac` @`master`.
- [x] **P04 🟠 [reverse Claude]:** Lớp B+ — SHA `bf7e959` @`main`.
- [x] **P05 🔴 [Agent to Product]:** Lớp C (cộng sinh) — SHA `a7c6ce4` @`main`.
- [x] **P06 🔴 [CausalAgent — Giai đoạn 1]:** Lớp D — KHÔNG commit (đúng thiết kế). Giai đoạn 2 hoãn.
- [x] **P08 🔴 [Hotfix engine phát sinh — v1.2.2]:** Bug "vá Bước 0 vào distill là no-op" (2 subagent độc lập phát hiện) — xem mục 5.
- [x] **P07 🟢 [Đóng kế hoạch]:** Báo cáo tổng, Sync Cascade 6 điểm vào `brain4agent/` hub, đóng plan ✅.

**Cách thực thi thực tế:** thay vì tuần tự, dùng **6 subagent chạy song song 2 đợt** (đợt 1: P01/P02 model tầm trung + P03 model mạnh; đợt 2: P04/P05/P06 model mạnh) — an toàn vì 6 repo hoàn toàn độc lập, mỗi subagent bị khoá phạm vi vào đúng repo của nó và cấm chạm repo hub. Orchestrator kiểm chứng độc lập lại toàn bộ sau khi cả 6 báo xong.

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

## ✅ 4. Quyết Định Đã Chốt (user uỷ quyền cho agent tự quyết, 2026-08-31)

1. **Agent to Product (SPEC-P05) → CỘNG SINH.** Giữ nguyên 100% Brain OS legacy (specs registry, tasks state machine, `graph.db`), chỉ thêm lớp chuẩn + pointer file. *Lý do:* di trú hệ đang vận hành có rủi ro gãy logic cao nhất toàn chiến dịch trong khi lợi ích chỉ là đồng nhất hình thức; cộng sinh đạt mục tiêu "mọi agent nạp được luật" mà không chạm dữ liệu sống.
2. **Script lạc `.brain-build` → ARCHIVE** vào `archive/legacy-skills/.brain-build/` của chính repo `Agent to Product`. *Lý do:* nó tái sinh cấu trúc hỏng nếu ai chạy nhầm, nhưng là hồ sơ lịch sử nên không xóa.
3. **CausalAgent (SPEC-P06) → THU HẸP PHẠM VI, KHÔNG tạo commit đầu tiên.** Agent chỉ làm phần AN TOÀN: di trú `brain4agent/` + chạy engine + backup thủ công (mô hình đã dùng cho 4 repo không git ở kế hoạch #04). **HOÃN** phần dọn ~20 `scratch_*.py` ở root sang đợt sau. *Lý do:* (a) tạo commit đầu tiên là mốc lịch sử thuộc quyền user (bài học P04c #04); (b) repo có `.env` — commit gộp mù dễ lộ key; (c) dọn script Python không có git để lùi là rủi ro gãy runtime cao nhất, backup thủ công không đủ an toàn cho thao tác nhiều file liên quan import lẫn nhau.

---

## 🏁 5. Kết Quả Thực Thi & Kiểm Chứng Độc Lập (2026-08-31)

### Bảng kết quả 6/6 repo

| Repo | Lớp | Kết quả | SHA @ branch | Điểm đáng chú ý |
| :--- | :--- | :--- | :--- | :--- |
| block-ads-fb-v2 | A | ✅ | `1c0569e` @master | Không phải di trú gì; subagent bắt được engine đặt `current_version` mặc định `1.0.0` sai so với `package.json` (`0.0.0`) → sửa lại |
| dreamteam4vn | A+ | ✅ | `79efb93`, `cb2bcfa` @master | `ls src/modules/` xác nhận tên module thật khớp SPEC; `-dreamteam4vn.md` → `docs/` (không gộp, vì là quy ước tổ chức `src/`, khác vai trò `project-intro.md`). Commit 2 sửa chính `today.md` tự vi phạm cổng grep |
| Audit | B | ✅ | `451f1ac` @master | Phẳng hoá `core/`+`modules/`+`setup/`, 10/10 file truy vết được; docs đặt tên theo module thật (`api.md`, `ai.md`, `scanner.md`, `reporting.md`) |
| reverse Claude | B+ | ✅ | `bf7e959` @main | Grep tham chiếu CỨU 2 file: `task.md` và `memory-distill.md` root tưởng là rác nhưng là **đầu vào của gate `verify-documentation-integrity.js`** → giữ nguyên. Transcript đi `scratch/` thay `raw/` (lệch SPEC có chủ đích, có lý do từ `verify-worktree-hygiene.js`) |
| Agent to Product | C | ✅ | `a7c6ce4` @main | Cộng sinh: 6 pointer file thay cho phân vùng rỗng; `graph.db` SHA256 sau = trước; `state.json` qua validator legacy `validate_state.py` → `[OK] State is valid`; `.brain-build` archive R100 |
| CausalAgent | D | ✅ GĐ1 | *(không commit — đúng thiết kế)* | 0 lệnh git ghi; 5 file move đều `Get-FileHash` IDENTICAL; root còn nguyên 18 `scratch_*.py` + 8 file dữ liệu |

### Kiểm chứng độc lập của orchestrator (chạy lại toàn bộ, không tin báo cáo suông)

- 6/6: `CLAUDE.md` shim hợp lệ (có `@AGENTS.md`, ≤10 dòng, không backtick) · đúng 1 marker `brain4agent-v1.2.0.md` · `state.json` tail byte = `10` · `brain_template_version` = 1.2.0 · đủ 7 phân vùng · `memory-distill.txt` có Bước 0 · `AGENTS.md` tồn tại.
- 6/6: chạy lại engine → `NÃO ĐÃ OK` (idempotent thật, không phải chỉ theo lời subagent).
- 5/5 repo có commit: `git status` sạch sau cùng; `CausalAgent` vẫn `No commits yet on main` đúng thiết kế.

### Sai lệch hợp đồng có chủ đích (ghi nhận, không phải lỗi)

1. **`Agent to Product` không có `current_version` trong `state.json`** (hợp đồng C4 yêu cầu). Lý do: `state.json` của repo này theo schema legacy riêng, vai trò version do field `release`/`release_commit` đảm nhiệm. Thêm `current_version` sẽ tạo **hai nguồn chân lý version** trong cùng một file — trái tinh thần C4 hơn là tuân thủ chữ nghĩa của nó. Chỉ thêm `brain_template_version`, 0 key legacy mất, validator legacy vẫn pass.
2. **`reverse Claude`: transcript vào `scratch/` thay vì `raw/`** như SPEC ghi. Lý do phát hiện lúc thực thi: `raw/` là input read-only ghim manifest SHA và `scripts/verify-worktree-hygiene.js` báo "Tracked Raw Capture Risk" cho mọi path chứa chuỗi `raw`; `docs/CODEBASE_ATLAS.md` chỉ định `scratch/` cho log vứt đi. Quy ước sẵn có của dự án thắng dự đoán trong SPEC.

### P08 — Hotfix engine phát sinh (v1.2.2)

**Bug (2 subagent độc lập phát hiện):** nhánh "tự vá Bước 0 vào `memory-distill.txt`" dùng `String.replace(/<agent_startup_protocol>/i, ...)`. Với kernel cũ viết **markdown thuần** (không có tag XML), `replace` không khớp → trả về chuỗi y nguyên, script vẫn `writeFileSync` và vẫn in `🔄 Đã tự động vá Bước 0` — **log báo-vá-nhưng-không-vá**, đúng lớp lỗi "báo-ổn-sai" mà kế hoạch #03 đã vá cho nhánh `AGENTS.md`. Hệ quả: dự án đó không bao giờ tự đạt chuẩn, mỗi lần chạy lại đều in dòng vá giả.

**Sửa:** kiểm `regex.test()` trước; khớp thì vá vào trong tag như cũ, KHÔNG khớp thì fallback chèn nguyên khối `<agent_startup_protocol>…</agent_startup_protocol>` lên đầu file, kèm log nói rõ đã dùng fallback.

**Bằng chứng:**
- `node --check` → `OK_SYNTAX`.
- Ca fallback (kernel markdown thuần): trước `xay-dung-nao-bo`=False → sau=True; nội dung cũ còn nguyên (`Kernel kieu markdown thuan` vẫn khớp); chạy lần 2 → `NÃO ĐÃ OK`; đếm tag = 2 (mở+đóng, không nhân đôi).
- Ca hồi quy (kernel XML): vẫn đi nhánh cũ, chèn đúng vào trong `<agent_startup_protocol>`, không dùng fallback.
- Deploy lại → `DIFF_EMPTY_BYTE_IDENTICAL` với bản global; boot lại hub → `NÃO ĐÃ OK`.

### Việc còn treo bàn giao user

1. **`CausalAgent` Giai đoạn 2** — dọn 18 `scratch_*.py` + 8 file dữ liệu ở root. Cần user tạo commit đầu tiên "as-is" (kiểm `.gitignore` che `.env`) mới mở gate.
2. **Phát hiện của `Audit` (đã nạp vào não repo đó, chưa sửa code):** `security_platform.db` mồ côi ở root do `db.py` dùng đường dẫn tương đối theo CWD; `requirements.txt` có dòng cuối ghi UTF-16LE.
3. **Phát hiện của `reverse Claude`:** gate `verify-documentation-integrity.js` đang FAIL do 2 broken link trỏ `output/target_corpus/...` — **lỗi có trước đợt này**, không do não hóa.
4. Toàn bộ commit là **local, chưa push** — theo luật thường trực của user.

## 📌 Ghi Chú Phạm Vi

- Kế hoạch này CHỈ lập hồ sơ — chưa có repo đích nào bị sửa tại thời điểm DRAFT.
- 2 repo pending của #04 (`control-discord`, `teamworkflow`) KHÔNG thuộc kế hoạch này — chúng đã có `AGENTS.md`/shim, chỉ chờ user xử lý git (xem roadmap).
- Tên 2 repo chứa dấu cách (`Agent to Product`, `reverse Claude`) — mọi lệnh trong SPEC phải bọc ngoặc kép đường dẫn.
- Backup bắt buộc trước di trú: toàn bộ `brain4agent/` của repo đích copy vào scratchpad (dù có git — di trú là thao tác nhiều file, revert bằng backup nhanh và an toàn hơn dò từng file).
