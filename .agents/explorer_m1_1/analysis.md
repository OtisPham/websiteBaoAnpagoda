# BÁO CÁO PHÂN TÍCH HỆ THỐNG MẪU IN SỚ & LAYOUT (MILESTONE M1 - EXPLORER 1)

**Dự án**: Pagoda ERP & Website Chùa Báo Ân (`c:\Users\ADMIN\Desktop\pagodaweb`)  
**Ngày thực hiện**: 24/07/2026  
**Người thực hiện**: Explorer 1 (Milestone M1)

---

## 1. TỔNG QUAN HỆ THỐNG IN SỚ (PRINT SYSTEM OVERVIEW)

Hệ thống in sớ của Chùa Báo Ân được thiết kế để xử lý việc in ấn hàng loạt các sớ Cầu An, Cầu Siêu và Linh Vị tại Trạm In Sớ (`/dashboard/print`). Hệ thống hỗ trợ đa chế độ in, tự động phân cột, ngắt trang A4, chèn phôi nền hoa văn và hỗ trợ xuất phôi đè `.docx`.

### Các file nguồn cốt lõi:
- **Giao diện Trạm In Sớ**: `src/app/dashboard/print/PrintStation.tsx` (564 dòng)
- **Trang Server Render Trạm In**: `src/app/dashboard/print/page.tsx` (72 dòng)
- **Server Actions In Sớ**: `src/app/dashboard/print/actions.ts` (68 dòng)
- **Quản lý Phôi Sớ Động**: `src/app/dashboard/templates/AdminTemplates.tsx` (222 dòng)
- **Thuật toán Line-Weight Chia Cột**: `src/utils/so/lineWeight.ts` (128 dòng)
- **Render File Docx Template**: `src/utils/so/docxRenderer.ts` (31 dòng)
- **CSS In Ấn & Font**: `src/app/globals.css` (Dòng 59-137)
- **Schema CSDL Supabase**: `supabase/migrations/20260707000000_init_schema.sql`

---

## 2. CHI TIẾT CÁC CHẾ ĐỘ IN & BỐ CỤC (LAYOUT MODES)

Hệ thống hỗ trợ 3 chế độ in chính được lựa chọn thông qua dropdown `printMode` tại `PrintStation.tsx`:

### 2.1. Chế độ In Dọc Chuẩn A4 (`READING` mode - "Mẫu Quý Thầy Đọc")
- **File**: `PrintStation.tsx` (Dòng 381 - 558)
- **Mục đích**: Dùng cho chư Tăng Ni cầm đọc trực tiếp trong các ca lễ Cầu An / Cầu Siêu.
- **Kích thước & Cấu hình CSS**:
  - Trang CSS target: `@page so-portrait-page` trong `globals.css` (Landscape: `210mm x 297mm`, Lề: `top/bottom 12mm`, `left/right 15mm`).
  - Khung bao ngoài: `w-full max-w-[210mm] print:w-[180mm] print:max-w-[180mm] h-[270mm] max-h-[270mm] print:h-[273mm] print:max-h-[273mm]`.
  - Khung chứa nội dung được đóng gói vừa khít **1 trang A4 duy nhất**, không tràn trang.
- **Cấu trúc Giao diện**:
  1. **Header**: 
     - Ấn đỏ cổ tự: `"Báo Ân Cổ Tự Pháp Ấn"` (đóng khung kép màu đỏ).
     - Tiêu đề chính: `"Phật Giáo Việt Nam • Bổn Tự Chùa Báo Ân"`.
     - Tên sớ: `"Sớ Phục Nguyện Cầu An"` hoặc `"Sớ Phục Nguyện Cầu Siêu"`.
     - Câu xưng niệm Phật hiệu:
       - Cầu An: `"Nam Mô Tiêu Tai Diên Thọ Dược Sư Lưu Ly Quang Vương Phật"`.
       - Cầu Siêu: `"Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật"`.
     - Mã sớ, ngày cúng, ca lễ ở góc phải.
  2. **Thông tin Trai Chủ / Gia Chủ**:
     - Lấy từ `relation === 'TRAI_CHU'` hoặc fallback từ tài khoản đăng ký `form.users.full_name`.
     - Kèm Pháp danh (nếu có), số điện thoại và Lời khấn/Ghi chú (`form.note`).
  3. **Danh sách Người Thụ Lễ / Hương Linh**:
     - Loại bỏ Trai Chủ khỏi danh sách người thụ lễ.
     - Tự động chia từ 1 đến 4 cột dựa trên số lượng (`MAX_PER_COL = 15` người/cột). Nếu danh sách từ 5-15 người, tự động chia 2 cột cho cân đối trang sớ.
  4. **Footer & Lời Nguyện**:
     - Lời nguyện Cầu An / Cầu Siêu chuẩn bài bản.
     - Vùng chữ ký hai bên: Trai Chủ Khấn Nguyện vs Chùa Báo Ân Bổn Tự Khâm Nguyện.
