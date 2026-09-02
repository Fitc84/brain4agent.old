# SPEC-P02 — WP2: Bộ Test `node:test` + Golden Manifest + `npm test` (0 dependency) 🔴

Gói này chia hai pha bắt buộc tách rời theo thời gian:
- **§A (WP2a) — trước WP6:** fixture + harness hộp đen + chụp golden **bằng engine v1.5.4 chưa sửa**.
- **§B (WP2b) — sau WP1:** unit test hàm thuần + test khiếm khuyết D1..D7 + test bất biến I1..I11 + hygiene.

---

## (a) Hợp đồng chính xác

### a.1. Bố cục & lệnh

```text
tests/
├── helpers/
│   ├── tmp.js          mkTmpRoot(fixtureName) → { dir, cleanup() }   // copy tests/fixtures/<name> → os.tmpdir()/brain-t-<rand>/; đổi tên mọi thư mục `dot-git` thành `.git`
│   ├── run.js          runEngine(enginePath, args, { cwd, env }) → { code, stdout, stderr }   // spawnSync(process.execPath, ['-r', fakeDatePath, enginePath, ...args], { encoding:'utf8', env:{...process.env, BRAIN_NOW, ...env} })
│   │                   runDoctor(args, opts) → như trên; runPwsh(scriptArgs, opts) → spawnSync('pwsh', ['-NoProfile','-NonInteractive','-File', ...]) ; null nếu không có pwsh
│   ├── tree.js         snapshotTree(dir) → { [relPosix]: { sha256, bytes, eol, bom, mtimeMs } }  // KHÔNG đệ quy vào .git; sort key
│   ├── fake-date.js    preload: nếu process.env.BRAIN_NOW ⇒ ghi đè global.Date sao cho `new Date()` và `Date.now()` trả mốc cố định; `new Date(x)` với đối số giữ nguyên
│   └── make-golden.js  CLI: node tests/helpers/make-golden.js --engine <path> --out tests/golden/manifest.json [--case <name>]...
├── fixtures/<case>/    (bảng a.3)
├── golden/manifest.json
├── unit/  text.test.js · diagnose.test.js · patch-agents.test.js · patch-distill.test.js · patch-state.test.js · plan.test.js · diff.test.js
├── cli/   exit-codes.test.js · check-dry-run.test.js · write-mode.test.js · idempotent.test.js
├── golden.test.js
├── doctor/ fleet.test.js · git-cases.test.js · schema.test.js · perf.test.js
├── deploy/ deploy.test.js
└── hygiene/ no-deps.test.js · no-abs-path.test.js · two-constitutions.test.js · version-sync.test.js · eol-bom.test.js
```

`package.json`:
```json
"scripts": {
  "test":        "node --test \"tests/**/*.test.js\"",
  "test:golden": "node --test tests/golden.test.js",
  "golden:make": "node tests/helpers/make-golden.js --engine .agents/skills/.xay-dung-nao-bo/scripts/init_brain.js --out tests/golden/manifest.json"
}
```
Mốc thời gian cố định cho mọi test: `BRAIN_NOW=2026-01-15T03:04:05.000Z`.

### a.2. `tests/golden/manifest.json`

```json
{
  "schema_version": 1,
  "engine_commit": "<SHA đầy đủ của commit chứa engine v1.5.4 dùng để chụp>",
  "engine_sha256": "<sha256 của init_brain.js lúc chụp>",
  "brain_now": "2026-01-15T03:04:05.000Z",
  "node": "v24.15.0",
  "cases": {
    "F01-blank": { "exit_code": 0, "files": { "AGENTS.md": "<sha256>", "CLAUDE.md": "…", "brain4agent-v1.3.0.md": "…", "brain4agent/index.md": "…", "...": "…" } },
    "F02-standard-lf": { "exit_code": 0, "files": { "...": "…" } }
  }
}
```
- `files` = **toàn bộ** file trong cây sau khi chạy engine (kể cả file không đổi) → phát hiện cả ghi thừa lẫn xoá thừa.
- Chụp bằng engine **cũ** chạy qua `run.js` (có preload `fake-date.js` — engine cũ không biết `BRAIN_NOW`, preload lo).
- `golden.test.js`: với mỗi case, copy fixture → chạy engine **hiện tại** → `snapshotTree` → so `sha256` từng file với manifest; thừa/thiếu file = FAIL; so `exit_code`.

