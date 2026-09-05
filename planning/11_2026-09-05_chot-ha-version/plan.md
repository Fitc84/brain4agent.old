# KẾ HOẠCH #11: CHỐT AN TOÀN — ENGINE TỪ CHỐI HẠ `brain_template_version` (#11)

- **STT KẾ HOẠCH:** #11
- **TRẠNG THÁI:** ✅ ĐÃ HOÀN THÀNH TRỌN VẸN — local + CI (2 OS) + deploy global
- **THỜI GIAN BẮT ĐẦU:** 2026-09-05 (lập hồ sơ)
- **THỜI GIAN HOÀN TẤT:** 2026-09-05 17:36:12 UTC+07:00
- **PHIÊN BẢN MỤC TIÊU (3 trục, KHÔNG trộn):** `ENGINE_VERSION` **1.7.2 → 1.7.3** · version DỰ ÁN hub **1.7.2 → 1.7.3** (`PATCH`) · `BRAIN_TEMPLATE_VERSION` **GIỮ NGUYÊN `1.4.0`** (không đổi chuẩn khung não ⇒ **không chạm repo vệ tinh nào, không rollout**)
- **LOẠI GÓI:** `plan.md` đơn theo ngoại lệ `AGENTS.md` §3 mục **2.5** (`PATCH`, ≤1 ngày công). Vì worker thực thi **không có ngữ cảnh chat**, hồ sơ này mang luôn hợp đồng ở mục 4 — đây là phần "đủ Metadata + nhật ký quyết định + checklist" mà 2.5 đòi, không phải thiết kế dài.

> **Đọc theo thứ tự:** mục 1 (vì sao) → mục 4 (hợp đồng — làm ĐÚNG THẾ, không "cải tiến") → mục 5 (vùng cấm) → mục 6 (checklist) → mục 7 (cổng nghiệm thu, đo thật).

---

## 🎯 1. Bối Cảnh — vì sao đây là lỗ hổng an toàn duy nhất còn mở

Bước 0 trong `memory-distill.txt` của **mọi** repo trỏ tới bản engine **GLOBAL**. Khi bản global **cũ hơn** repo (template thấp hơn), engine cũ nhìn thấy marker `brain4agent-v1.4.0.md` như "sai chuẩn" và **âm thầm kéo ngược**: đổi tên marker xuống, ghi `state.json.brain_template_version` xuống, thay thân luật trong các khối marker bằng bản cũ. Không lỗi, không cảnh báo, mã thoát 0.

Bài học này đã được ghi từ kế hoạch #07 (gotcha **#12**) nhưng **chưa bao giờ được cài thành luật máy**. Hậu quả đo được trong đợt #10 (2026-09-04): **hai sự cố thật** — một agent chạy bản global `1.6.0/1.3.0` ở chế độ ghi trong hub dù đã được cảnh báo, kéo hub từ `1.4.0` về `1.3.0`; phải khôi phục tay.

Kế hoạch này cài đúng **một** chốt: engine phát hiện repo đang ở template **cao hơn** chính nó ⇒ báo mã mới `BRN-018` (blocker, cần người), **thoát 2, không ghi byte nào** — ở cả `--check`, `--dry-run` lẫn chế độ ghi.

