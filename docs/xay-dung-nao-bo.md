# `xay-dung-nao-bo` — Universal Brain Engine & Brain Doctor

Tài liệu kỹ thuật 1-1 cho module `.agents/skills/.xay-dung-nao-bo/` (theo `MODULE_DOCUMENTATION_SPEC.md`).
Module này gồm **hai công cụ** dùng chung một lõi:

| Công cụ | File | Vai trò |
| :--- | :--- | :--- |
| **Engine** | `scripts/init_brain.js` | Chẩn đoán + (tuỳ chế độ) **ghi đĩa** để khởi tạo/nâng cấp `brain4agent/` của MỘT repo lên chuẩn khung não hiện hành. |
| **Doctor** | `scripts/brain_doctor.js` | Quét độ lệch **hàng loạt** nhiều repo cùng lúc, **CHỈ ĐỌC** (ngoại lệ ghi duy nhất: `--json <file>` khi người dùng chỉ định tường minh). |

---

## 1. Vai trò & vị trí trong kiến trúc

- Đây là module chuẩn hoá cấu trúc `brain4agent/` (Bước 0 của `AGENTS.md`/`memory-distill.txt`) — mọi agent khởi động phiên đều gọi engine trước khi làm việc.
- Engine là **nguồn chân lý DUY NHẤT** về "thế nào là chuẩn": mọi mã kiểm `BRN-001..017` do hàm `diagnose()` của engine quyết định. Doctor **KHÔNG** được tự định nghĩa lại — nó chỉ tái sử dụng `diagnose()` (qua `require('./init_brain.js')`) và bổ sung đúng hai mã `BRN-014`/`BRN-015` (quan sát về cấu trúc kho, không phải chuẩn khung não).
- **Quan hệ với bản deploy toàn cục:** `scripts/deploy_skills.ps1` sao chép nguyên văn thư mục này ra global skills root và global commands root (xem `-data-architecture.md`). Bản trong repo hub là bản **nguồn**; bản global là **bản sao**. Sau mỗi lần sửa engine/doctor, bắt buộc chạy lại deploy rồi so hash — bỏ qua bước này từng gây thoái lui thầm lặng toàn hệ sinh thái (xem mục "Bẫy đã biết" bên dưới).
- Engine không tự gọi doctor và ngược lại; đây là hai tiến trình CLI độc lập, doctor `require` engine làm thư viện dùng chung (không spawn subprocess).

---

## 2. Bảng tham số dòng lệnh

### 2.1. `init_brain.js`

```text
node init_brain.js [rootDir] [--check | --dry-run] [--version] [--help]
```

| Cờ / đối số | Ý nghĩa | Ghi đĩa? |
| :--- | :--- | :-: |
| `rootDir` (vị trí 1, tuỳ chọn) | Thư mục dự án cần dựng/đồng bộ não. Mặc định `process.cwd()`. Phải tồn tại và là thư mục. | — |
| *(không cờ)* | **Chế độ ghi** (mặc định khi cần nâng cấp): chẩn đoán → nếu đã chuẩn in `NÃO ĐÃ OK` → nếu lệch: lập plan → ghi → chẩn đoán lại để xác nhận hội tụ. | ✔ |
| `--check` | **Chỉ đọc, khuyến nghị dùng ở Bước 0** của Agent Startup Protocol để kiểm tra (không ghi). Chẩn đoán và in bảng findings (`formatFindings`). Không tạo thư mục, không đổi tên, không xoá marker, không ghi gì. | ✘ |
| `--dry-run` | **Chỉ đọc.** Như `--check`, cộng in `renderDiff(plan)` — mô tả từng thao tác (`mkdir`/`rename`/`write`/`delete`) mà chế độ ghi sẽ thực hiện, kèm unified diff cho các file sẽ bị vá. | ✘ |
| `--version` | In đúng một dòng `brain-engine <ENGINE_VERSION> template <BRAIN_TEMPLATE_VERSION>` rồi thoát. Không đọc rootDir. | ✘ |
| `--help` | In usage. | ✘ |

