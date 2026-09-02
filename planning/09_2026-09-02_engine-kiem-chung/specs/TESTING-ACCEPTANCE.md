# TESTING-ACCEPTANCE — Ma Trận Test, Độ Phủ D1..D7 / I1..I11, Exit Gates (#09)

Quy ước: `BRAIN_NOW=2026-01-15T03:04:05.000Z` cho mọi ca. Fixture theo SPEC-P02 §a.3. Cột **Bảo vệ** ghi khiếm khuyết `D`, bất biến `I`, bất biến kiến trúc `A`, mã `BRN`. Tên test trong code **bắt buộc** bắt đầu bằng mã ở cột Bảo vệ (vd `'D4: ...'`) để grep độ phủ.

---

## §1. MA TRẬN TEST

### 1.1. `tests/unit/` — hàm thuần (không chạm đĩa)

| ID | Tên | Đầu vào | Kỳ vọng | Bảo vệ |
| :-- | :--- | :--- | :--- | :--- |
| T-U01 | `stripBom` bỏ đúng 1 BOM đầu | `'\uFEFF\uFEFFabc'` | `'\uFEFFabc'` | D4, A7 |
| T-U02 | `stripBom` không đụng BOM giữa | `'a\uFEFFb'` | nguyên | A7 |
| T-U03 | `detectEol` 4 lớp | `'a\nb'`, `'a\r\nb'`, `'a\r\nb\nc'`, `'abc'` | `lf`, `crlf`, `mixed`, `none` | A7 |
| T-U04 | CR đơn độc không phải EOL | `'a\rb\n'` | `detectEol='lf'`; `normalizeEol` giữ `\r`; `restoreEol(…, 'lf')` giữ `\r` | A7, §1.1 |
| T-U05 | `restoreEol('crlf')` không sinh `\r\r\n` | `'a\r\nb\n'` (lỡ chưa chuẩn hoá) | `'a\r\nb\r\n'` | A7 |
| T-U06 | `detectEncoding` | buffer `FF FE …`, `FE FF …`, `EF BB BF …`, `C3 28` | `utf16le`, `utf16be`, `utf8-bom`, `invalid-utf8` | BRN-013, bẫy E.3 |
| T-U07 | `patchStateJson` vá version, giữ field khác | `{"current_version":"9.9.9","brain_template_version":"1.2.0"}` | `brain_template_version=1.3.0`, `current_version=9.9.9`, kết thúc `\n`, `patches=['version']` | **I3**, I2 |
| T-U08 | `patchStateJson` chỉ thêm newline | JSON đúng version, không `\n` cuối | `changed=true`, `patches=['newline']`, nội dung JSON không đổi | I2, BRN-011 |
| T-U09 | `patchStateJson` JSON hỏng | `'{"a":'` | ném `StateJsonError` | BRN-010 |
| T-U10 | `patchAgentsMd` đủ 4 token ⇒ không đổi | AGENTS chuẩn | `changed=false`, `content` === đầu vào | I5, I10 |
| T-U11 | `patchAgentsMd` thiếu Bước 0 | AGENTS không có `xay-dung-nao-bo`, có heading §1 chuẩn | `patches` chứa `step0`; regex dòng 631 khớp; chèn đúng chỗ | I5 |
| T-U12 | **D3:** `patchAgentsMd` với `` $` ``/`$&`/`$'`/`$$` trong mục G và H | AGENTS thiếu marker-exception + law-J; `### G.`/`### H.` chứa 4 mẫu | output chứa 4 mẫu **nguyên văn**; đủ token; **đỏ với v1.5.4** (chạy hàm cũ qua fixture CLI `F08`) | **D3** |
| T-U13 | `patchAgentsMd` thay khối cũ | có `Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)` | khối cũ biến mất, `SPEC PACKAGE` xuất hiện **1 lần** | I6 |
| T-U14 | `patchAgentsMd` dọn tàn dư | có cả khối cũ + `SPEC PACKAGE` | `patches=['remove-legacy-planning']`, chỉ còn 1 phát biểu | **I6**, dòng 720–731 |
| T-U15 | `patchAgentsMd` 3 fallback phụ lục | AGENTS không có `### G.`/`### H.`/`## 📋 3.` | 3 phụ lục cuối file theo đúng chuỗi dòng 649, 673, 714 | dòng 647–650, 671–674, 712–715 |
| T-U16 | `patchDistill` chèn sau tag | có `<agent_startup_protocol>` | `patches=['step0']`, dòng chèn = `step0Line` dòng 355 | I9 |
| T-U17 | `patchDistill` fallback | không tag | `patches=['step0-fallback']`, khối ở **đầu** file | I9, bug v1.2.2 |
| T-U18 | `patchClaudeMd` | không `@AGENTS.md` | nội dung cũ giữ + `\n\n@AGENTS.md\n` (dòng 762) | I4 |
| T-U19 | `planMarkerOps` | `['brain4agent-v1.2.0.md','brain4agent-v1.3.0.md','x.md']` | `stale=['brain4agent-v1.2.0.md']`, `create=false` | **I1**, D7(b) |
| T-U20 | `planMarkerOps` không có marker | `['README.md']` | `stale=[]`, `create=true` | I1 |
| T-U21 | `planCaseRenames` | `['DOCS','Plan']` / `['DOCS','docs']` | 2 rename qua `temp_docs`/`temp_plan` / 0 rename | dòng 139, 154 |
| T-U22 | `diagnose` chuẩn | snapshot F02 | `findings=[]`, `isStandard=true` | I10 |
| T-U23 | `diagnose` thiếu `docs/` | snapshot F02 với `dirs.docs=false` | BRN-009 `detail.missing=['docs/']`, `isStandard=false` | **I11** (bổ sung) |
| T-U24 | `diagnose` marker ≠ state | marker `1.3.0`, state `1.2.0` | BRN-007 + BRN-010 | **I1↔I3** (bổ sung) |
| T-U25 | `diagnose` `CLAUDE.md` 11 dòng (CRLF, không newline cuối) | text 11 dòng | BRN-005 `detail.lines=11`, `fixable=false`, `level=warning` | **D7(c)**, I4, bẫy E.4 |
| T-U26 | `diagnose` `CLAUDE.md` đúng 10 dòng + newline cuối | | không BRN-005 | I4 (biên) |
| T-U27 | **D7(b):** token 3 lần | `Dual Entry-Point Invariant` ×3 | BRN-003 `detail.counts`, `fixable=false` | **D7(b)** |
| T-U28 | `diagnose` không kiểm bằng `includes` toàn cục | fixture có `SPEC PACKAGE` nằm trong **code block** ví dụ nhưng thiếu khối luật thật | *(ghi nhận giới hạn: vẫn coi là có — hành vi cũ dòng 681; test khẳng định hành vi này để không ai "sửa" lặng lẽ)* | I5 |
| T-U29 | `renderDiff` | plan 1 write + 1 delete | có `--- a/`, `+++ /dev/null`, hunk `@@` | WP1 a.4 |
| T-U30 | `formatFindings` sort | 4 findings trộn | `[tự sửa]` trước, mã tăng dần | WP1 a.5 |
| T-U31 | `parseArgs` | `['--check','--dry-run']`, `['--bogus']`, `['a','b']`, `['--version']` | `errors≠[]` ×3; mode `version` | §3 |
| T-U32 | `computePlan` thứ tự ops | snapshot F11 + F10 gộp | thứ tự đúng 01-CONTRACTS §2.3 (rename → mkdir → migrate → template → state → marker → today → AGENTS → CLAUDE) | §2.3 |
| T-U33 | `renderFullAgentsMd`/`renderTemplates`/`renderClaudeShim` nguyên văn | so với chuỗi trích `git show <engine_commit>:…` | sha256 bằng | **A8** |
| T-U34 | Hàm thuần không chạm `fs` | `mock.method(fs, 'readFileSync'/'existsSync'/'writeFileSync')` ném | 10 hàm §2.2 vẫn đúng | **A3** |