**Không làm gì khác.** Đây là dự án đòi "bộ não gọn nhẹ" (Đ5 của #10); ước lượng **≤ 25 dòng engine**, trần G2 vẫn là **1472** dòng.

## 🧾 2. Nhật Ký Quyết Định (có mốc thời gian)

| Thời điểm | Quyết định | Lý do |
| :--- | :--- | :--- |
| 2026-09-05 | **Đ1 — Mã mới `BRN-018`**, mức `blocker`, **không fixable** | 014/015 là của doctor, 016/017 đã dùng ở #10 ⇒ 018 là số trống kế tiếp. `blocker` vì đây là engine SAI PHIÊN BẢN, không phải repo sai; `fixable:false` để `exitCodeForDiagnosis` cho **2** mà không cần logic mã thoát mới. |
| 2026-09-05 | **Đ2 — Chốt đặt ở HAI chỗ, không hơn:** (a) `diagnose()` nhánh I3 phát `BRN-018` **thay cho** `BRN-010` khi `state.json.brain_template_version` là SemVer hợp lệ và **lớn hơn** `templateVersion`; (b) `runBrainEngine()` **cắt ngay sau `diagnose`**, TRƯỚC `computePlan`, ở **mọi mode**, khi có `BRN-018` | (a) giữ chẩn đoán là hàm thuần, doctor tự thừa hưởng (P04-E7g cấm doctor định nghĩa lại); (b) vì `planMarkerOps` (đổi tên marker xuống), `patchStateJson` (ghi version xuống) và `patchAgentsMd` (thay thân luật bằng bản cũ) đều nằm trong `computePlan/applyPlan` — chốt phải đứng **trước** cả ba, giống tiền lệ nhánh `snapshot.fileErrors` đã có sẵn. |
| 2026-09-05 | **Đ3 — So sánh SemVer bằng helper thuần `compareSemver(a, b)`** (≤ 8 dòng, export cho test), regex `/^\d+\.\d+\.\d+$/` như doctor đang dùng | 0 dependency. Chuỗi không hợp lệ ⇒ `null` ⇒ **rơi về `BRN-010` như hiện nay**, không đổi hành vi cho mọi fixture đang có (F03/F07 ở `1.2.0`, F04/F05/F08/F09/F10 ở `1.3.0` đều là *thấp hơn* ⇒ vẫn `BRN-010`). |
| 2026-09-05 | **Đ4 — KHÔNG thêm fixture trên đĩa.** Ca "repo cao hơn engine" dựng **trong bộ nhớ** (`mkSnapshot` override `stateJson`) và **trong thư mục tạm** (`mkTmpRoot('F02-standard-lf')` rồi ghi đè `state.json` + đổi tên marker sang `9.9.9`) | Fixture mới kéo theo golden, `ci-fixture-exists`, `NON_CONVERGING` — đúng loại overengineering cần tránh. Cách này đo được y hệt mà 0 file mới. |
| 2026-09-05 | **Đ5 — Doctor KHÔNG sửa dòng nào.** Ca doctor dùng cờ có sẵn `--expect-template 1.3.0` trên bản tạm của `F02` (đang `1.4.0`) ⇒ phải ra `BLOCKER`/`BRN-018`/exit 2 | Doctor gọi `diagnose()` của engine (P04-E7g) nên tự nhận mã mới; cờ `--expect-template` mô phỏng chính xác "engine cũ hơn repo". |
| 2026-09-05 | **Đ6 — Bánh cóc cập nhật SỐ, không xoá test:** `T-U-D00` 15 → **16**; docs "Bảng 17 mã" → **18** | Kỷ luật bánh cóc của #09/#10: mã mới phải đi qua hồ sơ (chính file này) rồi mới sửa số. |
| 2026-09-05 | **Đ7 — `PATCH` 1.7.3, template giữ `1.4.0`** | Đóng một khiếm khuyết (thoái lui thầm lặng), không thêm bề mặt API ngoài một mã chẩn đoán; không repo vệ tinh nào cần ghi lại ⇒ không rollout, không sóng. |
| 2026-09-05 | **Đ10 — SỬA §4.7 (worker bắt được lần 2) + MỞ RỘNG BÁNH CÓC.** `project-intro.md` có **3** chỗ công bố version hiện hành (tiêu đề · dòng mô tả dự án · dòng `Version Control & CI/CD`), không phải 2 — sửa cả 3. Kèm theo: **tổng quát hoá `T-H03f`** từ chỗ chỉ canh `README.md` thành canh **cả ba** file công bố (`README.md` 3 chỗ · `project-intro.md` 3 chỗ · `index.md` 1 chỗ) qua một bảng dữ liệu trong test. | Đây **đúng lớp lỗi của gotcha #25** ("một điểm công bố version nằm ngoài mọi cổng thì trôi lệch âm thầm qua nhiều đợt phát hành"). #10 đã vá cho `README.md` nhưng **không** rà hai file anh em cùng loại — nên `project-intro.md` lại trôi, và lần này chỉ được phát hiện nhờ worker đếm tay. Vá xong một lỗ mà không quét cả họ chính là gotcha **#29**. Vì vậy mở rộng cổng là **bắt buộc**, không phải phình phạm vi: nó biến một lỗi đã tái diễn 2 lần thành lỗi máy bắt được. Dòng `(v1.7.2)` ở mục `Version Control & CI/CD` là chỗ nguy hiểm nhất — đọc như ví dụ định dạng SemVer nhưng thật ra là công bố version hiện hành. |
| 2026-09-05 | **Đ8 — Deploy global là NÚT CỦA USER** (H8 của #10), nhưng là **điều kiện đóng** kế hoạch | Chốt chỉ có giá trị khi nằm trong bản mà Bước 0 gọi — tức bản global. "Bất biến vận hành số 1" trong kernel: sửa engine xong phải deploy và so hash tới khi diff rỗng. |
| 2026-09-05 | **Đ9 — SỬA LUẬT §5 (worker bắt được, orchestrator viết sai).** Được phép cập nhật assertion của test cũ **khi và chỉ khi** hành vi mới do chính hợp đồng này quy định làm nhãn mã đổi, mà **ý đồ của ca test không đổi**. Ca duy nhất: `P04 · --expect-template` trong `tests/doctor/fleet.test.js` — `repo-alpha` ở `1.3.0` với `--expect-template 1.2.0` là repo **cao hơn** engine ⇒ theo §4.3 phải ra `BRN-018`. Đổi đúng chuỗi `BRN-010` → `BRN-018` ở assertion `alpha`, **giữ nguyên** assertion `bravo` và tên/ý đồ ca. | §5 bản đầu gộp hai việc khác hẳn nhau: *bẻ test cho vừa code hỏng* (cấm) và *cập nhật test vì hành vi đổi có chủ đích* (bắt buộc, nếu không thì lưới test nói dối). Đã cân nhắc và **BÁC** phương án tách ngữ nghĩa (doctor chỉ-đọc nên "repo cao hơn" là vô hại): sẽ phá bất biến MỘT nguồn chân lý `diagnose()` (P04-E7g) và thêm nhánh chỉ để né một dòng test — đúng loại overengineering Đ5 của #10 cấm. Doctor báo `BLOCKER` ở đây cũng **đúng nghĩa**: nó nói cho người vận hành biết cờ chuẩn họ đưa vào đã lạc hậu so với repo. |

### Quyết định bị thay thế
- Gotcha #12 ghi cách khắc phục là *"so hash sau mọi lần sửa engine"* — **đúng nhưng chưa đủ**: đó là kỷ luật của người, đã bị bỏ qua hai lần. **Thay bằng** chốt máy: engine cũ tự từ chối ghi. Ghi chú trỏ về #11 sẽ được thêm vào #12, không sửa nội dung cũ.

## 👥 3. Phân Công Work Package + Model Tier

| WP | Nội dung | Tier | Sản phẩm |
| :--- | :--- | :-: | :--- |
| **WP1** | Engine: `compareSemver`, `BRN-018`, nhánh I3, chốt trong `runBrainEngine`, bump `ENGINE_VERSION` | 🟠 | `.agents/skills/.xay-dung-nao-bo/scripts/init_brain.js` |
| **WP2** | Test: 3 ca đơn vị, 3 ca CLI, 1 ca doctor, sửa bánh cóc | 🟠 | `tests/unit/diagnose.test.js`, `tests/cli/exit-codes.test.js`, `tests/doctor/fleet.test.js` |
| **WP3** | Đồng bộ: docs bảng mã, 6 điểm não, README/index/kernel/state, gotcha #12 trỏ #11, roadmap | 🟢 | `docs/xay-dung-nao-bo.md`, `brain4agent/*`, `README.md`, `package.json` |
| **WP4** | Deploy global + `deploy:verify` + push + CI | 🔴 **user bấm nút** | bản global, remote |

## 📐 4. Hợp Đồng (làm ĐÚNG THẾ — không tự "tốt hơn")

### 4.1. Helper thuần (đặt cạnh `BRAIN_MARKER_REGEX`, export)
```js
// So SemVer x.y.z. Trả -1/0/1; trả null nếu MỘT trong hai không đúng dạng (⇒ caller coi như "không so được").
function compareSemver(a, b) { … }
```
- Input là string bất kỳ (kể cả `undefined`/`null`/số) ⇒ không throw, trả `null`.
- So từng thành phần dạng **số nguyên**: `1.10.0 > 1.9.0` (KHÔNG so chuỗi).

### 4.2. Bảng `BRN` — thêm ĐÚNG một dòng, cuối bảng
```js
'BRN-018': { level: 'blocker', title: 'Repo ở khung não CAO HƠN engine đang chạy — engine cũ, CẤM hạ version', fix: 'Cập nhật bản engine (chạy deploy từ hub, so hash tới khi diff rỗng) rồi chạy lại. TUYỆT ĐỐI không hạ brain_template_version của repo' }
```

### 4.3. `diagnose()` — nhánh I3 (hiện ở khoảng dòng 775–781)
Thay khối `if (actual !== templateVersion) add('BRN-010', …)` bằng:
```js
const cmp = compareSemver(actual, templateVersion);
if (cmp === 1) {
    add('BRN-018', 'state.json.brain_template_version = ' + actual + ' CAO HƠN engine ' + templateVersion + ' — engine đang chạy CŨ hơn repo',
        { actual, expected: templateVersion }, { fixable: false });
} else if (actual !== templateVersion) {
    add('BRN-010', /* nguyên văn như hiện nay */);
}
```
- **CẤM** động vào `BRN-007`, `BRN-011`, nhánh parse lỗi, hay `isStandard`.
- `BRN-006` (marker) vẫn có thể xuất hiện cùng `BRN-018` trong `--check` — **chấp nhận**, vì 4.4 bảo đảm không có gì được áp dụng.

### 4.4. `runBrainEngine()` — chốt cắt sớm (đặt NGAY SAU khối `snapshot.fileErrors`, TRƯỚC banner)
```js
if (diagnosis.findings.some((f) => f.code === 'BRN-018')) {
    emitFindings(diagnosis);
    errorLogger('[brain-engine] DỪNG: repo ở khung não cao hơn engine. Không ghi byte nào. Cập nhật bản engine rồi chạy lại.');
    return { exitCode: 2, diagnosis, plan: null, applied: 0, diagnosisAfter: null };
}
```
- Áp dụng cho **cả ba mode** (`write`, `check`, `dry-run`) — không có ngoại lệ, không có cờ vượt.
- **CẤM** thêm cờ CLI mới (`--force`, `--allow-downgrade`, …). Đây là vùng cấm đứng từ #10.

### 4.5. Doctor — **0 dòng thay đổi**
`brain_doctor.js` dùng `diagnose()` của engine ⇒ tự ra `BRN-018` với `status = BLOCKER`. Test P04-E7g phải vẫn xanh (doctor KHÔNG khai lại meta).

### 4.6. Test — tên ca cố định (để cổng §7 gọi đúng tên)

| Ca | File | Kiểm |
| :--- | :--- | :--- |
| **T-U-V01** | `tests/unit/diagnose.test.js` | `mkSnapshot({ stateJson: tf(JSON.stringify({ brain_template_version: '9.9.9' }) + '\n') })` ⇒ có `BRN-018` (`level:'blocker'`, `fixable:false`, `detail.actual='9.9.9'`), **không** có `BRN-010`; `isStandard === false` |
| **T-U-V02** | như trên | version `'1.2.0'` (thấp hơn) ⇒ `BRN-010` như cũ, **không** `BRN-018`; version `'abc'` ⇒ `BRN-010`, **không** `BRN-018` |
| **T-U-V03** | như trên | `compareSemver`: `('1.10.0','1.9.0')===1`, `('1.4.0','1.4.0')===0`, `('1.3.9','1.4.0')===-1`, `('x','1.0.0')===null`, `(undefined,'1.0.0')===null` |
| **T-C40** | `tests/cli/exit-codes.test.js` | tmp = `mkTmpRoot('F02-standard-lf')`; ghi `state.json.brain_template_version='9.9.9'`, đổi tên marker `brain4agent-v1.4.0.md → brain4agent-v9.9.9.md`; chụp **sha256 mọi file** trong tmp; chạy `--check` ⇒ exit **2**, stdout chứa `BRN-018`; cây **byte-identical** |
| **T-C41** | như trên | cùng cách dựng; chạy **chế độ ghi** (không cờ) ⇒ exit **2**, stderr chứa `DỪNG`, cây **byte-identical** (đây là ca "0 byte"), `state.json` vẫn `9.9.9`, marker vẫn `v9.9.9` |
| **T-C42** | như trên | `--dry-run` ⇒ exit 2, cây byte-identical |
| **T-R22** | `tests/doctor/fleet.test.js` | `runDoctor(['--repo', tmpF02, '--expect-template', '1.3.0', '--format', 'json'])` ⇒ exit 2, repo `status === 'BLOCKER'`, có finding `code === 'BRN-018'` với `detail.actual === '1.4.0'` |
| **T-U-D00** (sửa) | `tests/unit/diagnose.test.js` | `codes.length === 16`; thêm assert `e.BRN['BRN-018'].level === 'blocker'` |
| **P04** (sửa, Đ9) | `tests/doctor/fleet.test.js` | assertion `alpha`: `BRN-010` → `BRN-018`. Giữ nguyên tên ca, giữ nguyên assertion `bravo` (repo `1.2.0` = kỳ vọng ⇒ hết lệch) và `expected_template_version === '1.2.0'` |

Đếm mục tiêu: **241 → ≥ 248** ca, 0 fail, 0 skip.

### 4.7. Version — 3 trục
- `ENGINE_VERSION = '1.7.3'`; `package.json.version`; `state.json.current_version`; `README.md` (**3** chỗ); `brain4agent/project-intro.md` (**3** chỗ — tiêu đề, dòng mô tả dự án, dòng `Version Control & CI/CD`; xem Đ10); `brain4agent/index.md` (**1** chỗ, dòng `[VERSION TRUTH]`); `memory-distill.txt` (**2** chỗ); `tests/cli/exit-codes.test.js:147` literal `'1.7.2'` → `'1.7.3'`.
- **Mở rộng `T-H03f` (Đ10):** đổi từ chỉ đọc `README.md` sang duyệt một bảng `[{file, spots}]` gồm `README.md` (3), `brain4agent/project-intro.md` (3), `brain4agent/index.md` (1). Mỗi chỗ phải khớp `package.json.version`. Thông điệp lỗi phải nêu **tên file + vị trí**. **CẤM** nới sang `memory-distill.txt` (kernel là văn xuôi, dễ sinh âm tính giả) và `changelog.md`/`today.md` (là **lịch sử**, không phải hiện trạng — sửa chúng là xoá lịch sử).
- `BRAIN_TEMPLATE_VERSION` **không đổi**. Nếu thấy mình đang sửa nó ⇒ đang làm sai kế hoạch.

### 4.8. Golden
Không fixture nào "cao hơn engine" ⇒ output 7 ca **không đổi**. Nếu `npm run test:golden` đỏ **chỉ vì** `engine_sha256`/`engine_commit` ⇒ chụp lại bằng `npm run golden:make` **sau cùng, trên cây đã commit sạch**, và `git diff tests/golden/manifest.json` chỉ được đổi đúng hai trường đó. Đỏ vì bất kỳ sha file nào khác ⇒ **DỪNG, báo cáo**, không chụp lại.

## ⛔ 5. Vùng Cấm (điều đã cân nhắc và quyết định KHÔNG làm)

- **Không thêm cờ vượt chốt.** Hạ version là việc của người, làm tay, có ý thức — không có đường tắt bằng cờ.
- **Không tự "nâng" engine cũ lên** (tải bản mới, gọi deploy từ trong engine). Engine không được có side-effect ngoài repo đích.
- **Không chặn khi repo THẤP hơn** — đó là đường nâng cấp bình thường (`BRN-010` fixable). Chốt chỉ một chiều.
- **Không sửa doctor, không sửa `deploy_skills.ps1`, không thêm fixture, không đổi `BRAIN_TEMPLATE_VERSION`, không chạm `RULE_BLOCKS`/thân luật.**
- **Không chạy engine chế độ ghi ở repo nào ngoài thư mục tạm của test.** Hub tự kiểm bằng `--check` là đủ.
- **Không sửa test cũ cho xanh** — nghĩa là không bẻ assertion để che một hành vi ngoài ý muốn. **Ngoại lệ tường minh (Đ9):** được cập nhật assertion khi hành vi mới do chính hợp đồng này quy định làm **nhãn mã** đổi mà **ý đồ ca test giữ nguyên**; hiện có đúng ba chỗ: số bánh cóc `T-U-D00` (Đ6), literal version ở 4.7, và `BRN-010 → BRN-018` ở assertion `alpha` của ca `P04 · --expect-template`. Chỗ thứ tư ⇒ **DỪNG, hỏi**, không tự suy rộng.
- Hub là repo **PUBLIC**: không đường dẫn tuyệt đối máy, không tên repo vệ tinh trong file mới.

## 📋 6. Checklist Thực Thi

- [x] **P00 🔴 [Hồ sơ]** — file này. Đăng ký vào `brain4agent/index.md` (cây `planning/`) và `roadmap.md` (mục Idea Vault #11 → "đang thực thi").
- [x] **P01 🟠 [WP1]** — engine theo 4.1–4.4; `wc -l` ≤ 1472; `node init_brain.js --check .` tại hub = exit 0, `NÃO ĐÃ OK`.
- [x] **P02 🟠 [WP2]** — 7 ca mới + sửa T-U-D00; `npm test` 0 fail 0 skip; ba ca T-C40..42 chứng minh **0 byte** bằng sha256 trước/sau.
- [x] **P03 🟢 [WP3]** — 4.7 bump 3 trục; docs bảng 18 mã + mục export thêm `compareSemver`; gotcha #12 thêm dòng "→ cài thành luật máy ở #11 (`BRN-018`)"; `changelog.md` mục `v1.7.3`; `roadmap.md` Done; `today.md`; `state.json`; kernel (< 100 dòng).
- [x] **P04 🟠 [Golden]** — theo 4.8.
- [x] **P05 🔴 [WP4 — user]** — `npm run deploy` → `npm run deploy:verify` = 0 → chạy bản **GLOBAL** `--check` tại hub = 0. Push theo lệnh user; CI xanh 2 OS.
- [x] **P06 🔴 [Đóng]** — điền §7, đổi trạng thái, giờ hoàn tất tới giây.

## 🛡️ 7. Cổng Nghiệm Thu (Exit Gates) — điền SỐ ĐO THẬT, không điền "xanh"

| # | Gate | local | CI | máy thật (global) |
| :-- | :--- | :-: | :-: | :-: |
| X01 | T-U-V01..V03 xanh; T-U-D00 = 16 | ✅ `npm test`: 4 ca xanh; T-U-D00 = 16 | ✅ run `33971106273`: ubuntu + windows | — |
| X02 | T-C40/41/42: exit 2 **và** sha256 mọi file trước = sau (dán số file đã so) | ✅ 3 ca xanh; mỗi ca exit 2, SHA-256 trước = sau cho 15 file | ✅ run `33971106273`: ubuntu + windows | — |
| X03 | T-R22: doctor `BLOCKER` + `BRN-018`, 0 dòng doctor đổi (`git diff --stat` doctor = rỗng) | ✅ T-R22 xanh; `brain_doctor.js` diff rỗng | ✅ run `33971106273`: ubuntu + windows | — |
| X03b | Ca `P04 · --expect-template` xanh với nhãn mới; `git diff` của `fleet.test.js` **chỉ** đổi chuỗi mã ở assertion `alpha` (Đ9) — không đổi tên ca, không bớt assertion | ✅ ca xanh; P02 đã commit, working diff `fleet.test.js` rỗng | ✅ run `33971106273`: ubuntu + windows | — |
| X04 | `npm test` ≥ 248 ca, 0 fail, 0 skip | ✅ tests 248 · pass 248 · fail 0 · skipped 0 | ✅ run `33971106273`: ubuntu + windows (2 OS) | — |
| X05 | G2: `wc -l init_brain.js` ≤ 1472 (ghi số) | ✅ **1448** dòng (`wc -l`). *Ô này ban đầu ghi `1279` — đó là số dòng **bỏ dòng trống**, không phải `wc -l` mà cổng yêu cầu; cổng vẫn đạt nhưng thước đã bị ghi sai (gotcha #27).* | — | — |
| X06 | 3 trục version = `1.7.3`; T-H03/b/f xanh; `--version` in `1.7.3` + template `1.4.0` | ✅ 3 trục 1.7.3; T-H03/b/f xanh; `brain-engine 1.7.3 template 1.4.0` | ✅ run `33971106273`: ubuntu + windows | ✅ bản GLOBAL in `brain-engine 1.7.3 template 1.4.0` |
| X06b | `T-H03f` mở rộng: **7** điểm công bố (README 3 · project-intro 3 · index 1) đều khớp `package.json`; **thử ngược** — sửa tay MỘT chỗ thành `9.9.9` phải làm test ĐỎ, rồi hoàn nguyên (bằng chứng cổng "có răng") | ✅ 7/7; README tiêu đề → 9.9.9: tests 248 · pass 247 · fail 1 · skipped 0; hoàn nguyên: tests 248 · pass 248 · fail 0 · skipped 0 | ✅ run `33971106273`: ubuntu + windows | — |
| X07 | Golden xanh; nếu chụp lại: diff manifest chỉ 2 trường engine | ✅ tests 8 · pass 8 · fail 0; manifest không đổi | ✅ run `33971106273`: ubuntu + windows | — |
| X08 | Hub tự kiểm `--check .` = 0 bằng engine MỚI; doctor toàn kho: **0** `BRN-018` (không repo nào cao hơn 1.4.0 — sanity) | ✅ `--check .`: exit 0, NÃO ĐÃ OK. Doctor toàn kho **đã chạy** (chỉ đọc ⇒ không phải "chạm"): `candidates=71 clean=50 warning=5 error=12 blocker=2 skipped=2`, **0 repo có `BRN-018`** — đúng kỳ vọng vì không repo nào ở khung cao hơn `1.4.0` | — | ✅ bản GLOBAL `--check .` tại hub = exit 0, `NÃO ĐÃ OK` |
| X09 | Sync cascade 6 điểm + docs + gotcha #12 + roadmap; kernel < 100 dòng | ✅ docs/index/roadmap/changelog/hot memory/kernel cập nhật; kernel **55** dòng (< 100). *Ô này ban đầu ghi `51` — sai như ô X05; số đúng đo bằng `wc -l`.* | — | — |
| X10 | `deploy:verify` = 0; hash 4/4; file lệnh `cmd=ok` | — | — | ✅ `files=4 match=4 diff=0 missing=0 extra=2 cmd=ok exit=0`. Hai mục `extra` (`compact.md.disabled-by-plan07` — đường lùi cố ý từ #07; và một file test cũ ở đích) được **GIỮ NGUYÊN**, không xoá |
| X11 | Bằng chứng chốt hoạt động THẬT ngoài test: bản global mới chạy `--check` trên một thư mục tạm có `state.json` `9.9.9` ⇒ exit 2, `BRN-018` | — | — | ✅ dựng repo giả từ `F02` ở khung `9.9.9` (marker + `state.json`), chạy bằng **bản GLOBAL**: `--check` / `--dry-run` / **chế độ ghi** đều exit **2**, stderr có `DỪNG`, và **15/15 file byte-identical** trước–sau (so `sha256sum` toàn cây) |

## 📎 8. Bảng Trỏ

| Tài liệu | Vai trò |
| :--- | :--- |
| `brain4agent/-known-gotchas.md` #12 | Bài học gốc (2026-09-02) mà kế hoạch này cài thành luật máy |
| `planning/10_2026-09-02_va-bang-marker/specs/01-CONTRACTS.md` §6 | Bảng mã và luật mã thoát mà `BRN-018` phải tuân |
| `docs/xay-dung-nao-bo.md` §4 | Bảng mã công bố — cập nhật ở P03 |
| `brain4agent/memory/hot/state.json` → `plan_10_2026-09-02.P06_deploy_global.su_co` | Sự cố thật số 1 (bằng chứng động lực) |
