# SPEC-P04 — WP4: `brain-doctor` — Quét Độ Lệch Toàn Hệ Sinh Thái (chỉ đọc) 🔴

**Tiền đề:** WP6 + WP1 xong (`require('./init_brain.js')` không tác dụng phụ; `collectSnapshot/diagnose` tồn tại). WP3 xong (để bản global cũng có doctor).
**Vị trí:** `.agents/skills/.xay-dung-nao-bo/scripts/brain_doctor.js`. `package.json`: `"doctor": "node .agents/skills/.xay-dung-nao-bo/scripts/brain_doctor.js"`.

---

## (a) Hợp đồng chính xác

### a.1. CLI, mã thoát, schema: 01-CONTRACTS §4, §6, §7. Mã kiểm: §8 (cột D).

### a.2. Thuật toán quét — **bị chặn cứng về I/O** (luật thiết kế từ số đo E: quét đệ quy TIMEOUT 5 phút; root + `brain4agent/` ~70 thư mục = 1,445 s)

```text
scanRoot(rootDir):
  entries = readdirSync(rootDir, { withFileTypes: true })          // KỂ CẢ tên bắt đầu '.', KHÔNG lọc (bẫy E.1)
  for e in entries sorted by name (localeCompare 'vi', numeric):
     if !e.isDirectory() && !e.isSymbolicLink(): continue
     repoDir = join(rootDir, e.name)
     if excluded(e.name): push SKIPPED(excluded); continue
     kind = gitKind(repoDir)                                        // stat(join(repoDir,'.git')): isDirectory→'dir' ; isFile→'file' ; ENOENT→'none' ; lỗi khác→'unknown'  (bẫy E.2)
     if kind==='none' && !exists(AGENTS.md) && !exists(brain4agent/): push SKIPPED(not-a-repo); continue
     scanRepo(repoDir, kind)

scanRepo(repoDir, kind):   // TOÀN BỘ I/O của một repo giới hạn ở:
  1. snap = collectSnapshot(repoDir)      // đọc: readdir(root) ; stat 7 thư mục ; readText ≤ 12 file (AGENTS.md, CLAUDE.md, latest_memory.md, 7 phân vùng, state.json, today.md)
  2. diag = diagnose(snap, expectTemplate) // hàm thuần của engine — MỘT nguồn chân lý về "chuẩn"
  3. BRN-013 (toàn tập): từ snap.fileErrors + các TextFile.hadBom
  4. BRN-014: với mỗi mục con CẤP 1 là thư mục (trừ '.git','node_modules'): stat(join(child,'.git')) — chỉ 1 stat/mục, KHÔNG đi sâu hơn (bẫy E.7)
  5. BRN-015 (nếu !--no-git && kind!=='none'):
        git -C repoDir rev-parse --is-inside-work-tree        (timeout)
        git -C repoDir rev-parse --verify --quiet HEAD        → fail ⇒ head='unborn'
        git -C repoDir for-each-ref --count=1 --format=%(objectname) refs/heads   → exit≠0 hoặc stderr có 'bad ref'/'broken' ⇒ head='broken' (bẫy E.5: KHÔNG dùng rev-list --all / fsck)
        kind==='file' ⇒ luôn thêm BRN-015 detail 'gitdir-file (worktree/submodule)'
     spawnSync('git', [...], { timeout: gitTimeout, encoding:'utf8', windowsHide:true, shell:false, env:{...env, LC_ALL:'C', GIT_TERMINAL_PROMPT:'0'} })
     status===null (timeout) ⇒ head='timeout' ⇒ BRN-015
  6. Mọi exception trong scanRepo ⇒ status SCAN_ERROR, scan_error = `${e.code||''} ${e.message}` (KHÔNG có đường dẫn tuyệt đối — lọc bằng replace(rootDir,'<root>')), tiếp tục repo kế
```

**Không có** `readdirSync` nào với `recursive:true`. **Không có** vòng lặp nào đi quá cấp 1 của repo ngoài `brain4agent/` và `brain4agent/memory/hot/`.

### a.3. Bảng cho người (`--format table`)

```text
brain-doctor 1.6.0 · template kỳ vọng 1.3.0 · git: on · roots: 1
REPO                                   GIT        STATUS      FINDINGS
.hidden-repo                           dir/ok     CLEAN       -
not-a-repo                             none/-     SKIPPED     not-a-repo
repo-alpha                             dir/ok     CLEAN       -
repo-bravo                             dir/ok     ERROR       BRN-006 BRN-007 BRN-010 BRN-011
repo-charlie                           dir/ok     BLOCKER     BRN-001 BRN-004 BRN-008 BRN-009 BRN-012
repo-delta                             dir/ok     WARNING     BRN-014(sub)
repo-echo                              file/ok    WARNING     BRN-015(gitdir-file)
repo-foxtrot                           dir/ok     WARNING     BRN-005(12)
repo-golf                              dir/ok     WARNING     BRN-013(state.json:utf8-bom, today.md:utf16le)
Tên có dấu cách và tiếng Việt          dir/ok     CLEAN       -
SUMMARY candidates=10 clean=3 warning=4 error=1 blocker=1 scan_error=0 skipped=1 duration_ms=812 exit=2
```

