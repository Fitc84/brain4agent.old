# SPEC-P04 — Chẩn đoán theo mốc: BRN-002/003 đổi điều kiện, BRN-016/017 mới, `memory/archive/` (WP3)

Hợp đồng: 01-CONTRACTS §3 (bảng trạng thái), §6 (bảng BRN), §7. Doctor **không đổi logic**: nó `require` engine và dùng `diagnose()`; 016/017 tự xuất hiện trong bảng và `fleet-report.json`.

## §1. Thay đổi trong engine

### 1.1 Bảng `BRN` (+2 phần tử, nguyên văn `title`/`fix` theo 01-CONTRACTS §6)

```js
'BRN-016': { level: 'error',   title: 'AGENTS.md: khối marker hỏng hoặc vùng luật đã bị sửa tay', fix: 'Soi tay AGENTS.md: sửa cặp mốc (đúng 1 mở + 1 đóng, mỗi mốc trọn một dòng) hoặc xoá/bọc lại đoạn luật đã sửa, rồi chạy lại engine' },
'BRN-017': { level: 'warning', title: 'memory/archive/ có file không theo mẫu YYYY-MM-DD.md', fix: 'Chuyển file lạ ra khỏi memory/archive/ hoặc đổi tên đúng mẫu' }
```
Chú thích đầu bảng sửa: `BRN-014/BRN-015 là việc của doctor` giữ; thêm `BRN-016/017 từ #10`.

### 1.2 `diagnose()` — nhánh `AGENTS.md` (THAY dòng 734–769 v1.6.0)

```
if (!s.present['AGENTS.md']) add('BRN-001')
else:
  st = classifyRuleBlocks(agentsText)
  fixable = { absent: ids(st,'absent'), adopt: ids(st,'legacy'), stale: ids(st,'stale') }
  if (∃ khác rỗng) add('BRN-002', 'AGENTS.md thiếu/cũ khối luật: ' + liệt kê, fixable)
  bad = { malformed: ids(st,'malformed'), edited: ids(st,'edited') }
  if (∃ khác rỗng) add('BRN-016', undefined, bad, { fixable: false })
  extra = st.filter(x => x.block && x.extra).map(x => x.id)
  legacyPlanning = agentsText.includes('Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)')
  if (extra.length || legacyPlanning) add('BRN-003', undefined, { extra, legacy_planning: legacyPlanning }, { fixable: false, fix: 'Soi tay AGENTS.md, gỡ bản thừa (engine KHÔNG tự sửa nội dung người dùng)' })
```
Ước lượng ≤ 14 dòng. **CẤM** bất kỳ `includes(<token>)` nào ngoài chuỗi khối planning cũ ở trên (M-9).

### 1.3 Thư mục `memory/archive/` (TQ6)

- `TARGET_DIRS` thêm `['brain4agent/memory/archive', 'archive']` (+1 dòng) ⇒ `s.dirs.archive`; `computePlan` tạo thư mục khi ở đường ghi (vòng `mkdir` hiện có, +0 dòng).
- **KHÔNG** thêm vào `missingInfra` (BRN-009). Lý do: không `.gitkeep` ⇒ clone mới không có thư mục ⇒ nếu kiểm thiếu, mọi `--check` trên clone mới đều `CẦN NÂNG CẤP`.
- `collectSnapshot`: nếu `s.dirs.archive` thì `s.archiveEntries = fs.readdirSync(abs)` (tên, không stat), ngược lại `null` (+2 dòng). Đây là I/O trong vỏ — hợp lệ (A3).
- `diagnose`: `if (s.archiveEntries) { stray = s.archiveEntries.filter(n => n !== '.gitkeep' && !isArchiveName(n)); if (stray.length) add('BRN-017', undefined, { files: stray }, { fixable: false }); }` (+3 dòng). `isArchiveName = (n) => /^\d{4}-\d{2}-\d{2}\.md$/.test(n)` (+1).

