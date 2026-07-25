# BÁO CÁO PHÂN TÍCH KỸ THUẬT: CROSS-PLATFORM PDF GENERATION & PREVIEW (MILESTONE M1 - EXPLORER 3)

**Dự án**: Pagoda ERP & React Native Mobile App (`c:\Users\ADMIN\Desktop\pagodaweb` & `c:\Users\ADMIN\Desktop\pagoda-app`)  
**Ngày thực hiện**: 24/07/2026  
**Người thực hiện**: Explorer 3 (Milestone M1)  
**Chủ đề**: Kiến trúc Xuất & Xem trước PDF Đa nền nền tảng cho React Native / Expo, Phân tích 3 Mode In, CSS & Font Chuyên dụng, và Chiến lược Kiểm thử Tự động (Node/TS Verification Script).

---

## 1. TỔNG QUAN VÀ MỤC TIÊU KIẾN TRÚC

Trạm In Sớ trên ứng dụng di động React Native (`pagoda-app`) yêu cầu một giải pháp xuất và xem trước PDF đồng nhất, chính xác về mặt mỹ thuật truyền thống Phật giáo, hỗ trợ in ấn tại chỗ (Bổn tự Chùa Báo Ân) và xuất file gửi cho Phật tử.

### 1.1. Các Yêu cầu Cốt lõi:
1. **Đa chế độ Render (Multi-mode Rendering)**:
   - **Horizontal (`POSTER` mode)**: Ngang dán Chánh điện (A4 Landscape, 4 cột/trang, mã phiếu siêu lớn, nét cắt `✂`).
   - **Vertical A4 (`READING` mode)**: Dọc A4 Mẫu Quý Thầy đọc (A4 Portrait, đóng khung khít 1 trang 270mm, 1-4 cột).
   - **Phụng Vì - Tọa Vị (`PHUNG_VI` mode)**: Linh vị cúng chư Hương Linh (Bài vị thờ, tiêu đề `PHỤNG VÌ` ở đỉnh, `TỌA VỊ` ở đáy, loại bỏ toàn bộ mã số/STT).
2. **Đồng nhất Giao diện Xem trước & File PDF**: Người dùng thấy gì trên màn hình di động (Preview) thì file PDF xuất ra và bản in trên giấy A4 phải chính xác 100% như vậy.
3. **Chạy Cross-Platform**: Hoạt động hoàn hảo trên iOS, Android (thông qua React Native / Expo) và Web / Node.js backend.
4. **Hỗ trợ Tiếng Việt & Mỹ thuật Truyền thống**: Tránh lỗi font chữ tiếng Việt (dấu hỏi, ngã, nặng, các ký tự unicode đặc thù), hỗ trợ font Serif Times New Roman chuẩn, hoa văn phôi sớ nền, ấn đỏ cổ tự, và tùy chọn chữ dọc (`writing-mode: vertical-rl`).

---

## 2. PHÂN TÍCH CHI TIẾT 3 CHẾ ĐỘ RENDER SỚ (MULTI-MODE RENDERING)

Dựa trên mã nguồn legacy tại `PrintStation.tsx` và `lineWeight.ts`, cấu trúc kỹ thuật cho 3 chế độ in được quy định như sau:

### 2.1. Chế độ In Dọc A4 (`READING` Mode - Mẫu Quý Thầy Đọc)
- **Định dạng giấy**: A4 Portrait (`210mm x 297mm`).
- **Kích thước vùng chứa**: Lề `12mm top/bottom`, `15mm left/right`. Khung bao nội dung vừa khít `270mm` chiều cao để đảm bảo **luôn nằm trọn trên 1 trang A4 duy nhất**, không tràn sang trang thứ 2.
- **Thành phần giao diện**:
  1. **Header Trang Nghiêm**:
     - Mẫu ấn đỏ cổ tự: `"Báo Ân Cổ Tự Pháp Ấn"` (khung kép đỏ).
     - Tiêu đề: `"Phật Giáo Việt Nam • Bổn Tự Chùa Báo Ân"`.
     - Tên sớ: `"Sớ Phục Nguyện Cầu An"` hoặc `"Sớ Phục Nguyện Cầu Siêu"`.
     - Phật hiệu:
       - Cầu An: `"Nam Mô Tiêu Tai Diên Thọ Dược Sư Lưu Ly Quang Vương Phật"`.
       - Cầu Siêu: `"Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật"`.
  2. **Thông tin Trai chủ**: Trai chủ / Gia chủ khấn nguyện, kèm Pháp danh, SĐT, Lời khấn.
  3. **Danh sách Thụ lễ / Hương linh**: Lọc bỏ Trai chủ, tự động phân 1 đến 4 cột (`MAX_PER_COL = 15` người/cột). Danh sách 5-15 người chia 2 cột cho cân đối.
  4. **Footer & Chữ ký**: Lời nguyện cầu chuẩn bài bản + 2 vùng chữ ký: *Trai Chủ Khấn Nguyện* vs *Chùa Báo Ân Bổn Tự Khâm Nguyện*.
  5. **Phôi Nền (Background Overlay)**: Đèn hoa văn sớ nền với CSS `background-size: cover` và `-webkit-print-color-adjust: exact !important`.

