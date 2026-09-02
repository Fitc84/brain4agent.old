# SPEC-P01 — WP1: Engine Có Mã Thoát Thật + `--check` / `--dry-run` / `--version` + Chẩn Đoán Có Mã 🔴

**Tiền đề:** WP6 (SPEC-P06) đã xong — engine đã có lõi thuần `collectSnapshot / diagnose / computePlan / applyPlan`. WP1 **không** được bắt đầu khi golden của WP6 chưa xanh.
**Đầu ra:** `init_brain.js` thực hiện đúng hợp đồng 01-CONTRACTS §3, §6, §8, §9.

---

## (a) Hợp đồng chính xác

### a.1. CLI — tham chiếu 01-CONTRACTS §3 (không định nghĩa lại). Tóm tắt luồng `main()`

```text
main(argv, env, io):
  1. args = parseArgs(argv)             → errors ⇒ io.stderr(usage) ; return 64
  2. mode 'version' ⇒ io.stdout(`brain-engine ${ENGINE_VERSION} template ${BRAIN_TEMPLATE_VERSION}\n`) ; return 0
     mode 'help'    ⇒ io.stdout(usage) ; return 0
  3. now = env.BRAIN_NOW ? new Date(env.BRAIN_NOW) : new Date() ; NaN ⇒ return 64
  4. try:
       snap = collectSnapshot(rootDir)   → RootError ⇒ stderr ; return 64
       diag = diagnose(snap, BRAIN_TEMPLATE_VERSION)
       if snap.fileErrors.length > 0 ⇒ in từng lỗi (stderr, tiền tố [brain-engine]) ; return 2
       in banner hiện tại (dòng 20–23) — GIỮ NGUYÊN chữ
       if diag.isStandard:
            in khối "NÃO ĐÃ OK" (dòng 112–123, giữ nguyên chữ) ; in warnings (nếu có) ; return 0
       plan = computePlan(snap, BRAIN_TEMPLATE_VERSION, now)
       mode 'check'   ⇒ stdout(formatFindings(diag)) ; return 1
       mode 'dry-run' ⇒ stdout(formatFindings(diag) + renderDiff(plan, snap)) ; return 1
       mode 'write':
            applyPlan(rootDir, plan, io.stdout)          // in từng dòng log như hiện tại (✅ Đã tạo mới…, 🔄 Đã vá…)
            snap2 = collectSnapshot(rootDir) ; diag2 = diagnose(snap2, …)
            if diag2.isStandard ⇒ in "HOÀN TẤT THÀNH CÔNG" (dòng 770–772) ; return 0
            else ⇒ stderr("[brain-engine] KHÔNG HỘI TỤ sau khi ghi:\n" + formatFindings(diag2)) ; return 2
     catch (e) ⇒ stderr(`[brain-engine] LỖI NỘI BỘ: ${e.stack}`) ; return 3
```

### a.2. `diagnose()` — sinh `Finding` theo 01-CONTRACTS §8, cột "Ai kiểm = E"

Thuật toán từng mã (trên `Snapshot`, văn bản đã LF):