Mẫu tên **cố định** `YYYY-MM-DD.md` (Đ6) — không chấp nhận `YYYY-MM.md`. `.gitkeep` do người tạo: bỏ qua, không báo (không sinh ≠ cấm tồn tại). Thư mục con trong archive: báo BRN-017 (không phải mẫu).

## §2. Doctor

- **0 dòng logic mới.** Kiểm: `git diff --stat brain_doctor.js` chỉ đụng chuỗi usage/chú thích (`BRN-001..013` → `BRN-001..013, 016, 017`).
- Bảng terminal: cột mã hiển thị `BRN-016`/`BRN-017` như các mã engine khác (hàm `labelOf` không cần nhánh riêng).
- `fleet-report.json`: schema #09 §7 không liệt kê enum mã ⇒ không đổi `schema_version`.
- Fixture fleet CI (`tests/fixtures/fleet/`): thêm `03-moc-hong` (AGENTS.md S2 nhưng thiếu mốc đóng `dual-entry`) ⇒ BRN-016 error ⇒ doctor exit vẫn 2 (bước `doctor-fixture-check` không đổi).

## §3. Bảng lỗi + hành vi caller

| Finding | Mức/fixable | Engine ghi? | `--check` | Sau ghi | Doctor status |
| :--- | :--- | :-: | :-: | :-: | :--- |
| BRN-002 (absent/adopt/stale) | error / ✔ | có | 1 | 0 | ERROR (fixable) |
| BRN-003 (extra / legacy_planning) | error / ✘ | không đụng | 2 | 2 | ERROR |
| BRN-016 (malformed / edited) | error / ✘ | không đụng khối đó | 2 | 2 | ERROR |
| BRN-017 | warning / ✘ | không | 1 | 0 | WARNING |

Bất biến giữ từ #09: warning không fixable **không** kéo engine vào đường ghi; BRN-016 cùng lúc với BRN-002 ⇒ engine vẫn ghi các khối fixable rồi thoát 2 (không hội tụ vì 016).

## §4. BẮT BUỘC / CẤM / vùng cấm

- **BẮT BUỘC** `diagnose` và `patchAgentsMd` cùng gọi `classifyRuleBlocks` — một sự thật (M-9).
- **CẤM** thêm mã ngoài 016/017; **CẤM** mã "BRN-018: thiếu hàng bảng archive" hay tương tự.
- **CẤM** doctor tự định nghĩa lại 016/017 (bất biến 2 của doctor).
- **Vùng cấm:** không kiểm nội dung file archive (chỉ tên); không kiểm kích thước `today.md`; không kiểm hook — tất cả thuộc script xoay ký ức, ngoài khung.

## §5. Test bắt buộc (chi tiết TESTING-ACCEPTANCE §1)

T-M11 (6 trạng thái ⇒ đúng mã), T-U-D01…D04 (mỗi mã 002/003/016/017 ≥ 1 ca đơn vị với snapshot giả), T-C31/T-C36/T-C37 (hộp đen), T-R20/T-R21 (doctor). `Object.keys(engine.BRN).length === 15` và `Object.keys(DOCTOR_BRN).length === 2` (bánh cóc chống thêm mã).

## §6. Bằng chứng nghiệm thu

| Chỉ số | Kỳ vọng |
| :--- | :--- |
| Dòng engine thêm cho 016/017 + archive | ≤ 12 (2 bảng + 4 archive + ≤ 6 diagnose-017) — đếm thật vào `plan.md` §4 (G2) |
| Doctor `git diff --numstat` | chỉ dòng chuỗi; 0 hàm mới |
| Doctor quét fixture fleet (4 repo) | `03-moc-hong` = ERROR {BRN-016}; exit 2 |
| Doctor quét kho thật (chỉ đọc, sóng 0) | số repo có BRN-016 = **5** (khớp SPEC-P02 §2), thời gian ≤ 40 s |
