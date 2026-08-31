# KẾ HOẠCH NÂNG CẤP: BRAIN VERSION MARKER — NHÌN THẤY NGAY PHIÊN BẢN KHUNG NÃO Ở ROOT (#03)

- **STT KẾ HOẠCH:** #03
- **TRẠNG THÁI:** ✅ COMPLETED
- **THỜI GIAN BẮT ĐẦU:** 2026-08-31
- **THỜI GIAN HOÀN TẤT:** 2026-08-31
- **PHIÊN BẢN MỤC TIÊU:** v1.2.0 (SemVer 2.0.0, MINOR)

---

## 🎯 1. Mục Tiêu Nghiệp Vụ

1. Cho phép nhìn thấy NGAY ở root một dự án là não của nó sinh bởi khung phiên bản nào — thay vì phải đọc code `init_brain.js` mới biết.
2. Cho `init_brain.js` một căn cứ máy đọc để migrate: hiện đang dò lỗi thời bằng cờ thủ công từng tính năng (`hasStep0InAgentsMd`, `hasClaudeMd`...) — không mở rộng được khi thêm tính năng mới. Từ v1.2.0, mọi dự án được sinh/vá có `state.json.brain_template_version` để so khớp trực tiếp với `BRAIN_TEMPLATE_VERSION` của script.
3. Tách bạch tuyệt đối hai khái niệm: version KHUNG NÃO (`brain_template_version`) vs version DỰ ÁN (`current_version`, `package.json`) — không bao giờ trộn lẫn.
4. Cưỡng chế đúng một file marker `brain4agent-v<x.y.z>.md` ở root — tự động dọn bản cũ khi bump version, không nhân đôi khi chạy lại.
5. Nhúng ngoại lệ Root Clean cho marker vào luật quản trị (`AGENTS.md` §5.G, `CORE_GOVERNANCE_RULES.md` LUẬT 6) và vào template sinh bởi `init_brain.js`, để dự án mới khởi tạo đã có luật đúng ngay từ đầu.
6. Dogfooding: chính repo `brain4agent.old` tự có `brain4agent-v1.2.0.md` và `state.json.brain_template_version`.

---

## 📋 2. Checklist Thực Thi (Model Tier Tagged)

- [x] **P01 🔴 [Architecture]:** Định nghĩa nguồn chân lý máy đọc `state.json.brain_template_version` (khác `current_version`) và bản soi cho người `brain4agent-v<x.y.z>.md` — quyết định thiết kế do user chốt sẵn, không tự đổi.
- [x] **P02 🔴 [Brain Engine Core Fix]:** Sửa `.agents/skills/.xay-dung-nao-bo/scripts/init_brain.js`:
  - Thêm hằng số `BRAIN_TEMPLATE_VERSION = '1.2.0'` (một chỗ duy nhất).
  - Vá `brain_template_version` vào `state.json` khi tạo mới hoặc đã tồn tại (giữ nguyên field khác).
  - Sinh marker root, cưỡng chế đúng 1 file: glob `brain4agent-v*.md`, xoá mọi bản khác version, ghi bản đúng version (idempotent — không ghi lại nếu đã đúng).
  - Thêm chẩn đoán `hasBrainVersionMarker` + đưa vào điều kiện `isFullyStandard`.
  - Log console rõ khi tạo/vá/xoá marker.
