# 01-CONTRACTS — Hợp Đồng Bất Biến Chiến Dịch #06

## §1. Hợp đồng đích GIT (áp cho 67/67)

- `Test-Path <repo>\.git` = True (directory).
- `git -C <repo> rev-parse --show-toplevel` = chính đường dẫn repo.
- `git -C <repo> rev-parse HEAD` trả về SHA (≥1 commit, không unborn).
- Branch mặc định: giữ nguyên branch hiện có; repo init mới dùng `main`.
- KHÔNG cấu hình remote, KHÔNG push (user tự quyết remote sau).

## §2. Hợp đồng đích NÃO (áp cho repo phạm vi P04; kế thừa nguyên văn 01-CONTRACTS #05)

`AGENTS.md` (nguồn chân lý) + `CLAUDE.md` shim ≤10 dòng + đúng 1 `brain4agent-v1.2.0.md` + `brain4agent/` 7 phân vùng nội dung THẬT + `memory/hot/{today.md, state.json}` (tail `0a`, 2 field version tách bạch) + `docs/` 1-1 nếu có tài liệu module. Cổng V1–V7 như #05.

## §3. GIAO THỨC CHỐNG LỘ KEY (bắt buộc trước MỌI `git add` trong chiến dịch)

Pattern secret chuẩn của chiến dịch (regex tên file):
`^\.env($|\..*)` (trừ `.example|.sample|.template`), `.*secret.*`, `.*credential.*`, `\.pem$`, `\.key$`, `.*token.*\.(json|txt)$`, `id_rsa.*`

Trình tự trên TỪNG repo:
1. **Trước add:** liệt kê file khớp pattern (đệ quy, trừ `node_modules|venv|.git`). Với mỗi file tìm thấy → xác nhận `.gitignore` đã che (`git check-ignore` từng file phải exit 0). Chưa che → THÊM dòng ignore tương ứng vào `.gitignore` (thao tác này được phép và bắt buộc — khác #05 vì đây là chiến dịch git do user ra lệnh).
2. **Dry-run:** `git add -A -n` — soi danh sách sẽ stage; có file khớp pattern → DỪNG repo đó, báo cáo.
3. **Sau stage, trước commit:** `git diff --cached --name-only` grep pattern = 0 khớp.
4. **Sau commit:** `git show --name-only HEAD` grep pattern = 0 khớp — ghi output làm bằng chứng.
5. File secret ĐÃ bị track từ trước (commit cũ của user): KHÔNG đụng, KHÔNG untrack hộ — chỉ ghi vào báo cáo mục "secret đã tracked sẵn, user cân nhắc".

## §4. `.gitignore` BASELINE (cho repo init mới / repo unborn chưa có `.gitignore`)

Repo ĐÃ có `.gitignore`: giữ nguyên, chỉ BỔ SUNG dòng còn thiếu theo §3.1. Repo CHƯA có: ghi baseline sau (điều chỉnh theo tech stack thấy trong repo):

```gitignore
# Secrets
.env
.env.*
!.env.example
*.pem
*.key
# Dependencies / build
node_modules/
venv/
.venv/
__pycache__/
dist/
build/
.next/
# OS / editor noise
Thumbs.db
.DS_Store
*.log
*.tmp
```

## §5. Hợp đồng commit

- Commit baseline P01/P02: `chore: establish git baseline (initial commit as-is)` — thân message ghi số file, và dòng `secret-scan: clean` kèm số file bị ignore. TUYỆT ĐỐI không trộn thay đổi khác vào commit baseline.
- Commit P03 (dirty lành tính): message mô tả ĐÚNG thay đổi thật (đọc diff rồi viết), không dùng message chung chung.
- Commit P04 (não hóa): khuôn `feat(brain): adopt brain template v1.2.0 ...` như #05.
- 100% tiếng Anh, Conventional Commits, kết thúc `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. KHÔNG push.

## §6. Hợp đồng kiểm chứng & rollback

- Script kiểm kê (như P00) chạy lại sau mỗi phase; kết quả dán vào SPEC tương ứng.
- Repo chưa có commit/chưa có git: backup thư mục sắp sửa vào `scratchpad/backup-plan06-<repo>/` trước khi chạm.
- Sự cố giữa chừng: khôi phục backup (repo không git) hoặc `git restore` (repo có git), ghi FAIL + log vào SPEC, DỪNG repo đó.
- Sai lệch hợp đồng chỉ được phép khi quy ước sẵn có của repo đích mâu thuẫn với hợp đồng (tiền lệ #05: `raw/` vs `scratch/`) — bắt buộc ghi rõ "lệch có chủ đích + lý do" vào SPEC và báo cáo.