### 1.2. `tests/cli/` — hộp đen, tiến trình thật

| ID | Tên | Fixture / lệnh | Kỳ vọng | Bảo vệ |
| :-- | :--- | :--- | :--- | :--- |
| T-C01 | exit 0 chuẩn | `F02` (ghi) | 0; stdout có `NÃO ĐÃ OK`; cây không đổi (hash + mtime) | **I10** |
| T-C02 | exit 0 ghi xong | `F03` (ghi) | 0; stdout có `HOÀN TẤT THÀNH CÔNG`; chạy lần 2 ⇒ T-C01 | I1, I3, I5 |
| T-C03 | exit 1 `--check` | `F03 --check` | 1; stdout có `CẦN NÂNG CẤP`, tập mã `{BRN-002, BRN-006, BRN-010, BRN-011}`; **không** `NÃO ĐÃ OK`; cây không đổi | WP1, D7 |
| T-C04 | exit 1 `--dry-run` | `F13 --dry-run` | 1; có `[delete] brain4agent-v1.2.0.md`; cây không đổi; marker cũ **vẫn còn** | I1, WP1 |
| T-C05 | exit 2 không đọc được | `F16` (ghi) | 2; stderr `[brain-engine]`; **không file nào bị ghi** | BRN-013, bẫy E.3 |
| T-C06 | exit 2 JSON hỏng | `F17` (ghi) | 2; `state.json` hash trước = sau; các op khác (marker…) vẫn thi hành | BRN-010, SPEC-P06 (c) |
| T-C07 | exit 2 cần người (`--check`) | `F19 --check` | 2 (không fixable, error) | D7(b), SPEC-P01 a.2 |
| T-C08 | exit 3 | `main()` với `mock.method(fs,'mkdirSync')` ném `EACCES` trên F01 | 3; stdout không `HOÀN TẤT`/`NÃO ĐÃ OK` | A5 |
| T-C09 | exit 64 | `--bogus`; root không tồn tại; `--check --dry-run`; `BRAIN_NOW=abc` | 64 ×4; usage ở stderr | §3 |
| T-C10 | `--version` | root không tồn tại + `--version` | 0; stdout === `brain-engine 1.6.0 template 1.3.0\n`; stderr rỗng | §3, §10 |
| T-C11 | **D4** | `F07` (ghi) | 0; `state.json`: 3 byte đầu ≠ BOM, `brain_template_version=1.3.0`, `current_version` giữ, tail `0x0A`; lần 2 ⇒ `NÃO ĐÃ OK`. **Đỏ với v1.5.4** (exit 0 nhưng version vẫn `1.2.0`) | **D4**, I2, I3 |
| T-C12 | **D3** hộp đen | `F08` (ghi) | 0; `AGENTS.md` chứa nguyên văn 4 mẫu `$`; 4 token đủ. **Đỏ với v1.5.4** | **D3** |
| T-C13 | CRLF | `F05` (ghi) | 0; `AGENTS.md` **100% CRLF** (0 `\n` không kèm `\r`); 1 phát biểu `SPEC PACKAGE`; snapshot người duyệt (H3) | gotcha #11, I6, A7 |
| T-C14 | mixed → lf | `F18` (ghi) | 0; `detectEol` sau = `lf`; stdout có 1 dòng cảnh báo mixed | §1.1 |
| T-C15 | di trú legacy | `F10` (ghi) | `latest_memory.md` mất; `today.md` = nội dung cũ | **I8** |
| T-C16 | `DOCS`/`Plan` | `F11` (ghi) | có `docs/`, `planning/`; không còn `DOCS`, `Plan`, `temp_*` | dòng 136–164 |
| T-C17 | không ghi đè phân vùng có sẵn | `F03` (có `roadmap.md` nội dung riêng) (ghi) | `roadmap.md` hash trước = sau | **I7** |
| T-C18 | CLAUDE giữ nội dung người dùng | `F14` (ghi) | nội dung cũ là tiền tố; kết thúc `@AGENTS.md\n` | I4 |
| T-C19 | `BRAIN_NOW` xác định | `F01` ghi 2 lần vào 2 tmp | `changelog.md`, `state.json`, marker, `today.md` sha bằng nhau | A10 tiền đề |
| T-C20 | chạy từ bản copy bất kỳ | copy engine sang tmp rồi chạy trên `F03` | giống T-C02 | **A2** |
| T-C21 | idempotent toàn bộ golden | mỗi case golden: ghi ×2 | lần 2: 0 + `NÃO ĐÃ OK` + cây không đổi | **I10** |

