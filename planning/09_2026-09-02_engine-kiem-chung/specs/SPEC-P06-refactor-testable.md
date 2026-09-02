# SPEC-P06 — WP6: Refactor Tối Thiểu Để Test Được — Lõi Thuần + Vỏ I/O, Byte-Identical Với v1.5.4 🟠

**Tiền đề:** WP5a xong (`.gitattributes`), WP2a xong (**golden đã chụp từ engine v1.5.4 chưa sửa** — `tests/golden/manifest.json` có `engine_commit`).
**Luật sắt:** trên **mọi** ca golden, cây file sau khi chạy engine đã refactor có SHA-256 từng file **bằng** manifest. Refactor **không** được đổi output. Mọi khác biệt là regression cho tới khi có quyết định ngược lại ghi trong `plan.md`.
**Đầu ra:** `init_brain.js` **vẫn một file**, có `module.exports` (01-CONTRACTS §2.5), không `process.exit` giữa file, đọc-ghi qua lớp chuẩn hoá (01-CONTRACTS §1).

---

## (a) Hợp đồng chính xác

### a.1. Điểm vào lập trình (bổ sung vào 01-CONTRACTS §2.4)

```ts
interface RunOptions {
  rootDir: string;
  logger?: (line: string) => void;          // mặc định: no-op. Nhận TỪNG dòng console.log hiện tại, KHÔNG kèm '\n'
  errorLogger?: (line: string) => void;     // nhận TỪNG dòng console.error hiện tại
  mode?: 'write' | 'check' | 'dry-run';     // mặc định 'write' (hành vi hiện tại). 'check'/'dry-run' do WP1 hiện thực; WP6 chỉ chừa tham số, ném RangeError nếu ≠ 'write'
  now?: Date;                               // mặc định new Date()
  templateVersion?: string;                 // mặc định BRAIN_TEMPLATE_VERSION — CHỈ để test; không có cờ CLI
}
interface RunResult {
  exitCode: 0 | 1 | 2 | 3;                  // WP6: chỉ 0 (chuẩn / ghi xong) hoặc 2 (file dự án không đọc được) hoặc 3
  diagnosis: Diagnosis;                     // trước khi ghi
  plan: Plan | null;                        // null khi đã chuẩn
  applied: number;                          // số op đã ghi
  diagnosisAfter: Diagnosis | null;         // WP6: null (WP1 thêm chẩn đoán lại)
}
function runBrainEngine(opts: RunOptions): RunResult;   // KHÔNG process.exit, KHÔNG console.* trực tiếp
```

`main(argv, env, io)` (01-CONTRACTS §2.4) là vỏ: parse cờ → gọi `runBrainEngine({ logger: l => io.stdout(l + '\n'), errorLogger: l => io.stderr(l + '\n') })` → trả `exitCode`. Vỏ CLI cuối file: `if (require.main === module) process.exitCode = main(...)`.

### a.2. Bản đồ dòng cũ → hàm mới (bắt buộc — người review đối chiếu từng hàng)

