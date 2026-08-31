# 00-ARCHITECTURE — Kiến Trúc Chiến Dịch Đồng Bộ 67 Repo

## 1. Vấn đề

Kho `.My-Repositories` có 67 repo với **hai trục lệch chuẩn độc lập**:

- **Trục GIT:** 9 repo không có `.git` riêng (git leo lên repo cha — vùng bị cha `.gitignore`, tức thật sự vô chủ về version control), 13 repo unborn (init rồi bỏ đó), 15 repo bẩn. Hệ quả đã đo được ở #04: audit hàng loạt cho số liệu sai, thao tác không có đường lùi.
- **Trục NÃO:** 21 repo chuẩn, 13 repo nửa vời (3 kiểu thiếu khác nhau), 32 repo trắng, 1 repo dùng file notice của framework làm `AGENTS.md`.

Sửa não mà git chưa lành là lặp lại đúng cái khó của #04/#05 (backup thủ công, subsequence check thay diff). Vì vậy:

## 2. Nguyên tắc trục: GIT TRƯỚC — NÃO SAU

```text
P01 git-init 9 repo      P02 first-commit 13 repo      P03 xử lý 15 repo bẩn
 (tạo .git + .gitignore    (commit "as-is" có kiểm       (bậc thang: lành tính
  + secret gate             secret gate)                   thì commit, khó thì báo)
  + commit baseline)
        └──────────────────────┴──────────────────────────────┘
                               ▼
              P04 não hóa phần còn thiếu (engine + di trú ngữ nghĩa)
              — mọi repo lúc này đều có git sạch để soi diff & commit riêng
                               ▼
              P06 nghiệm thu toàn kho bằng script kiểm kê tái chạy
```

Mọi commit baseline ở P01/P02 là commit "as-is" THUẦN (không trộn thay đổi não hóa) — để về sau `git diff` phân biệt được rõ "trạng thái vốn có" và "những gì chiến dịch này thêm".

## 3. Mô hình rủi ro và đối sách

| Rủi ro | Đối sách |
| :--- | :--- |
| Lộ secret khi first-commit hàng loạt (15 repo có `.env*`) | Giao Thức Chống Lộ Key (01-CONTRACTS §3) — bắt buộc, chặn TRƯỚC `git add` và kiểm LẠI sau khi stage |
| Commit nhầm rác nặng (`node_modules/`, `venv/`, `dist/`, `.next/`, `__pycache__/`) vào baseline | `.gitignore` baseline (01-CONTRACTS §4) ghi TRƯỚC commit đầu; dry-run `git add -A -n` soi danh sách trước khi add thật |
| Engine đổi tên `DOCS`/`Plan` làm đứt tham chiếu (5 repo có thư mục hoa) | P04 pre-flight grep tham chiếu tên cũ; có tham chiếu → xử lý tay trước, KHÔNG để engine tự đổi |
| Não song trùng khi engine chạy lên não/AGENTS cũ (gotcha 5b) | Phân lớp di trú như #05; 7 repo "A có, B không" phải ĐỌC `AGENTS.md` cũ trước — nếu là luật tuỳ biến thì vá bằng engine (nó chỉ THÊM), nếu là notice/file lạ thì dừng hỏi |
| File root "trông như rác" hoá ra là input của CI/gate (gotcha 5c) | Không dọn root ở P01/P02 (commit as-is); dọn chỉ diễn ra ở bước có git + grep tham chiếu |
| Đụng dự án sống đang dở tay | `brain4agent` mới + `aiedu4vn` cách ly tuyệt đối (SPEC-P05); repo dirty khó hiểu → chỉ báo cáo |
| Số lượng lớn (67) → sai sót lặp | Thực thi bằng script vòng lặp có cổng kiểm máy per-repo (như `rollout.ps1` #04) + subagent theo NHÓM, orchestrator kiểm chứng độc lập lại |

## 4. Tổ chức thực thi

- **Subagent theo nhóm, không theo repo** (9+13+14+~40 repo — per-repo sẽ quá nhiều): P01 một agent, P02 một agent, P03 một agent (bậc thang), P04 chia 2–3 agent theo lô danh sách. Model mạnh cho P01/P02/P03 và lô có di trú; model tầm trung cho lô "trắng hoàn toàn" (engine sinh mới, ít phán đoán).
- Mỗi agent nhận: danh sách repo đóng khung + hợp đồng + cấm tuyệt đối (push, `aiedu4vn`, `brain4agent` mới, repo hub).
- Orchestrator giữ script kiểm kê làm nguồn chân lý nghiệm thu, chạy lại sau mỗi phase.

## 5. Bất biến an toàn (không SPEC nào được vượt)

- KHÔNG push. KHÔNG xoá nội dung. KHÔNG đụng `aiedu4vn`, `brain4agent` (mới), repo hub ngoài hồ sơ kế hoạch.
- `git init` CHỈ trong phạm vi SPEC-P01 (user đã yêu cầu tường minh trong đề bài #06); không init repo nào ngoài danh sách 9.
- Secret: không đọc nội dung file secret, không ghi vào log/SPEC, không để lọt vào bất kỳ commit nào.
- Repo nào lệch khỏi hiện trạng đã khảo sát (số bẩn thay đổi lớn, xuất hiện thư mục lạ) → DỪNG repo đó, báo cáo, không tự chế.