### 1.3. `tests/golden.test.js`

| ID | Tên | Đầu vào | Kỳ vọng | Bảo vệ |
| :-- | :--- | :--- | :--- | :--- |
| T-G01 | golden byte-identical | 11 case golden (F01, F02, F03, F04, F06, F10, F11, F12, F13, F14, F15) | mọi file sha256 = manifest; không thừa/thiếu file; `exit_code` khớp | **A10**, D2 (chứng minh refactor an toàn) |
| T-G02 | manifest hợp lệ | `manifest.json` | `engine_commit` 40 hex; `brain_now` = hằng; ≥ 11 case; ≥ 100 file | SPEC-P02 |

### 1.4. `tests/doctor/`

| ID | Tên | Fixture / lệnh | Kỳ vọng | Bảo vệ |
| :-- | :--- | :--- | :--- | :--- |
| T-R01 | bảng fleet | `--root fleet` | tập mã từng repo đúng SPEC-P04 a.3; `SUMMARY … exit=2`; exit 2 | BRN-001..015, bẫy E.1 (`.hidden-repo` có mặt), E.6 (tên tiếng Việt) |
| T-R02 | JSON schema | `--root fleet --json tmp/r.json` | validator §7 pass; `exit_code=2` = mã tiến trình; không field đường dẫn; `roots[0].label`=`fleet` | §7, **A9** |
| T-R03 | exit 0 | `--repo fleet/repo-alpha` | 0, `CLEAN` | §6 |
| T-R04 | exit 1 | `--repo fleet/repo-foxtrot` | 1, chỉ WARNING (BRN-005) | §6, D7(c) |
| T-R05 | **3 ≠ 2** | `--root fleet --json <thư-mục-không-tồn-tại>/r.json` | **3**, bảng vẫn đã in | §6 luật tuyệt đối |
| T-R06 | exit 64 | không `--root`; `--git-timeout x` | 64 | §4 |
| T-R07 | root không tồn tại | `--root nope` | 3 | §6 |
| T-R08 | `.git` là file | `repo-echo` | `git.kind=file`, BRN-015 `gitdir-file`; các mã khác của repo vẫn tính | bẫy E.2 |
| T-R09 | nested git | `repo-delta` | BRN-014 `detail.dirs=['sub']` | gotcha #7/#9 |
| T-R10 | unborn (git thật) | `git init` trong tmp + AGENTS chuẩn | `head=unborn`, BRN-015; **không** BRN-001.. sai | bẫy E.5 |
| T-R11 | ref hỏng (git thật) | tmp repo + `.git/refs/heads/broken` = rác | `head=broken`, BRN-015; quét tiếp repo sau | bẫy E.5 |
| T-R12 | `--no-git` | fleet | `head=skipped`; BRN-014 vẫn có; nhanh hơn T-R01 | §4 |
| T-R13 | timeout git | `--git-timeout 1` với repo thật | `head=timeout`, exit 1 (nếu không lỗi khác) | (c) |
| T-R14 | encoding | `repo-golf` | BRN-013 `files` chứa `state.json:utf8-bom`, `today.md:utf16le` | **D4/D5**, bẫy E.3 |
| T-R15 | không đệ quy (grep) | mã nguồn doctor | 0 khớp `recursive\|rev-list\|fsck\|status\b` | luật thiết kế E |
| T-R16 | không ghi | mã nguồn + hash fleet trước/sau | 0 `writeFileSync/mkdirSync/unlinkSync/renameSync`; fleet không đổi | **A6** |
| T-R17 | perf (local gate) | fleet 10 repo với git | ≤ 3 s | E |
| T-R18 | `SCAN_ERROR` cô lập | fleet + 1 mục là symlink chết (tạo trong tmp; skip nếu không tạo được symlink) | repo đó `SCAN_ERROR`, các repo khác bình thường, exit 2 | (c) |