### a.3. Bảng fixture (tên **chung chung** — CẤM tên repo thật)

| Case | Nội dung | Golden? | Bảo vệ |
| :--- | :--- | :-: | :--- |
| `F01-blank` | thư mục rỗng | ✔ | I7, I11, luồng "mới tinh" (dòng 130) |
| `F02-standard-lf` | dự án chuẩn `1.3.0` đầy đủ, LF | ✔ | I10 (không ghi gì; exit 0) |
| `F03-legacy-v120` | `AGENTS.md` thiếu `SPEC PACKAGE`; marker `v1.2.0`; `state.json` `1.2.0` **thiếu newline cuối**; `current_version: "9.9.9"` | ✔ | I1, I2, I3, I5, BRN-002/006/010/011 |
| `F04-old-planning-block` | `AGENTS.md` có khối `Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)` (LF) | ✔ | nhánh thay thế dòng 705–706 |
| `F05-crlf-agents` | = F04 nhưng toàn file CRLF | ✘ (snapshot riêng, sinh bởi engine MỚI, người duyệt) | gotcha #11, §1 hợp đồng EOL, I6 |
| `F06-duplicate-law` | `AGENTS.md` có **cả** khối cũ và `SPEC PACKAGE` | ✔ | I6, dòng 720–731 |
| `F07-bom-state` | `state.json` có BOM, version `1.2.0` | ✘ | **D4** |
| `F08-dollar-agents` | `AGENTS.md` thiếu `Marker Phiên Bản Khung Não` và `Dual Entry-Point Invariant`; mục `### G.` và `### H.` chứa nguyên văn các chuỗi `` $` ``, `$&`, `$'`, `$$` | ✘ | **D3** |
| `F09-claude-too-long` | `CLAUDE.md` 12 dòng có `@AGENTS.md` | ✘ | **D7(c)**, BRN-005 |
| `F10-legacy-latest-memory` | root có `latest_memory.md`, chưa có `today.md` | ✔ | I8, dòng 176–185 |
| `F11-uppercase-dirs` | có `DOCS/` và `Plan/`, không có `docs/`/`planning/` | ✔ | dòng 136–164 |
| `F12-no-startup-tag` | `memory-distill.txt` không có `<agent_startup_protocol>` | ✔ | fallback dòng 364–367 (bug v1.2.2) |
| `F13-two-markers` | root có `brain4agent-v1.2.0.md` **và** `brain4agent-v1.3.0.md` | ✔ | I1, **D7(b)** (đếm) |
| `F14-claude-no-import` | `CLAUDE.md` có nội dung người dùng, không `@AGENTS.md` | ✔ | dòng 762 |
| `F15-agents-nonstandard` | `AGENTS.md` không có `### G.`/`### H.`/`## 📋 3.` | ✔ | 3 nhánh fallback dòng 649, 673, 713 |
| `F16-utf16-agents` | `AGENTS.md` UTF-16LE có BOM | ✘ | BRN-013, exit 2, bẫy E.3 |
| `F17-state-corrupt` | `state.json` = `{"a":` | ✘ | BRN-010 không fixable, exit 2 |
| `F18-mixed-eol` | `AGENTS.md` trộn CRLF/LF, thiếu `SPEC PACKAGE` | ✘ | §1.1 quy tắc `mixed` → LF |
| `F19-token-x3` | `AGENTS.md` có `Dual Entry-Point Invariant` xuất hiện **3 lần** | ✘ | **D7(b)**, BRN-003 không fixable |
| `fleet/` | kho giả cho doctor — mục con: `repo-alpha` (chuẩn), `repo-bravo` (kẹt `1.2.0`: marker cũ + state cũ + không newline), `repo-charlie` (không có não), `repo-delta` (con `sub/` có `dot-git/`), `repo-echo` (`dot-git` là **file** `gitdir: ../x`), `Tên có dấu cách và tiếng Việt` (chuẩn), `.hidden-repo` (chuẩn), `not-a-repo` (chỉ có `readme.txt`), `repo-foxtrot` (`CLAUDE.md` 12 dòng), `repo-golf` (`state.json` BOM + `today.md` UTF-16LE) | ✘ | SPEC-P04, 7 bẫy E.1–E.7 |

