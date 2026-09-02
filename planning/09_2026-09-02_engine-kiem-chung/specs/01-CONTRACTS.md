# 01-CONTRACTS — Hợp Đồng Bất Biến Của Đợt #09

> Mọi SPEC-Pxx **tham chiếu** file này, không định nghĩa lại. Sửa hợp đồng ⇒ sửa ở đây và ghi vào nhật ký quyết định trong `plan.md`.
> Ký hiệu chữ ký dùng cú pháp kiểu TypeScript **chỉ để mô tả**; mã thật là JavaScript CommonJS thuần (không build).

---

## §1. QUY ƯỚC CHUẨN HOÁ VĂN BẢN (quan trọng nhất — mọi hàm khác dựa vào đây)

### 1.1. Nguyên tắc

- **Khi ĐỌC:** strip đúng một `U+FEFF` ở đầu; chuẩn hoá `\r\n → \n`; **ghi nhận** EOL gốc và việc có BOM. Mọi hàm thuần chỉ nhận **văn bản đã chuẩn hoá LF**.
- **Khi GHI:** khôi phục EOL gốc đã ghi nhận (`crlf` → đổi mọi `\n` thành `\r\n`); **KHÔNG BAO GIỜ** ghi BOM; mã hoá UTF-8.
- **CR đơn độc** (`\r` không đi kèm `\n`) **không phải EOL** — giữ nguyên byte, không đổi. (Vì `-known-gotchas.md` của hub đang có 1 CR đơn độc ở dòng 102; đổi nó là đổi nội dung.)
- **`mixed`** (có cả `\r\n` và `\n`): khi ghi lại → `lf`, và log 1 dòng cảnh báo. (Ghi `crlf` cho file mixed là bịa ra EOL cho các dòng vốn là LF.)
- **`none`** (không có ký tự xuống dòng nào): khi ghi → `lf`.
- **File JSON do engine quản lý (`state.json`)**: luôn ghi `lf` bất kể EOL gốc — giữ đúng hành vi hiện tại (dòng 392, 404 luôn ghi `JSON.stringify(...) + '\n'`) và bất biến I2.
- **File MỚI do engine sinh** (template, marker, shim, `today.md`): ghi `lf` — giữ đúng hành vi hiện tại.

### 1.2. Chữ ký

```ts
type Eol = 'lf' | 'crlf' | 'mixed' | 'none';

// THUẦN — không I/O
function stripBom(s: string): string;                  // bỏ đúng 1 U+FEFF ở vị trí 0; không đụng chỗ khác
function detectEol(raw: string): Eol;                  // đo trên chuỗi THÔ (trước normalizeEol)
function normalizeEol(raw: string): string;            // '\r\n' → '\n'; '\r' đơn độc GIỮ NGUYÊN
function restoreEol(lf: string, eol: Eol): string;     // 'crlf' → '\n'→'\r\n'; 'lf'|'mixed'|'none' → trả nguyên
function hasUtf8Bom(buf: Uint8Array): boolean;         // EF BB BF
function detectEncoding(buf: Uint8Array): 'utf8' | 'utf8-bom' | 'utf16le' | 'utf16be' | 'invalid-utf8';
//   utf16le: FF FE; utf16be: FE FF; invalid-utf8: TextDecoder('utf-8',{fatal:true}) ném lỗi

// I/O — chỉ hai hàm này đụng byte của file văn bản
interface TextFile { text: string; eol: Eol; hadBom: boolean; bytes: number; encoding: 'utf8' | 'utf8-bom'; }
interface TextFileError { code: 'UTF16' | 'INVALID_UTF8' | 'EISDIR' | 'EACCES' | 'EIO'; message: string; }
function readText(filePath: string): TextFile | null;  // null nếu ENOENT; ném TextFileError (có .code) nếu UTF-16 / UTF-8 hỏng / lỗi khác
function writeText(filePath: string, lfText: string, eol: Eol): void;
//   ghi Buffer.from(restoreEol(lfText, eol), 'utf8') — KHÔNG BOM; 'mixed'|'none' ⇒ ghi như 'lf'
```

### 1.3. Luật

- **BẮT BUỘC:** mọi lệnh đọc file văn bản trong `init_brain.js` và `brain_doctor.js` đi qua `readText()`. Grep `readFileSync(` chỉ được xuất hiện **bên trong** `readText()` (và trong `collectSnapshot` khi đọc buffer để dò encoding).
- **BẮT BUỘC:** mọi lệnh ghi file văn bản đi qua `writeText()`. Grep `writeFileSync(` chỉ được xuất hiện bên trong `writeText()`.
- **CẤM** dùng `fs.readFileSync(p, 'utf8')` trực tiếp (nguyên nhân D4).
- **CẤM** regex chứa `\r?\n` **mới**; regex cũ (dòng 703, 708, 724) giữ nguyên để không đổi ngữ nghĩa — chúng vẫn khớp trên văn bản LF.