### 1.5. `tests/deploy/` (skip nếu không `pwsh`; CI bắt buộc)

| ID | Tên | Lệnh | Kỳ vọng | Bảo vệ |
| :-- | :--- | :--- | :--- | :--- |
| T-Y01 | deploy vào tmp | 2 root tmp | 0; `SUMMARY diff=0 missing=0 cmd=ok`; hash từng file khớp (tính lại bằng Node) | gotcha #12 |
| T-Y02 | **D5** không BOM | file lệnh ở tmp | 3 byte đầu ≠ `EF BB BF`; 0 byte `0x08`; chứa `NÃO ĐÃ OK` | **D5**, gotcha #13 |
| T-Y03 | **D1** fail-closed | `-GeminiSkillsRoot` = `<file>/x` | **3**; stdout **không** chứa `THÀNH CÔNG` | **D1**, A5 |
| T-Y04 | phát hiện lệch | sau T-Y01 sửa 1 byte đích; `-VerifyOnly` | 2; đúng 1 `DIFF` | gotcha #12 |
| T-Y05 | phát hiện thiếu | xoá `brain_doctor.js` đích; `-VerifyOnly` | 2; `MISSING` | gotcha #12 |
| T-Y06 | `-VerifyOnly` không ghi | mtime đích trước = sau | bằng | (b) 8 |
| T-Y07 | `-DryRun` không ghi | root tmp rỗng | 0; thư mục đích **không** được tạo | (b) |
| T-Y08 | EXTRA không xoá | thêm `foo.md.disabled` ở đích; deploy lại | 0; dòng `EXTRA foo.md.disabled`; file vẫn còn | (b) CẤM 1 |
| T-Y09 | 5.1 bị chặn (chỉ Windows có `powershell.exe`; skip nếu không) | `powershell -File …` | ≠ 0; đích không đổi | (b) 1 |
| T-Y10 | hygiene script | grep | 0 `Set-Content\|Out-File\|Add-Content\|Remove-Item\|Users\\\|C:\\` | (b) 4, 6 |