- [x] **P03 🟠 [Template Governance]:** Nhúng ngoại lệ marker vào template `fullAgentsMdContent` (§5.G mục 3) sinh bởi `init_brain.js`, để dự án mới thừa hưởng luật ngay từ đầu.
- [x] **P04 🟠 [Doc Sync]:** Cập nhật sơ đồ cây trong template `index.md` sinh bởi script (dòng marker); cập nhật `AGENTS.md` §5.G và `CORE_GOVERNANCE_RULES.md` LUẬT 6 của chính repo này với cùng nội dung ngoại lệ.
- [x] **P05 🟢 [Version Bump v1.2.0]:** Nâng version tại `package.json`, `brain4agent/{changelog.md, project-intro.md, roadmap.md, memory-distill.txt, index.md}`, `README.md`, `brain4agent/memory/hot/state.json` (`current_version`). Giữ nguyên hồi tố các mục changelog `[v1.1.0]`/`[v1.0.1]`/`[v1.0.0]` cũ.
- [x] **P06 🟢 [Dogfooding]:** Chạy `init_brain.js` bản nguồn trên chính repo `brain4agent.old` → tự vá `brain_template_version` vào `state.json` hiện có + sinh `brain4agent-v1.2.0.md` ở root.
- [x] **P07 🟠 [Multi-Agent Deploy Sync]:** Chạy `scripts/deploy_skills.ps1` đồng bộ bản vá sang `C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo\`, xác nhận byte-identical với nguồn (`diff` rỗng).
- [x] **P08 🔴 [Verification Gate]:** Chạy 3 ca kiểm chứng thật bằng bản DEPLOY tại `C:\Users\hoang\AppData\Local\Temp\claude\...\scratchpad\test-marker\`.
- [x] **P09 🔴 [Regression Fix — Silent False-OK]:** Phát hiện qua kiểm chứng độc lập của coordinator: `init_brain.js` KHÔNG vá ngoại lệ §5.G mục 3 (marker) lẫn Luật J (Dual Entry-Point Invariant) vào `AGENTS.md` **đã tồn tại** của dự án cũ — chỉ nhúng khi sinh file mới. Hệ quả: script báo "NÃO ĐÃ OK" trong khi luật cho phép marker đang vắng mặt trong `AGENTS.md` của dự án đó (rủi ro: một đợt Root Clean audit khác coi marker là rác và xoá nhầm). Cùng lớp lỗi với sự cố Luật J ở v1.1.0 (đã vá `CLAUDE.md` nhưng bỏ sót việc vá `AGENTS.md` text cho dự án cũ).
  - Thêm chẩn đoán `hasRootMarkerException` (dò chuỗi ổn định `Marker Phiên Bản Khung Não`) và `hasDualEntryPointLawInAgentsMd` (dò chuỗi ổn định `Dual Entry-Point Invariant`) — không dò theo số dòng.
  - Đưa cả hai vào điều kiện `isFullyStandard`.
  - Mở rộng khối "Ghi hoặc cập nhật AGENTS.md": nếu file đã tồn tại và thiếu 1 trong 2 luật, tự vá đúng vị trí (chèn vào cuối section `### G.` / `### H.` theo cấu trúc chuẩn, có fallback phụ lục cuối file nếu AGENTS.md không theo đúng cấu trúc mẫu), giữ nguyên phần còn lại, chỉ ghi file một lần nếu có patch nào xảy ra.
  - Rà thêm không phát hiện cờ nào khác bị bỏ sót cùng lớp lỗi (Bước 0 đã có cơ chế vá từ trước, CLAUDE.md đã có cơ chế vá từ v1.1.0).
- [x] **P10 🟠 [Re-verify + Re-deploy]:** Chạy lại `deploy_skills.ps1`, xác nhận `diff` rỗng; chạy 3 ca A/B/C mới bằng bản DEPLOY; chạy lại Ca 1/2/3 cũ để xác nhận không hồi quy; dogfood lại `brain4agent.old`.

---

## 🛡️ 3. Cổng Nghiệm Thu (Bằng Chứng Thật)

### Ca 1 — Dự án trắng
Chạy `node "C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo\scripts\init_brain.js" .` trên thư mục trống `test-marker/ca1`:
- Output: `✅ Đã tạo mới marker phiên bản khung não: brain4agent-v1.2.0.md`.
- Root listing có ĐÚNG 1 file `brain4agent-v1.2.0.md` (689 bytes) + `AGENTS.md` + `CLAUDE.md` (356 bytes, có `@AGENTS.md`).
- `brain4agent/memory/hot/state.json`:
  ```json
  {
    "current_version": "1.0.0",
    "brain_template_version": "1.2.0",
    ...
  }
  ```
- `grep "NGOẠI LỆ TƯỜNG MINH" AGENTS.md` → khớp dòng 127 (ngoại lệ marker đã nhúng vào bản sinh mới).
- **Không hồi quy v1.1.0:** `CLAUDE.md` vẫn được sinh kèm shim `@AGENTS.md`.

### Ca 2 — Nâng cấp từ bản cũ (giả lập marker v1.1.0)
Tạo tay `brain4agent-v1.1.0.md` giả trong `ca1/` (dự án đã init ở Ca 1), chạy lại `init_brain.js`:
- Output: `🗑️ Đã xoá marker phiên bản khung não lỗi thời: brain4agent-v1.1.0.md` rồi `📄 Đã có sẵn: brain4agent-v1.2.0.md (đúng chuẩn, giữ nguyên).`
- `ls brain4agent-v*.md` sau khi chạy → chỉ còn **đúng 1 dòng** `brain4agent-v1.2.0.md`.
- `state.json` không bị ghi đè (log: "brain_template_version đúng chuẩn, giữ nguyên dữ liệu").

### Ca 3 — Idempotent (chạy lần 3)
Chạy lại `init_brain.js` lần nữa trên `ca1/`:
- Output: `🎉 [KẾT QUẢ CHẨN ĐOÁN] BỘ NÃO DỰ ÁN ĐÃ HOÀN HẢO!` kèm dòng `✅ Marker Phiên Bản Khung Não: brain4agent-v1.2.0.md đúng chuẩn tại root.`
- `EXIT_CODE=0`.
- `ls brain4agent-v*.md | wc -l` → `1` (không nhân đôi).