---

## §2. KIỂU DỮ LIỆU & HÀM THUẦN CỦA ENGINE (sau WP6/WP1)

### 2.1. Kiểu

```ts
const REQUIRED_FILES = ['memory-distill.txt','index.md','project-intro.md','roadmap.md','changelog.md','-known-gotchas.md','-data-architecture.md']; // giữ nguyên thứ tự dòng 28–36

interface Snapshot {
  rootLabel: string;                       // basename(rootDir) — chỉ để in; hàm thuần KHÔNG dùng để mở file
  rootEntries: string[];                   // readdirSync(rootDir) — kể cả mục ẩn, thứ tự đã sort
  dirs: { brain: boolean; memory: boolean; hot: boolean; planning: boolean; agents: boolean; skills: boolean; docs: boolean; };
  files: {
    agentsMd: TextFile | null; claudeMd: TextFile | null; distill: TextFile | null;
    stateJson: TextFile | null; todayMd: TextFile | null; legacyLatest: TextFile | null;
    brain: Record<string, TextFile | null>;   // key ∈ REQUIRED_FILES
  };
  fileErrors: Array<{ rel: string; code: TextFileError['code']; message: string }>;  // file đọc được path nhưng không decode được
}

type Level = 'blocker' | 'error' | 'warning';
interface Finding { code: `BRN-${string}`; level: Level; fixable: boolean; message: string; fix: string; detail?: Record<string, unknown>; }
interface Diagnosis { findings: Finding[]; isStandard: boolean; isBrandNew: boolean; }
//   isStandard  ⇔ không có finding nào có fixable === true VÀ không có finding level 'blocker'|'error'
//   isBrandNew  ⇔ !snapshot.dirs.brain   (giữ dòng 100)

type PlanOp =
  | { op: 'mkdir';  rel: string; reason: string }
  | { op: 'rename'; from: string; to: string; reason: string }       // DOCS→docs, Plan→planning (qua tên trung gian như dòng 143–144, 158–159)
  | { op: 'write';  rel: string; text: string; eol: Eol; reason: string; create: boolean }
  | { op: 'delete'; rel: string; reason: string };
interface Plan { ops: PlanOp[]; notes: string[]; }
```

### 2.2. Hàm thuần (KHÔNG `fs`, KHÔNG `Date.now()`, KHÔNG `console`, KHÔNG `process`)

| Chữ ký | Thay cho dòng cũ | Ghi chú |
| :--- | :--- | :--- |
| `diagnose(s: Snapshot, templateVersion: string): Diagnosis` | 38–109 | Sinh danh sách `Finding` theo §8; `isStandard` thay `isFullyStandard` |
| `computePlan(s: Snapshot, templateVersion: string, now: Date): Plan` | 130–768 (phần quyết định) | Thứ tự ops **BẮT BUỘC** như §2.3 |
| `patchAgentsMd(content: string, version: string): { content: string; patches: string[]; changed: boolean }` | 625–731 | `patches` ∈ {`step0`, `marker-exception`, `law-j`, `spec-package`, `remove-legacy-planning`} |
| `patchDistill(content: string): { content: string; patches: string[]; changed: boolean }` | 353–369 | `patches` ∈ {`step0`, `step0-fallback`} |
| `patchClaudeMd(content: string): { content: string; patches: string[]; changed: boolean }` | 759–764 | `patches` ∈ {`import`} |
| `patchStateJson(lfText: string, version: string): { content: string; patches: string[]; changed: boolean }` | 398–404 | Ném `StateJsonError` nếu `JSON.parse` thất bại; `content` luôn kết thúc `\n`; **không** đụng field khác (`current_version`) |
| `renderTemplates(version: string, now: Date): Record<string, string>` | 188–343 | 7 template, **nguyên văn** |
| `renderInitialState(version: string, now: Date): string` | 382–392 | |
| `renderMarker(version: string, now: Date): string` | 443–455 | |
| `renderTodayMd(now: Date): string` | 464 | |
| `renderClaudeShim(): string` | 745–753 | |
| `renderFullAgentsMd(): string` | 469–618 | |
| `planMarkerOps(rootEntries: string[], version: string): { stale: string[]; create: boolean }` | 81–90, 431, 441 | |
| `planCaseRenames(rootEntries: string[]): Array<{ from: string; to: string; via: string }>` | 136–164 | |
| `renderDiff(plan: Plan, s: Snapshot): string` | mới (WP1) | Unified diff tối giản: `--- a/<rel>` / `+++ b/<rel>` / hunks `@@`; file mới: `--- /dev/null`; delete: `+++ /dev/null` |
| `formatFindings(d: Diagnosis): string` | mới (WP1) | Bảng `code · level · message · fix`, sort theo code |
| `parseArgs(argv: string[]): { rootDir: string; mode: 'write'\|'check'\|'dry-run'\|'version'\|'help'; errors: string[] }` | 9 | |