| Mã | Điều kiện phát sinh | `fixable` |
| :-- | :--- | :-: |
| BRN-001 | `files.agentsMd === null` | true |
| BRN-002 | `agentsMd` có nhưng thiếu ≥1 token trong `['xay-dung-nao-bo','Marker Phiên Bản Khung Não','Dual Entry-Point Invariant','SPEC PACKAGE']`; `detail.missing` | true |
| BRN-003 | (`includes('SPEC PACKAGE') && includes('Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)')`) ⇒ `fixable:true`; **hoặc** `count(token) > 1` cho token ∈ {`Dual Entry-Point Invariant`, `Marker Phiên Bản Khung Não`, `SPEC PACKAGE`} ⇒ `fixable:false`; `detail.counts` | tuỳ |
| BRN-004 | `claudeMd === null` hoặc `!includes('@AGENTS.md')` | true |
| BRN-005 | `claudeMd` có; `lines = text.replace(/\n+$/,'').split('\n').length`; `lines > 10`; `detail.lines` | false |
| BRN-006 | `planMarkerOps(rootEntries, version)`: `stale.length > 0 \|\| create` ; `detail.found` | true |
| BRN-007 | marker đúng tồn tại **và** `stateJson` parse được **và** `brain_template_version !== <version trong tên marker>` | true |
| BRN-008 | `!dirs.brain` hoặc `REQUIRED_FILES.some(f => files.brain[f] === null)`; `detail.missing` | true |
| BRN-009 | thiếu bất kỳ: `files.stateJson`, `files.todayMd`, `dirs.planning`, `dirs.skills`, `dirs.docs`; `detail.missing` | true |
| BRN-010 | `stateJson` có: `JSON.parse` ném ⇒ `fixable:false`, `detail.parse_error`; parse được nhưng `brain_template_version !== version` ⇒ `fixable:true`, `detail.actual/expected` | tuỳ |
| BRN-011 | `stateJson` có và `!text.endsWith('\n')` | true |
| BRN-012 | `files.distill` có mà `!includes('xay-dung-nao-bo')` ⇒ `detail.which:'distill'`; `files.legacyLatest !== null` ⇒ `detail.which:'latest_memory'` (hai finding riêng nếu cả hai) | true |
| BRN-013 | `stateJson.hadBom` ⇒ `fixable:true`; các file khác trong tập quét `hadBom` hoặc nằm trong `fileErrors` (UTF16/INVALID_UTF8) ⇒ `fixable:false`; `detail.files` | tuỳ |

`isStandard = findings.every(f => !f.fixable && f.level !== 'blocker' && f.level !== 'error')`.

Hệ quả cần ghi rõ: BRN-003 (token lặp), BRN-010 (JSON hỏng), BRN-013 (UTF-16) là `error`/không fixable ⇒ `isStandard=false` mà engine không sửa được ⇒ chế độ ghi exit **2**, `--check` exit **1**... **KHÔNG.** Sửa lại cho chính xác: `--check` trả **1** khi có finding `fixable` (engine sẽ ghi), trả **2** khi có finding `error`/`blocker` **không fixable** (người phải xử), ưu tiên **2** nếu cả hai. Chế độ ghi: sau khi ghi còn finding không fixable mức `error`/`blocker` ⇒ **2**; chỉ còn `warning` không fixable (BRN-005, BOM file khác) ⇒ **0** kèm in warning. *(Đây là phát biểu có hiệu lực; bảng 01-CONTRACTS §6 hàng `1`/`2` của engine đọc theo nghĩa này.)*

### a.3. `computePlan()` — sinh op theo 01-CONTRACTS §2.3, mỗi op mang `reason` = đúng chuỗi log hiện tại (vd `🔄 Đã tự động vá Bước 0 (.xay-dung-nao-bo) vào AGENTS.md tại root.`) để `applyPlan` in y nguyên.

### a.4. `renderDiff(plan, snapshot)` — định dạng

```text
=== DRY-RUN: <n> thao tác sẽ thực hiện (không ghi) ===
[mkdir]  planning/
[rename] DOCS -> docs (qua temp_docs)
[delete] brain4agent-v1.2.0.md      # lý do: marker lỗi thời
[write]  AGENTS.md  (eol=crlf, +17 dòng, -0 dòng)  # lý do: 🔄 Đã tự động vá luật SPEC PACKAGE ...
--- a/AGENTS.md
+++ b/AGENTS.md
@@ -12,3 +12,20 @@
 ...
```

Diff dòng: thuật toán LCS đơn giản trên mảng dòng (O(n·m) chấp nhận được — `AGENTS.md` ≤ 200 dòng); **không** kéo thư viện. File mới: chỉ in `[write] <rel> (mới, N dòng)` **không** in toàn bộ nội dung template (tránh 150 dòng `AGENTS.md` mỗi lần dry-run) — trừ khi có cờ… **không có cờ**; quy ước cố định.

### a.5. `formatFindings(diag)` — định dạng

