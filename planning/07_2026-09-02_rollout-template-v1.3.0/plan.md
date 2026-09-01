# KẾ HOẠCH: PHỦ KHUNG NÃO v1.3.0 RA TOÀN KHO + VÁ BUG NHÂN ĐÔI LUẬT (#07)

- **STT KẾ HOẠCH:** #07
- **TRẠNG THÁI:** ✅ ĐÃ HOÀN THÀNH
- **THỜI GIAN BẮT ĐẦU:** 2026-09-02
- **THỜI GIAN HOÀN TẤT:** 2026-09-02
- **PHIÊN BẢN MỤC TIÊU:** hub `v1.5.0 → v1.5.1` (PATCH); `BRAIN_TEMPLATE_VERSION` giữ nguyên `1.3.0`

> **Vì sao gói này chỉ có `plan.md`, không có `specs/`:** theo chính luật SPEC PACKAGE vừa ban hành
> (`AGENTS.md` §3 mục **2.5**), đợt `PATCH` ≤1 ngày công được phép chỉ có `plan.md` miễn đủ
> Metadata + nhật ký quyết định + checklist. Đây là đợt vá lỗi + phủ bản vá, không thêm tính năng.

---

## 🎯 1. Bối Cảnh & Vấn Đề

Ngày 2026-09-01 lúc 22:23, **một phiên agent khác** commit `529ca8a` nâng hub lên `v1.5.0` và nâng
`BRAIN_TEMPLATE_VERSION` **1.2.0 → 1.3.0**, ban hành luật **SPEC PACKAGE** (cấm `plan.md` phẳng,
bắt buộc thêm `OPERATIONS.md` + `TESTING-ACCEPTANCE.md`).

Hệ quả: chiến dịch #06 vừa phủ xong chuẩn **1.2.0** cho 66/67 repo thì **chuẩn dịch chuyển ngay sau đó**.
Đo lại đầu phiên 2026-09-02: **chỉ 2/67 repo đạt v1.3.0** (`brain4agent.old`, `router4vn`) — **64 repo lạc hậu**.

## 🧾 2. Nhật Ký Quyết Định (có mốc thời gian)

