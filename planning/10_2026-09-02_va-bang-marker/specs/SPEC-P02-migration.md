# SPEC-P02 — Migration 1.3.0 (không mốc) → 1.4.0 (có mốc) (WP1)

Hợp đồng: 01-CONTRACTS §2, §3, §5, §10. Thuật toán: SPEC-P01 §a.3–a.4. Đây là **đường MỘT CHIỀU duy nhất**; không có "đường cũ" (C11).

## §1. Thứ tự quyết định cho từng khối (Đ3 — `probe` là bắt buộc)

```
1. findBlock(id)   → 'malformed' ⇒ BRN-016, bỏ qua khối · tìm thấy ⇒ inner === body ? no-op : sync
2. findLegacy(id)  → khớp NGUYÊN VĂN thân luật cũ ⇒ adopt (bọc mốc tại chỗ, thay bằng body)
3. probe ∈ outside → CÓ ⇒ người đã sửa tay ⇒ BRN-016, KHÔNG GHI, KHÔNG CHÈN
4. còn lại         → add (phụ lục cuối file)
```

Bước `supersedes` (gỡ nguyên văn khối luật đã bị thay thế) **không cài ở #10** (TQ5): đo 2026-09-02 trên 65 repo vệ tinh 1.3.0 + hub = **0** repo còn `Cấu trúc Thư mục Kế hoạch Chuẩn (Spec-First)`. Repo nào còn ⇒ BRN-003 không fixable (người gỡ). ⚠️ user có thể muốn mở lại ở #11 kèm bằng chứng có repo cần.

**Vì sao bước 3 không được bỏ (bằng chứng, không phải giả định):** nguyên mẫu R2 khi thiếu bước 3 đã chèn bản máy cạnh bản người sửa ⇒ hai luật — đúng #07. Đo fleet: **5 repo** sẽ rơi vào bước 3 (bảng §2), tức 5 repo được cứu khỏi việc bị chèn bản thứ hai.

## §2. Phân bố trạng thái ĐO THẬT trên fleet (2026-09-02, chỉ đọc, không tên repo)