```text
=== CHẨN ĐOÁN: CẦN NÂNG CẤP (3 lệch engine tự sửa · 1 việc cần người) ===
BRN-006  error    [tự sửa]   Marker: tìm thấy 2 file (brain4agent-v1.2.0.md, brain4agent-v1.3.0.md) — cần đúng 1
BRN-010  error    [tự sửa]   state.json.brain_template_version = 1.2.0, kỳ vọng 1.3.0
BRN-011  warning  [tự sửa]   state.json không kết thúc bằng newline
BRN-005  warning  [cần người] CLAUDE.md dài 12 dòng (> 10) — rút về shim
```

Sort: theo mã tăng dần **trong** từng nhóm; nhóm `[tự sửa]` trước. Mọi chữ tiếng Việt có dấu, UTF-8.

---

## (b) Luật BẮT BUỘC / CẤM + vùng cấm riêng

**BẮT BUỘC**
1. `main()` trả số; `process.exit` **không** xuất hiện ở đâu ngoài vỏ `require.main === module` (dòng 124 hiện tại phải biến mất).
2. `--check` và `--dry-run` **không** gọi `fs.mkdirSync/writeFileSync/unlinkSync/renameSync`. Kiểm bằng test đo mtime + hash cây trước/sau (`T-P01-05`).
3. Mọi chuỗi log hiện có (`✅ Đã tạo mới…`, `🔄 Đã tự động vá…`, `📄 Đã có sẵn…`, `🗑️ Đã xoá…`, `NÃO ĐÃ OK`, `HOÀN TẤT THÀNH CÔNG`) **giữ nguyên ký tự** — file lệnh đã deploy và các `SKILL.md` đọc chúng.
4. `--version` không đọc đĩa, không in banner, đúng **một dòng**, kết thúc `\n`.
5. Thông điệp lỗi (exit 2/3/64) ra **stderr**; stdout của exit 3 **không** chứa `HOÀN TẤT THÀNH CÔNG` cũng không chứa `NÃO ĐÃ OK`.
6. `BRAIN_NOW` chỉ ảnh hưởng `now`; không ảnh hưởng gì khác.
7. Chế độ ghi sau `applyPlan` **bắt buộc** chẩn đoán lại (đây là điểm giết lớp lỗi D4 "vá hụt mà báo xong").

**CẤM**
1. **CẤM** thêm cờ `--force`, `--fix`, `--yes`, `--json`, `--quiet`, `--color` trong đợt này.
2. **CẤM** đổi thứ tự ops (01-CONTRACTS §2.3).
3. **CẤM** đổi nội dung template/regex vá (A8).
4. **CẤM** engine gọi `git` (engine không biết git; doctor mới biết).
5. **CẤM** engine tự sửa BRN-005 (cắt `CLAUDE.md`) hay BRN-003 dạng token lặp — đó là nội dung người dùng.
6. **CẤM** `--check` in `NÃO ĐÃ OK` khi exit ≠ 0.

**Vùng cấm riêng của WP1 (đã cân nhắc, KHÔNG làm, lý do)**
- **Không thêm `--json` cho engine.** Doctor gọi thẳng `diagnose()` qua `require`, không parse stdout; thêm `--json` là thêm một hợp đồng phải bảo trì mà chưa có người dùng.
- **Không tách "vá tài liệu" thành nhiều lệnh con (`init`, `upgrade`, `check`).** Bước 0 của 66 repo đang gọi engine không tham số; đổi giao diện lệnh = đổi chuẩn = phải chạm 66 repo (NG4).
- **Không chuyển chế độ ghi thành mặc định `--check` ("safe by default").** Cùng lý do: Bước 0 phụ thuộc chế độ ghi mặc định. Ghi vào Idea Vault cho #10.
- **Không dùng `process.exitCode` với I/O bất đồng bộ.** Toàn bộ engine giữ đồng bộ (`*Sync`) như hiện tại — tránh bug "exit trước khi flush stdout" trên Windows pipe.

---

## (c) Bảng phân loại lỗi + hành vi bắt buộc của bên gọi