### Đồng bộ deploy
- `diff .agents/skills/.xay-dung-nao-bo/scripts/init_brain.js C:\Users\hoang\.gemini\config\skills\.xay-dung-nao-bo\scripts\init_brain.js` → rỗng (byte-identical).

### Dogfooding
- Chạy bản nguồn trên chính `brain4agent.old`: log `🔄 Đã vá brain_template_version=1.2.0 vào memory/hot/state.json (giữ nguyên các field khác).` và `✅ Đã tạo mới marker phiên bản khung não: brain4agent-v1.2.0.md`.
- `brain4agent/memory/hot/state.json` sau chạy có cả `current_version: "1.2.0"` (đã bump tay trước đó) và `brain_template_version: "1.2.0"` — hai field tách bạch, không field nào bị ghi đè lên field kia.

### Cú pháp
- `node --check .agents/skills/.xay-dung-nao-bo/scripts/init_brain.js` → `OK_SYNTAX` (không có bộ test tự động khác trong repo — dự án này là bộ khung/script Node.js thuần, không có `package.json` scripts `test`/`typecheck`/`lint`).

### Ca A — Dự án CŨ thiếu cả 2 luật (mô phỏng lỗ hổng đã phát hiện)
Lấy `test-marker/ca-old/AGENTS.md` (sinh từ Ca trắng trước đó, đã strip tay 2 đoạn — item 3 của `### G.` và toàn bộ `### J.`) rồi chạy lại `init_brain.js`:
- Trước khi chạy: `grep -c "Marker Phiên Bản Khung Não" AGENTS.md` = `0`; `grep -c "Dual Entry-Point Invariant" AGENTS.md` = `0`.
- Output: `🔄 Đã tự động vá ngoại lệ "Marker Phiên Bản Khung Não" (§5.G mục 3) vào AGENTS.md hiện có.` và `🔄 Đã tự động vá Luật J (Dual Entry-Point Invariant) vào AGENTS.md hiện có.`
- **KHÔNG báo "NÃO ĐÃ OK"** ở lần chạy này — output bắt đầu bằng `🔄 [TRẠNG THÁI] Phát hiện Não cũ / Chưa đồng bộ...`, `EXIT=0` (chạy xong migration, không phải branch "đã chuẩn").
- Sau khi chạy: cả hai đoạn luật xuất hiện đúng **1 lần**, đúng vị trí (`3. **NGOẠI LỆ TƯỜNG MINH...` nối tiếp mục 2 trong `### G.`; `### J. Quy tắc Tương Thích Đa Agent...` chèn sau `### H.`, trước phần còn lại của file).

### Ca B — Idempotent sau khi vá (chạy lại lần nữa trên `ca-old/`)
- Output: `🎉 [KẾT QUẢ CHẨN ĐOÁN] BỘ NÃO DỰ ÁN ĐÃ HOÀN HẢO!` kèm dòng mới `✅ AGENTS.md chứa đủ Luật J (Dual Entry-Point Invariant) và Ngoại Lệ Marker (§5.G mục 3).`
- `EXIT=0`.
- `grep -c` cho cả 2 chuỗi vẫn = `1` mỗi chuỗi — **không nhân đôi** đoạn luật.

### Ca C — Dự án trắng không hồi quy (`test-marker/ca-fresh/`)
- Chạy lần 1 trên thư mục trống → sinh đầy đủ, `AGENTS.md` đã có sẵn cả 2 chuỗi (`grep -c` = 1 mỗi chuỗi) ngay từ lần sinh mới (không cần patch riêng vì đã có trong `fullAgentsMdContent`).
- Chạy lần 2 → báo `NÃO ĐÃ OK` ngay lập tức.

### Regression check — Ca 1/2/3 cũ (không hồi quy sau khi thêm P09)
- Chạy lại `init_brain.js` trên `test-marker/ca1/` (đã qua Ca 1/2/3 gốc) → vẫn báo `NÃO ĐÃ OK` (AGENTS.md của Ca 1 vốn đã có sẵn 2 luật từ `fullAgentsMdContent`, không bị đánh dấu thiếu).
- Dogfood lại `brain4agent.old`: chạy bản nguồn → báo `NÃO ĐÃ OK` ngay, `git status --short` chỉ còn thay đổi ở `init_brain.js` (không sinh thêm side-effect nào trên các file khác).

- [x] Toàn bộ mã nguồn đã commit; **chưa push** (chờ quyết định của user cho hành động ảnh hưởng remote).

---

## 📌 Ghi Chú Phạm Vi

- `archive/legacy-skills/` **CỐ Ý không sửa** trong đợt nâng cấp này — hồ sơ đóng băng, không đại diện hành vi hiện hành.
- Repo `aiedu4vn` **KHÔNG bị đụng tới** — worker khác đang làm việc ở đó, đúng theo yêu cầu phạm vi của user.
- Thư mục test `test-marker/ca1` nằm trong scratchpad tạm, không phải một phần của repo `brain4agent.old`.