Quy tắc ghi đè chuỗi (sửa D3): **mọi** `String.prototype.replace(pattern, replacement)` trong hai file phải có `replacement` là **hàm** `() => text`. Grep `.replace(` với đối số thứ hai là chuỗi/biến chuỗi = **0** (trừ `replace(/\s*$/, '')` — chuỗi rỗng không chứa `$`-pattern, được phép).

### 2.3. Thứ tự ops trong `Plan` (bất biến — bảo toàn hành vi dòng 136–768)

1. `rename` DOCS→docs (qua `temp_docs`), Plan→planning (qua `temp_plan`) — chỉ khi tên hoa tồn tại **và** tên thường chưa tồn tại (dòng 139, 154).
2. `mkdir` theo đúng thứ tự `targetDirs` dòng 167.
3. Di trú `latest_memory.md`: `write today.md` (chỉ khi chưa có, `create:true`, `eol` = eol của legacy) rồi `delete latest_memory.md` (dòng 176–185).
4. 7 template: `write` khi chưa có; riêng `memory-distill.txt` đã có ⇒ `patchDistill` (dòng 345–377).
5. `state.json`: tạo mới hoặc `patchStateJson`; `eol:'lf'` (dòng 380–417).
6. Marker: `delete` từng marker lỗi thời, rồi `write` marker đúng nếu chưa có (dòng 424–460).
7. `today.md` nếu chưa có (dòng 462–466).
8. `AGENTS.md`: tạo mới hoặc `patchAgentsMd` (dòng 620–738).
9. `CLAUDE.md`: tạo mới hoặc `patchClaudeMd` (dòng 755–768).

### 2.4. Hàm I/O (vỏ mỏng)

```ts
function collectSnapshot(rootDir: string): Snapshot;      // ném RootError nếu rootDir không tồn tại/không phải thư mục; lỗi từng file → snapshot.fileErrors
function applyPlan(rootDir: string, plan: Plan, log: (line: string) => void): { applied: number };
function runBrainEngine(opts: { rootDir: string; logger?: (line: string) => void; errorLogger?: (line: string) => void; mode?: 'write'|'check'|'dry-run'; now?: Date; templateVersion?: string }): { exitCode: 0|1|2|3; diagnosis: Diagnosis; plan: Plan | null; applied: number; diagnosisAfter: Diagnosis | null };
//   điểm vào lập trình (chi tiết SPEC-P06 a.1): collect → diagnose → plan → apply → diagnose lại; KHÔNG process.exit, KHÔNG console.*, KHÔNG bắt exception của chính nó
function main(argv: string[], env: NodeJS.ProcessEnv, io: { stdout(s: string): void; stderr(s: string): void }): number;  // vỏ: parseArgs → runBrainEngine → TRẢ mã thoát; nơi DUY NHẤT bắt exception ⇒ 3
```

Vỏ CLI (cuối file, duy nhất chỗ có `process.exit`):

```js
if (require.main === module) { process.exitCode = main(process.argv.slice(2), process.env, { stdout: s => process.stdout.write(s), stderr: s => process.stderr.write(s) }); }
```

### 2.5. `module.exports` bắt buộc của `init_brain.js`

`BRAIN_TEMPLATE_VERSION, ENGINE_VERSION, REQUIRED_FILES, stripBom, detectEol, normalizeEol, restoreEol, detectEncoding, readText, writeText, collectSnapshot, diagnose, computePlan, applyPlan, runBrainEngine, patchAgentsMd, patchDistill, patchClaudeMd, patchStateJson, renderTemplates, renderInitialState, renderMarker, renderTodayMd, renderClaudeShim, renderFullAgentsMd, planMarkerOps, planCaseRenames, renderDiff, formatFindings, parseArgs, main, BRN` (BRN = bảng §8 dạng đối tượng `{ 'BRN-001': { level, title, fix } ... }`).

---

## §3. HỢP ĐỒNG CLI `init_brain.js`

```text
node init_brain.js [rootDir] [--check | --dry-run] [--version] [--help]
```