Biến môi trường **chỉ dùng cho test**: `BRAIN_NOW=<ISO-8601>` — ép `now` trong `computePlan` thay vì `new Date()` thật; giá trị không parse được ⇒ thoát mã `64`.

Cấm dùng đồng thời `--check` và `--dry-run`; chỉ nhận tối đa MỘT đối số vị trí (`rootDir`); cờ lạ ⇒ lỗi dùng sai (`64`, in usage ra stderr).

### 2.2. `brain_doctor.js`

```text
node brain_doctor.js --root <kho> [--root <kho>...] [cờ]
node brain_doctor.js --repo <dir> [--repo <dir>...] [cờ]
```

| Cờ | Ý nghĩa | Mặc định |
| :--- | :--- | :--- |
| `--root <kho>` | Thư mục **chứa** các repo; mỗi mục con cấp 1 là một ứng viên repo. Lặp được. | bắt buộc ≥1 trong `--root`/`--repo` |
| `--repo <dir>` | Quét đúng một thư mục như một repo. Lặp được. | |
| `--exclude <tên>` | Bỏ qua mục con có **tên** (basename) trùng khớp; ghi `SKIPPED` lý do `excluded`. Lặp được. | rỗng |
| `--json <file>` | Ghi báo cáo `fleet-report.json` (xem `01-CONTRACTS.md` §7). Thư mục cha của `<file>` phải đã tồn tại. | không ghi |
| `--format table\|json\|quiet` | Kiểu xuất ra stdout: `table` (bảng người đọc), `json` (in nguyên report), `quiet` (chỉ 1 dòng `SUMMARY`). | `table` |
| `--expect-template <x.y.z>` | Phiên bản khung não kỳ vọng, dùng cho `BRN-007`/`BRN-010`. | `BRAIN_TEMPLATE_VERSION` của engine đi kèm |
| `--no-git` | Không chạy lệnh `git` nào. `BRN-014` vẫn kiểm (chỉ `stat`, không cần git); `BRN-015` = `skipped`. | tắt (git bật) |
| `--git-timeout <ms>` | Timeout **mỗi** lệnh git con. | `5000` |
| `--version` | In `brain-doctor <ENGINE_VERSION> template <BRAIN_TEMPLATE_VERSION>` rồi thoát. | |
| `--help` | In usage. | |

**Ứng viên repo** (khi quét qua `--root`) = mục con cấp 1 là thư mục (kể cả tên bắt đầu bằng `.` — KHÔNG lọc) **và** thoả ít nhất một trong: có `.git` (thư mục hoặc file), có `AGENTS.md`, có `brain4agent/`. Không thoả ⇒ `SKIPPED` lý do `not-a-repo` (vẫn liệt kê ra, không bỏ sót thầm lặng).

---

## 3. Bảng mã thoát

Đối chiếu với `planning/09_2026-09-02_engine-kiem-chung/specs/01-CONTRACTS.md` §6 và mã nguồn thật (`init_brain.js` hàm `main`/`exitCodeForDiagnosis`, `brain_doctor.js` hàm `main`).

| Mã | `init_brain.js` | `brain_doctor.js` |
| :-: | :--- | :--- |
| **0** | Đã chuẩn (không ghi gì) **hoặc** ghi xong và chẩn đoán lại đạt chuẩn (hội tụ); `--check`/`--dry-run` không phát hiện lệch nào. | Mọi repo quét được đều `CLEAN` hoặc `SKIPPED`. |
| **1** | `--check`/`--dry-run`: còn finding `fixable:true` — nghĩa là chế độ ghi **sẽ** tự sửa được. | Không có `BLOCKER`/`ERROR`/`SCAN_ERROR`, nhưng có ít nhất một `WARNING`. |
| **2** | Chế độ ghi: sau khi ghi xong chẩn đoán lại **vẫn lệch** (không hội tụ); hoặc snapshot có `fileErrors` (file dự án không đọc được: UTF-16, UTF-8 hỏng, `state.json` không parse được) — trường hợp này exit ngay 2, KHÔNG thử ghi. | Có ≥1 repo `BLOCKER`, `ERROR`, hoặc `SCAN_ERROR`. |
| **3** | Engine tự lỗi: exception không lường trong `main()` (bug nội bộ, `EACCES` khi ghi, root biến mất giữa chừng…). **Không bao giờ** phát sinh từ lỗi phát hiện được trong dự án đích. | Doctor tự lỗi: exception ngoài vòng quét từng repo (ví dụ ghi `--json` thất bại, hoặc `--root`/`--repo` chỉ định không tồn tại). Lỗi khi quét **một** repo không bao giờ leo lên mã 3 — repo đó chỉ thành `SCAN_ERROR`, vòng quét đi tiếp, tổng thể vẫn exit 2. |
| **64** | Dùng sai cờ/đối số (cờ lạ, `--check` + `--dry-run` cùng lúc, >1 đối số vị trí, `BRAIN_NOW` không parse được, `rootDir` chỉ định không tồn tại/không phải thư mục). | Dùng sai cờ/đối số; thiếu cả `--root` lẫn `--repo`. |