### 2.2. Chế độ In Ngang Dán Chánh Điện (`POSTER` Mode - Bảng Dán)
- **Định dạng giấy**: A4 Landscape (`297mm x 210mm`).
- **Kích thước vùng chứa**: Lề `10mm`. Kích thước in: `277mm x 190mm`.
- **Cấu trúc dồn cột**:
  - Gom **4 cột kề bên nhau** trên mỗi trang A4 Ngang (`MAX_COLS_PER_PAGE = 4`).
  - Đầu mỗi cột hiển thị **Mã đuôi 3 chữ số** in siêu lớn (`fontSize: 64px`, `fontWeight: bold`).
  - Danh sách tên in hoa cỡ lớn (`fontSize: 20px`, `fontWeight: bold`, `uppercase`).
  - Đường biên cột: Đường nét đứt (`border-dashed border-stone-400 print:border-stone-500`) kèm biểu tượng kéo cắt (`✂`) ở các góc giúp Phụng sự viên dễ dàng cắt dán nối tiếp thành băng rôn dài dán tại Chánh điện.

### 2.3. Chế độ In Linh Vị Phụng Vì - Tọa Vị (`PHUNG_VI` Mode - Bài Vị)
- **Mục đích**: In bài vị thờ / linh vị cúng cho chư Hương linh.
- **Quy tắc Tuyệt đối**: **HOÀN TOÀN BỎ MÃ PHIẾU, SỐ THỨ TỰ, MÃ CA LỄ Ở ĐẦU TRANG VÀ ĐẦU CỘT**.
- **Cấu trúc Bài Vị**:
  - **Đỉnh Bài Vị**: 
    - Câu niệm: `"Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật"` (chữ nghiêng nhỏ).
    - Tiêu đề chính: **`"PHỤNG VÌ"`** (chữ in hoa cỡ lớn `3xl`, `font-serif`, `font-bold`, `amber-950`, đường kẻ ngang trang trọng).
  - **Thân Bài Vị**:
    - Danh sách tên chư Hương linh in chữ cỡ lớn trang nghiêm (`text-xl font-bold uppercase`).
  - **Đáy Bài Vị**:
    - Tiêu đề kết chốt: **`"TỌA VỊ"`** (chữ in hoa `2xl`, `font-serif`, `font-bold`, `amber-950`).
    - Dòng chữ phụ: `"Chùa Báo Ân • Linh Vị"`.

---

## 3. SO SÁNH CÁC GIẢI PHÁP KIẾN TRÚC ON REACT NATIVE (`pagoda-app`)

Chúng ta tiến hành so sánh 4 phương án kỹ thuật khả thi cho xuất & preview PDF trên React Native / Expo:

| Tiêu chí | Phương án A: HTML-to-PDF via `expo-print` + `react-native-webview` (Khuyên dùng) | Phương án B: `@react-pdf/renderer` (Declarative React PDF) | Phương án C: Native PDF Modules (`react-native-html-to-pdf`) | Phương án D: Server-side PDF API (Puppeteer/Next.js) |
|---|---|---|---|---|
| **Cơ chế hoạt động** | Template engine sinh chuỗi HTML/CSS. WebView render live preview. `expo-print` chuyển HTML thành PDF native. | Render JSX components (`<Document>`, `<Page>`, `<Text>`) thành PDF binary qua JS engine. | Gọi Native Module iOS/Android (UIGraphicsPDFRenderer / PdfDocument). | App gửi request đến Server Next.js, Server dùng Puppeteer trả file PDF binary. |
| **Đồng nhất Template** | **100% Đồng nhất**: Cùng 1 hàm `renderSoHtml(data, mode)` dùng chung cho Mobile Preview, Mobile Export, Web Next.js, và Node verification script. | Phải viết lại 100% giao diện bằng thẻ riêng (`<Page>`, `<View>`, `<Text>`), không dùng lại CSS HTML của Web. | Dùng HTML/CSS nhưng phụ thuộc thư viện native cũ. | Dùng chung HTML/CSS trên Server. |
| **Tốc độ Preview** | Nhanh, mượt mà trên WebView. | Cần chuyển PDF binary thành image/view để preview. | Cần tạo file PDF rồi dùng `react-native-pdf` để render. | Phụ thuộc tốc độ mạng và độ trễ Server. |
| **Hỗ trợ Offline tại Chùa** | **100% Offline**: Không cần kết nối Internet hay Server backend. | **100% Offline**. | **100% Offline**. | **KHÔNG** (Thất bại nếu chùa mất mạng). |
| **Khả năng tùy biến CSS** | Rất cao: Hỗ trợ Flexbox, Grid, `@page`, `-webkit-print-color-adjust`, base64 fonts, `writing-mode`. | Hạn chế: Chỉ hỗ trợ subset CSS của PDFkit, không hỗ trợ multi-column flex tự động, không `writing-mode`. | Khá cao, nhưng thư viện đã ngưng bảo trì. | Rất cao (Full Headless Chrome). |
| **Độ tương thích Expo** | **Hoàn hảo** (Thư viện chuẩn Expo SDK `expo-print`, `expo-sharing`, `react-native-webview`). | Phức tạp (Cần polyfill `stream`, `buffer`, `zlib` cho Metro bundler). | Kém (Cần Native Code / Eject khỏi Expo Go). | Hoàn hảo trên Client. |