| Dòng v1.5.4 | Hiện trạng | Thành | Loại |
| :--- | :--- | :--- | :-: |
| 1–2 | `require fs, path` | giữ | — |
| 7 | `BRAIN_TEMPLATE_VERSION` | giữ nguyên tên/giá trị; thêm `ENGINE_VERSION` ngay dưới | hằng |
| 9–18 | 10 hằng đường dẫn cấp module (`rootDir` từ `argv[2]`) | thành `paths(rootDir)` trả object cùng tên field; **`argv` chỉ đọc trong `parseArgs`** | thuần |
| 20–23 | banner `console.log` | `logger(...)` trong `runBrainEngine`, **giữ nguyên 4 chuỗi** | I/O log |
| 28–36 | `REQUIRED_FILES` | giữ, export | hằng |
| 38–43, 47–51, 54–72, 74–77, 82–90, 94–98 | 15 phép đọc/`existsSync` | `collectSnapshot(rootDir)` — đọc **một lần** mỗi file qua `readText()`; `AGENTS.md` hiện được đọc **3 lần** (dòng 61, 106, 625) → 1 lần | I/O đọc |
| 100 | `isBrandNew` | `Diagnosis.isBrandNew` | thuần |
| 101–109 | boolean → `isFullyStandard` | `diagnose()` → `Finding[]` + `isStandard` (**WP6: `isStandard` phải cho cùng giá trị boolean với dòng 109 trên mọi golden** — bảng BRN đầy đủ là việc WP1; WP6 được phép sinh findings tối thiểu miễn `isStandard` tương đương) | thuần |
| 111–125 | in "NÃO ĐÃ OK" + **`process.exit(0)`** | `logger` 12 dòng nguyên văn; **`return { exitCode: 0, ... }`** — dòng 124 biến mất | — |
| 130–134 | 2 dòng trạng thái | `logger`, giữ chữ | log |
| 136–164 | đổi tên `DOCS`/`Plan` (qua `temp_docs`/`temp_plan`) | `planCaseRenames(rootEntries)` (thuần) + op `rename` trong `applyPlan` (**giữ 2 bước qua tên trung gian** — NTFS không phân biệt hoa/thường) | thuần + I/O |
| 166–173 | `targetDirs` + `mkdirSync` | op `mkdir` theo **đúng thứ tự mảng dòng 167** | — |
| 175–185 | di trú `latest_memory.md` | op `write today.md` (nếu chưa có) + op `delete latest_memory.md` | — |
| 188–343 | `templates` (7 template literal) | `renderTemplates(version, now)` — **template literal chép nguyên văn, kể cả `\\\\` và khoảng trắng**; `new Date()` ở dòng 320 → `now` | thuần |
| 345–377 | vòng ghi template + vá distill | op `write` (create) cho file thiếu; `patchDistill(content)` cho distill có sẵn; log `📄 Đã có sẵn` cho phần còn lại | thuần + I/O |
| 355 | `step0Line` | hằng chuỗi trong `patchDistill` (nguyên văn) | thuần |
| 357–367 | regex `<agent_startup_protocol>` + fallback | `patchDistill` — `.replace(regex, () => ...)` | thuần |
| 380–417 | `state.json` tạo/vá | `renderInitialState(version, now)`; `patchStateJson(lfText, version)`; **luôn `eol:'lf'`** | thuần |
| 398–399 | `readFileSync` + `JSON.parse` (D4) | `readText()` đã strip BOM ⇒ parse được; JSON hỏng thật ⇒ `StateJsonError` ⇒ `exitCode 2` (**không** còn nhánh log-rồi-đi-tiếp dòng 414–416) | — |
| 424–460 | marker xoá/tạo | `planMarkerOps` + op `delete`/`write`; `renderMarker(version, now)` (dòng 442 `syncDate` → `now`) | thuần + I/O |
| 462–466 | `today.md` | `renderTodayMd(now)` — **giữ `toLocaleDateString('vi-VN')`** | thuần |
| 469–618 | `fullAgentsMdContent` | `renderFullAgentsMd()` nguyên văn | thuần |
| 620–738 | tạo/vá `AGENTS.md` | `patchAgentsMd(content, version)` — **thứ tự 4 khối vá + dọn khối cũ giữ nguyên** (629 → 640 → 657 → 681/720) | thuần |
| 630–633, 646, 649, 670, 673, 706, 711, 713, 727 | `.replace(...)` với chuỗi thay thế (D3 ở 646, 670, 706, 727) | **tất cả** thành `.replace(pattern, () => text)`; riêng 711 dùng `slice`, giữ | thuần |
| 728, 734 | ghi `AGENTS.md` có thể **2 lần** trong một lượt | **1 op `write`** với nội dung cuối — bytes trên đĩa giống hệt | — |
| 745–768 | `CLAUDE.md` | `renderClaudeShim()`, `patchClaudeMd(content)` (dòng 762 `.replace(/\s*$/, '')` giữ) | thuần |
| 770–772 | banner cuối | `logger` 3 dòng nguyên văn, rồi `return { exitCode: 0 }` | — |
| **mới** | — | `stripBom/detectEol/normalizeEol/restoreEol/detectEncoding/readText/writeText` (01-CONTRACTS §1.2) | thuần + I/O |
| **mới** | — | `computePlan`, `applyPlan`, `runBrainEngine`, `main`, `parseArgs` (WP6 chỉ parse `rootDir`; cờ là WP1), vỏ `require.main` | — |