Quét 69 thư mục cùng kho với hub; 67 có `AGENTS.md`; loại 2 ca ngoại lệ (`brain_template_version` = `1.2.0` và `null` — Đ10) ⇒ **65 repo vệ tinh 1.3.0** (+ hub = 66). 1 repo CRLF. 0 repo có mốc. 12 repo có tiêu đề phụ lục cũ `[PHỤ LỤC TỰ ĐỘNG VÁ] … SPEC PACKAGE bắt buộc` (gotcha #17) — không ảnh hưởng (tiêu đề không chứa probe).

| Khối | verbatim (→ `adopt`) | có dấu vết, không nguyên văn (→ BRN-016) | vắng (→ `add`) |
| :--- | --: | --: | --: |
| `boot` | 52 | **4** (1 bản có `\&`, 1 bản cắt ngắn câu, 2 bản khác đường dẫn) | **9** (chỉ có `xay-dung-nao-bo` ở luật J.4 — TQ8) |
| `spec-package` | 64 | **1** (đoạn luật không bắt đầu ở cột 0) | 0 |
| `root-marker` | 65 (63 + 2 mang lỗ version `1.3.0`) | 0 | 0 |
| `dual-entry` | 65 | 0 | 0 |
| `cold-memory` | — | 0 | 65 |
| `structural-extension` | — | 0 | 65 |

Tổ hợp theo repo: **49** S1 thuần (4 khối cũ đều `adopt`) · **9** `boot` add + 3 adopt · **4** `boot` BRN-016 · **1** `spec-package` BRN-016 · **2** root-marker adopt-qua-lỗ. ⇒ **60/65 repo hội tụ hoàn toàn tự động**, **5 repo** cần người (chính là ứng viên canary "sửa tay" ở OPERATIONS §5).

Hub: `boot` và `dual-entry` **không** nguyên văn (tuỳ biến riêng) ⇒ hub **bọc mốc bằng tay** và theo template (TQ1, SPEC-P03 §4).

Repo mẫu (đã có nội dung v1.4.0 do người vá tay, `state.json` còn 1.3.0, 0 HTML comment): 4 khối cũ `adopt`; `cold-memory` → `add` (probe của khối không trùng hàng bảng §2 của repo mẫu — cố ý, SPEC-P03 §1.2); `structural-extension` → **BRN-016** (văn bản repo mẫu có mốc lịch sử `kế hoạch #16`, `v1.10.0 → v1.17.0` — không nguyên văn). Xử tay ở sóng 2: thay mục 2 của §5.B bằng khối máy. **Đây là hành vi đúng của "nội dung mới / version cũ"**: engine không đoán, người quyết.

## §3. Máy trạng thái repo và diff kỳ vọng (Đ4 — thay "diff = 0")

| Trạng thái | Diff `AGENTS.md` lần chạy ĐẦU | Lần THỨ HAI | Mã thoát lần đầu |
| :-- | :--- | :-- | :-: |
| **S0** thư mục trống | file mới = `renderFullAgentsMd()` | 0 | 0 |
| **S1** văn bản chuẩn 1.3.0, chưa mốc (49 repo) | `+12` dòng mốc (4 khối × 2 + 2 khối mới × 2) · `−1/+1` dòng `boot` (thân đổi) · `−1/+1` dòng `root-marker` (bỏ ví dụ version) · `+4` phụ lục (`---`, tiêu đề, 2 dòng trống) · `+N` thân 2 luật mới · **0 dòng xoá ngoài vùng luật** | **0** | 0 |
| **S1'** S1 nhưng `boot` vắng (9 repo) | như S1, `boot` vào phụ lục (thêm 3 dòng) | 0 | 0 |
| **S2** đã có mốc, thân đúng (hub sau WP2, F02 mới) | **0** | 0 | 0 |
| **S3** đã có mốc, thân cũ (bump về sau) | chỉ dòng **giữa** cặp mốc | 0 | 0 |
| **S4** sửa tay vùng luật, chưa mốc (5 repo) | **0** cho khối đó; khối khác như S1 | như lần đầu | **2** |
| **S5** mốc hỏng H1–H5 | **0** cho khối đó; khối khác bình thường | như lần đầu | **2** |

`deletions` trong S1 đúng bằng **2** (dòng `boot` cũ, dòng `root-marker` cũ) — cả hai đều là dòng `legacy` ⇒ A2 = 0 vi phạm.

## §4. Chứng minh idempotent — nghĩa vụ test, không phải lập luận suông

Lập luận (R2 §2.5): mỗi khối rơi vào một điểm bất động (`ok` không sinh op; `edited`/`malformed` không đổi text; `adopt`/`add`/`sync` đưa khối về `ok`). `findLegacy` không bao giờ chạy khi khối đã có ⇒ không có đường bọc mốc hai lần.

Nghĩa vụ **BẮT BUỘC** (T-M17): với mọi input trong tập {F02, F03, F04, F05, F06, F08, F09, F10, fleet/00, fleet/01, hub `AGENTS.md`, 5 chuỗi H1–H5, oracle T-M24}: `P(P(x)).content === P(x).content` **và** `P(P(x)).patches.length === 0` **và** `P(P(x)).broken` bằng `P(x).broken`.

## §5. Ranh giới xử lý — luật BẮT BUỘC / CẤM

- **BẮT BUỘC** `adopt` thay đúng đoạn `[start, end)`; phần còn lại của file **byte-identical** (T-M24 khẳng định bằng oracle).
- **BẮT BUỘC** phụ lục nối ở cuối file, dưới `---`, tiêu đề `APPENDIX_HEADING`; nếu tiêu đề đã có (từ lần add trước hoặc bump sau) thì **không** sinh tiêu đề thứ hai.
- **CẤM** suy diễn vị trí chèn từ tiêu đề mục (`### G.`, `## 📋 3.`, `<agent_startup_protocol>`).
- **CẤM** "sửa nhẹ" đoạn legacy để khớp (trim, bỏ `\&`, chuẩn hoá khoảng trắng) — không khớp là không khớp; 5 repo đi đường người.
- **CẤM** engine kiểm `git status` — đó là điều kiện tiên quyết của **kịch bản rollout** (OPERATIONS §5), không phải của engine.
- **Vùng cấm:** không thêm `legacy` biến thể "đoán" (vd bản có `\&`) — chỉ thêm `legacy` khi có bằng chứng engine từng viết ra đúng biến thể đó (lịch sử git engine: 1 biến thể/thân).

## §6. Bảng lỗi

| Tình huống | Hành vi | Người làm gì |
| :--- | :--- | :--- |
| S4 (BRN-016 `edited`) | không ghi khối; exit 2 | xoá đoạn đã sửa **hoặc** tự dán 2 dòng mốc quanh đoạn của mình (engine sẽ `sync` về body ở lần chạy sau — mất tuỳ biến, có chủ đích) |
| S5 (BRN-016 `malformed`) | như trên | sửa mốc về đúng 1 mở + 1 đóng |
| BRN-003 `extra` sau `adopt` | ghi khối; exit 2 | gỡ bản thừa ngoài khối |
| Repo ngoại lệ (1.2.0 / null) | **không chạy** (kịch bản rollout bỏ qua) | quyết định riêng ngoài #10 |

## §7. Bằng chứng nghiệm thu

| Chỉ số | Kỳ vọng | Nguồn |
| :--- | :--- | :--- |
| F09 (S1) RUN1: `patches` | `['adopt:boot','add:cold-memory','adopt:spec-package','add:structural-extension','adopt:root-marker','adopt:dual-entry']` (đúng thứ tự `RULE_BLOCKS`) | T-C30 |
| F09 RUN1: dòng xoá ngoài vùng luật | 0 | `diff-scope.js` |
| F09 RUN2 vs RUN3 | byte-identical, exit 0, `NÃO ĐÃ OK` | T-C30 |
| F10 (S4) `--check` | exit 2, BRN-016 `edited` = `['dual-entry']`, cây không đổi | T-C31 |
| Fleet `--dry-run` (sóng 0) | 60 repo 0 vi phạm A2/A3; 5 repo BRN-016 đúng tập khối như §2 | OPERATIONS §5 |