- **Tính năng Phôi Nền**: Hỗ trợ đè phôi nền hoa văn từ URL (`selectedTemplateUrl`) thông qua `backgroundImage: cover`.

### 2.2. Chế độ In Ngang Dán Chánh Điện (`POSTER` mode - "Mẫu Dán Chánh Điện")
- **File**: `PrintStation.tsx` (Dòng 258 - 380, đoạn 362-376)
- **Mục đích**: Bảng biểu dán tại Chánh điện để Phật tử và ban lễ nghi tra cứu tên.
- **Kích thước & Cấu hình CSS**:
  - Trang CSS target: `@page so-page` trong `globals.css` (`A4 landscape`, Lề `10mm`).
  - Vùng in: `print:w-[277mm] print:max-w-[277mm] print:h-[190mm] print:max-h-[190mm]`.
- **Cấu trúc & Thuật toán Dồn Cột**:
  - Mỗi trang A4 Ngang gom chính xác **4 cột kề bên nhau** (`MAX_COLS_PER_PAGE = 4`).
  - Giới hạn dòng mỗi cột: `MAX_LINES_PER_COL = 13` dòng.
  - Trên đầu mỗi cột hiển thị **Mã đuôi 3 chữ số** in siêu lớn (`text-[64px] font-bold`).
  - Danh sách tên in hoa cỡ lớn (`text-xl font-bold uppercase`).
  - Viền cột: Sử dụng nét đứt (`border-dashed border-stone-400 print:border-stone-500`) và biểu tượng kéo cắt (`✂`) ở các góc (`-top-3.5 -left-2.5`, `-bottom-3.5`, v.v.) giúp Tăng Ni dễ dàng cắt dán nối tiếp trên bảng chánh điện.

### 2.3. Chế độ In Linh Vị Phụng Vì - Tọa Vị (`PHUNG_VI` mode - "Mẫu Linh Vị")
- **File**: `PrintStation.tsx` (Dòng 258 - 380, đoạn 328-361)
- **Mục đích**: In bài vị thờ / linh vị cúng cho chư Hương Linh.
- **Bố cục Chuyên biệt**:
  - **HOÀN TOÀN BỎ SỐ THỨ TỰ / MÃ PHIẾU Ở ĐẦU TRANG/CỘT**.
  - **Đỉnh Bài Vị**: 
    - Câu niệm: `"Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật"` (chữ nghiêng nhỏ).
    - Tiêu đề chính trang trọng: **`"PHỤNG VÌ"`** (`text-3xl font-serif font-bold text-amber-950 uppercase tracking-widest border-b-2`).
  - **Thân Bài Vị (Chính Giữa)**:
    - Danh sách tên Hương linh in chữ lớn, trang nghiêm (`text-xl font-serif font-bold uppercase text-stone-900 leading-snug`).
  - **Đáy Bài Vị (Kết Thúc)**:
    - Tiêu đề kết chốt: **`"TỌA VỊ"`** (`text-2xl font-serif font-bold text-amber-950 uppercase tracking-widest`).
    - Dòng chữ phụ: `"Chùa Báo Ân • Linh Vị"`.

---

## 3. THUẬT TOÁN LINE-WEIGHT CHIA CỘT SỚ (`src/utils/so/lineWeight.ts`)

Bên cạnh logic chia cột inline của `PrintStation.tsx`, dự án chứa module chuẩn hóa `lineWeight.ts` dành cho việc render Sớ nhiều cột theo trọng số dòng:

- **Giới hạn cột**: `MAX_LINES_PER_COL = 28` dòng/cột.
- **Trọng số dòng (Line Weights)**:
  - Header Mã phiếu (`FORM_CODE`): `4` dòng.
  - Tên ngắn (< 15 ký tự, không pháp danh): `1` dòng (`SHORT_NAME_WEIGHT`).
  - Tên dài (>= 15 ký tự hoặc có pháp danh/năm sinh): `2` dòng (`LONG_NAME_WEIGHT`).