Ghi chú kỹ thuật: fixture **không** chứa thư mục `.git` thật (git sẽ coi là gitlink/bỏ qua). Dùng `dot-git/` (thư mục) hoặc `dot-git` (file); `tmp.js` đổi tên sau khi copy. Ca "repo 0 commit" và "ref hỏng" **không** là fixture tĩnh: test tạo bằng `git init` trong tmp rồi ghi rác vào `.git/refs/heads/broken`; **skip** (`t.skip`) nếu không có `git`.

### a.4. Danh mục test tối thiểu (ánh xạ đầy đủ ở TESTING-ACCEPTANCE.md)

- **unit/**: mỗi hàm thuần 01-CONTRACTS §1–§2 ≥ 2 ca (đường chính + biên). `text.test.js` bắt buộc có: BOM giữa file không bị strip; CR đơn độc giữ nguyên qua `normalizeEol→restoreEol('lf')`; `restoreEol('crlf')` không sinh `\r\r\n` khi đầu vào lỡ còn `\r\n`.
- **cli/**: 5 mã thoát; `--check`/`--dry-run` không ghi; write mode + chẩn đoán lại; idempotent trên mọi fixture golden.
- **golden.test.js**: A10.
- **doctor/**: bảng + JSON + schema (validator tự viết tối giản theo §7: kiểm `required`, `enum`, `pattern`, `additionalProperties`); 3 mã thoát 0/1/2 + 3 + 64; perf.
- **deploy/**: D1 (fail-closed), D5 (không BOM), hash verify, `-VerifyOnly` phát hiện lệch. Skip nếu không `pwsh`.
- **hygiene/**: A1, A9, H02 (hai hiến pháp), version sync, EOL/BOM của file tracked.

---

## (b) Luật BẮT BUỘC / CẤM + vùng cấm riêng

**BẮT BUỘC**
1. Chỉ `node:test`, `node:assert/strict`, `node:fs`, `node:path`, `node:os`, `node:child_process`, `node:crypto`. Test `no-deps.test.js` đọc `package.json` khẳng định không có `dependencies`/`devDependencies`.
2. Mọi test ghi đĩa đều ghi trong `os.tmpdir()` (hoặc `tests/.tmp/` nếu `BRAIN_TEST_TMP` đặt) và **dọn** trong `after()`; **CẤM** ghi vào `tests/fixtures/`.
3. Fixture đọc-chỉ: `tree.js` chụp hash `tests/fixtures/` ở `before()` toàn cục và so lại ở `after()` — lệch ⇒ FAIL toàn bộ (test làm bẩn fixture là bug test).
4. Golden chụp **một lần** từ engine v1.5.4; `manifest.json.engine_commit` là SHA thật của hub tại thời điểm đó (commit `395a1a5` hoặc commit sau nếu có thay đổi ngoài engine — ghi rõ). Chụp lại chỉ khi có quyết định trong `plan.md`.
5. Mọi test spawn dùng `process.execPath` (không `'node'` chuỗi) và mảng đối số (không `shell:true`) — chống bẫy E.6 (tên có dấu cách/tiếng Việt).
6. Test doctor **bắt buộc** có ca kiểm `exit 3 ≠ 2`: `--json` trỏ vào thư mục không tồn tại ⇒ 3, trong khi fixture fleet có lỗi (⇒ nếu doctor nhầm sẽ ra 2).
7. Mỗi khiếm khuyết D1..D7 và mỗi bất biến I1..I11 có ≥1 test **ghi mã** trong tên test (`'D4: state.json BOM → ...'`) để grep được độ phủ.

**CẤM**
1. **CẤM** Jest/Vitest/Mocha/Chai/Sinon (NG3).
2. **CẤM** test phụ thuộc thứ tự chạy hoặc trạng thái global (mỗi test tự `mkTmpRoot`).
3. **CẤM** fixture chứa: đường dẫn tuyệt đối máy user, tên repo vệ tinh thật, chuỗi trông như khoá (`sk-`, `ghp_`, `AIza`, `Bearer `). `no-abs-path.test.js` grep regex `[A-Za-z]:\\Users\\|/home/[a-z]+/|/Users/[a-z]+/` trên `git ls-files` (trừ `tests/hygiene/no-abs-path.test.js` chính nó và `archive/`).
4. **CẤM** dùng `t.assert.fileSnapshot` cho cây output (dùng manifest sha256 — dễ diff, không lưu 150 dòng `AGENTS.md` ×15 case). Được phép dùng `t.assert.snapshot` cho **văn bản** `formatFindings`/`renderDiff` (nhỏ, dễ review).
5. **CẤM** test doctor chạy trên kho thật của máy user (A11, A9). Chỉ `tests/fixtures/fleet/`.

**Vùng cấm riêng của WP2**
- **Không dùng `--experimental-test-coverage` làm cổng.** Coverage của Node còn thay đổi giữa các bản; đưa số % vào gate là mời flaky. Có thể **in** để tham khảo, không fail theo nó.
- **Không mock `fs` cho test hộp đen.** Test CLI chạy tiến trình thật trên đĩa thật — đó là điều engine làm ngoài đời. `mock.method(fs, …)` chỉ dùng cho ca exit 3.
- **Không tạo fixture bằng cách copy hub thật.** Hub có nội dung dài, tên thật, lịch sử; fixture phải tối thiểu và tổng hợp bằng tay.
- **Không chạy test song song mức file (`--test-concurrency`) mặc định.** Test deploy/doctor spawn `pwsh`/`git`; giữ tuần tự để số đo perf ổn định. (Node mặc định tuần tự trên Windows; giữ nguyên.)

---

## (c) Bảng phân loại lỗi + hành vi bắt buộc của bên gọi (khi `npm test` đỏ)

| Loại thất bại | Dấu hiệu | Bên gọi (agent/CI) phải làm |
| :--- | :--- | :--- |
| Golden lệch | `golden.test.js` báo sha khác ở file X case Y | **KHÔNG** chạy `golden:make` để "xanh lại". Đọc diff thật (`--dry-run` trên fixture), quyết định: regression ⇒ sửa engine; thay đổi có chủ đích ⇒ ghi quyết định vào `plan.md` **rồi** mới chụp lại |
| Fixture bị bẩn | hash `tests/fixtures/` trước ≠ sau | Bug ở test (ghi nhầm chỗ) — sửa test; `git checkout -- tests/fixtures` |
| Skip vì thiếu `pwsh`/`git` | test in `SKIP` | Local: được phép; **CI: CẤM skip** — CI bật `BRAIN_TEST_REQUIRE_TOOLS=1` làm skip thành FAIL |
| Flaky theo thời gian | test perf vượt ngưỡng đôi khi | Ngưỡng perf là **local-only gate**; CI chỉ ghi số, không fail (§(d)) |
| Lỗi encoding console | stdout tiếng Việt vỡ trên Windows | So sánh **chuỗi** trong test (spawn `encoding:'utf8'`), không so ảnh console; không sửa test bằng cách bỏ dấu |

---

## (d) Số đo / bằng chứng nghiệm thu

| # | Bằng chứng | Ngưỡng |
| :-- | :--- | :--- |
| P02-E1 | `npm test` trên Windows (máy user) **và** Ubuntu (CI): `# fail 0`, `# skipped 0` khi `BRAIN_TEST_REQUIRE_TOOLS=1` | 0 fail, 0 skip |
| P02-E2 | Độ phủ khiếm khuyết: `grep -c "D[1-7]:" tests/**/*.test.js` ≥ 7 và mỗi D có ≥1 | 7/7 |
| P02-E3 | Độ phủ bất biến: mỗi `I1..I11` có ≥1 test tên chứa `I<n>:` | 11/11 |
| P02-E4 | Golden: ≥ 11 case, tổng ≥ 100 file được so sha256; `manifest.json.engine_commit` là SHA có thật trong `git log` | ≥11 case |
| P02-E5 | Thời gian `npm test` local (không kể deploy/doctor spawn `pwsh`) | ≤ 60 s |
| P02-E6 | `package.json` không có `dependencies`/`devDependencies`; `node_modules/` không tồn tại sau `npm test` | đúng |
| P02-E7 | Fixture: 0 khớp regex đường dẫn tuyệt đối / tên repo thật (`no-abs-path.test.js` xanh) | 0 |
| P02-E8 | Test D3 (`F08-dollar-agents`) **đỏ** khi chạy với engine v1.5.4 (chứng minh test có răng) và **xanh** với engine sau WP6 — ghi cả hai kết quả vào TESTING-ACCEPTANCE | đỏ→xanh |
| P02-E9 | Test D4 (`F07-bom-state`) đỏ với v1.5.4 (exit 0 nhưng version không đổi) và xanh sau WP6 | đỏ→xanh |