### 1.6. `tests/hygiene/`

| ID | Tên | Kỳ vọng | Bảo vệ |
| :-- | :--- | :--- | :--- |
| T-H01 | docs 1-1 | mỗi `.agents/skills/<x>/` có `docs/<x bỏ dấu chấm đầu>.md` | §5.C, brief H |
| T-H02 | hai hiến pháp không lệch | `AGENTS.md` và `CORE_GOVERNANCE_RULES.md` cùng chứa/cùng thiếu 3 token `SPEC PACKAGE`, `OPERATIONS.md`, `TESTING-ACCEPTANCE`; và cùng số lần xuất hiện | NG8 |
| T-H03 | version sync | `package.json.version === ENGINE_VERSION === state.json.current_version`; `state.json.brain_template_version === BRAIN_TEMPLATE_VERSION === '1.3.0'` | §10, **A8** |
| T-H04 | no deps | `package.json` không `dependencies`/`devDependencies`; `node_modules/` không tồn tại | **A1** |
| T-H05 | no abs path / no repo names | regex trên `git ls-files` (trừ `archive/`, chính test, allowlist 4 dòng template) = 0 | **A9**, gotcha #14 |
| T-H06 | EOL/BOM tracked | `git ls-files --eol`: 0 `w/crlf\|mixed\|-text` ngoài `tests/fixtures/`; 0 BOM ngoài fixtures | **D6** |
| T-H07 | engine hygiene | grep engine: `process.exit` chỉ ở vỏ; `console.` chỉ trong `main`/vỏ; `.replace(` đối số 2 là hàm hoặc `''` | A3, A4, D3 |
| T-H08 | `require` không tác dụng phụ | tiến trình con `node -e "require(engine)"` với cwd = tmp có file: stdout/stderr rỗng, cây tmp không đổi | **A4**, **D2** |
| T-H09 | `index.md` không còn `brain4agent-v1.2.0.md` | | brief H |
| T-H10 | `.gitattributes` có `tests/fixtures/** -text` và `* text=auto eol=lf` | | D6 |
| T-H11 | `.gitignore` có `fleet-report*.json` | | A9 |

---

## §2. ĐỘ PHỦ KHIẾM KHUYẾT D1..D7 (bắt buộc 7/7)