Luật tuyệt đối (giữ nguyên trong mã thật): mã **3** chỉ phát sinh từ khối `catch` bao ngoài cùng của chính công cụ đó — không bao giờ dùng cho lỗi ở phía dự án/repo đích.

---

## 4. Bảng 17 mã kiểm tra `BRN-001..BRN-017`

Cột **Ai kiểm**: E = `diagnose()` của engine (chạy trong cả `--check` lẫn chế độ ghi); D = doctor (`brain_doctor.js`, chỉ BRN-014/BRN-015). Cột **Tự sửa** = ✔ nghĩa là chế độ ghi của engine tự vá được (tính vào "lệch" khi chạy `--check`).

| Mã | Mức | Ai kiểm | Tự sửa | Ý nghĩa | Cách sửa |
| :-- | :-: | :-: | :-: | :--- | :--- |
| BRN-001 | Blocker | E, D | ✔ | Thiếu `AGENTS.md` ở root. | Chạy engine chế độ ghi tại repo. |
| BRN-002 | Error | E, D | ✔ | `AGENTS.md` khối marker thiếu hoặc cũ: `absent` (chưa thêm), `legacy` (đã thêm lâu từ v1.3.0), hoặc `stale` (cần đồng bộ nội dung). Khối bắt buộc: 6 mã `boot`, `cold-memory`, `spec-package`, `structural-extension`, `root-marker`, `dual-entry`. | Chạy engine chế độ ghi. |
| BRN-003 | Error | E, D | ✘ | `AGENTS.md` có hai phát biểu cùng sống: **probe của khối đã có xuất hiện NGOÀI mọi mốc** (bản thừa cũ), **hoặc** còn khối planning cũ `Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)`. **Không tự sửa** — engine CẤM sửa nội dung người dùng. | Soi tay `AGENTS.md`, gỡ bản thừa hoặc khối planning cũ, rồi chạy lại engine. |
| BRN-004 | Blocker | E, D | ✔ | `CLAUDE.md` thiếu hoặc không chứa dòng `@AGENTS.md`. | Chạy engine chế độ ghi. |
| BRN-005 | Warning | E, D | ✘ | `CLAUDE.md` dài hơn 10 dòng (đếm sau chuẩn hoá LF, không tính dòng trống cuối) — không còn là shim mỏng. | Rút `CLAUDE.md` về shim ≤10 dòng bằng tay, chuyển phần luật thừa sang `AGENTS.md`. Engine **cấm** tự cắt nội dung người dùng. |
| BRN-006 | Error | E, D | ✔ | Số file khớp `brain4agent-v<x.y.z>.md` ở root ≠ 1 (thiếu, thừa, hoặc sai version). | Chạy engine chế độ ghi. |
| BRN-007 | Error | E, D | ✔ | Version trong tên file marker khác `state.json.brain_template_version` (khi cả hai đọc được). | Chạy engine chế độ ghi. |
| BRN-008 | Blocker | E, D | ✔ | Thiếu thư mục `brain4agent/` hoặc thiếu ≥1 trong 7 phân vùng bắt buộc bên trong. | Chạy engine chế độ ghi (chỉ sinh file thiếu — **không ghi đè** file đã tồn tại). |
| BRN-009 | Error | E, D | ✔ | Thiếu ≥1 trong: `brain4agent/memory/hot/state.json`, `brain4agent/memory/hot/today.md`, `planning/`, `.agents/skills/`, `docs/`. | Chạy engine chế độ ghi. |
| BRN-010 | Error | E, D | ✔ khi parse được | `state.json` không parse được sau khi strip BOM, hoặc thiếu `brain_template_version`, hoặc khác phiên bản kỳ vọng. | Engine tự vá version khi JSON hợp lệ. JSON hỏng thật ⇒ **sửa tay**, engine chế độ ghi sẽ exit 2 (không hội tụ) nếu cứ chạy lại mà chưa sửa. |
| BRN-011 | Warning | E, D | ✔ | `state.json` không kết thúc bằng byte `0x0A`. | Chạy engine chế độ ghi. |
| BRN-012 | Error | E, D | ✔ | `memory-distill.txt` thiếu chuỗi `xay-dung-nao-bo` (thiếu Bước 0), **hoặc** root còn tồn tại `latest_memory.md` (di tích chuẩn cũ). | Chạy engine chế độ ghi. |
| BRN-013 | Warning | E (chỉ `state.json` có BOM), D (toàn tập) | ✔ chỉ `state.json` có BOM | File trong tập quét (`AGENTS.md`, `CLAUDE.md`, 7 phân vùng `brain4agent/`, `state.json`, `today.md`) có BOM UTF-8, là UTF-16, hoặc không phải UTF-8 hợp lệ. | `state.json` có BOM: engine tự ghi lại không BOM. Mọi file khác: **lưu lại tay** dạng UTF-8 không BOM. |
| BRN-014 | Warning | D | ✘ | Thư mục con **cấp 1** của repo (trừ `.git`, `node_modules`) có `.git` riêng — nghi vấn repo lồng repo. | Quyết định của con người: gitignore / chuyển thành submodule thật / gỡ một tầng thư mục. |
| BRN-015 | Warning | D | ✘ | Git bất thường: `.git` là **file** (worktree/gitdir liên kết), HEAD unborn (chưa có commit), ref hỏng (`for-each-ref` lỗi), hoặc timeout lệnh git. | **Không được suy ra "repo hỏng"** từ mã này — soi tay `.git/refs` khi cần. |
| BRN-016 | Error | E, D | ✘ | Khối marker hỏng: cặp mốc không trọn (mở mà không đóng, hoặc ≥2 mốc cùng `id` cùng tồn tại); **hoặc** vùng luật đã bị sửa tay (nội dung bên trong khối khác body mong muốn). Engine **fail-closed** — không ghi byte nào cho khối đó, báo `BRN-016` để người sửa tay mốc/khối. | Soi tay `AGENTS.md`: kiểm cặp mốc `<!-- brain:rule:id -->` và `<!-- /brain:rule:id -->` (mỗi mốc phải trọn một dòng, đúng 1 mở + 1 đóng), sửa hoặc xoá dòng vừa sửa tay, rồi chạy lại engine. |
| BRN-017 | Warning | E, D | ✘ | `memory/archive/` chứa file không theo mẫu tên `YYYY-MM-DD.md` (ký ức lạnh chỉ được ghi bởi script xoay, không cho sửa tay). File `.gitkeep` được bỏ qua. | Chuyển file lạ ra khỏi `memory/archive/` hoặc đổi tên đúng mẫu `YYYY-MM-DD.md`. |

