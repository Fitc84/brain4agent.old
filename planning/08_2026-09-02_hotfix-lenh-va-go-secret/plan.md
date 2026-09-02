# KẾ HOẠCH: HAI BẢN VÁ PATCH — GỠ LỆNH CHIẾM CHỖ `/compact` + GỠ BẢN ĐỒ SECRET TRƯỚC KHI PUSH (#08)

- **STT KẾ HOẠCH:** #08
- **TRẠNG THÁI:** ✅ ĐÃ HOÀN THÀNH
- **THỜI GIAN BẮT ĐẦU:** 2026-09-02
- **THỜI GIAN HOÀN TẤT:** 2026-09-02
- **PHIÊN BẢN MỤC TIÊU:** hub `v1.5.1 → v1.5.4`; `BRAIN_TEMPLATE_VERSION` **giữ nguyên `1.3.0`** (không đổi chuẩn khung não)

> **Vì sao gói này chỉ có `plan.md`, không có `specs/`:** theo `AGENTS.md` §3 mục **2.5**, đợt `PATCH`
> ≤1 ngày công được phép chỉ có `plan.md` miễn đủ Metadata + nhật ký quyết định + checklist. Đây là hồ sơ
> **lập bù** cho hai bản vá đã thực thi trong ngày, không thêm tính năng, không đổi contract.

---

## 🎯 1. Bối Cảnh

Hai sự cố phát sinh sau khi #07 đóng, cả hai đều do **user tự phát hiện**, không phải do cổng kiểm của agent:

1. **`/compact` chạy sai việc.** `scripts/deploy_skills.ps1` sinh `~/.claude/commands/compact.md`. Claude Code
   nạp mọi `*.md` trong thư mục đó thành slash-command, nên file này **đè lên lệnh `/compact` built-in**
   (nén cửa sổ ngữ cảnh). Nghi thức ghi não vốn đã có lệnh riêng `/luu-nao` ⇒ file kia vừa thừa vừa che
   tính năng gốc. Kèm theo: here-string **nháy kép** `@"..."@` làm backtick thành ký tự escape, hỏng nội dung
   mọi file lệnh được sinh ra.
2. **Kho công khai mang bản đồ vị trí secret của kho riêng tư.** Hub này là repo **PUBLIC**, nhưng tài liệu
   #06/#07 ghi bảng ánh xạ *repo → đường dẫn → loại khoá* của 6 dự án **PRIVATE**. Giá trị khoá không nằm
   trong repo, nhưng bảng đó là chỉ dẫn sẵn cho người tấn công.

## 🧾 2. Nhật Ký Quyết Định (có mốc thời gian)

