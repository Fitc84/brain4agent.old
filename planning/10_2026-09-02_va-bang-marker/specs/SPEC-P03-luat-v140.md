# SPEC-P03 — Khung Não v1.4.0: 6 thân luật, skeleton, hub, hai hiến pháp (WP2)

Hợp đồng: 01-CONTRACTS §5 (bảng `RULE_BLOCKS`), §6, §8. Ký hiệu `<GLOBAL_SKILL>` = đường dẫn bản skill global **hiện có trong engine v1.6.0 dòng 315** — giữ nguyên chuỗi, không viết lại ở đây (repo PUBLIC, allowlist T-H05).

## §1. Nguyên văn `body` (LF, không newline đầu/cuối, không version)

### 1.1 `boot` — THÂN ĐỔI (Đ9 + TQ2: `--check` là mặc định Bước 0, ở tầng văn bản)

```text
1. **Bước 0 (Bắt buộc tiên quyết — Đồng Bộ & Boot Não Bộ):** Chạy `node <GLOBAL_SKILL>\scripts\init_brain.js --check` (skill `.xay-dung-nao-bo`, CHỈ ĐỌC) để kiểm tra não bộ đã đạt chuẩn mới nhất trước khi xử lý bất kỳ yêu cầu nào. Chỉ khi kết quả là `CẦN NÂNG CẤP` mới chạy lại **không cờ** (chế độ GHI) và nêu tường minh trong phiên; mã thoát `2` = cần người xử — KHÔNG tự sửa tay vùng luật do engine quản lý.
```
`legacy = [BOOT_V130]` = nguyên văn dòng 315 engine v1.6.0. Ràng buộc: body chứa `xay-dung-nao-bo` (token), `Bước 0 (Bắt buộc tiên quyết` (probe), đúng **1** dòng đường dẫn tuyệt đối (allowlist `AGENTS.md: 1` không đổi; engine giữ **2** = body mới + legacy cũ).

### 1.2 `cold-memory` — MỚI (Đ6.2: văn xuôi độc lập, không hàng bảng)

```text
**Ký ức lạnh (Cold Memory) — `memory/archive/`:** phân khu chứa các mục nhật ký đã xoay vòng khỏi `memory/hot/today.md`, mỗi file tên `YYYY-MM-DD.md`. CHỈ script xoay ký ức được ghi (append); CẤM sửa tay; CẤM coi là nguồn chân lý hiện trạng (kernel `memory-distill.txt` và `index.md` mới là). Engine chỉ tạo thư mục, KHÔNG sinh `.gitkeep`, KHÔNG quản lý script xoay; file không đúng mẫu tên bị `brain-doctor` báo `BRN-017`.
```
`probe` = `` Ký ức lạnh (Cold Memory) — `memory/archive/` `` — **cố ý** không trùng câu mở đầu §2 hay hàng bảng của repo mẫu (`**Ký ức lạnh (Cold Memory)**. Các mục…`) để repo mẫu rơi vào `add`, không phải BRN-016, và để BRN-003 không báo giả khi bảng §2 có hàng archive. `legacy = []`.

### 1.3 `spec-package` — THÂN KHÔNG ĐỔI

`body` = nguyên văn dòng 350–367 engine v1.6.0 (18 dòng, từ `2. **BẮT BUỘC DẠNG SPEC PACKAGE` đến hết mục `2.6.`). `legacy = [body]` (cùng chuỗi — hợp lệ: "legacy = bản 1.3.0 = bản 1.4.0").

### 1.4 `structural-extension` — MỚI (lược mốc lịch sử repo mẫu theo scope brief)