### a.3. Thứ tự các mục trong file mới (để review theo khối)

```text
 1. header + require + BRAIN_TEMPLATE_VERSION + ENGINE_VERSION + REQUIRED_FILES + BRN (bảng mã, WP1 điền đủ)
 2. Lớp văn bản: stripBom, detectEol, normalizeEol, restoreEol, detectEncoding, readText, writeText
 3. Lớp render: renderTemplates, renderInitialState, renderMarker, renderTodayMd, renderClaudeShim, renderFullAgentsMd
 4. Lớp vá thuần: patchDistill, patchStateJson, patchAgentsMd, patchClaudeMd, planMarkerOps, planCaseRenames
 5. Lớp chẩn đoán: collectSnapshot (I/O), diagnose (thuần)
 6. Lớp kế hoạch: computePlan (thuần), renderDiff (WP1), formatFindings (WP1)
 7. Lớp thi hành: applyPlan (I/O)
 8. runBrainEngine
 9. parseArgs, main
10. module.exports
11. if (require.main === module) { ... }
```

### a.4. Quy trình refactor theo bước — **mỗi bước chạy golden, xanh mới sang bước sau, mỗi bước một commit**

| Bước | Việc | Gate |
| :-- | :--- | :--- |
| S1 | Bọc **nguyên** thân file (dòng 9–772) vào `function runBrainEngine({rootDir, logger, errorLogger, now})`; `console.log/error` → `logger/errorLogger` (dòng-một-dòng); `process.exit(0)` dòng 124 → `return`; thêm `module.exports` + vỏ `require.main`. **Không** đổi gì khác. | golden 100%; `require()` không in gì |
| S2 | Kéo 6 template/chuỗi lớn ra hàm `render*` (chép-dán nguyên văn, chỉ thay `new Date()` → `now`) | golden 100% |
| S3 | Tách `patchAgentsMd`, `patchDistill`, `patchClaudeMd`, `patchStateJson` thành hàm thuần; đổi mọi `.replace(p, chuỗi)` → `.replace(p, () => chuỗi)` | golden 100% + test D3 xanh |
| S4 | Đưa lớp văn bản vào; mọi `readFileSync/writeFileSync` → `readText/writeText` | golden 100% + test D4 xanh + test `F05-crlf-agents` (snapshot mới, người duyệt) |
| S5 | Tách `collectSnapshot` + `diagnose` (boolean tương đương dòng 109) | golden 100% + `T-I10` |
| S6 | Tách `computePlan` + `applyPlan`; `runBrainEngine` = collect → diagnose → plan → apply | golden 100% |

Sau S6 mới bàn giao cho WP1.

---

## (b) Luật BẮT BUỘC / CẤM + vùng cấm riêng

**BẮT BUỘC**
1. Mọi **chuỗi** log (kể cả emoji, dấu câu, khoảng trắng đầu/cuối) giữ nguyên ký tự; chỉ đổi kênh (`console` → `logger`).
2. Mọi **regex** giữ nguyên nguồn (`source`) và cờ. Được phép chuyển thành hằng đặt tên; **cấm** "đơn giản hoá".
3. Mọi **template literal** giữ nguyên byte, kể cả escape `\\\\Users\\\\...` (dòng 355, 632) và đường dẫn bản global (dòng 193, 479) — nội dung template là chuẩn `1.3.0` (A8). Kiểm bằng test `T-A08`: `renderFullAgentsMd()` và `renderTemplates()` so sha256 với chuỗi trích từ engine v1.5.4 (`git show <engine_commit>:<path>`, cắt theo dòng 189–342 và 469–618 sau khi bỏ backtick bao).
4. Thứ tự ops = thứ tự thi hành cũ (01-CONTRACTS §2.3). Không gom, không hoán vị "cho hợp lý".
5. `.replace(pattern, replacement)`: `replacement` **luôn là hàm** trừ `replace(/\s*$/, '')` (đối số rỗng). Grep trong file: số lần `.replace(` = số lần `() =>` + số lần `, '')` ngay sau.
6. Hàm thuần: **không** `fs`, `path.resolve` trên đĩa, `Date`, `process`, `console`, `Math.random`. Kiểm bằng test gọi hàm với `fs` bị `mock.method` ném lỗi (`T-P06-03`).
7. `runBrainEngine` **không** bắt exception của chính nó — để `main()` bắt và trả 3 (một chỗ duy nhất quyết định mã 3).
8. Indent 4 khoảng trắng, CommonJS, `'use strict'` **không** thêm (có thể đổi ngữ nghĩa `this`/biến ngầm — không có lợi, có rủi ro).