| # | Khiếm khuyết (brief C) | Test bảo vệ | Bằng chứng "test có răng" (đỏ trên v1.5.4) |
| :-- | :--- | :--- | :--- |
| **D1** | deploy fail-open (không `$ErrorActionPreference`, `Copy-Item` dòng 38/43 không `-ErrorAction Stop`, banner dòng 79 vẫn in) | T-Y03, T-Y04, T-Y05 | chạy script cũ (`git show <sha>:scripts/deploy_skills.ps1`) với cùng tham số T-Y03 (cần thêm 2 tham số ⇒ script cũ không có param; thay bằng sửa tạm 2 dòng 10–11 trong bản copy scratchpad) ⇒ in `THÀNH CÔNG`, exit 0 — ghi lại |
| **D2** | engine không test được (0 `module.exports`, `process.exit(0)` dòng 124) | T-H08, T-U34, T-G01 (toàn bộ unit chỉ tồn tại nhờ export) | v1.5.4: `require()` chạy engine lên cwd — T-H08 đỏ |
| **D3** | `String.replace(chuỗi, chuỗi)` diễn giải `$` (dòng 646, 670, 706, 727) | T-U12, T-C12, T-H07 | T-C12 đỏ trên v1.5.4 (ghi diff `AGENTS.md`) |
| **D4** | `readFileSync 'utf8'` không strip BOM ⇒ `JSON.parse` ném (dòng 399) ⇒ catch 414 ⇒ không hội tụ | T-U01, T-C11, T-R14 | T-C11 đỏ trên v1.5.4 |
| **D5** | file lệnh deploy có BOM vì `powershell` 5.1 + `Set-Content -Encoding UTF8` (dòng 70) | T-Y02, T-Y09, T-Y10 | `od` file lệnh global hiện tại = `ef bb bf` (đo 2026-09-02) |
| **D6** | không `.gitattributes`; cây làm việc 9 CRLF / 1 mixed+BOM / 1 nhị phân | T-H06, T-H10, P05A-E1..E5, CI step 6–7 | `git ls-files --eol` trước WP5a (đo 2026-09-02: 38 lf / 9 crlf / 1 mixed / 1 -text) |
| **D7** | `isFullyStandard` (dòng 109) boolean thủ công: (a) không kiểm `brain_template_version`; (b) không đếm; (c) không kiểm `CLAUDE.md` ≤10 | (a) T-U24, T-C03; (b) T-U19, T-U27, T-C07; (c) T-U25, T-U26, T-R04 | v1.5.4 trên `F09` ⇒ `NÃO ĐÃ OK` (không phát hiện 12 dòng); trên `F19` ⇒ `NÃO ĐÃ OK` — ghi lại |

## §3. ĐỘ PHỦ BẤT BIẾN I1..I11 (bắt buộc 11/11)

| ID | Test |
| :-- | :--- |
| I1 | T-U19, T-U20, T-U24, T-C04, T-C02 |
| I2 | T-U07, T-U08, T-C11 |
| I3 | T-U07, T-U24, T-C11, T-H03 |
| I4 | T-U18, T-U25, T-U26, T-C18 |
| I5 | T-U10, T-U11, T-U28, T-C02 |
| I6 | T-U13, T-U14, T-C13 |
| I7 | T-C17, T-C01 (F02 có 7 file) |
| I8 | T-C15 |
| I9 | T-U16, T-U17 |
| I10 | T-C01, T-C21, T-U22 |
| I11 | T-U23, T-C02 (F03 thiếu `docs/` ⇒ được tạo) |

Bất biến kiến trúc: A1 T-H04 · A2 T-C20, P04-E8 · A3 T-U34 · A4 T-H08 · A5 T-C08, T-Y03 · A6 T-R16 · A7 T-U01..05 · A8 T-U33, T-H03 · A9 T-H05, T-R02 · A10 T-G01 · A11 OPERATIONS §4 (kiểm thủ công: không có lệnh ghi nào ngoài hub/fixture trong `today.md`).

## §4. BẰNG CHỨNG THẬT PHẢI ĐIỀN KHI THỰC THI (chỉ số đếm, không tên repo, không đường dẫn)

