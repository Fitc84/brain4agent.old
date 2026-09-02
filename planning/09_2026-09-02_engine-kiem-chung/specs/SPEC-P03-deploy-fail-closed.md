# SPEC-P03 — WP3: `deploy_skills.ps1` Fail-Closed + Đối Chiếu SHA-256 + `pwsh` + Không BOM 🔴

**Mục tiêu:** diệt gotcha #12 (bản global kẹt version → thoái lui thầm lặng) và D1/D5. Sau WP3, câu "đã chạy deploy rồi" **đồng nghĩa** với "hash nguồn = hash đích, file lệnh không BOM" — vì script tự kiểm và tự fail.

---

## (a) Hợp đồng chính xác

### a.1. Tham số, mã thoát: 01-CONTRACTS §5, §6 (cột deploy). Cấu trúc script bắt buộc

```text
1  #requires -Version 7.0
2  [CmdletBinding()] param([switch]$DryRun, [switch]$VerifyOnly, [string]$GeminiSkillsRoot = (Join-Path $HOME '.gemini/config/skills'), [string]$ClaudeCommandsRoot = (Join-Path $HOME '.claude/commands'))
3  Set-StrictMode -Version Latest
4  $ErrorActionPreference = 'Stop'
5  [Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)      # in tiếng Việt đúng trên console Windows
6  $exit = 3                                                                  # mặc định: tự lỗi — chỉ hạ xuống khi đi hết đường thành công
7  try {
8    # B1. Nguồn: $hubRoot = Split-Path -Parent $PSScriptRoot (giữ dòng 6); 2 thư mục skill (giữ dòng 7–8) — thiếu ⇒ Write-Error; $exit = 1; throw
9    # B2. Kế hoạch: liệt kê đệ quy MỌI file trong 2 thư mục nguồn (Get-ChildItem -File -Recurse -Force) → bảng { Rel, SrcHash }
10   # B3. Nếu -DryRun: in bảng + trạng thái đích (MATCH / MISSING / DIFF) ; $exit = 0 ; return
11   # B4. Nếu KHÔNG -VerifyOnly:
12   #      New-Item -ItemType Directory -Force đích ; Copy-Item -Recurse -Force -ErrorAction Stop (giữ ngữ nghĩa dòng 35–43)
13   #      Ghi file lệnh: [System.IO.File]::WriteAllText($cmdPath, $content, [System.Text.UTF8Encoding]::new($false))   # nội dung giữ NGUYÊN VĂN dòng 55–67, here-string nháy đơn @'...'@ (giữ bài học #08)
14   # B5. Đối chiếu (LUÔN chạy, kể cả -VerifyOnly):
15   #      với mỗi file nguồn: Get-FileHash -Algorithm SHA256 đích ; so; đếm $mismatch
16   #      file lệnh: 3 byte đầu ≠ EF BB BF ; không chứa byte 0x08 ; chứa chuỗi 'NÃO ĐÃ OK' ; chứa 'init_brain.js'
17   #      file THỪA ở đích (có ở đích, không có ở nguồn): liệt kê dạng WARNING — KHÔNG xoá
18   #      $mismatch -gt 0 ⇒ $exit = 2 ; else $exit = 0
19   # B6. Chỉ khi $exit -eq 0: in banner 'HOÀN TẤT ĐỒNG BỘ ... THÀNH CÔNG' (giữ chữ dòng 79)
20 } catch { Write-Error "❌ $($_.Exception.Message)" ; if ($exit -eq 0) { $exit = 3 } }
21 exit $exit
```

### a.2. Bảng in ra (stdout, một dòng mỗi file)

```text
STATUS   SHA256(8)  REL
MATCH    3f9c1a2b   .xay-dung-nao-bo/scripts/init_brain.js
MATCH    77aa01de   .xay-dung-nao-bo/scripts/brain_doctor.js
MATCH    5b1e...    .xay-dung-nao-bo/SKILL.md
MATCH    ...        .compact/SKILL.md
CMD-OK   -          xay-dung-nao-bo.md  (no-BOM, no-0x08, has 'NÃO ĐÃ OK')
EXTRA    -          compact.md.disabled-by-plan07   # WARNING: có ở đích, không có ở nguồn — giữ nguyên
SUMMARY  files=4 match=4 diff=0 missing=0 extra=1 cmd=ok exit=0
```