| Cờ / đối số | Ý nghĩa | Ghi đĩa? | Mã thoát |
| :--- | :--- | :-: | :--- |
| `rootDir` (vị trí 1, tuỳ chọn) | Thư mục dự án; mặc định `process.cwd()` (giữ dòng 9). Phải tồn tại và là thư mục. | — | không tồn tại ⇒ `64` |
| *(không cờ)* | **Chế độ ghi** (hành vi hiện tại): chẩn đoán → nếu chuẩn in `NÃO ĐÃ OK` → nếu lệch: lập plan → ghi → chẩn đoán lại | ✔ | `0` chuẩn/hội tụ · `2` không hội tụ hoặc file dự án không đọc được · `3` engine tự lỗi |
| `--check` | **Chỉ đọc.** Chẩn đoán, in `formatFindings`. Không tạo thư mục, không đổi tên, không xoá marker. | ✘ | `0` không có finding `fixable`/`error`/`blocker` · `1` có lệch · `2` file dự án không đọc được · `3` |
| `--dry-run` | **Chỉ đọc.** Như `--check` **cộng** in `renderDiff(plan)` mô tả từng op sẽ thực hiện. | ✘ | như `--check` |
| `--version` | In đúng một dòng `brain-engine <ENGINE_VERSION> template <BRAIN_TEMPLATE_VERSION>` rồi thoát. Không đọc rootDir. | ✘ | `0` |
| `--help` | In usage. | ✘ | `0` |
| cờ lạ / `--check` cùng `--dry-run` / >1 đối số vị trí | Lỗi dùng sai. In usage ra **stderr**. | ✘ | `64` |

**Biến môi trường (chỉ cho test):** `BRAIN_NOW=<ISO-8601>` — nếu đặt, `now` trong `computePlan` = `new Date(BRAIN_NOW)`; giá trị không parse được ⇒ `64`. Không đặt ⇒ `new Date()`.

**Hợp đồng stdout (giữ tương thích với file lệnh đã deploy và `SKILL.md`):**
- Nhánh đã chuẩn (exit 0, không ghi) **BẮT BUỘC** chứa chuỗi `NÃO ĐÃ OK` (dòng 123) — file lệnh Claude Code đọc chuỗi này (`deploy_skills.ps1` dòng 66).
- Nhánh ghi thành công (exit 0) **BẮT BUỘC** chứa `HOÀN TẤT THÀNH CÔNG` (dòng 771). **CẤM** in chuỗi này ở bất kỳ exit ≠ 0 nào.
- `--check`/`--dry-run` khi có lệch: in `CẦN NÂNG CẤP` + bảng findings; **CẤM** in `NÃO ĐÃ OK`.
- Lỗi (exit 2/3/64): thông điệp ra **stderr**, có tiền tố `[brain-engine]`.

---

## §4. HỢP ĐỒNG CLI `brain_doctor.js`

```text
node brain_doctor.js (--root <kho> [--root <kho>...] | --repo <dir> [--repo <dir>...])
                     [--exclude <tên-thư-mục>]... [--json <file>] [--format table|json|quiet]
                     [--expect-template <x.y.z>] [--no-git] [--git-timeout <ms>] [--version] [--help]
```

| Cờ | Ý nghĩa | Mặc định |
| :--- | :--- | :--- |
| `--root <kho>` | Thư mục **chứa** các repo; mỗi mục con cấp 1 là một ứng viên repo. Lặp được. | bắt buộc một trong `--root`/`--repo` |
| `--repo <dir>` | Quét đúng một thư mục như một repo. Lặp được. | |
| `--exclude <tên>` | Bỏ qua mục con có **tên** (basename) trùng; ghi `SKIPPED` với lý do `excluded`. | rỗng |
| `--json <file>` | Ghi `fleet-report.json` theo §7. Thư mục cha phải tồn tại. | không ghi |
| `--format` | `table` bảng người đọc; `json` in JSON ra stdout; `quiet` chỉ dòng tổng kết. | `table` |
| `--expect-template` | Phiên bản khung não kỳ vọng cho BRN-007/010. | `BRAIN_TEMPLATE_VERSION` của engine đi kèm |
| `--no-git` | Không chạy lệnh git nào; BRN-014 vẫn kiểm (chỉ stat), BRN-015 = `skipped`. | tắt |
| `--git-timeout` | Timeout **mỗi** lệnh git (ms). | `5000` |

**Ứng viên repo** = mục con cấp 1 là thư mục (theo `Dirent.isDirectory()`, **kể cả tên bắt đầu bằng `.`**) và thoả ≥1: có `.git` (thư mục **hoặc** file), có `AGENTS.md`, có `brain4agent/`. Không thoả ⇒ `SKIPPED` lý do `not-a-repo` (vẫn liệt kê để không "bỏ sót thầm lặng"). Symlink thư mục: quét theo đích nhưng `git.kind = 'unknown'` nếu stat lỗi.