Ngoài 15 mã: trạng thái repo `SCAN_ERROR` (không phải mã kiểm) khi doctor **không đọc được** root repo đó (ví dụ `EACCES`, đường dẫn lỗi, symlink chết) — mức tương đương Error, kèm chuỗi `scan_error`; quét vẫn tiếp tục sang repo khác.

---

## 5. Kiến trúc bên trong

Cả engine lẫn doctor tách rõ **lõi thuần** (pure functions — không `fs`, không `Date.now()`, không `console`, không `process`) và **vỏ vào/ra** (I/O + CLI). Đây là bất biến kiến trúc để test được bằng `node --test` mà không cần mock filesystem phức tạp.

### 5.1. Luồng lõi thuần của engine (`init_brain.js`)

```
collectSnapshot(rootDir)   →   diagnose(snapshot, templateVersion)   →   computePlan(snapshot, ...)   →   applyPlan(rootDir, plan, ...)
   [vỏ I/O đọc]                    [thuần]                                  [thuần]                        [vỏ I/O ghi]
```

- `collectSnapshot(rootDir)` — **lớp I/O đọc duy nhất**. Mỗi file được đọc **đúng một lần**, kết quả gói vào một object `Snapshot` (đủ mọi thứ các hàm thuần cần: `rootEntries`, `dirs`, `files.*`, `present`, `fileErrors`, `archiveEntries` tên file trong `memory/archive/`). Ném lỗi `RootError` nếu `rootDir` không tồn tại/không phải thư mục. **Ký ức lạnh (`memory/archive/`)**: chỉ đọc danh sách TÊN file (không stat, không nội dung) — vùng cấm của SPEC.
- `diagnose(snapshot, templateVersion)` — **thuần**. Duyệt `Snapshot`, sinh danh sách `Finding` (mã `BRN-*`, mức, có tự sửa được không, thông điệp, cách sửa, chi tiết). Bao gồm kiểm các khối marker (dùng `classifyRuleBlocks`), BRN-002/003/016/017. Trả về `{ findings, isStandard, isBrandNew }`.
- `computePlan(snapshot, templateVersion, now)` — **thuần**. Sinh danh sách thao tác (`PlanOp`: `mkdir`/`rename`/`write`/`delete`/`log`) theo **thứ tự bất biến** (đổi tên thư mục hoa→thường → tạo 8 thư mục *bao gồm* `brain4agent/memory/archive/` → di trú `latest_memory.md` → 7 phân vùng `brain4agent/` → `state.json` → marker → `today.md` → `AGENTS.md` → `CLAUDE.md`). Nhận `now: Date` làm tham số thay vì gọi `new Date()` trực tiếp — cho phép test tất định qua `BRAIN_NOW`.
- `applyPlan(rootDir, plan, log, errorLog)` — **lớp I/O ghi duy nhất**. Thi hành đúng thứ tự `ops`, không sắp xếp lại; gọi `readText`/`writeText` cho mọi thao tác chạm nội dung file. **Không sinh `.gitkeep` trong `memory/archive/`** — thư mục rỗng không được git theo dõi, đó là đặc tính sẵn của git (không phải bẫy engine).
- `runBrainEngine(opts)` — điểm vào lập trình gộp cả bốn bước trên theo `mode` (`write`/`check`/`dry-run`), **không** `process.exit`, **không** `console.*`, và **không tự bắt exception của chính nó** (để `main()` là nơi duy nhất phân loại lỗi).
- `main(argv, env, io)` — vỏ CLI: `parseArgs` → `runBrainEngine` → trả mã thoát. Đây là nơi **duy nhất** bắt exception không lường và trả về `3`.