- **Xử lý Ngắt Cột & Chèn Mã Tiếp**:
  - Khi chèn một phiếu sớ mới, nếu cột hiện tại còn lại < 4 dòng, tự động ngắt sang cột mới.
  - Khi một phiếu sớ có danh sách người quá dài tràn sang cột tiếp theo, đầu cột mới sẽ tự động được chèn mã phiếu bổ sung: `[Mã_Phiếu (Tiếp)]` chiếm 4 dòng trước khi tiếp tục danh sách tên.

---

## 4. QUẢN LÝ PHÔI SỚ VÀ XUẤT ĐỊNH DẠNG FILE

### 4.1. Phôi Sớ Động (Dynamic Background Overlay)
- Quản lý tại `src/app/dashboard/templates/AdminTemplates.tsx`.
- Admin/Monk có thể tải lên file hình ảnh phôi sớ (`.jpg`, `.png`) lên Supabase Storage bucket `print_templates`.
- URL hình ảnh phôi lưu vào bảng `public.templates` (các trường: `id`, `name`, `form_type`, `file_url`, `is_active`).
- Khi preview/in, hình nền phôi được load thông qua CSS `background-size: cover`.
- Đảm bảo in đè hoa văn nhờ thuộc tính CSS: `-webkit-print-color-adjust: exact !important`.

### 4.2. Render File Word `.docx` (`src/utils/so/docxRenderer.ts`)
- Sử dụng thư viện `docxtemplater` và `pizzip`.
- Cho phép nhận Buffer file `.docx` mẫu và Object dữ liệu sớ (`{ form_code, owner_name, targets: [...] }`) để sinh ra file `.docx` hoàn chỉnh.

---

## 5. TỔNG HỢP VĂN BẢN TĨNH (STATIC TEXTS)

| Tên văn bản / Mục đích | Nội dung văn bản tĩnh tiếng Việt | Vị trí trong Code |
|---|---|---|
| Tên Chùa (Header) | `"Phật Giáo Việt Nam • Bổn Tự Chùa Báo Ân"` | `PrintStation.tsx:413` |
| Ấn Đỏ Chùa | `"Báo Ân Cổ Tự Pháp Ấn"` | `PrintStation.tsx:408` |
| Tiêu đề Sớ Cầu An | `"Sớ Phục Nguyện Cầu An"` | `PrintStation.tsx:418` |
| Tiêu đề Sớ Cầu Siêu | `"Sớ Phục Nguyện Cầu Siêu"` | `PrintStation.tsx:419` |
| Phật Hiệu Cầu An | `"Nam Mô Tiêu Tai Diên Thọ Dược Sư Lưu Ly Quang Vương Phật"` | `PrintStation.tsx:423` |
| Phật Hiệu Cầu Siêu | `"Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật"` | `PrintStation.tsx:424`, `PrintStation.tsx:333` |
| Tiêu đề Linh Vị Đỉnh | **`"PHỤNG VÌ"`** | `PrintStation.tsx:336` |
| Tiêu đề Linh Vị Đáy | **`"TỌA VỊ"`** | `PrintStation.tsx:355` |
| Chú thích Linh Vị Đáy | `"Chùa Báo Ân • Linh Vị"` | `PrintStation.tsx:358` |
| Tiêu đề DS Cầu An | `"Danh Sách Hương Linh & Phật Tử Cầu An Tiêu Tai"` | `PrintStation.tsx:460` |
| Tiêu đề DS Cầu Siêu | `"Danh Sách Chư Hương Linh Phục Nguyện Siêu Độ"` | `PrintStation.tsx:461` |
| Ghi chú 0 Hương linh | `"(Gia chủ cúng dường chung cho gia quyến)"` | `PrintStation.tsx:465` |
| Lời Nguyện Cầu An | `"Đệ tử chúng đẳng thành tâm khấu bái, nguyện cầu Tam Bảo chứng minh, gia quyến khang ninh khương thái cát tường, sở cầu như ý, sở nguyện tòng tâm."` | `PrintStation.tsx:539` |
| Lời Nguyện Cầu Siêu | `"Đệ tử chúng đẳng thành tâm khấu bái, nguyện cầu Tiếp Dẫn Đạo Sư A Di Đà Phật phóng quang tiếp độ chư hương linh trút bỏ trần duyên, siêu sinh tịnh độ."` | `PrintStation.tsx:540` |
| Chữ ký Trai Chủ | `"Trai Chủ Khấn Nguyện"` / `"(Đã đăng ký trực tuyến)"` | `PrintStation.tsx:546-547` |
| Chữ ký Bổn Tự | `"Chùa Báo Ân • Bổn Tự Khâm Nguyện"` / `"Khám Ấn Duyệt Sớ"` | `PrintStation.tsx:550-551` |