Dòng `SUMMARY` là **hợp đồng máy đọc** (test parse dòng này). Mọi trường: `files`, `match`, `diff`, `missing`, `extra`, `cmd` ∈ {`ok`,`bom`,`ctrl`,`missing-token`,`missing`}, `exit`.

### a.3. `package.json`

```json
"deploy":        "pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/deploy_skills.ps1",
"deploy:verify": "pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/deploy_skills.ps1 -VerifyOnly",
"deploy:dry":    "pwsh -NoProfile -ExecutionPolicy Bypass -File scripts/deploy_skills.ps1 -DryRun"
```
(`powershell` ở dòng `deploy` hiện tại → `pwsh`. D5: `powershell` 5.1 + `Set-Content -Encoding UTF8` luôn kèm BOM; máy có `pwsh` 7.6.5.)

---

## (b) Luật BẮT BUỘC / CẤM + vùng cấm riêng

**BẮT BUỘC**
1. `#requires -Version 7.0` là dòng đầu tiên (sau comment). Chạy bằng `powershell.exe` 5.1 phải **chết ngay** với thông báo của PowerShell — đó là fail-closed đúng nghĩa, không cần code.
2. `$ErrorActionPreference = 'Stop'` **và** `-ErrorAction Stop` tường minh trên `Copy-Item`, `New-Item`, `Get-FileHash` (hai lớp: ai xoá một lớp vẫn còn lớp kia).
3. Biến `$exit` khởi tạo **3**; chỉ được gán `0` **sau** bước đối chiếu B5 thành công. Không có đường nào tới banner thành công mà không qua B5.
4. Ghi file văn bản **duy nhất** bằng `[System.IO.File]::WriteAllText(path, content, UTF8Encoding($false))`. Grep `Set-Content`/`Out-File`/`Add-Content` trong script = **0**.
5. Here-string nội dung Markdown: **nháy đơn** `@'…'@` (gotcha #13).
6. Đường dẫn đích mặc định xây từ `$HOME` — grep chuỗi `Users\` hoặc `C:\` trong script = **0** (repo PUBLIC; xoá đường dẫn cứng dòng 10–11).
7. Mỗi lần deploy in đủ bảng a.2; `SUMMARY` luôn là dòng cuối của stdout trước banner.
8. `-VerifyOnly` **không** tạo thư mục, không chép, không ghi file lệnh — kiểm bằng test đo mtime đích.

**CẤM**
1. **CẤM** `Remove-Item` bất kỳ đâu trong script. **CẤM** `robocopy /MIR`, `rsync --delete`. File thừa ở đích chỉ được **liệt kê**.
2. **CẤM** sinh file lệnh có tên trùng lệnh built-in của Claude Code (`compact`, `clear`, `help`, `model`, `init`, `context`, `config`, `cost`, `doctor`, `login`, `logout`, `memory`, `review`, `status`, `terminal-setup`, `vim`, `bug`, `pr-comments`, `release-notes`). Script có mảng cấm và kiểm tên trước khi ghi (gotcha #13).
3. **CẤM** ghi ra ngoài `$GeminiSkillsRoot` và `$ClaudeCommandsRoot`.
4. **CẤM** đổi nội dung file lệnh `xay-dung-nao-bo.md` ngoài việc mã hoá (giữ nguyên văn dòng 55–67) — file lệnh là giao diện người dùng đã quen.
5. **CẤM** deploy trong CI (không có thư mục global trên runner; NG4). CI chỉ chạy `-DryRun` với hai root trỏ vào `$RUNNER_TEMP`.

**Vùng cấm riêng của WP3**
- **Không đổi cơ chế "copy" thành symlink/junction từ global → hub.** Nghe hay (hết kẹt version) nhưng: (1) junction trỏ vào working tree của hub ⇒ mọi thay đổi chưa commit lập tức thành "bản global" cho 66 repo; (2) bẫy E.6/E.3 với đường dẫn Windows; (3) mất khả năng rollback theo bản. Ghi Idea Vault.
- **Không ký số / không kiểm chữ ký.** Đích là máy cá nhân; SHA-256 nguồn↔đích đủ cho mục đích "không kẹt".
- **Không tự động chạy deploy trong hook git (post-commit).** Bump engine mà deploy tự động ⇒ bản global đổi khi hub còn đang dở việc. Deploy là **nút người bấm** (OPERATIONS §5).
- **Không hỗ trợ PowerShell 5.1 bằng nhánh tương thích.** Bộ ghi .NET không BOM chạy được trên 5.1, nhưng cho phép 5.1 là mở lại đường cho `Set-Content` trở lại về sau. Một shell, một hành vi.

---

## (c) Bảng phân loại lỗi + hành vi bắt buộc của bên gọi

| Loại | Dấu hiệu | Mã | Bên gọi phải làm |
| :--- | :--- | :-: | :--- |
| Thiếu `pwsh` / chạy bằng 5.1 | `The script 'deploy_skills.ps1' cannot be run because it contained a "#requires" statement for Windows PowerShell 7.0` | ≠0 (PowerShell tự) | Cài PowerShell 7 hoặc gọi `pwsh`. **Không** sửa `#requires` |
| Thiếu nguồn | `❌ Không tìm thấy thư mục nguồn` | 1 | Đang đứng sai hub / working tree hỏng — kiểm `git status` |
| Lệch hash sau chép | `DIFF`/`MISSING` trong bảng; `SUMMARY ... diff>0` | 2 | **Không** deploy lại mù. Soi file lệch: thường là tiến trình khác đang giữ file ở đích, hoặc antivirus. Đóng tiến trình, chạy `deploy:verify`, rồi deploy lại |
| File lệnh có BOM/0x08 | `cmd=bom` / `cmd=ctrl` | 2 | Ai đó đã đổi bộ ghi — kiểm BẮT BUỘC 4, 5 |
| Exception | `❌ …` + exit 3 | 3 | Lỗi hạ tầng (quyền, đĩa) — sửa môi trường; không sửa script để "nuốt" lỗi |
| `EXTRA` | dòng `EXTRA` | 0 (warning) | Đọc danh sách; file `*.disabled-by-plan07` là cố ý (#08). File lạ khác ⇒ người quyết xoá tay |

---

## (d) Số đo / bằng chứng nghiệm thu

| # | Bằng chứng | Cách đo | Ngưỡng |
| :-- | :--- | :--- | :--- |
| P03-E1 | **Trước** deploy WP3 (engine mới chưa ra global): `npm run deploy:verify` ⇒ exit **2**, bảng có ≥1 `DIFF` (chính `init_brain.js`) và 1 `MISSING` (`brain_doctor.js`) | chạy tay, dán output vào TESTING-ACCEPTANCE | exit 2 |
| P03-E2 | **Sau** deploy: `npm run deploy:verify` ⇒ exit 0; `SUMMARY diff=0 missing=0 cmd=ok` | như trên | exit 0 |
| P03-E3 | 3 byte đầu file lệnh ở đích ≠ `ef bb bf`; đếm byte `0x08` = 0 | `od -An -tx1 -N3`; `grep -c $'\x08'` | đúng |
| P03-E4 | D1 fail-closed: test trỏ `-GeminiSkillsRoot` vào đường dẫn có **cha là file** ⇒ exit 3, stdout **không** chứa `THÀNH CÔNG` | `tests/deploy/deploy.test.js` | exit 3 |
| P03-E5 | Phát hiện lệch: deploy vào tmp ⇒ 0; sửa 1 byte file ở đích ⇒ `-VerifyOnly` ⇒ 2 với đúng 1 dòng `DIFF` | test | 2 |
| P03-E6 | `-VerifyOnly` không ghi: mtime mọi file đích trước = sau | test | bằng |
| P03-E7 | Chạy bằng `powershell.exe -File …` (5.1) ⇒ exit ≠ 0, không tạo/không sửa file nào ở đích | chạy tay trên máy user (có 5.1.26100) | ≠0, mtime bằng |
| P03-E8 | Grep script: `Set-Content\|Out-File\|Add-Content\|Remove-Item\|Users\\\|C:\\` = 0 dòng | `tests/hygiene` | 0 |
| P03-E9 | Đối chiếu hash **độc lập** (không dùng script): `Get-FileHash` từng file nguồn vs đích bằng lệnh tay ⇒ khớp 100% (gotcha #12 "đừng tin đã chạy deploy") | chạy tay | 100% |
