# SPEC-P06 — Việc nhỏ gộp (Đ9): allowlist một nguồn, CI actions, `--check` mặc định, docs (WP5)

## §1. Allowlist đường dẫn tuyệt đối — MỘT nguồn

Đo: `ci.yml` 15 mục / `no-abs-path.test.js` 14 mục; lệch tại `scripts/deploy_skills.ps1` — mục **chết** (file có 0 dòng khớp). Bánh cóc T-H05b chỉ canh bản trong test.

**Hợp đồng:** file dữ liệu `tests/hygiene/abs-path-allowlist.json`:
```json
{ "<đường dẫn tương đối repo>": <số dòng tối đa được phép>, ... }
```
- `no-abs-path.test.js`: `const ALLOWLIST = require('./abs-path-allowlist.json')`. Chú thích lý do 3 nhóm giữ trong file test (JSON không có comment).
- `ci.yml` bước `abs-path-gate`: xoá khối `ALLOWLIST` nội tuyến; thay bằng `const ALLOWLIST = require('./tests/hygiene/abs-path-allowlist.json')`. Regex và `SKIP_PREFIXES` cũng đọc chung? **Không** — quá khổ; chỉ allowlist là dữ liệu trôi dạt (regex chưa từng lệch).
- Nội dung ban đầu = 14 mục của test hiện tại; **kiểm lại số** cho `init_brain.js` sau WP1/WP2: kỳ vọng vẫn `2` (body `boot` mới + `BOOT_V130` legacy). Nếu đo ra khác, sửa số theo đo (bánh cóc chỉ cấm tăng so với hiện trạng đo).
- Test mới **T-H05f**: `ci.yml` chứa chuỗi `abs-path-allowlist.json` và **không** chứa `'scripts/deploy_skills.ps1':` (chống ai đó dán lại bản nội tuyến).

**CẤM** thêm mục mới vào allowlist trong #10 (kể cả `planning/10_*` — bộ SPEC này không chứa đường dẫn tuyệt đối).

## §2. CI — nâng actions

- `actions/checkout@v4` → `@v5`; `actions/setup-node@v4` → `@v5` (`node-version: '24'` giữ). Lý do: cảnh báo Node 20 deprecated trên runner.
- Không đổi bước nào khác. Bước `self-check` giữ `init_brain.js --check .` (TQ2: CLI không đổi mặc định).
- Bằng chứng: run CI sau push không còn dòng cảnh báo `Node.js 20 actions are deprecated`; 2 OS xanh. (Remote — chờ user cho push.)

## §3. `--check` là mặc định của Bước 0 — phạm vi

| Nơi | Việc | Ghi chú |
| :--- | :--- | :--- |
| Thân luật `boot` (template + 66 repo qua rollout) | SPEC-P03 §1.1 | cơ chế chính |
| `AGENTS.md` hub | qua khối `boot` (SPEC-P03 §4) | |
| `.agents/skills/.xay-dung-nao-bo/SKILL.md` dòng lệnh mẫu (dòng 23) | thêm `--check` + 1 câu "chế độ ghi = không cờ, phải nêu tường minh" | deploy ra global theo thư mục skill |
| `brain4agent/memory-distill.txt` hub dòng 5 | thêm `--check` | kernel hub; template distill **không** đổi (C7) |
| `docs/xay-dung-nao-bo.md` §2 bảng tham số | ghi rõ "Bước 0 khuyến nghị `--check`; CLI mặc định vẫn là ghi" | tránh hiểu nhầm đổi CLI |

**CẤM** đổi `parseArgs`/mã thoát/thêm cờ `--write`. ⚠️ user có thể muốn đổi mặc định CLI thật sự — đó là breaking change (`MAJOR`), để #11+.

## §4. Docs / README / index — Sync Cascade (phần thuộc WP5; phần não bộ ở OPERATIONS §7)

| File | Sửa |
| :--- | :--- |
| `docs/xay-dung-nao-bo.md` | §4: "17 mã", thêm 016/017, BRN-002/003 điều kiện mới; §5 kiến trúc: mục "Lớp marker" (find/classify/patch, skeleton, 6 khối, fail-closed); §7: golden 7 case + thứ tự Đ8.3; §8 bẫy: "mốc phải trọn dòng", "không sửa ruột khối", "di chuyển trọn khối được phép" |
| `README.md` | `v1.4.0` → `v1.7.0` (2 chỗ, sót từ #06 — không test nào canh: ghi Idea Vault "test README version"); dòng marker `brain4agent-v1.2.0.md` → `v1.4.0.md` |
| `brain4agent/index.md:55` | `brain4agent-v1.3.0.md` → `v1.4.0.md` (thao tác tay lặp lại của #09) |
| `docs/UNIVERSAL_AGENT_GUIDE.md` | nếu có mô tả "engine dò token" thì sửa thành "khối marker"; không thêm mục mới |

## §5. Bảng lỗi

| Tình huống | Hành vi |
| :--- | :--- |
| `abs-path-allowlist.json` không parse được | T-H05 ném ⇒ đỏ; CI bước `abs-path-gate` exit 1 |
| Mục allowlist chết (file đã 0 dòng) | T-H05b đỏ (bánh cóc) — gỡ mục |
| Actions v5 không tồn tại trên runner | CI đỏ ở bước `checkout` — rollback 1 dòng (OPERATIONS §6) |

## §6. Bằng chứng nghiệm thu

| Chỉ số | Kỳ vọng |
| :--- | :--- |
| `grep -c "ALLOWLIST = {" .github/workflows/ci.yml` | 0 |
| Số mục allowlist | 14 (không tăng) |
| `grep -c "1\.4\.0\|1\.7\.0" README.md` sau sửa | ≥ 3, và 0 khớp `v1\.4\.0)` ở tiêu đề |
| `docs/xay-dung-nao-bo.md` | có chuỗi `BRN-016`, `BRN-017`, `classifyRuleBlocks`, `AGENTS_SKELETON` |