| Thời điểm | Quyết định | Lý do |
| :--- | :--- | :--- |
| 09-02 | **Gỡ hẳn khối sinh `compact.md`**, không đổi tên thành lệnh khác | Nghi thức ghi não đã có `/luu-nao`; thêm một tên nữa chỉ làm rối. |
| 09-02 | File đã deploy **đổi tên** thành `compact.md.disabled-by-plan07` thay vì xoá | Đuôi khác `.md` nên không được nạp; giữ đường lùi. (`Remove-Item` cũng bị sandbox chặn.) |
| 09-02 | Mọi here-string nội dung tĩnh chuyển sang **nháy đơn** `@'...'@` | Backtick giữ nguyên nghĩa literal; nháy kép biến `` `b `` thành byte `0x08`. |
| 09-02 | **KHÔNG xoay 6 khoá đã lộ** (user quyết) | User chốt bỏ mục này. 6 repo liên quan đều PRIVATE. Chi tiết chuyển sang hồ sơ ngoài git. |
| 09-02 | **Viết lại 9 commit chưa push** bằng `git filter-branch` trước khi push | Sửa ở commit mới KHÔNG đủ: nội dung vẫn nằm trong diff các commit trước, `git log -p` đọc được hết. |
| 09-02 | Mỗi cặp thay thế phải **nằm trọn một dòng** | `--tree-filter` checkout theo `core.autocrlf` nên file có thể thành CRLF trong thư mục tạm; chuỗi tìm kiếm chứa ký tự xuống dòng sẽ trượt (cùng họ gotcha #11). |
| 09-02 | Chi tiết secret chuyển sang **hồ sơ ngoài git** thay vì xoá trắng | Không mất kiến thức, mà cũng không công bố. Vị trí bị `.gitignore` của repo cha chặn. |
| 09-02 | **Chỉ push nhánh `main`** | Nhánh/tag backup và `refs/original/` chứa lịch sử GỐC chưa gỡ — tuyệt đối không được lên remote. |
| 09-02 | **Đóng kế hoạch #04** | Kiểm chứng bằng máy: 6 repo treo của nó đã xong ở #06/#07; header cũ đã lỗi thời. |

### Quyết định bị thay thế

- **#06/#07 chốt "ghi rõ vị trí secret để user còn xoay khoá"** → **THAY BẰNG** "kho PUBLIC chỉ được ghi
  sự kiện và số đếm; đường dẫn + loại khoá đưa ra hồ sơ ngoài git". Lý do: mục đích ban đầu (nhắc user xoay
  khoá) đã hết hiệu lực khi user quyết không xoay, trong khi rủi ro công bố thì vẫn còn.
- **Mục "🔒 XOAY KHOÁ (ưu tiên cao nhất)" trong `roadmap.md`** → **ĐÓNG** theo quyết định của user 2026-09-02.

## 📋 3. Checklist Thực Thi

- [x] **P01 🟠 Gỡ `compact.md` khỏi `deploy_skills.ps1`** + đổi here-string sang nháy đơn + xoá biến chết. `v1.5.2`.
- [x] **P02 🟠 Đổi tên file lệnh đã deploy** + deploy lại + nghiệm thu byte `0x08` = 0 và `diff` nguồn↔global RỖNG.
- [x] **P03 🔴 Rà hồ sơ #06** — tick 2 ô lỗi thời ở `SPEC-P02`/`SPEC-P04`, gắn nhãn môi trường cho cổng §7.
- [x] **P04 🔴 Ghi quyết định "không xoay khoá"** vào `roadmap.md` + `today.md` + `state.json`.
- [x] **P05 🔴 Kiểm điều kiện push** — remote, visibility, độ lệch, quét secret 6 lớp, `push --dry-run`.
- [x] **P06 🔴 Gỡ bản đồ secret khỏi 9 commit** bằng `filter-branch` (15 chỗ, 6 file) + backup nhánh/tag. `v1.5.3`.
- [x] **P07 🔴 Push `main`** (fast-forward, không force) + kiểm chứng lại trên remote.
- [x] **P08 🟢 Đóng #04 + lập hồ sơ #08 + đồng bộ não.** `v1.5.4`.

## 🛡️ 4. Cổng Nghiệm Thu (Exit Gates)

| Gate | Kết quả | Môi trường |
| :--- | :--- | :--- |
| `~/.claude/commands/` không còn file trùng tên lệnh built-in | ✅ | local |
| Deploy lại KHÔNG sinh lại `compact.md`; byte `0x08` trong file lệnh = 0 | ✅ | local |
| `diff` engine nguồn ↔ bản deploy global | **RỖNG** ✅ | local |
| Bản đồ vị trí secret: quét **mọi file × mọi commit** của `origin/main` | **0 dấu vết** ✅ | **remote** |
| Nhánh/tag backup KHÔNG lên remote (`git ls-remote` chỉ có `refs/heads/main`) | ✅ | **remote** |
| Push là fast-forward, không cần `--force` | ✅ | **remote** |
| `state.json` hợp lệ JSON · engine boot `NÃO ĐÃ OK` | ✅ | local |
| Kế hoạch #04 hết mục treo vì lý do kỹ thuật | ✅ | local |

## 🐛 5. Lỗi Đã Tìm Ra (kể cả lỗi của chính agent)

1. **Deploy sinh file lệnh trùng tên lệnh built-in** → gotcha **#13**.
2. **Here-string nháy kép làm hỏng nội dung** (`` `b `` → `0x08`) → gotcha **#13**.
3. **Kho PUBLIC mang bản đồ secret của kho PRIVATE** → gotcha **#14**.
4. **Lỗi quy trình của orchestrator (ghi để tự răn):** cổng kiểm cuối trước khi push **chỉ in cảnh báo mà
   không trả mã lỗi**, lại được nối bằng `&&` nên lệnh `push` vẫn chạy dù cổng đã báo "CÓ DẤU VẾT". Kết quả
   cuối vô hại (thứ khớp chỉ là văn bản mô tả regex quét, không phải khoá) nhưng **đó là may, không phải do
   cổng làm đúng việc**. → gotcha **#15**.

## ⚠️ 5b. Rò Rỉ ĐÃ CÔNG KHAI TỪ TRƯỚC — KHÔNG thu hồi được bằng đợt này

Quét rộng toàn kho phát hiện hai chỗ mang chỉ dẫn vị trí khoá **đã nằm trên `origin/main` từ những lần
push TRƯỚC** chiến dịch này, nên việc gỡ ở #08 chỉ làm sạch bản hiện tại, **không xoá được khỏi lịch sử
đã công bố**:

| Chỗ | Nội dung | Xử lý ở #08 |
| :--- | :--- | :--- |
| `planning/05_*/specs/SPEC-P06-causalagent.md` | ghi rõ `.env` của một repo chứa khoá API của **ba nhà cung cấp có tên** | đã gỡ tên 3 nhà cung cấp khỏi bản hiện tại |
| `planning/06_*/plan.md` | danh sách **15 repo có secret ở root** | giữ nguyên — chỉ nói repo nào có file `.env`, không nói bên trong có gì |

**Muốn xoá triệt để phải viết lại lịch sử ĐÃ CÔNG BỐ rồi `--force` push** — đó là quyết định của chủ dự án,
#08 KHÔNG tự làm. Nếu chọn không xoá thì nên coi các khoá đó là đã lộ.

## 📎 6. Bảng Trỏ

| Cần gì | Xem ở đâu |
| :--- | :--- |
| Chi tiết kỹ thuật 3 gotcha | `brain4agent/-known-gotchas.md` mục **#13, #14, #15** |
| Mục phát hành `v1.5.2` / `v1.5.3` / `v1.5.4` | `brain4agent/changelog.md` |
| Nhật ký phiên | `brain4agent/memory/hot/today.md` |
| Việc còn chờ user | `brain4agent/roadmap.md` mục **🔴 Active** |
| Lịch sử gốc trước khi gỡ | nhánh + tag `backup/pre-redact-2026-09-02` (chỉ LOCAL) |