**Mã thoát doctor:** xem §6.

---

## §5. HỢP ĐỒNG `scripts/deploy_skills.ps1`

```text
pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/deploy_skills.ps1 [-DryRun] [-VerifyOnly] [-GeminiSkillsRoot <dir>] [-ClaudeCommandsRoot <dir>]
```

| Tham số | Ý nghĩa | Mặc định |
| :--- | :--- | :--- |
| `-DryRun` | Liệt kê file sẽ chép + trạng thái hash hiện tại; **không ghi**. | tắt |
| `-VerifyOnly` | Không chép; chỉ đối chiếu SHA-256 nguồn↔đích + kiểm file lệnh. | tắt |
| `-GeminiSkillsRoot` | Thư mục skills global. | `Join-Path $HOME '.gemini/config/skills'` (thay đường dẫn cứng dòng 10) |
| `-ClaudeCommandsRoot` | Thư mục lệnh Claude Code. | `Join-Path $HOME '.claude/commands'` (thay dòng 11) |

Đầu script **BẮT BUỘC**: `#requires -Version 7.0`, `Set-StrictMode -Version Latest`, `$ErrorActionPreference = 'Stop'`.

---

## §6. BẢNG MÃ THOÁT HỢP NHẤT

| Mã | `init_brain.js` | `brain_doctor.js` | `deploy_skills.ps1` |
| :-: | :--- | :--- | :--- |
| **0** | Đã chuẩn (không ghi) **hoặc** ghi xong và chẩn đoán lại đạt chuẩn; `--check`/`--dry-run` không lệch | Mọi repo `CLEAN`/`SKIPPED` | Chép xong **và** 100% hash khớp **và** file lệnh không BOM/không `0x08`; hoặc `-VerifyOnly` khớp; hoặc `-DryRun` |
| **1** | `--check`/`--dry-run`: có lệch mà chế độ ghi **sẽ** sửa | Chỉ có `WARNING` | Thiếu thư mục nguồn (giữ dòng 19–26) |
| **2** | Chế độ ghi: sau khi ghi vẫn lệch (**không hội tụ**), hoặc file dự án không đọc được (UTF-16/UTF-8 hỏng/`state.json` không parse) | Có ≥1 `BLOCKER`/`ERROR`/`SCAN_ERROR` | Sau chép (hoặc `-VerifyOnly`) có ≥1 file **lệch hash / thiếu ở đích**, hoặc file lệnh có BOM / byte `0x08` / thiếu chuỗi `NÃO ĐÃ OK` |
| **3** | Engine tự lỗi: exception không lường (bug, `EACCES` khi ghi, root biến mất giữa chừng) | Doctor tự lỗi: exception ngoài vòng quét từng repo, không ghi được `--json`, root không tồn tại | Exception bất kỳ trong `try` (PowerShell 5.1 sẽ chết ngay ở `#requires` — cũng là fail-closed) |
| **64** | Dùng sai cờ/đối số | Dùng sai cờ/đối số; thiếu `--root`/`--repo` | *(không dùng — `param()` của PowerShell tự báo lỗi tham số, exit ≠ 0)* |

**Luật tuyệt đối:** `3` **chỉ** phát sinh từ `catch` bao ngoài cùng của công cụ. Lỗi phát hiện được **trong dự án/repo đích** (kể cả không đọc được file) **không bao giờ** là `3`. Với doctor, lỗi quét **một** repo ⇒ repo đó `SCAN_ERROR`, quét tiếp repo khác, exit `2`.

---