| Thời điểm | Quyết định | Lý do |
| :--- | :--- | :--- |
| 09-02 | **Deploy lại engine ra global TRƯỚC khi rollout** | Bản global còn kẹt `1.2.0` và không có luật SPEC PACKAGE. Bước 0 trong mọi `memory-distill.txt` trỏ tới bản global ⇒ agent nào chạy nó sẽ **kéo ngược repo về 1.2.0** (engine cũ xoá marker "lỗi thời" 1.3.0 và ghi lại marker 1.2.0). Đây là lỗi thoái lui thầm lặng, phải chặn trước. |
| 09-02 | **Vá engine: regex khớp khối luật cũ phải CRLF-tolerant** | Regex đời trước dùng `\n` cứng nên thất bại trên file CRLF → rơi vào nhánh CHÈN THÊM thay vì THAY THẾ. |
| 09-02 | **Thêm chẩn đoán `hasNoDuplicatePlanningLaw` vào `isFullyStandard`** | Không có nó, repo bị nhân đôi luật vẫn được engine báo `NÃO ĐÃ OK` — sai lệch âm thầm, đúng loại lỗi mà hiến pháp cấm. |
| 09-02 | **GIỮ `BRAIN_TEMPLATE_VERSION = 1.3.0`, chỉ bump hub PATCH** | Nội dung template sinh ra cho ca ĐÚNG không đổi; đây là sửa lỗi áp dụng, không phải đổi chuẩn. |
| 09-02 | **Repo đang bẩn: stage TƯỜNG MINH, không `git add -A`** | Kế thừa gotcha #10 của #06. |
| 09-02 | **`control-gpm` + `GramPilot`: chỉ commit marker, KHÔNG commit `AGENTS.md`/`state.json`** | Hai file đó nằm trong danh sách bẩn của chủ dự án; commit sẽ nuốt việc đang dở. Chấp nhận đạt chuẩn một phần và ghi rõ. |
| 09-02 | **`CV`: không commit `AGENTS.md`** | File đó là bản untracked chủ dự án vừa tạo, chưa quyết có thay `agent.md` hay không (treo từ #06). |
| 09-02 | **KHÔNG đụng `aiedu4vn`** | Luật thường trực ⛔ từ #04, chưa được gỡ. |
| 09-02 | **KHÔNG đụng `brain4agent` (mới)** | Quyết định cách ly #06 mục 5.1, chưa được gỡ. |

### Quyết định bị thay thế

- **#06 chốt "não chuẩn = template v1.2.0"** → **THAY BẰNG** "template v1.3.0" kể từ `529ca8a` (2026-09-01 22:23).
  Số liệu "66/67 đạt chuẩn" của #06 vẫn ĐÚNG tại thời điểm đo, nhưng không còn là thước đo hiện hành.
- **#06 dùng cổng "AGENTS.md phải chỉ-thêm (0 dòng xoá)"** → **THAY BẰNG** cổng "không mất thông tin":
  kiểm mọi token bắt buộc (`00-ARCHITECTURE.md`, `01-CONTRACTS.md`, `SPEC-Pxx-[Name].md`, `OPERATIONS.md`,
  `TESTING-ACCEPTANCE.md`, `specs/`, `plan.md`, `[STT]_[YYYY-MM-DD]_[Ten-Ngan]`, `SPEC PACKAGE`) vẫn còn sau khi vá.
  Lý do: bản vá v1.3.0 **thay thế** khối luật cũ bằng khối bao trùm nó, nên xoá dòng là ĐÚNG.

## 📋 3. Checklist Thực Thi

- [x] **P01 🔴 Đo hiện trạng theo chuẩn MỚI** — script `inv13.ps1` (marker + `brain_template_version` + có chuỗi `SPEC PACKAGE`). Kết quả: 2 đạt / 64 lạc hậu / 1 cách ly.
- [x] **P02 🔴 Đồng bộ engine ra global** — backup trước, chạy `scripts/deploy_skills.ps1`, nghiệm thu `diff nguồn↔deploy = RỖNG`.
- [x] **P03 🔴 Vá engine** — CRLF-tolerant regex + nhánh dọn khối cũ + chẩn đoán `hasNoDuplicatePlanningLaw`. `node --check` sạch.
- [x] **P04 🟠 Rollout 54 repo sạch** → 51 commit.
- [x] **P05 🟠 Dọn 33 repo bị nhân đôi luật** → 33 commit.
- [x] **P06 🟠 Xử 8 repo đang bẩn bằng stage tường minh** → 8 commit, việc user nguyên vẹn 8/8.
- [x] **P07 🟢 Đo lại + đồng bộ não hub + đóng kế hoạch.**

## 🛡️ 4. Cổng Nghiệm Thu (Exit Gates)

| Gate | Kết quả | Môi trường |
| :--- | :--- | :--- |
| Không repo nào còn 2 khối luật planning mâu thuẫn | **0/67** ✅ | local |
| Không mất thông tin trong `AGENTS.md` sau khi vá | 9 token bắt buộc còn đủ ở mọi repo ✅ | local |
| Engine idempotent (chạy lần 2 không đổi file) | ✅ | local |
| Hồi quy: repo đã đúng + hub không bị đụng | ✅ | local |
| `diff` engine nguồn ↔ bản deploy global | **RỖNG** ✅ | local |
| Não đạt chuẩn v1.3.0 | **65/67** ✅ | local |
| 0 secret trong mọi commit mới | ✅ | local |
| KHÔNG `git push` | ✅ | local |
| ⬜ Xác nhận trên máy/tài khoản khác | chưa | server/remote |

## 🐛 5. Bug Đã Tìm Ra Trong Đợt Này

1. **Engine — regex chỉ khớp LF** (nghiêm trọng): trên `AGENTS.md` CRLF, nhánh thay-thế trượt và rơi
   xuống nhánh chèn-thêm ⇒ **33 repo có cả khối luật cũ lẫn mới cùng sống**. Đã vá + dọn hết.
2. **Engine — `isFullyStandard` không phát hiện tình trạng trên**: repo bị nhân đôi luật vẫn được báo
   `NÃO ĐÃ OK`. Đã thêm biến chẩn đoán.
3. **Bản deploy global kẹt ở 1.2.0**: mọi `memory-distill.txt` bảo agent chạy bản global đó ⇒ nguy cơ
   **thoái lui thầm lặng** toàn hệ sinh thái. Đã deploy lại, `diff` rỗng.
4. **Lỗi của chính orchestrator (ghi để tự răn):** cổng kiểm "AGENTS.md phải chỉ-thêm" parse `numstat`
   bằng `-split` trên mảng nên lấy nhầm cột → báo động giả trên 35 repo. Cùng họ với gotcha #6.
   Bài học đã ghi: **cổng an toàn phải parse bằng regex có neo, và phải in ra dữ liệu thô để soi**.

## 📌 6. Còn Treo (chờ user, không vướng kỹ thuật)

1. `aiedu4vn` — gỡ luật ⛔ thì sẽ vá được ngay (1 lệnh).
2. `brain4agent` (mới) — 3 câu hỏi ở `planning/06_*/specs/SPEC-P05-ca-dac-biet.md` mục 1.
3. `control-gpm`, `GramPilot`, `CV` — commit việc đang dở rồi chạy lại `init_brain.js` để nhận nốt
   luật SPEC PACKAGE + `brain_template_version`.
4. Toàn bộ mục Active trong `brain4agent/roadmap.md` (xoay khoá, tắt tiến trình nhân bản, repo lồng nhau).