- Cột `REPO` cắt ở 38 ký tự (đếm code point, không đếm byte); `GIT` = `kind/head`.
- Sau bảng, mỗi repo ≠ CLEAN/SKIPPED in khối chi tiết: `  BRN-006 error   Marker: tìm thấy [...] · fix: Chạy engine chế độ ghi`.
- Dòng `SUMMARY` là hợp đồng máy đọc, cùng khoá với `summary` trong JSON + `exit`.

### a.4. `fleet-report.json`

Theo 01-CONTRACTS §7. Ghi bằng `writeText(path, JSON.stringify(report, null, 2) + '\n', 'lf')` — không BOM, kết thúc `0x0A`. Ghi **sau** khi quét xong toàn bộ; nếu ghi thất bại ⇒ exit 3 (và bảng vẫn đã in). Mặc định **không** ghi (chỉ khi `--json`).

---

## (b) Luật BẮT BUỘC / CẤM + vùng cấm riêng

**BẮT BUỘC**
1. **Chỉ đọc tuyệt đối.** Grep trong `brain_doctor.js`: `writeFileSync|writeText|mkdirSync|unlinkSync|renameSync|rmSync|copyFileSync` = 0, **trừ** đúng một lần `writeText` cho `--json`. Không gọi `applyPlan`/`computePlan`.
2. Dùng `diagnose()` của engine cho BRN-001..012 — **CẤM** tự viết lại logic "thế nào là chuẩn" trong doctor (nếu không, hai công cụ sẽ lệch nhau đúng như hai file hiến pháp).
3. Mọi lệnh git: mảng đối số, `shell:false`, `timeout`, `windowsHide`, `LC_ALL=C`, `GIT_TERMINAL_PROMPT=0`. **CẤM** `rev-list --all`, `fsck`, `gc`, `status` (status có thể chậm 3 s/repo và chạm submodule hỏng — #06 §7).
4. Tên thư mục có dấu cách/tiếng Việt/ký tự lạ: mọi thao tác dùng `path.join` + mảng đối số; **không** có nội suy chuỗi lệnh (bẫy E.6).
5. Phát hiện UTF-16 bằng byte đầu (`FF FE` / `FE FF`) **trước** khi decode; UTF-8 hỏng bằng `TextDecoder('utf-8',{fatal:true})` (bẫy E.3).
6. Đếm dòng `CLAUDE.md` **sau** `normalizeEol` và bỏ newline cuối (bẫy E.4).
7. `SCAN_ERROR` của một repo **không** dừng vòng quét và **không** thành exit 3.
8. Exit 3 chỉ từ `catch` ngoài cùng của `main()`; test bắt buộc chứng minh `3 ≠ 2` (SPEC-P02 §(b).6).
9. Output không chứa đường dẫn tuyệt đối: mọi chỗ in đường dẫn dùng `name` (basename) hoặc `rel` tương đối repo; `roots[].label` = basename.

**CẤM**
1. **CẤM** quét đệ quy (`recursive:true`, `glob`, vòng lặp tự đệ quy) — vi phạm là FAIL nghiệm thu bất kể kết quả đúng.
2. **CẤM** chế độ `--fix`/`--apply`/`--write` (NG4). Doctor chỉ **đề xuất** `fix` dạng chữ.
3. **CẤM** đọc `.env*`, `*.pem`, `*.key`, bất kỳ file nào ngoài tập 12 file/repo — kể cả để "đếm secret" (gotcha #14: doctor chạy trên kho private, báo cáo có thể bị chép vào hub public).
4. **CẤM** commit `fleet-report*.json` (gitignore ở WP5a) và **CẤM** dán bảng doctor có tên repo thật vào bất kỳ file nào trong hub. Trong SPEC/TESTING chỉ được ghi **số đếm** (vd "66/67 CLEAN").
5. **CẤM** doctor sửa `--expect-template` theo `state.json` của repo nào đó ("suy ra chuẩn từ đa số") — chuẩn đến từ engine đi kèm hoặc cờ.

**Vùng cấm riêng của WP4**
- **Không có chế độ "watch"/daemon.** Chạy một lần, thoát. Heartbeat vi phạm §5.H.
- **Không đọc `package.json`/`pyproject.toml` để lấy `current_version`.** Không phải việc của doctor; kéo theo parse nhiều định dạng.
- **Không tích hợp `gh repo view` để kiểm visibility.** Là ý hay (gotcha #14) nhưng gọi mạng, cần auth, ngoài "chỉ đọc đĩa". Idea Vault.
- **Không xuất CSV/HTML.** JSON + bảng (NG5).
- **Không chạy engine `--check` như tiến trình con cho từng repo** (67 tiến trình Node ≈ 67 × ~60 ms khởi động, và mất khả năng gộp findings). Gọi hàm trực tiếp.

---

## (c) Bảng phân loại lỗi + hành vi bắt buộc của bên gọi

| Loại | Dấu hiệu | Mã | Bên gọi (người / agent vận hành) phải làm |
| :--- | :--- | :-: | :--- |
| Dùng sai | thiếu `--root`; `--git-timeout abc` | 64 | sửa lệnh |
| Root không tồn tại / không đọc được | `[brain-doctor] root không tồn tại: <label>` | 3 | kiểm đường dẫn; **không** phải lỗi repo |
| Repo `BLOCKER` | BRN-001/004/008 | 2 | Repo chưa não hoá hoặc não hỏng nặng — xử **từng repo bằng tay/agent tại repo**, theo quy trình #06 (stage tường minh nếu repo bẩn). **CẤM** vòng lặp tự động chạy engine ghi trên danh sách này (NG4) |
| Repo `ERROR` | BRN-002/003/006/007/009/010/012 | 2 | Thường là kẹt version cũ → tại repo chạy `init_brain.js --dry-run` xem diff, rồi chế độ ghi nếu repo sạch |
| Repo `WARNING` | BRN-005/011/013/014/015 | 1 | Không khẩn; BRN-014/015 là thông tin cấu trúc, **không suy ra repo hỏng** |
| `SCAN_ERROR` | `scan_error` có nội dung | 2 | Thường EACCES/symlink chết/đường dẫn quá dài (Windows MAX_PATH) — kiểm tay; báo cáo phần còn lại vẫn hợp lệ |
| Timeout git | `head=timeout` | 1 | Repo lớn hoặc đĩa chậm — tăng `--git-timeout` hoặc `--no-git`; không phải lỗi não |
| Không ghi được `--json` | `[brain-doctor] không ghi được báo cáo` | 3 | thư mục đích không tồn tại — bảng đã in vẫn dùng được |

---

## (d) Số đo / bằng chứng nghiệm thu

| # | Bằng chứng | Cách đo | Ngưỡng |
| :-- | :--- | :--- | :--- |
| P04-E1 | Fixture `fleet/`: bảng đúng như a.3 về **tập mã** từng repo (không so khoảng trắng), `exit=2` | `tests/doctor/fleet.test.js` | khớp 10/10 repo |
| P04-E2 | `fleet-report.json` hợp lệ theo schema §7 (validator tối giản tự viết) và `exit_code` trong file = mã thoát tiến trình | `schema.test.js` | hợp lệ |
| P04-E3 | Mã thoát 0/1/2/3/64 mỗi mã ≥1 test; ca **3≠2**: fleet có lỗi + `--json` vào thư mục không tồn tại ⇒ 3 | `fleet.test.js` | 5/5 |
| P04-E4 | Ca git thật (skip nếu không có git, CI bắt buộc có): unborn ⇒ `head=unborn` + BRN-015; ref hỏng ⇒ `head=broken` + BRN-015; **các mã BRN-001..013 của repo đó vẫn được tính đúng** (không bị git che) | `git-cases.test.js` | đúng |
| P04-E5 | **Quét thật trên kho của máy user** (chỉ đọc, `--json` vào scratchpad): thời gian ≤ **40 s** với git, ≤ **10 s** với `--no-git`; số `CLEAN` = **66**, đúng **1** repo `ERROR` với tập mã `{BRN-006, BRN-007, BRN-010, BRN-011}` (repo cách ly kẹt `1.2.0` — brief mục E) | chạy tay; ghi **số** vào TESTING-ACCEPTANCE, **không** ghi tên | ≤40 s; 66/1 |
| P04-E6 | Perf trên fixture: 10 repo ≤ 3 s với git (`perf.test.js` — local gate; CI chỉ ghi số) | test | ≤3 s |
| P04-E7 | Grep cấm: `recursive\|rev-list\|fsck\|writeFileSync\|mkdirSync\|unlinkSync\|renameSync` trong `brain_doctor.js` = 0 (trừ `writeText` cho `--json`) | `tests/hygiene` | 0 |
| P04-E8 | Chạy doctor **từ bản global đã deploy** (WP3) trên `tests/fixtures/fleet/` ⇒ kết quả giống bản hub (A2: chạy từ bất kỳ đâu) | chạy tay | giống |
| P04-E9 | Output không chứa đường dẫn tuyệt đối: regex `[A-Za-z]:\\\|/home/\|/Users/` trên stdout + JSON = 0 | test | 0 |