### 5.2. Doctor (`brain_doctor.js`) tái dùng lõi

Doctor **không** viết lại logic chẩn đoán — nó `require('./init_brain.js')` và gọi thẳng `collectSnapshot` + `diagnose` cho từng repo ứng viên, rồi cộng thêm hai bước riêng của nó: `findNestedGit()` (sinh `BRN-014`) và `probeGit()` (sinh `BRN-015`, chỉ 3 lệnh git rẻ tiền: `rev-parse --is-inside-work-tree`, `rev-parse --verify --quiet HEAD`, `for-each-ref --count=1`). Vòng quét theo repo (`scanRepo`) tự bọc `try/catch` để một repo lỗi không chặn các repo khác — đây là lý do `SCAN_ERROR` không bao giờ leo thành mã thoát `3`.

### 5.3. Lớp marker — đầu vào/đầu ra của `classifyRuleBlocks` và `patchAgentsMd`

Engine v1.4.0+ quản lý 6 khối luật trong `AGENTS.md` bằng cặp mốc `<!-- brain:rule:<id> -->` ... `<!-- /brain:rule:<id> -->` (id: `boot`, `cold-memory`, `spec-package`, `structural-extension`, `root-marker`, `dual-entry`). Điểm mạnh so với regex cũ:

- **`classifyRuleBlocks(text)` — dò tìm** từng khối và phân loại trạng thái: `ok` (khối có, nội dung đúng), `stale` (khối có nhưng cũ), `legacy` (bản cũ v1.3.0 còn sót), `edited` (khối có nhưng nội dung bị sửa tay), `malformed` (mốc lỏng lẻo), `absent` (không có khối).
- **`patchAgentsMd(text)` — vá theo thứ tự**:
  - `stale` → cập nhật nội dung bên trong khối (thân `body` mới).
  - `legacy` → bọc bản cũ bằng mốc mới.
  - `absent` → thêm khối mới ở cuối `AGENTS.md` (sau tiêu đề `## 🔒 Luật khung...` hoặc tạo mới tiêu đề).
  - `malformed`/`edited` → **fail-closed** (không ghi gì, báo `BRN-016`/`BRN-003` cho người xử).