| Mục | Giá trị điền | Nguồn |
| :--- | :--- | :--- |
| `git ls-files --eol` trước / sau WP5a | `38/9/1/1` → `__/0/0/0` | P05A-E1 |
| `manifest.json.engine_commit`, số case, số file | `________` / `__` / `___` | T-G02 |
| Golden sau S1..S6 (6 lần) | `✔✔✔✔✔✔` | P06-E1 |
| T-C11, T-C12 trên v1.5.4 | đỏ (dán 2–3 dòng output) | P06-E8/E9 |
| `npm test` Windows: pass/fail/skip, thời gian | `___/0/0`, `__ s` | P02-E1, E5 |
| CI run id ubuntu / windows | `____` / `____` | P05B-E1 |
| `deploy:verify` trước / sau WP3: `SUMMARY` | `diff=1 missing=1 …` → `diff=0 missing=0 cmd=ok` | P03-E1/E2 |
| File lệnh global 3 byte đầu sau deploy | `__ __ __` | P03-E3 |
| Doctor thật: candidates / clean / warning / error / blocker / scan_error / skipped / duration_ms (git on) | `__/66/__/1/0/0/__/_____` | P04-E5 |
| Doctor thật `--no-git` duration_ms | `_____` | P04-E5 |
| Tập mã của repo `ERROR` duy nhất | `{BRN-006, BRN-007, BRN-010, BRN-011}` kỳ vọng | P04-E5 |
| `wc -l init_brain.js` | `____` (≤ 1100) | P06-E10 |

## §5. EXIT GATES — theo môi trường (kế hoạch chỉ đóng khi **mọi ô** ✅)

| # | Gate | local | CI |
| :-- | :--- | :-: | :-: |
| G01 | `.gitattributes` có hiệu lực: 0 `w/crlf\|mixed\|-text` ngoài fixtures; 0 BOM ngoài fixtures (T-H06, CI step 6–7) | ⬜ | ⬜ |
| G02 | Golden 11 case byte-identical với engine v1.5.4 (T-G01) | ⬜ | ⬜ |
| G03 | `require(engine)` không tác dụng phụ (T-H08) | ⬜ | ⬜ |
| G04 | 5 mã thoát engine (0/1/2/3/64) mỗi mã ≥1 test xanh (T-C01..C10) | ⬜ | ⬜ |
| G05 | `--check`/`--dry-run` không ghi (T-C03, T-C04) | ⬜ | ⬜ |
| G06 | D1..D7 mỗi cái ≥1 test xanh **và** D3/D4 đỏ trên v1.5.4 đã ghi lại (§2) | ⬜ | ⬜ (chỉ phần xanh) |
| G07 | I1..I11 mỗi cái ≥1 test xanh (§3) | ⬜ | ⬜ |
| G08 | `npm test`: 0 fail, 0 skip với `BRAIN_TEST_REQUIRE_TOOLS=1` | ⬜ | ⬜ (2 OS) |
| G09 | Hub self-check `init_brain.js --check .` = 0 | ⬜ | ⬜ |
| G10 | Deploy: `deploy:verify` = 0; file lệnh không BOM/0x08; hash tay khớp (P03-E2/E3/E9) | ⬜ | — (không deploy trên CI; `-DryRun` = 0) ⬜ |
| G11 | 5.1 bị chặn (P03-E7) | ⬜ | — |
| G12 | Doctor: fixture fleet đúng tập mã, exit 2; `3 ≠ 2` (T-R01, T-R05) | ⬜ | ⬜ |
| G13 | Doctor thật trên kho: ≤ 40 s; 66 CLEAN / 1 ERROR đúng tập mã; output không có đường dẫn tuyệt đối (P04-E5, E9) | ⬜ | — |
| G14 | Doctor chạy từ bản global cho kết quả giống bản hub (P04-E8) | ⬜ | — |
| G15 | CI xanh 2 OS; 3 ca cố ý đỏ đúng step (P05B-E1, E3) | — | ⬜ |
| G16 | Version sync `1.6.0` ×3 + template `1.3.0` (T-H03, CI step 11) | ⬜ | ⬜ |
| G17 | A9: không đường dẫn máy user / tên repo vệ tinh trong file tracked mới (T-H05); `fleet-report*.json` không tracked | ⬜ | ⬜ |
| G18 | Docs 1-1 + `index.md` marker `1.3.0` (T-H01, T-H09) | ⬜ | ⬜ |
| G19 | Sync Cascade 6 điểm xong (OPERATIONS §6) — kiểm thủ công | ⬜ | — |
| G20 | Không `git push`, không engine ghi ngoài hub/fixture — kiểm `today.md` + `git reflog` các repo không có commit mới do #09 | ⬜ | — |
