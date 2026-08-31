# 00-ARCHITECTURE — Kiến Trúc Chiến Dịch Não Hóa Nhóm C

## 1. Vấn đề

6 repo có `brain4agent/` nhưng không có `AGENTS.md` → không agent nào nạp được luật (Claude Code còn tệ hơn: cần `CLAUDE.md`). Não của chúng sinh từ các thế hệ template khác nhau (kể cả `.brain-build` cổ) nên **nội dung đúng nhưng nằm sai schema**. Chỉ chạy `init_brain.js` đè lên là KHÔNG đủ và NGUY HIỂM về logic:

- Engine chỉ sinh file THIẾU theo tên chuẩn — nó không biết `core/memory-distill.txt` (Audit) hay `gotchas.md` (Agent to Product) chính là dữ liệu của phân vùng chuẩn. Kết quả nếu chạy thẳng: **não song trùng** — một bộ file chuẩn RỖNG do engine sinh nằm cạnh bộ file cũ ĐẦY dữ liệu, agent đời sau đọc bộ rỗng và mất trí nhớ dự án.
- Engine tự đổi tên `DOCS`→`docs`, `Plan`→`planning` (đã khảo sát: 6 repo này không có, nhưng phải re-check ngay trước giờ chạy).

## 2. Nguyên tắc kiến trúc: DI TRÚ TRƯỚC — ENGINE SAU — KIỂM SAU CÙNG

```text
[Pre-flight]           [Migrate]                [Engine]              [Verify]
git sạch?         →  backup brain4agent/   →  init_brain.js     →  chạy lần 2 = NÃO ĐÃ OK
thư mục hoa?         di trú nội dung cũ       (chỉ còn sinh          + 7 điều Acceptance Gate
schema lạ nào?       vào ĐÚNG phân vùng       những gì thiếu)        + commit (không push)
                     chuẩn (git mv)
```

Vai trò tách bạch: **con người/agent di trú NGỮ NGHĨA** (file nào là gotchas, file nào là roadmap...), **engine chỉ lấp cấu trúc** (AGENTS.md, CLAUDE.md, marker, memory/hot, file phân vùng còn thiếu). Không bao giờ để engine "đoán" ngữ nghĩa.

## 3. Phân lớp di trú (quyết định độ phức tạp từng SPEC)

| Lớp | Đặc điểm | Chiến lược | Repo |
| :--- | :--- | :--- | :--- |
| **A** | Não đã đúng tên 7 phân vùng | Chạy engine gần như trực tiếp | block-ads-fb-v2 |
| **A+** | Chuẩn nhưng có docs module nằm trong não | Tách docs module ra `docs/` (luật 1-1 §5.C) rồi chạy engine | dreamteam4vn |
| **B** | Não lồng thư mục phi chuẩn | Ánh xạ file → phân vùng chuẩn bằng `git mv`, gỡ thư mục lồng | Audit |
| **B+** | Não rỗng nhưng dự án có governance riêng sống ngoài não | Hút tri thức từ governance riêng vào não; BẢO TỒN hệ riêng | reverse Claude |
| **C** | Brain OS legacy đầy đủ đang sống | **Cộng sinh**: giữ nguyên hệ legacy, thêm lớp chuẩn, AGENTS.md mô tả cả hai | Agent to Product |
| **D** | Git chưa dùng được (unborn/dirty) | GATE — user xử lý git trước, sau đó áp lớp B | CausalAgent |

## 4. Quy trình chuẩn 6 bước cho MỌI repo (SPEC chỉ đặc tả phần KHÁC BIỆT)

1. **Pre-flight:** `git status` sạch; không `DOCS`/`Plan` hoa; `rev-parse --show-toplevel` trùng chính repo (bài học gotcha #4).
2. **Backup:** copy nguyên `brain4agent/` (+ file luật riêng nếu SPEC nêu) → `scratchpad/backup-plan05-<repo>/`.
3. **Migrate:** thực hiện bảng ánh xạ trong SPEC bằng `git mv` (giữ history); nội dung cần GỘP (không chỉ move) thì ghi rõ trong SPEC từng đoạn gộp đi đâu.
4. **Engine:** `node "<hub>\.agents\skills\.xay-dung-nao-bo\scripts\init_brain.js" "<repo>"`.
5. **Hoàn thiện ngữ nghĩa:** điền `memory-distill.txt`/`index.md`/`project-intro.md` mới sinh (nếu engine vừa tạo rỗng) bằng nội dung thật rút từ tài liệu đã di trú — não hóa mà distill rỗng là não giả.
6. **Verify + Commit:** 7 điều của Acceptance Gate trong `plan.md`; commit tiếng Anh; KHÔNG push.

## 5. Bất biến an toàn (không SPEC nào được vượt)

- **Không xóa nội dung** — chỉ `git mv`, gộp có ghi vết, hoặc archive vào `archive/` của chính repo đó.
- **Không push, không `git init`, không tạo commit đầu tiên của repo** (quyền của user).
- **Không đụng `aiedu4vn`**, không đụng repo ngoài danh sách.
- Repo có hệ governance riêng đang sống (P04, P05): hệ đó là **tài sản**, không phải rác — AGENTS.md mới phải TRỎ tới nó, không thay thế nó.
- Mỗi repo một commit riêng, làm tuần tự, repo nào lỗi thì dừng repo đó báo user — không lan sang repo khác.