## §7. JSON SCHEMA `fleet-report.json` (Draft 2020-12)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "brain4agent/fleet-report.schema.json",
  "title": "brain-doctor fleet report",
  "type": "object",
  "additionalProperties": false,
  "required": ["schema_version", "generated_at", "tool", "expected_template_version", "roots", "summary", "exit_code", "repos"],
  "properties": {
    "schema_version": { "const": 1 },
    "generated_at": { "type": "string", "format": "date-time" },
    "tool": {
      "type": "object", "additionalProperties": false,
      "required": ["name", "engine_version", "template_version", "node", "git_enabled"],
      "properties": {
        "name": { "const": "brain-doctor" },
        "engine_version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
        "template_version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
        "node": { "type": "string" },
        "git_enabled": { "type": "boolean" }
      }
    },
    "expected_template_version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "roots": {
      "type": "array", "minItems": 1,
      "items": {
        "type": "object", "additionalProperties": false, "required": ["index", "label", "kind"],
        "properties": {
          "index": { "type": "integer", "minimum": 0 },
          "label": { "type": "string", "description": "basename của thư mục — KHÔNG phải đường dẫn tuyệt đối" },
          "kind": { "enum": ["root", "repo"] }
        }
      }
    },
    "summary": {
      "type": "object", "additionalProperties": false,
      "required": ["candidates", "clean", "warning", "error", "blocker", "scan_error", "skipped", "duration_ms"],
      "properties": {
        "candidates": { "type": "integer", "minimum": 0 }, "clean": { "type": "integer", "minimum": 0 },
        "warning": { "type": "integer", "minimum": 0 }, "error": { "type": "integer", "minimum": 0 },
        "blocker": { "type": "integer", "minimum": 0 }, "scan_error": { "type": "integer", "minimum": 0 },
        "skipped": { "type": "integer", "minimum": 0 }, "duration_ms": { "type": "integer", "minimum": 0 }
      }
    },
    "exit_code": { "enum": [0, 1, 2] },
    "repos": { "type": "array", "items": { "$ref": "#/$defs/repo" } }
  },
  "$defs": {
    "repo": {
      "type": "object", "additionalProperties": false,
      "required": ["name", "root_index", "status", "git", "template_version", "marker_version", "findings", "duration_ms"],
      "properties": {
        "name": { "type": "string", "minLength": 1, "description": "basename thư mục repo" },
        "root_index": { "type": "integer", "minimum": 0 },
        "status": { "enum": ["CLEAN", "WARNING", "ERROR", "BLOCKER", "SCAN_ERROR", "SKIPPED"] },
        "skip_reason": { "enum": ["excluded", "not-a-repo"] },
        "git": {
          "type": "object", "additionalProperties": false, "required": ["kind", "head"],
          "properties": {
            "kind": { "enum": ["dir", "file", "none", "unknown"] },
            "head": { "enum": ["ok", "unborn", "broken", "timeout", "skipped", "unknown"] },
            "detail": { "type": "string" }
          }
        },
        "template_version": { "type": ["string", "null"] },
        "marker_version": { "type": ["string", "null"] },
        "findings": { "type": "array", "items": { "$ref": "#/$defs/finding" } },
        "scan_error": { "type": "string" },
        "duration_ms": { "type": "integer", "minimum": 0 }
      }
    },
    "finding": {
      "type": "object", "additionalProperties": false,
      "required": ["code", "level", "message", "fix"],
      "properties": {
        "code": { "type": "string", "pattern": "^BRN-0(0[1-9]|1[0-5])$" },
        "level": { "enum": ["blocker", "error", "warning"] },
        "message": { "type": "string" },
        "fix": { "type": "string" },
        "detail": { "type": "object" }
      }
    }
  }
}
```

**Luật schema:** không có field nào tên `path`/`abs`/`dir` chứa đường dẫn tuyệt đối (A9). `status` suy từ findings: có `blocker` ⇒ `BLOCKER`; không thì có `error` ⇒ `ERROR`; không thì có `warning` ⇒ `WARNING`; không có gì ⇒ `CLEAN`. `exit_code` trong file **phải bằng** mã thoát thật của tiến trình.

---

## §8. BẢNG 15 MÃ KIỂM TRA `BRN-001..BRN-015`

Cột **Ai kiểm**: E = `diagnose()` của engine (ảnh hưởng `--check` và chế độ ghi); D = doctor. Cột **Engine tự sửa**: ✔ ⇒ `fixable:true` (tính vào "lệch" của `--check`).

| Mã | Mô tả | Mức | Ai kiểm | Engine tự sửa | Bất biến | Cách sửa (field `fix`) |
| :-- | :--- | :-: | :-: | :-: | :-- | :--- |
| BRN-001 | Thiếu `AGENTS.md` ở root | Blocker | E, D | ✔ (sinh mới, dòng 621–623) | I5 | Chạy engine chế độ ghi tại repo |
| BRN-002 | `AGENTS.md` thiếu ≥1 trong 4 token mốc: `xay-dung-nao-bo`, `Marker Phiên Bản Khung Não`, `Dual Entry-Point Invariant`, `SPEC PACKAGE` (`detail.missing[]`) | Error | E, D | ✔ (vá, dòng 629–718) | I5 | Chạy engine chế độ ghi |
| BRN-003 | `AGENTS.md` có **hai phát biểu luật planning cùng sống** (có cả `SPEC PACKAGE` và `Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)`), **hoặc** một token mốc xuất hiện > 1 lần (`detail.counts{}`) | Error | E, D | ✔ chỉ trường hợp khối cũ (dòng 723–730); trường hợp token > 1 lần: ✘ (báo, người xử) | I6 | Gỡ khối cũ bằng engine; token lặp ⇒ soi tay, gỡ bản thừa |
| BRN-004 | `CLAUDE.md` thiếu, hoặc không chứa `@AGENTS.md` | Blocker | E, D | ✔ (dòng 756, 762) | I4 | Chạy engine chế độ ghi |
| BRN-005 | `CLAUDE.md` > 10 dòng (đếm sau chuẩn hoá LF; dòng trống cuối không tính) | Warning | E, D | ✘ | I4 | Rút `CLAUDE.md` về shim ≤10 dòng, chuyển luật sang `AGENTS.md` |
| BRN-006 | Số file khớp `^brain4agent-v(\d+\.\d+\.\d+)\.md$` ở root ≠ 1 (`detail.found[]`) | Error | E, D | ✔ (xoá lỗi thời + sinh đúng, dòng 431–457) | I1 | Chạy engine chế độ ghi |
| BRN-007 | Version trong tên marker ≠ `state.json.brain_template_version` (khi cả hai đọc được) | Error | E, D | ✔ (hệ quả của BRN-006/010) | I1, I3 | Chạy engine chế độ ghi |
| BRN-008 | Thiếu `brain4agent/` hoặc thiếu ≥1 trong 7 phân vùng (`detail.missing[]`) | Blocker | E, D | ✔ (sinh template, dòng 345–349; **không ghi đè** file có sẵn) | I7 | Chạy engine chế độ ghi |
| BRN-009 | Thiếu ≥1 trong: `memory/hot/state.json`, `memory/hot/today.md`, `planning/`, `.agents/skills/`, `docs/` (`detail.missing[]`) | Error | E, D | ✔ (dòng 167–173, 381, 463) | I11 | Chạy engine chế độ ghi |
| BRN-010 | `state.json` không parse được **sau** strip BOM, **hoặc** thiếu `brain_template_version`, **hoặc** ≠ phiên bản kỳ vọng (`detail.actual`, `detail.expected`) | Error | E, D | ✔ khi parse được (dòng 400–404); ✘ khi JSON hỏng thật (engine exit 2) | I3 | Engine vá version; JSON hỏng ⇒ sửa tay |
| BRN-011 | `state.json` không kết thúc bằng byte `0x0A` | Warning | E, D | ✔ (dòng 401, 404) | I2 | Chạy engine chế độ ghi |
| BRN-012 | `memory-distill.txt` thiếu `xay-dung-nao-bo` **hoặc** root còn `latest_memory.md` (`detail.which`) | Error | E, D | ✔ (dòng 354–369; 176–185) | I8, I9 | Chạy engine chế độ ghi |
| BRN-013 | File trong tập quét có BOM UTF-8 / là UTF-16 / không phải UTF-8 hợp lệ (`detail.files[{rel, encoding}]`). Tập quét = `AGENTS.md`, `CLAUDE.md`, 7 phân vùng, `state.json`, `today.md` | Warning | E (chỉ `state.json` BOM ⇒ fixable), D (toàn tập) | ✔ chỉ `state.json` có BOM (ghi lại không BOM); còn lại ✘ | D4, D5 | Lưu lại file dạng UTF-8 không BOM |
| BRN-014 | Thư mục con **cấp 1** của root (trừ `.git`, `node_modules`) có `.git` riêng (thư mục hoặc file) (`detail.dirs[]`) | Warning | D | ✘ | gotcha #7/#9 | Quyết định: gitignore / submodule / gỡ tầng — do người |
| BRN-015 | Git bất thường: `.git` là **file** (worktree/gitdir), HEAD unborn (`rev-parse --verify HEAD` fail), ref hỏng (`for-each-ref` fail), hoặc timeout (`detail.head`, `detail.stderr`) | Warning | D | ✘ | bẫy E.5 | **Không suy ra repo hỏng**; soi tay `.git/refs` |

Ngoài 15 mã: trạng thái repo `SCAN_ERROR` (không phải mã kiểm) khi doctor **không đọc được root repo** (EACCES, đường dẫn Unicode lỗi, symlink chết) — level tương đương Error, kèm `scan_error` string.

---

## §9. BẢNG 11 BẤT BIẾN ENGINE `I1..I11` — hiện trạng chẩn đoán

| ID | Bất biến | Dòng chứng minh | Dòng 109 hiện kiểm? | Sau #09 |
| :-- | :--- | :--- | :--- | :--- |
| I1 | Root có **đúng 1** `brain4agent-v<x.y.z>.md`, tên khớp `BRAIN_TEMPLATE_VERSION` | 81, 88–90, 431–439 | ✔ (`hasBrainVersionMarker`) nhưng **không đối chiếu** với `state.json` | BRN-006 + BRN-007 |
| I2 | `state.json` kết thúc `0x0A` | 94–97, 392, 404 | ✔ | BRN-011 |
| I3 | `state.json.brain_template_version === BRAIN_TEMPLATE_VERSION`, **không** đụng `current_version` | 384, 400–404 | **✘ CHƯA** — phải bổ sung | BRN-010 (+ test `T-I03` kiểm `current_version` bất biến) |
| I4 | `CLAUDE.md` chứa `@AGENTS.md`, shim ≤10 dòng, không chứa luật | 50, 745–753 | ✔ một nửa (`includes('@AGENTS.md')`); **✘ độ dài chưa kiểm** | BRN-004 + BRN-005 |
| I5 | `AGENTS.md` có đủ 4 chuỗi mốc | 62–64, 629, 640, 657, 681 | ✔ (4 boolean) | BRN-002 (có `detail.missing`) |
| I6 | `AGENTS.md` không đồng thời có `SPEC PACKAGE` và khối cũ | 104–108, 720–731 | ✔ | BRN-003 (+ **đếm** token > 1 lần — mới) |
| I7 | `brain4agent/` đủ 7 file; **không ghi đè** file đã tồn tại | 28–36, 347 | ✔ | BRN-008 + test `T-I07` (nội dung file có sẵn bất biến) |
| I8 | Root không có `latest_memory.md` | 43, 176–185 | ✔ | BRN-012 |
| I9 | `memory-distill.txt` chứa `xay-dung-nao-bo` | 71, 354 | ✔ | BRN-012 |
| I10 | **Idempotent**: chạy lần 2 exit 0 ngay, không ghi gì | 109–125 | ✔ ngầm (không có test) | test `T-I10` đo mtime + hash cây trước/sau lần 2 |
| I11 | Tồn tại `planning/`, `.agents/skills/`, `docs/`, `memory/hot/` | 39–42, 167–173 | ✔ `planning`, `skills`, `hot`; **✘ `docs/` chưa kiểm** (chỉ tạo ở dòng 167) | BRN-009 |

**Bổ sung bắt buộc ở WP1:** I3, I4 (độ dài), I6 (đếm), I11 (`docs/`), và I1 đối chiếu marker↔`state.json`.

---

## §10. HỢP ĐỒNG PHIÊN BẢN

| Hằng số / field | Vị trí | Giá trị sau #09 | Ràng buộc |
| :--- | :--- | :--- | :--- |
| `BRAIN_TEMPLATE_VERSION` | `init_brain.js` dòng 7 | `'1.3.0'` **không đổi** | A8; test `T-A08` |
| `ENGINE_VERSION` | `init_brain.js` (hằng mới, ngay dưới dòng 7) | `'1.6.0'` | **phải bằng** `package.json.version` — test `T-A10`; là thứ `--version` in ra |
| `package.json.version` | root | `1.6.0` | bump khi đóng |
| `state.json.current_version` (hub) | `brain4agent/memory/hot/state.json` | `1.6.0` | bump khi đóng; **không** trộn với `brain_template_version` |
| `state.json.brain_template_version` (hub) | như trên | `1.3.0` | không đổi |
| Marker root hub | `brain4agent-v1.3.0.md` | không đổi | I1 |

---

## §11. BỐ CỤC FILE SAU #09 (mới = ➕, sửa = ✏️)

```text
.agents/skills/.xay-dung-nao-bo/scripts/
├── init_brain.js            ✏️ refactor + CLI (WP6, WP1) — vẫn MỘT file
└── brain_doctor.js          ➕ (WP4) — require('./init_brain.js')
scripts/deploy_skills.ps1    ✏️ (WP3)
tests/                       ➕ (WP2) — KHÔNG nằm trong thư mục skill
├── helpers/{tmp.js, run.js, tree.js, fake-date.js, make-golden.js}
├── fixtures/<case>/...      (tên chung chung; -text trong .gitattributes)
├── golden/manifest.json
├── unit/*.test.js · cli/*.test.js · golden.test.js · doctor/*.test.js · deploy/*.test.js · hygiene/*.test.js
.gitattributes               ➕ (WP5a)
.gitignore                   ✏️ thêm fleet-report*.json, tests/.tmp/
.github/workflows/ci.yml     ➕ (WP5b)
docs/xay-dung-nao-bo.md      ➕ (WP7) · docs/compact.md ➕
package.json                 ✏️ scripts: test, test:golden, doctor, deploy (pwsh), deploy:verify; version 1.6.0
```