```text
2. **Mở Rộng Bắt Buộc Khi Đổi Nền Cấu Trúc (Structural Extension):** Kế hoạch nào thêm **THƯ MỤC TOP-LEVEL mới** (vd `app/`, `legacy/`, `.claude/agents/`) hoặc đưa vào **NGÔN NGỮ / KHUNG mới** (vd Rust, Tauri, React, Node ESM) thì BẮT BUỘC rà thêm **2 file ngoài Ma Trận 6 Điểm**: [`brain4agent/project-intro.md`](file:///brain4agent/project-intro.md) (mục tiêu, bản chất repo, tech stack) và [`brain4agent/-data-architecture.md`](file:///brain4agent/-data-architecture.md) (tầng lưu trữ, data flow). Lý do: hai file này KHÔNG thuộc 6 điểm nên dễ mô tả sai repo trong thời gian dài mà mọi kiểm tra tự động vẫn xanh; bản chất repo và tech stack chỉ con người rà được.
```
Đã lược: `luật chốt 2026-09-02, kế hoạch #16`, `v1.10.0 → v1.17.0`, `reality_audit`, `check #11`. `probe = token = Structural Extension`. `legacy = []`.

### 1.5 `root-marker` — THÂN ĐỔI 1 CỤM (TQ3: bỏ ví dụ version)

Nguyên văn dòng 524 engine v1.6.0 với cụm `` (vd `brain4agent-v${version}.md`) `` **bị xoá** (kể cả khoảng trắng trước nó). `legacy = [[RM_A, RM_B]]` với `RM_A` = phần trước `brain4agent-v`, `RM_B` = phần từ `.md`) do` trở đi — ghép bằng lỗ SemVer (khớp cả bản `v1.2.0` của template và `v1.3.0` do bản vá viết).

### 1.6 `dual-entry` — THÂN KHÔNG ĐỔI

`body` = nguyên văn dòng 446–453 engine v1.6.0 (8 dòng, từ `### J. Quy tắc…` đến `7. Cách kiểm…`). `legacy = [body]`.

## §2. `AGENTS_SKELETON` — thay đổi ngoài khối (văn bản khung, KHÔNG do máy quản)

| Vị trí | Thay đổi |
| :--- | :--- |
| §1 mục 1 | thay dòng Bước 0 bằng cặp mốc rỗng `boot` |
| §2 câu mở đầu | `…gồm **7 phân vùng chức năng cố định**, **Phân khu Ký ức Nóng (\`memory/hot/\`)** và **Phân khu Ký ức Lạnh (\`memory/archive/\`)**. Tuyệt đối…` |
| §2 bảng, hàng mới ngay sau `memory/hot/` | `\| **\`memory/archive/\`** (\`YYYY-MM-DD.md\`) \| **Ký ức lạnh**: nhật ký đã xoay vòng khỏi \`today.md\`. \| Đọc khi cần tra phiên cũ; luật ghi xem khối ngay dưới bảng. \|` — **không** chứa token `Ký ức lạnh (Cold Memory)` (token chỉ ở khối ⇒ T-H02b đếm 1) |
| §2 sau bảng, trước `---` | dòng trống + cặp mốc rỗng `cold-memory` |
| §3 mục 2 | cặp mốc rỗng `spec-package` |
| §5.B sau bullet cuối của mục 1 | cặp mốc rỗng `structural-extension` |
| §5.G mục 3 | cặp mốc rỗng `root-marker` |
| §5.J | cặp mốc rỗng `dual-entry` (thay cả dòng `### J.` — vì `### J.` thuộc `body`) |

Cặp mốc rỗng = hai dòng liền nhau `OPEN(id)` rồi `CLOSE(id)`. Skeleton có **đúng 6** cặp; T-M18 kiểm.