- **`RULE_BLOCKS` skeleton** — định nghĩa đầy đủ nội dung và điều kiện của mỗi khối (thân luật, token probe, legacy).

**Cấm sửa ruột khối** — nội dung giữa hai mốc là lãnh địa engine, người dùng không được sửa tay. Nếu sửa, engine sẽ phát hiện (`edited = true`) và dừng lại, yêu cầu khôi phục hoặc bọc lại khối. **Di chuyển trọn khối được phép** — có thể cắt-dán toàn bộ cặp mốc + nội dung đến nơi khác trong file, engine vẫn tìm được.

### 5.3. Danh sách hàm được `module.exports`

**`init_brain.js`:** `BRAIN_TEMPLATE_VERSION`, `ENGINE_VERSION`, `REQUIRED_FILES`, `stripBom`, `detectEol`, `normalizeEol`, `restoreEol`, `hasUtf8Bom`, `detectEncoding`, `readText`, `writeText`, `renderTemplates`, `renderInitialState`, `renderMarker`, `renderTodayMd`, `renderClaudeShim`, `renderFullAgentsMd`, `patchDistill`, `patchStateJson`, `patchAgentsMd`, `patchClaudeMd`, `BRN`, `collectSnapshot`, `diagnose`, `formatFindings`, `renderDiff`, `planCaseRenames`, `planMarkerOps`, `computePlan`, `applyPlan`, `runBrainEngine`, `exitCodeForDiagnosis`, `usage`, `parseArgs`, `main`.

**`brain_doctor.js`:** `TOOL_NAME`, `SCHEMA_VERSION`, `DOCTOR_BRN`, `DEFAULT_GIT_TIMEOUT`, `padTrim`, `scrub`, `sortViet`, `statusFromFindings`, `gitKind`, `isCandidate`, `mergeBom013`, `findNestedGit`, `probeGit`, `scanRepo`, `scanRoot`, `findingTag`, `renderTable`, `renderQuiet`, `usage`, `parseArgs`, `main`.

> Lưu ý đối chiếu SPEC: `01-CONTRACTS.md` §2.5 liệt kê thêm `detectEncoding` trong danh sách export dự kiến — mã thật xuất `detectEncoding` (đúng tên), khớp SPEC. Không có chỗ lệch giữa export thật và SPEC tại thời điểm viết tài liệu này.

---

## 6. Quy ước chuẩn hoá văn bản (lớp nền tảng — mọi hàm khác dựa vào đây)