**CẤM**
1. **CẤM** tách thành nhiều file (`lib/text.js`…) — A2: một file + doctor. Chạy từ bản global copy phải không cần gì khác.
2. **CẤM** ESM (`import/export`, `"type":"module"`), TypeScript, JSDoc-typecheck bắt buộc, prettier/eslint (kéo dependency, đổi format hàng loạt che mất diff thật).
3. **CẤM** đổi tên `BRAIN_TEMPLATE_VERSION`, đổi giá trị, hoặc đọc nó từ `package.json`.
4. **CẤM** sửa 4 dòng template chứa đường dẫn bản global (193, 355, 479, 632) — dù là để "bỏ đường dẫn máy user" (đúng về nguyên tắc, nhưng là đổi chuẩn ⇒ #10).
5. **CẤM** bỏ nhánh đổi tên `DOCS`/`Plan` (dòng 136–164) hay nhánh di trú `latest_memory.md` — chúng là hành vi đã cam kết với 66 repo.
6. **CẤM** thay `toLocaleDateString('vi-VN')` (dòng 464) bằng định dạng tự viết — `today.md` mới sinh phải giống hệt bản cũ.
7. **CẤM** chạy engine chế độ ghi lên bất kỳ repo nào ngoài fixture/tmp trong WP6.

**Vùng cấm riêng của WP6 (đã cân nhắc, KHÔNG làm)**
- **Không sửa regex vá để "bền" hơn (vd chấp nhận `## 1.` không emoji).** Mỗi thay đổi regex là đổi tập `AGENTS.md` được vá ⇒ có thể vá thêm ở repo trước đây rơi vào fallback ⇒ diff hàng loạt. NG1/#10.
- **Không thêm "backup file trước khi ghi" (`AGENTS.md.bak`).** Vi phạm Root Clean §5.G; git đã là backup; `--dry-run` (WP1) là cách xem trước.
- **Không chuyển sang `fs.promises`/async.** Không có lợi ích I/O (vài file nhỏ), thêm rủi ro exit trước khi flush trên Windows pipe (SPEC-P01 vùng cấm).
- **Không gộp hai lần đọc `AGENTS.md`… bằng cache toàn cục.** Dùng `Snapshot` truyền tay — không biến module-level nào giữ trạng thái giữa hai lần `runBrainEngine` (test gọi 2 lần trong một tiến trình phải độc lập).
- **Không đổi hành vi `mixed` EOL thành "giữ mixed".** Ghi `mixed` là tái tạo lỗi; quyết định `mixed → lf` (01-CONTRACTS §1.1) — không nằm trong golden nên không vi phạm luật sắt.

---

## (c) Bảng phân loại lỗi + hành vi bắt buộc của bên gọi

| Lỗi (class) | Khi nào | `runBrainEngine` làm gì | Bên gọi (`main`/doctor/test) làm gì |
| :--- | :--- | :--- | :--- |
| `RootError` (`.code='EROOT'`) | `rootDir` không tồn tại / không phải thư mục | ném | `main` ⇒ 64; doctor ⇒ `SCAN_ERROR` cho repo đó |
| `TextFileError` (`UTF16`/`INVALID_UTF8`) | file trong tập đọc không decode được | **không ném** — vào `snapshot.fileErrors`; `runBrainEngine` trả `exitCode 2`, `applied 0` | `main` ⇒ in stderr, 2; doctor ⇒ BRN-013 |
| `StateJsonError` | `state.json` không parse sau strip BOM | vào findings BRN-010 `fixable:false`; **không ghi `state.json`**; các op khác **vẫn** thi hành (giữ hành vi cũ: dòng 414 catch chỉ bỏ qua state.json) — nhưng `exitCode 2` | `main` ⇒ 2; người sửa JSON tay |
| `EACCES`/`EBUSY` khi `applyPlan` | ghi thất bại giữa chừng | ném (đã ghi được bao nhiêu thì đã ghi — không rollback tự động) | `main` ⇒ 3; người chạy lại (idempotent: op đã xong sẽ không lặp) |
| Lỗi lập trình | `TypeError` v.v. | ném | `main` ⇒ 3; là bug engine |

**Điểm khác cố ý so với v1.5.4 (không thuộc golden, ghi để không ai "sửa lại"):** (1) `state.json` có BOM ⇒ trước: log cảnh báo + exit 0, không hội tụ; nay: vá được (D4). (2) `state.json` JSON hỏng ⇒ trước: exit 0; nay: exit 2. (3) `AGENTS.md` CRLF ⇒ trước: output **trộn** EOL; nay: toàn CRLF. (4) `AGENTS.md`/section chứa `` $` ``/`$&`/`$'`/`$$` ⇒ trước: văn bản chèn bị biến dạng; nay: nguyên văn (D3). (5) UTF-16 ⇒ trước: vá lên rác; nay: exit 2, không ghi.

---

## (d) Số đo / bằng chứng nghiệm thu

| # | Bằng chứng | Cách đo | Ngưỡng |
| :-- | :--- | :--- | :--- |
| P06-E1 | Golden 100% sau **mỗi** bước S1–S6 (6 lần chạy `npm run test:golden`, ghi kết quả từng bước vào TESTING-ACCEPTANCE) | `golden.test.js` | 6/6 xanh, 0 file lệch |
| P06-E2 | `require('./init_brain.js')` trong tiến trình sạch: stdout + stderr rỗng, không tạo/sửa file ở `cwd` (hash cây cwd trước/sau) | `T-P06-01` | rỗng, bằng |
| P06-E3 | `runBrainEngine` gọi 2 lần liên tiếp trong **một** tiến trình trên 2 tmp root khác nhau ⇒ kết quả mỗi lần giống chạy đơn lẻ | `T-P06-02` | giống |
| P06-E4 | Hàm thuần không chạm `fs`: `mock.method(fs,'readFileSync')`/`existsSync`/`writeFileSync` ném ⇒ 10 hàm thuần (01-CONTRACTS §2.2) vẫn chạy đúng | `T-P06-03` | 10/10 |
| P06-E5 | `T-A08`: `renderFullAgentsMd()` sha256 = sha256 chuỗi trích từ `git show <engine_commit>:…` dòng 469–618 (bỏ 2 dòng bao); tương tự 7 template dòng 189–342 và shim 745–753 | test | bằng |
| P06-E6 | Grep: `process.exit` = 0 dòng ngoài vỏ cuối; `console.` = 0 dòng ngoài `main`/vỏ; `readFileSync` = 1 (trong `readText`) + 1 (đọc buffer trong `collectSnapshot`/`detectEncoding`); `writeFileSync` = 1 | `tests/hygiene` | đúng số |
| P06-E7 | Grep `.replace(` với đối số 2 không phải hàm và không phải `''` = 0 | hygiene | 0 |
| P06-E8 | D3: `F08-dollar-agents` — sau ghi, `AGENTS.md` chứa nguyên văn `` $` ``, `$&`, `$'`, `$$` **và** đủ 4 token mốc; test này **đỏ** với engine v1.5.4 (ghi lại output làm bằng chứng) | `T-D03` | đỏ→xanh |
| P06-E9 | D4: `F07-bom-state` — sau ghi: 3 byte đầu ≠ BOM, `brain_template_version=1.3.0`, `current_version` giữ, tail `0x0A`; đỏ với v1.5.4 | `T-D04` | đỏ→xanh |
| P06-E10 | Kích thước: file ≤ **1 100 dòng** (từ 772; phần tăng là chữ ký hàm, lớp văn bản, export — không phải logic mới) | `wc -l` | ≤1100 |
| P06-E11 | `AGENTS.md` được đọc **1 lần** mỗi lượt (đếm gọi `readText` qua `mock.method` trên `F02-standard-lf`): tổng lượt đọc file ≤ 12 | test | ≤12 |
