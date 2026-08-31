# 01-CONTRACTS — Schema Đích & Các Hợp Đồng Bất Biến

## 1. Schema não đích (mọi repo sau não hóa PHẢI khớp 100%)

```text
<repo>/
├── AGENTS.md                        # Nguồn chân lý DUY NHẤT (luật chung template + phụ lục luật riêng dự án nếu có)
├── CLAUDE.md                        # Shim ≤10 dòng, chỉ @AGENTS.md
├── brain4agent-v1.2.0.md            # Marker — ĐÚNG MỘT file, do engine quản lý
├── brain4agent/
│   ├── memory-distill.txt           # Kernel < 100 dòng — nội dung THẬT, không phải template rỗng
│   ├── index.md                     # Router + Codebase Map
│   ├── project-intro.md
│   ├── roadmap.md                   # gồm Idea Vault
│   ├── changelog.md
│   ├── -known-gotchas.md
│   ├── -data-architecture.md
│   └── memory/hot/
│       ├── today.md
│       └── state.json               # có brain_template_version="1.2.0", current_version riêng của dự án, tail 0a
├── docs/                            # tài liệu module 1-1 (luật §5.C) — TẠO nếu SPEC yêu cầu
├── planning/                        # nếu dự án đã có hệ planning riêng: GIỮ NGUYÊN chỗ cũ, index.md trỏ tới
└── .agents/skills/                  # Single Skill Vault — skill sẵn có GIỮ NGUYÊN
```

## 2. Hợp đồng nội dung khi di trú (content contract)

- **C1 — Không mất chữ nào:** với mỗi file não cũ, đích đến thuộc đúng 1 trong 3: (a) `git mv` sang tên/vị trí chuẩn; (b) GỘP vào file chuẩn — toàn bộ nội dung được chép sang, file cũ xóa trong CÙNG commit (git history giữ vết); (c) archive vào `archive/legacy-brain/` của chính repo. SPEC phải liệt kê đủ, không có file "để tính sau".
- **C2 — Distill thật:** `memory-distill.txt` sau não hóa phải mô tả ĐÚNG dự án đó (role, tech stack, trạng thái) — cấm để nguyên template mẫu của engine.
- **C3 — Luật riêng bất tử:** repo có quy ước riêng đang vận hành (spec registry, task state machine, hooks...) → AGENTS.md thêm mục "PHỤ LỤC LUẬT RIÊNG DỰ ÁN" mô tả + trỏ tài liệu gốc. Chuỗi định danh cần grep-được sau khi xong được nêu trong từng SPEC.
- **C4 — `state.json` hai version tách bạch:** `brain_template_version` = 1.2.0 (khung não); `current_version` = version DỰ ÁN (lấy từ `package.json`/thực trạng, SPEC nêu giá trị khởi tạo).
- **C5 — Đường dẫn có dấu cách:** mọi lệnh với `Agent to Product`, `reverse Claude` phải bọc `"..."`.

## 3. Hợp đồng kiểm chứng (verification contract)

| # | Kiểm | Lệnh mẫu | Đạt khi |
| :--- | :--- | :--- | :--- |
| V1 | Idempotent | chạy `init_brain.js` lần 2 | log `🎉 NÃO ĐÃ HOÀN HẢO`, exit 0 |
| V2 | Dual entry | đọc `CLAUDE.md` | có `@AGENTS.md`, ≤10 dòng, không bọc backtick |
| V3 | Marker | `ls brain4agent-v*.md` | đúng 1 file, tên `brain4agent-v1.2.0.md` |
| V4 | State | tail byte `state.json` + parse JSON | `0a` + đủ 2 field version |
| V5 | Không mất nội dung | so danh sách file/`git status` trước-sau với bảng ánh xạ SPEC | mọi file cũ truy vết được; diff các file giữ-nguyên = 0 |
| V6 | Luật riêng còn sống | grep chuỗi định danh của SPEC trong `AGENTS.md` | mỗi chuỗi ≥ 1 |
| V7 | Root Clean | soi root sau khi xong | không file nháp mới; marker là ngoại lệ duy nhất được thêm |

## 4. Hợp đồng commit & rollback

- **Commit:** 1 repo = 1 commit, Conventional Commits tiếng Anh, khuôn: `feat(brain): adopt brain template v1.2.0 with content migration` + body liệt kê ánh xạ chính. KHÔNG push.
- **Rollback:** backup tại `scratchpad/backup-plan05-<repo>/` là đường lùi cấp 1 (nhanh); `git restore/reset` cấp 2. Repo lỗi giữa chừng: khôi phục từ backup, ghi SPEC trạng thái FAIL kèm log, DỪNG — không thử biến thể khác khi chưa hỏi user.