| Loại | Ví dụ | Mã | Engine làm gì | Bên gọi (agent chạy Bước 0 / CI / doctor) phải làm gì |
| :--- | :--- | :-: | :--- | :--- |
| Dùng sai | cờ lạ; `rootDir` không tồn tại; `BRAIN_NOW` hỏng | 64 | usage ra stderr | Sửa lệnh; **không** retry tự động |
| Lệch, tự sửa được | thiếu marker, version cũ, thiếu shim | 1 (`--check`) / 0 (ghi) | ghi rồi chẩn đoán lại | CI: fail job, người chạy chế độ ghi tại repo. Bước 0: chạy chế độ ghi (mặc định) |
| Lệch, cần người | `CLAUDE.md` 12 dòng; token lặp; `state.json` JSON hỏng; `AGENTS.md` UTF-16 | 2 | in findings; **không ghi bừa** (UTF-16/JSON hỏng: không ghi gì cả) | Dừng, báo người; **CẤM** agent tự viết lại file bằng nội dung đoán |
| Không hội tụ sau ghi | vá xong vẫn thiếu token (regex trượt vì `AGENTS.md` cấu trúc lạ mà fallback cũng thất bại) | 2 | in findings còn lại | Báo bug engine kèm `--dry-run` output; không chạy lại vòng lặp |
| Engine tự lỗi | exception, EACCES khi ghi | 3 | stack ra stderr | Coi là bug engine hoặc lỗi hạ tầng (tầng 1 theo §5.E); **không** coi repo lỗi |

---

## (d) Số đo / bằng chứng nghiệm thu

| # | Bằng chứng | Cách đo | Ngưỡng |
| :-- | :--- | :--- | :--- |
| P01-E1 | Bảng mã thoát 01-CONTRACTS §6 cột engine: **mỗi mã** (0, 1, 2, 3, 64) có ≥1 test spawn thật | `tests/cli/exit-codes.test.js` | 5/5 mã |
| P01-E2 | `--check` trên hub hiện tại (root repo) ⇒ exit **0** và stdout chứa `NÃO ĐÃ OK` | chạy tay + CI step | exit 0 |
| P01-E3 | `--check` trên fixture `F03-legacy-v120` ⇒ exit 1; stdout liệt kê đúng tập mã `{BRN-002, BRN-006, BRN-010}` (+BRN-011 nếu fixture không newline) | test so sánh tập mã | khớp tập |
| P01-E4 | `--dry-run` **không ghi**: hash cây + mtime từng file trước/sau **bằng nhau** | `tree.js` | 100% |
| P01-E5 | Chế độ ghi trên `F07-bom-state` ⇒ exit 0; `state.json` sau: không BOM, `brain_template_version=1.3.0`, `current_version` **không đổi**, byte cuối `0x0A` | test đọc buffer | 4/4 |
| P01-E6 | Chế độ ghi trên `F17-state-corrupt` ⇒ exit **2**; `state.json` **không bị ghi** (hash trước = sau) | test | exit 2, hash bằng |
| P01-E7 | `--version` ⇒ stdout đúng `brain-engine 1.6.0 template 1.3.0\n`, stderr rỗng, exit 0, **không** mở rootDir (chạy với rootDir không tồn tại vẫn exit 0) | test | khớp byte |
| P01-E8 | Exit 3 tái tạo được: mock `applyPlan` ném lỗi (gọi `main()` với `io` giả và `fs` bị `mock.method` để `mkdirSync` ném `EACCES`) ⇒ trả 3; stdout không có `HOÀN TẤT` | `node:test` `mock.method(fs, 'mkdirSync')` | 3 |
| P01-E9 | Idempotent: chạy ghi 2 lần liên tiếp trên mọi fixture golden ⇒ lần 2 exit 0, stdout có `NÃO ĐÃ OK`, cây không đổi | `T-I10` | 100% fixture |
| P01-E10 | Golden A10 vẫn xanh **sau** WP1 (WP1 chỉ thêm vỏ, không đổi nội dung ghi) | `golden.test.js` | 100% |
