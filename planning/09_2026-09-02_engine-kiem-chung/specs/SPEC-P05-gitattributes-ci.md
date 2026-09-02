# SPEC-P05 — WP5: `.gitattributes` + Chuẩn Hoá EOL/BOM (§A) · CI GitHub Actions matrix (§B) · Lỗi tài liệu nhỏ (§C) 🟠

§A là **việc đầu tiên** của cả kế hoạch (OPERATIONS §1). §B chỉ sau khi WP2b có test. §C làm ở bước đóng.

---

## §A. `.gitattributes` + chuẩn hoá cây làm việc (WP5a)

### (a) Hợp đồng

**Hiện trạng đo 2026-09-02 (`git ls-files --eol`, 49 file tracked):** index 100% `i/lf` (trừ 1 `i/-text`); cây làm việc `38 w/lf · 9 w/crlf · 1 w/mixed · 1 w/-text`. `core.autocrlf=true`. **Không có `.gitattributes`.** Chi tiết:
- `w/crlf` (9): `brain4agent/changelog.md`, `brain4agent/memory/hot/today.md`, `brain4agent/roadmap.md`, `planning/06_*/plan.md`, `planning/06_*/specs/SPEC-P01..P05` (5 file).
- `w/mixed` (1): `docs/MODULE_DOCUMENTATION_SPEC.md` — **kèm BOM** (`ef bb bf`, 45 dòng, 2542 byte).
- `i/-text w/-text` (1): `brain4agent/-known-gotchas.md` — git coi là **nhị phân** vì dòng 102 (mô tả gotcha #13) chứa **byte thô** `0x07` (BEL) và **một CR đơn độc** (đo bằng `od`: 1 byte `07`, 1 chuỗi `0d` không kèm `0a`). Hệ quả: `git diff` cho file này in "Binary files differ" — không review được thay đổi gotchas.

**Nội dung `.gitattributes` (nguyên văn):**
```gitattributes
# Chuẩn hoá EOL: index luôn LF; checkout luôn LF trên mọi OS (đè core.autocrlf)
*            text=auto eol=lf
*.md         text eol=lf
*.js         text eol=lf
*.json       text eol=lf
*.ps1        text eol=lf
*.yml        text eol=lf
*.txt        text eol=lf
.gitattributes text eol=lf
.gitignore   text eol=lf

# Fixture test: giữ NGUYÊN BYTE (CRLF/BOM/UTF-16 là dữ liệu thử nghiệm, không được chuẩn hoá)
tests/fixtures/** -text

# Nhị phân
*.png binary
*.jpg binary
*.gif binary
*.ico binary
*.pdf binary
*.zip binary
```

**Bổ sung `.gitignore`:**
```gitignore
# Báo cáo doctor: chứa tên repo vệ tinh — KHÔNG commit (repo PUBLIC)
fleet-report*.json
# Thư mục tạm của test
tests/.tmp/
```

**Runbook §A (thứ tự bắt buộc, tiền đề: `git status` sạch):**
1. Sửa nội dung 2 file (commit riêng `fix(docs): replace raw control bytes and BOM in tracked markdown`):
   - `brain4agent/-known-gotchas.md` dòng 102: thay byte `0x07` bằng chữ `<0x07>` và CR đơn độc bằng chữ `<CR>` (giữ nghĩa mô tả). Kiểm: `git ls-files --eol` ⇒ `i/lf w/lf`.
   - `docs/MODULE_DOCUMENTATION_SPEC.md`: strip BOM, chuẩn hoá LF (dùng chính `readText/writeText` của engine sau WP6 **hoặc** Node one-liner — không dùng editor GUI để tránh tự thêm BOM lại).
2. Thêm `.gitattributes` + sửa `.gitignore`; `git add --renormalize .`; `git status` phải cho thấy **chỉ** 2–3 file thay đổi (`.gitattributes`, `.gitignore`, và có thể 0 file nội dung vì index đã LF). Commit `chore(repo): add .gitattributes enforcing LF and raw fixtures`.
3. Đưa cây làm việc về LF: với **từng** file `w/crlf|w/mixed` trong `git ls-files --eol`: `git checkout-index --force -- <file>` (ghi lại từ index qua bộ lọc `eol=lf`). **Không** dùng `git reset --hard`/`rm --cached -r .` (đụng toàn cây).
4. Kiểm: `git ls-files --eol | grep -E 'w/(crlf|mixed|-text)'` = **0 dòng** (chưa có fixture nào lúc này); `git status` sạch.
5. BOM: `git ls-files -z | xargs -0 -I{} sh -c 'head -c3 "{}" | od -An -tx1'` không dòng nào `ef bb bf`.

### (b) Luật + vùng cấm

- **BẮT BUỘC** `.gitattributes` commit **trước** bất kỳ fixture nào (OPERATIONS §1).
- **BẮT BUỘC** đo bằng `git ls-files --eol` — **duy nhất** lệnh được dùng để kết luận EOL của index/cây làm việc. Lý do ghi lại để tránh tranh cãi: brief C ghi `git show :f` áp bộ lọc; đo lại 2026-09-02 trên hub thì `git show :f`, `git cat-file -p :f`, `git show HEAD:f` đều trả blob thô (0 CRLF), còn `git cat-file --filters :f` mới áp bộ lọc (219 CRLF). Dù cơ chế thế nào, **kết luận vận hành không đổi**.
- **CẤM** đổi nội dung (ngoài EOL/BOM/2 byte điều khiển) của bất kỳ file nào trong bước này — diff commit 1 phải là ≤ 3 dòng thay đổi.
- **CẤM** `git add --renormalize` trong khi có thay đổi chưa commit khác (trộn diff).
- **Vùng cấm:** không thêm `.editorconfig` (ngoài scope; Idea Vault); không đặt `*.ps1 eol=crlf` (pwsh chạy LF tốt; một quy tắc cho tất cả); không thêm `export-ignore`/`linguist-*`.

### (c) Lỗi + hành vi bên gọi

| Lỗi | Hành vi |
| :--- | :--- |
| Sau bước 3 vẫn còn `w/crlf` | File đó có thể đang mở bởi editor tự động CRLF — đóng editor, chạy lại bước 3 cho file đó; không "sửa tay" |
| `git add --renormalize` báo nhiều file thay đổi | Dừng. Index đang không LF như đo (hiện trạng thay đổi) — đo lại, ghi vào plan.md, mới tiếp |
| Editor thêm lại BOM cho `docs/MODULE_DOCUMENTATION_SPEC.md` | Chỉ sửa file bằng Node/`writeText`; kiểm 3 byte đầu trước commit |

### (d) Bằng chứng

| # | Bằng chứng | Ngưỡng |
| :-- | :--- | :--- |
| P05A-E1 | `git ls-files --eol` sau §A: `w/lf` = 100% (trừ `tests/fixtures/**` khi có, hiện `-text`) | 0 `w/crlf\|mixed`, 0 `-text` ngoài fixtures |
| P05A-E2 | `git diff --numstat <commit-1>` cho `-known-gotchas.md` là **số** (không phải `-\t-`) — file không còn nhị phân | số |
| P05A-E3 | 3 byte đầu `docs/MODULE_DOCUMENTATION_SPEC.md` = `23 20` hoặc chữ đầu tiêu đề — không `ef bb bf` | đúng |
| P05A-E4 | `git check-attr -a tests/fixtures/x` ⇒ `text: unset` (sau khi tạo fixture) | đúng |
| P05A-E5 | Clone mới trên máy Windows (`git clone` vào thư mục tạm, `core.autocrlf=true` mặc định) ⇒ `git ls-files --eol` 100% `w/lf` — chứng minh attribute đè autocrlf | 100% |

---

## §B. CI GitHub Actions (WP5b)

### (a) Hợp đồng — `.github/workflows/ci.yml`

| Khoá | Giá trị |
| :--- | :--- |
| `on` | `push` (branches: `main`), `pull_request`, `workflow_dispatch` |
| `permissions` | `contents: read` (không có quyền ghi; không secrets) |
| `concurrency` | `ci-${{ github.ref }}`, `cancel-in-progress: true` |
| `strategy.matrix.os` | `[ubuntu-latest, windows-latest]`; `fail-fast: false` |
| `timeout-minutes` | 15 |
| `env` | `BRAIN_TEST_REQUIRE_TOOLS=1`, `BRAIN_NOW=2026-01-15T03:04:05.000Z` |

**Các bước — mỗi cổng là một `step` riêng, trả mã thoát của chính nó (gotcha #15: không `&&` cổng-echo với bước sau):**

| # | Step | Lệnh | Kỳ vọng |
| :-- | :--- | :--- | :--- |
| 1 | checkout | `actions/checkout@v4` (fetch-depth 1) | |
| 2 | node | `actions/setup-node@v4` `node-version: 24` | `node --version` in `v24.x` |
| 3 | versions | `node --version && git --version && pwsh --version` | pwsh có sẵn trên cả 2 runner |
| 4 | **test** | `npm test` | exit 0 |
| 5 | **self-check** | `node .agents/skills/.xay-dung-nao-bo/scripts/init_brain.js --check .` | exit **0** (hub tự chuẩn; nếu 1 ⇒ ai đó commit hub lệch) |
| 6 | **eol-gate** | `node -e` script: `git ls-files --eol` → fail nếu bất kỳ dòng nào `w/crlf`/`w/mixed`, hoặc `i/-text` ngoài `tests/fixtures/` và ngoài pattern binary | exit 0 |
| 7 | **bom-gate** | `node -e`: với mỗi file `git ls-files -z` (trừ `tests/fixtures/`, trừ binary): 3 byte đầu ≠ `EF BB BF` | exit 0 |
| 8 | **abs-path-gate** | `node -e`: grep regex `[A-Za-z]:\\Users\\\|/home/[a-z0-9_-]+/\|/Users/[a-z0-9_-]+/` trên mọi file tracked trừ `archive/`, `tests/hygiene/no-abs-path.test.js`, và **trừ 4 dòng template engine đã có từ trước** (dòng 193, 355, 479, 632 — đường dẫn bản global nhúng trong template, thuộc chuẩn `1.3.0`, không được sửa ở đợt này — A8) — dùng allowlist theo `file:line-pattern` | exit 0 |
| 9 | **doctor-fixture** | `node .../brain_doctor.js --root tests/fixtures/fleet --json "$RUNNER_TEMP/fleet-report.json"` ; bước tiếp `node -e` khẳng định mã thoát **đúng bằng 2** (fixture fleet cố ý có lỗi) — dùng `continue-on-error` + `steps.x.outcome`/ghi mã vào file rồi so | mã = 2 (không phải 3) |
| 10 | **deploy-dry** | `pwsh -NoProfile -File scripts/deploy_skills.ps1 -DryRun -GeminiSkillsRoot "$RUNNER_TEMP/g" -ClaudeCommandsRoot "$RUNNER_TEMP/c"` | exit 0; **không** deploy thật |
| 11 | **version-sync** | `node -e`: `package.json.version === require(engine).ENGINE_VERSION` | exit 0 |

Ghi chú Windows runner: bước 6 chứng minh `.gitattributes` đè `core.autocrlf=true` mặc định của runner.

### (b) Luật + vùng cấm

- **BẮT BUỘC** không có `secrets.*` nào được tham chiếu; không `GITHUB_TOKEN` quyền ghi.
- **BẮT BUỘC** bước 9 khẳng định **mã thoát chính xác** (`=== 2`), không phải `!== 0` — đây là bằng chứng "3 không lẫn 2" chạy mỗi commit.
- **CẤM** cache `node_modules` (không có), **CẤM** `npm ci`/`npm install` (không có dependency; nếu bước này xuất hiện là có ai vi phạm A1).
- **CẤM** bất kỳ step nào chạy engine chế độ ghi trên thư mục ngoài `$RUNNER_TEMP` (NG4). Self-check là `--check`.
- **CẤM** `schedule:` cron (NG4).
- **Vùng cấm:** không thêm matrix `macos-latest` (tốn phút, không có người dùng); không thêm Node 22/20 vào matrix (engine chỉ cam kết Node ≥ 24 — `TextDecoder fatal`, `node:test` snapshot); không dùng action bên thứ ba ngoài `actions/*` chính chủ.

### (c) Lỗi + hành vi bên gọi

| Step đỏ | Nghĩa | Làm gì |
| :--- | :--- | :--- |
| 4 | test đỏ | xem SPEC-P02 §(c) |
| 5 | hub tự lệch chuẩn | chạy engine chế độ ghi **tại hub**, review diff, commit |
| 6/7 | có file CRLF/BOM lọt | lỗi máy dev (editor); sửa file, không sửa gate |
| 8 | có đường dẫn máy user lọt vào hub | **gỡ trước khi merge** (gotcha #14); nếu là dòng template hợp lệ mới ⇒ cập nhật allowlist kèm quyết định trong `plan.md` |
| 9 ≠ 2 | doctor đổi hành vi mã thoát hoặc fixture đổi | xem SPEC-P04 |
| 10 | script deploy hỏng cú pháp / `#requires` | sửa script; CI không cần thư mục global |
| 11 | quên bump `ENGINE_VERSION` hoặc `package.json` | bump đồng thời (01-CONTRACTS §10) |

### (d) Bằng chứng

| # | Bằng chứng | Ngưỡng |
| :-- | :--- | :--- |
| P05B-E1 | Workflow xanh trên **cả 2 OS** ở commit đầu tiên có workflow; link run ghi vào TESTING-ACCEPTANCE (chỉ số run, không token) | 2/2 |
| P05B-E2 | Thời gian mỗi job | ≤ 5 phút |
| P05B-E3 | Cố ý tạo nhánh thử (không merge) commit 1 file CRLF ⇒ step 6 đỏ; commit 1 file BOM ⇒ step 7 đỏ; sửa `ENGINE_VERSION` lệch ⇒ step 11 đỏ — ghi 3 kết quả | 3/3 đỏ đúng chỗ |
| P05B-E4 | Step 9 log in `exit=2` từ SUMMARY của doctor và bước so sánh in `OK: doctor exit 2 as expected` | đúng |

---

## §C. Lỗi tài liệu nhỏ phát hiện kèm (brief mục H) + tài liệu module 1-1 (WP7, 🟢)

| # | Việc | Chi tiết |
| :-- | :--- | :--- |
| C1 | `brain4agent/index.md` dòng 53: `brain4agent-v1.2.0.md` → `brain4agent-v1.3.0.md` | Bản đồ cây đang ghi sai marker (thực tế root có `brain4agent-v1.3.0.md`) |
| C2 | Tạo `docs/xay-dung-nao-bo.md` | Tài liệu module 1-1 cho `.agents/skills/.xay-dung-nao-bo/`: CLI engine (01-CONTRACTS §3), CLI doctor (§4), bảng mã thoát (§6), 15 mã BRN (§8), quy ước văn bản (§1), cách chạy test/golden, cách deploy/verify. **Không** chép hợp đồng — trỏ về SPEC #09 và tóm tắt. Quyết định bỏ dấu chấm đầu tên file: xem `plan.md` nhật ký (user có thể đổi). |
| C3 | Tạo `docs/compact.md` | Tài liệu 1-1 cho `.agents/skills/.compact/` (skill ghi não, lệnh `/luu-nao`; ghi rõ **không** deploy thành `compact.md` — gotcha #13) |
| C4 | `brain4agent/index.md` Router mục 1 + Bản đồ mục 2 | thêm `tests/`, `.github/workflows/ci.yml`, `brain_doctor.js`, `docs/xay-dung-nao-bo.md`, `docs/compact.md`, `.gitattributes` |
| C5 | `docs/MODULE_DOCUMENTATION_SPEC.md` | đã xử lý ở §A (BOM + EOL) — không đổi nội dung |

Bằng chứng: `T-H01` test hygiene khẳng định với mỗi thư mục `.agents/skills/<x>/` tồn tại `docs/<x-bỏ-dấu-chấm-đầu>.md` (2/2); `index.md` không còn chuỗi `brain4agent-v1.2.0.md`.