Lưu ý render: HTML comment cắt danh sách đánh số tại chỗ đặt mốc; CommonMark/GitHub giữ số bắt đầu (`2.`, `3.`) nên hiển thị không đổi. **Không** đặt mốc trong bảng/khối ``` (C10).

## §3. Hai hiến pháp — `CORE_GOVERNANCE_RULES.md` (sửa tay, KHÔNG mốc — C7)

| Vị trí | Sửa |
| :--- | :--- |
| §2 câu mở đầu (dòng 22) | thêm `và **Phân khu Ký ức Lạnh (\`memory/archive/\`)**` như skeleton |
| §2 bảng, sau hàng `memory/hot/` | hàng `memory/archive/` — ở CORE, hàng này **chứa** token `Ký ức lạnh (Cold Memory)` đúng 1 lần (CORE không có khối) |
| LUẬT 2, sau mục `6.` | thêm gạch đầu dòng: `- **Structural Extension:** ` + phần thân sau dấu `:` của §1.4 (1 lần token) |

Kết quả T-H02: 7 token × (AGENTS ×1 = CORE ×1). Không đụng mục khác của CORE.

## §4. Hub tự bọc mốc (TQ1) — quy trình tay, trong CÙNG commit với engine

1. `AGENTS.md` hub: thay dòng Bước 0 bằng `OPEN(boot)` + body §1.1 + `CLOSE(boot)` (mất câu nhắc đường dẫn local — đã có ở `memory-distill.txt` dòng 5).
2. Thay khối §5.J bằng `OPEN(dual-entry)` + body §1.6 + `CLOSE(dual-entry)` (mất 2 chỉnh sửa riêng của hub — ghi vào nhật ký `plan.md`).
3. Bọc mốc quanh mục 2 §3 và mục 3 §5.G (thân đã nguyên văn — chỉ thêm 2 dòng mốc mỗi khối; riêng root-marker đổi ruột theo §1.5).
4. §2: sửa câu mở đầu, thêm hàng bảng theo §2 (giữ tuỳ biến còn lại của hub), thêm khối `cold-memory` sau bảng.
5. §5.B: thêm khối `structural-extension`.
6. Kiểm: `node -e "const e=require('./.agents/skills/.xay-dung-nao-bo/scripts/init_brain.js');const r=e.patchAgentsMd(require('fs').readFileSync('AGENTS.md','utf8'));console.log(r.changed, r.broken)"` ⇒ `false []`; `classifyRuleBlocks` 6/6 `ok`, `extra` = false.
7. Đọc lại **12 dòng mốc** bằng mắt trước commit (repo PUBLIC).

Hub trở thành repo **duy nhất** diff = 0 ngay lần chạy đầu (mẫu đối chứng cho sóng 1).

## §5. BẮT BUỘC / CẤM / vùng cấm

- **BẮT BUỘC** nguyên văn §1 là hợp đồng: sửa một ký tự thân luật = đổi ruột 66 khối ở lần bump sau — chỉ làm khi có quyết định trong `plan.md`.
- **CẤM** nhúng mốc lịch sử dự án mẫu, tên script xoay, đường dẫn hook, `.gitkeep` vào thân luật.
- **CẤM** mã chèn hàng vào bảng §2 của repo cũ (C8). Repo cũ **không** tự có hàng `memory/archive/` — ai muốn thì thêm tay; điều này được ghi rõ trong body `cold-memory` (chỗ chứa + luật ghi nằm trong khối, không phụ thuộc hàng bảng).
- **Vùng cấm:** không sửa `patchDistill`/`memory-distill.txt` template để nhắc `--check` (C7) — hub tự cập nhật distill của mình ở Sync Cascade; template distill giữ nguyên ở #10 (ghi Idea Vault).

## §6. Bằng chứng nghiệm thu

| Chỉ số | Kỳ vọng |
| :--- | :--- |
| `RULE_BLOCKS.length` | 6; T-M19 xanh (token ⊂ body, probe ⊂ body, 0 version trong body, probe ∉ skeleton ngoài mốc) |
| Số dòng engine dành cho 2 luật mới (G3) | ≤ 20 (2 phần tử `RULE_BLOCKS` + 2 thân) — ghi số thật vào `plan.md` §4 |
| `renderFullAgentsMd()` | chứa 6 khối `ok`, 0 cặp mốc rỗng, 7 token mỗi cái ×1, 1 dòng đường dẫn tuyệt đối |
| Hub | `patchAgentsMd(hub).changed === false`, `--check` = 0 sau khi engine ghi `state.json`/marker |
| T-H02/T-H02b | 7/7 token khớp hai hiến pháp, mỗi token ×1 |