---

## 6. CẤU TRÚC DỮ LIỆU VÀ CƠ CHẾ TIÊM DỮ LIỆU (DATA INJECTION)

### 6.1. Cấu trúc Dữ liệu Form và Targets
```typescript
interface TargetPerson {
  id: string
  full_name: string
  dharma_name?: string | null  // Pháp danh
  birth_year?: number | null   // Năm sinh (dùng cho Cầu An)
  death_year?: number | null   // Năm mất (dùng cho Cầu Siêu)
  relation?: string | null     // Mối quan hệ với Trai chủ
  type: 'CAU_AN' | 'CAU_SIEU'
}

interface FormRecord {
  id: string
  form_code: string            // Mã phiếu độc lập (CA-0001, CS-0001)
  form_type: 'CAU_AN' | 'CAU_SIEU'
  status: string               // 'Accepted', 'Printed', v.v.
  is_delegated: boolean        // Trạng thái ủy nhiệm ca cúng
  scheduled_date: string       // Ngày cúng (YYYY-MM-DD)
  selected_time_slot?: string | null // Ca cúng (VD: "07:00")
  note?: string | null         // Lời khấn / Ghi chú của gia chủ
  created_at: string
  users?: { full_name: string; phone: string } | null
  targets: TargetPerson[]
}
```

### 6.2. Cơ chế Tiêm Dữ liệu vào Mẫu In (Injection Logic)
1. **Lọc Trai Chủ vs Thụ Lễ**:
   - `traiChuTarget = form.targets.find(t => t.relation === 'TRAI_CHU')`
   - `traiChuName = traiChuTarget ? traiChuTarget.full_name : form.users?.full_name`
   - `traiChuDharma = traiChuTarget?.dharma_name`
   - `actualTargets = form.targets.filter(t => t.relation !== 'TRAI_CHU')`
2. **Cập nhật Trạng thái In**:
   - Khi nhấn nút "Đánh dấu ĐÃ IN thành công", action `markAsPrinted(selectedIds)` cập nhật `status = 'Printed'` trong bảng `forms` và ghi nhật ký vào bảng `print_history`.

---

## 7. CÁC QUY TẮC CSS VÀ STYLING IN ÁN (CSS & STYLING RULES)

- **Font Family**: Định dạng bắt buộc Times New Roman cho toàn bộ bản in:
  ```css
  .so-page-block, .so-page-block *, .receipt-print-area, .receipt-print-area *, .receipt-preview, .receipt-preview *, .print-font-times, .print-font-times * {
    font-family: "Times New Roman", Times, serif !important;
  }
  ```
- **Kiểm soát Ngắt Trang Media Print**:
  ```css
  @media print {
    .break-after-page {
      page-break-after: always !important;
      break-after: page !important;
    }
    .break-inside-avoid {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  }
  ```
- **Cấu hình Margins Trình duyệt**:
  - `@page so-portrait-page`: `size: A4 portrait; margin: 12mm 15mm;`
  - `@page so-page`: `size: A4 landscape; margin: 10mm;`

---

## 8. KẾT LUẬN & ĐỀ XUẤT CHO MILESTONE M2 (TEMPLATES & RENDER ENGINE)

1. **Khôi phục đầy đủ 3 Layout Modes**: Dựa trên phân tích mã nguồn legacy ở trên, hệ thống React Native / Mobile hoặc Web app mới ở Milestone M2 cần duy trì chính xác 3 chế độ:
   - Bản Dọc A4 Chuẩn (`READING`)
   - Bản Ngang Dán Chánh Điện (`POSTER`) với nét đứt `✂`
   - Bản Linh Vị (`PHUNG_VI`) với tiêu đề `PHỤNG VÌ` ở đỉnh và `TỌA VỊ` ở đáy (loại bỏ mã số).
2. **Chuẩn hóa Thuật toán Line-Weight**: Sử dụng trọng số dòng trong `lineWeight.ts` làm chuẩn cho việc ngắt cột tự động và chèn lại `[Mã (Tiếp)]` khi danh sách vượt quá 28 dòng/cột.
3. **Quản lý Font & Background**: Đảm bảo font chữ Times New Roman và thuộc tính `print-color-adjust: exact` được áp dụng nhất quán trên các trình duyệt/thiết bị xuất PDF.