Đây là **gốc của cả một họ lỗi cũ** trong dự án (xem gotcha #11 trong `-known-gotchas.md`: một đợt vá luật hàng loạt từng làm 33 repo có AGENTS.md chứa đồng thời khối luật CŨ và MỚI, vì regex vá `\n` cứng trượt trên file CRLF). Quy ước dưới đây là hàng rào chống tái diễn.

- **Khi ĐỌC** (`readText`): strip đúng một `U+FEFF` (BOM) ở vị trí đầu tệp; chuẩn hoá mọi `\r\n → \n`; **ghi nhận lại** EOL gốc (`lf`/`crlf`/`mixed`/`none`) và việc file có BOM hay không. Mọi hàm thuần trong engine (`diagnose`, `computePlan`, các hàm `patch*`) chỉ nhận **văn bản đã chuẩn hoá LF** — không bao giờ thấy `\r`.
- **Khi GHI** (`writeText`): khôi phục đúng EOL gốc đã ghi nhận khi đọc (`crlf` → đổi mọi `\n` thành `\r\n`; `lf`/`mixed`/`none` → ghi thẳng LF); **không bao giờ** ghi lại BOM; luôn mã hoá UTF-8.
- **CR đơn độc** (`\r` không đi kèm `\n` ngay sau) **không được coi là EOL** — giữ nguyên byte, không đổi (vì `-known-gotchas.md` của chính hub có một CR đơn độc trong nội dung; "sửa" nó là đổi nội dung chứ không phải chuẩn hoá).
- **`mixed`** (file có cả `\r\n` lẫn `\n` trần): khi ghi lại → chuyển hết về `lf`, kèm log cảnh báo một dòng. Ghi `crlf` cho file `mixed` sẽ bịa ra EOL cho những dòng vốn dĩ là LF.
- **`none`** (không có ký tự xuống dòng nào trong file): khi ghi → `lf`.
- File JSON do engine quản lý (`state.json`) và mọi file **mới** do engine sinh (7 template, marker, `CLAUDE.md` shim, `today.md`) luôn ghi `lf` bất kể ngữ cảnh.

**Vì sao quan trọng:** đây là lớp I/O văn bản duy nhất trong cả hai file — `readText`/`writeText` là hai hàm **duy nhất** được phép gọi `fs.readFileSync`/`fs.writeFileSync` lên nội dung văn bản (ngoại lệ: `collectSnapshot` đọc buffer thô để dò encoding trước khi gọi `readText`). Mọi regex vá nội dung (`patchAgentsMd`, `patchDistill`, `patchClaudeMd`) chạy trên chuỗi đã chuẩn hoá LF nên **không cần** viết `\r?\n` trong pattern — nếu thấy một regex mới chứa `\r?\n`, đó là dấu hiệu ai đó đang vá sai lớp.

---

## 7. Chạy test & chụp lại ảnh chuẩn (golden)

```bash
npm test            # chạy toàn bộ tests/**/*.test.js (node --test)
npm run test:golden # chỉ chạy tests/golden.test.js — so sha256 từng file output với tests/golden/manifest.json
npm run doctor       # chạy brain_doctor.js với alias sẵn trong package.json
```

`golden.test.js` copy từng fixture trong `tests/fixtures/`, chạy engine **hiện tại** lên bản copy, chụp lại cây file (`snapshotTree`) rồi so `sha256` từng file với `tests/golden/manifest.json` — file thừa/thiếu hoặc sai `exit_code` đều FAIL.

Chụp lại ảnh chuẩn:

```bash
npm run golden:make
# tương đương: node tests/helpers/make-golden.js --engine .agents/skills/.xay-dung-nao-bo/scripts/init_brain.js --out tests/golden/manifest.json
```

**Cảnh báo bắt buộc:** khi `golden.test.js` báo lệch sha ở một file, **TUYỆT ĐỐI KHÔNG** chạy `golden:make` ngay để "cho xanh lại". Phải đọc diff thật trước (ví dụ `node init_brain.js <fixture> --dry-run`), rồi tự quyết định: nếu là **regression** (engine sinh sai) → sửa engine, chạy lại test; nếu là **thay đổi có chủ đích** (đổi hành vi hợp lệ) → ghi rõ quyết định + lý do vào `plan.md` của kế hoạch liên quan **trước**, rồi mới chạy `golden:make`. Chụp lại ảnh chuẩn là một **quyết định của con người**, không phải bước tự động hoá — golden tồn tại chính là để bắt những thay đổi hành vi không chủ ý.

---

## 8. Bẫy đã biết khi dùng module này

- **Mốc marker phải trọn một dòng** — `<!-- brain:rule:id -->` và `<!-- /brain:rule:id -->` phải mỗi cái nguyên vẹn trên một dòng LF riêng lẻ. Nếu mốc bị tách (vd mốc đóng nằm dòng cuối cùng mà không có `\n` sau) → `classifyRuleBlocks` cho `malformed`, engine **fail-closed** báo `BRN-016` (không ghi). Lý do: engine so khớp theo **dòng nguyên vẹn**, không tìm trong giữa dòng.
- **Không sửa ruột khối** — nội dung bên trong khối là lãnh địa engine. Nếu sửa tay → `classifyRuleBlocks` cho `edited = true`, `patchAgentsMd` báo `BRN-003` (không tự sửa, người xử). Cách khôi phục: xoá nội dung sửa tay, hoặc cắt-dán toàn bộ cặp mốc sang nơi khác (di chuyển trọn khối được phép).
- **Một ref git hỏng làm cả loạt lệnh git chết `fatal`.** Đây là lý do `probeGit()` trong doctor **chỉ** dùng 3 lệnh rẻ, đọc-metadata (`rev-parse --is-inside-work-tree`, `rev-parse --verify --quiet HEAD`, `for-each-ref --count=1 refs/heads`) thay vì bất cứ lệnh nào duyệt toàn bộ đối tượng (`rev-list --all`, `fsck`...). Một ref hỏng chỉ khiến `BRN-015` được gắn cho đúng repo đó — **không được suy ra "cả repo hỏng"** từ đó, và các mã `BRN-001..017` của repo đó vẫn phải tính đúng, không bị git che.
- **`brain_doctor.js` CẤM quét đệ quy sâu hơn cấp 1.** Số đo thật trên hệ sinh thái: quét đệ quy toàn cây tìm BOM đã TIMEOUT sau 5 phút; quét chỉ root + `brain4agent/` (+ `memory/hot/`) cho ~70 thư mục hết 1.445 giây (~24 phút). Vì vậy `findNestedGit()` chỉ gọi `stat` đúng một lần cho mỗi mục con **cấp 1** (bỏ qua `.git`, `node_modules`), tuyệt đối không đệ quy sâu hơn — đi sâu hơn làm thời gian quét nổ theo cấp số nhân.
- **Unborn branch dễ bị nhầm là detached HEAD.** Repo mới `git init`, chưa có commit nào, cũng làm `rev-parse --abbrev-ref HEAD` in ra `HEAD` giống hệt detached thật. Doctor phân biệt bằng exit code của `rev-parse --verify --quiet HEAD` (fail ⇒ `unborn`) chứ không suy luận từ chuỗi in ra.
- **`.git` có thể là FILE, không chỉ thư mục** — trường hợp worktree liên kết hoặc submodule. `gitKind()` luôn `stat` trước khi quyết định `dir`/`file`/`none`/`unknown`; nhầm lẫn chỗ này từng làm `git -C <thư-mục-con>` leo lên repo tổ tiên và đo sai trạng thái repo con hoàn toàn.
- **Regex vá nội dung dùng `replace()` với chuỗi thay thế trực tiếp là một bẫy khác** (không phải bẫy CRLF ở trên, nhưng cùng họ D3): nếu nội dung thay thế từng chứa ký tự `$`, JavaScript sẽ diễn giải nó thành pattern đặc biệt (`$&`, `$1`...). Mọi lệnh `.replace()` trong hai file này dùng **hàm** làm đối số thứ hai (`() => text`) thay vì chuỗi trực tiếp, trừ trường hợp chuỗi rỗng (`replace(/\s*$/, '')`) vốn không chứa `$`-pattern.
- **Tên thư mục có dấu cách hoặc tiếng Việt có dấu.** Mọi lời gọi git trong doctor dùng `spawnSync('git', ['-C', repoDir, ...args], { shell: false })` — mảng đối số, không nội suy chuỗi lệnh — để không vỡ khi đường dẫn chứa khoảng trắng hoặc ký tự có dấu.
- **Đường dẫn tuyệt đối không được lọt vào output.** `scrub()` trong doctor thay mọi đường dẫn root đã dùng bằng `<root>` trước khi in ra bảng/JSON — báo cáo và stdout của doctor tuyệt đối không chứa đường dẫn tuyệt đối của máy đang chạy.