### Kết luận Phương án Kiến trúc Khuyên dùng:
**Phương án A (`expo-print` + `react-native-webview` + HTML Template Shared Engine)** là phương án tối ưu vượt trội.
- **Hàm core template**: `generateSoHtml(data: FormRecord, mode: PrintMode): string`
- **Live Preview UI**: `<WebView source={{ html: generateSoHtml(form, mode) }} style={{ flex: 1 }} />`
- **Xuất file PDF**: `const { uri } = await Print.printToFileAsync({ html: generateSoHtml(form, mode) })`
- **In trực tiếp ra máy in WiFi/LAN**: `await Print.printAsync({ uri })` hoặc `await Print.printAsync({ html })`
- **Chia sẻ / Lưu file**: `await Sharing.shareAsync(uri)`

---

## 4. QUẢN LÝ FONT CHỮ, STYLING CSS VÀ XỬ LÝ CHỮ DỌC (VERTICAL TEXT)

### 4.1. Giải pháp Font Chữ Tiếng Việt Chuyên dụng (Embedded Base64 Fonts)
- **Vấn đề**: Khi ứng dụng di động xuất PDF offline hoặc WebView hiển thị trong môi trường không có mạng, các font Google Fonts gọi qua `@import url('https://fonts.googleapis.com/...')` sẽ bị timeout hoặc fallback về font hệ thống mặc định, gây lỗi hiển thị ký tự Tiếng Việt (dấu tiếng Việt bị lệch/ô vuông).
- **Giải pháp Kiến trúc**:
  1. Sử dụng font bộ Serif chuẩn: `font-family: "Times New Roman", Times, serif !important;` (hỗ trợ sẵn 100% Unicode tiếng Việt trên cả iOS, Android, Windows và macOS).
  2. Đối với font cổ truyền / Hán-Nôm / Calligraphy (như *Nom Na Tong Light*, *Hannom*, *Noto Serif Vietnamese*): Nhúng trực tiếp chuỗi Base64 Data URI vào CSS template:
     ```css
     @font-face {
       font-family: 'NomNaTong';
       src: url('data:font/ttf;charset=utf-8;base64,AAEAAAASAQA...') format('truetype');
       font-weight: normal;
       font-style: normal;
     }
     ```

### 4.2. Styling CSS Chuẩn cho PDF & Ngắt Trang
Để đảm bảo PDF không bị vỡ khung hay tràn trang bất ngờ:
```css
/* Thiết lập lề và hướng trang */
@page {
  size: A4 portrait;
  margin: 10mm;
}
@page landscape {
  size: A4 landscape;
  margin: 10mm;
}

/* Ép in màu nền và hoa văn phôi sớ */
* {
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

/* Kiểm soát ngắt trang */
.page-break {
  page-break-after: always !important;
  break-after: page !important;
}
.avoid-break {
  page-break-inside: avoid !important;
  break-inside: avoid !important;
}

/* Ép font Times New Roman chuẩn */
.so-container, .so-container * {
  font-family: "Times New Roman", Times, serif !important;
}
```

### 4.3. Xử lý Chữ Dọc Truyền Thống (Vertical Writing Mode)
Đối với câu đối hoặc sớ viết chữ dọc từ trên xuống dưới, từ phải sang trái:
```css
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.1em;
}
```
Khi render trên WebView và Chromium print engine của `expo-print` / Puppeteer, CSS `writing-mode: vertical-rl` hiển thị cực kỳ chuẩn xác cho văn bản Hán-Nôm và Quốc ngữ dạng dọc.

---

## 5. THIẾT KẾ CHIẾN LƯỢC KIỂM THỬ TỰ ĐỘNG (NODE/TS DUMMY EXPORT SCRIPT)

Để phục vụ kiểm thử độc lập (Agent-as-judge inspection) mà không cần bật thiết bị di động thật hay giả lập Android/iOS, chúng ta thiết kế **Kịch bản xuất thử nghiệm Node/TypeScript (`scripts/verify-pdf-export.ts`)**.

### 5.1. Kiến trúc Script Export Kiểm thử (`verify-pdf-export.ts`)
1. **Mục đích**: Nhận dữ liệu giả lập (Mock Data), render chuỗi HTML thông qua template engine `generateSoHtml()`, và ghi trực tiếp ra các file vật lý `.html` và `.pdf` trên đĩa cứng trong thư mục `output/`.
2. **Luồng thực thi (Execution Pipeline)**:
   ```typescript
   // 1. Khởi tạo Mock Data cho 3 modes
   const mockReadingData = getMockForm('READING');
   const mockPosterData = getMockForm('POSTER');
   const mockPhungViData = getMockForm('PHUNG_VI');

   // 2. Render HTML string
   const htmlReading = renderSoHtml(mockReadingData, 'READING');
   const htmlPoster = renderSoHtml(mockPosterData, 'POSTER');
   const htmlPhungVi = renderSoHtml(mockPhungViData, 'PHUNG_VI');

   // 3. Ghi file physical .html
   fs.writeFileSync('./output/reading_a4.html', htmlReading);
   fs.writeFileSync('./output/poster_landscape.html', htmlPoster);
   fs.writeFileSync('./output/phung_vi.html', htmlPhungVi);

   // 4. Sinh file PDF vật lý via Puppeteer (nếu có môi trường Node Chrome)
   await generatePdfFromHtml(htmlReading, './output/reading_a4.pdf', { format: 'A4', landscape: false });
   await generatePdfFromHtml(htmlPoster, './output/poster_landscape.pdf', { format: 'A4', landscape: true });
   await generatePdfFromHtml(htmlPhungVi, './output/phung_vi.pdf', { format: 'A4', landscape: false });
   ```

### 5.2. Bộ Quy tắc Kiểm tra Tự động (Agent-as-Judge Assertions)
Một test suite hoặc script kiểm tra có thể tự động đọc nội dung file `.html` hoặc `.pdf` đã tạo để xác minh các tiêu chuẩn sau:

1. **Xác minh Văn bản Tĩnh (Static Text Invariants)**:
   - File output phải chứa chính xác chuỗi: `"Phật Giáo Việt Nam • Bổn Tự Chùa Báo Ân"`.
   - File output phải chứa chính xác chuỗi: `"Báo Ân Cổ Tự Pháp Ấn"`.
   - Đối với mode `PHUNG_VI`: File output **bắt buộc chứa** `"PHỤNG VÌ"` và `"TỌA VỊ"`, đồng thời **tuyệt đối KHÔNG được chứa** mã sớ (vd: `CA-`, `CS-`) hay số thứ tự cột.
   - Đối với mode `POSTER`: File output phải chứa biểu tượng kéo cắt `✂` và lớp CSS `border-dashed`.
2. **Xác minh Thuật toán Line-Weight chia cột**:
   - Kiểm tra số lượng dòng trong 1 cột không vượt quá 28 dòng.
   - Tên ngắn (< 15 ký tự) tính 1 dòng, tên dài (>= 15 ký tự) tính 2 dòng.
   - Khi tràn cột, mã sớ bổ sung `[Mã_Phiếu (Tiếp)]` phải xuất hiện ở đầu cột tiếp theo.

---

## 6. KẾT LUẬN VÀ LỘ TRÌNH MILESTONE M2 & M3

1. **Về mặt kỹ thuật xuất & preview**: Mô hình **HTML-to-PDF / WebView với `expo-print`** là giải pháp tối ưu nhất cho ứng dụng di động React Native `pagoda-app`.
2. **Về mặt khôi phục mẫu in**: Đã làm rõ chi tiết quy cách render cho cả 3 chế độ (`READING`, `POSTER`, `PHUNG_VI`), bộ văn bản tĩnh chuẩn tiếng Việt, và thuật toán chia cột dồn trang.
3. **Về mặt kiểm thử tự động**: Script Node/TS `verify-pdf-export.ts` sinh ra các file `.html` và `.pdf` thực tế trên đĩa cứng sẽ giúp Agent-as-judge và các Developer dễ dàng mở duyệt visual inspection và chạy test assertion tự động.
