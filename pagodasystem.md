# TÀI LIỆU ĐẶC TẢ YÊU CẦU HỆ THỐNG HOÀN CHỈNH (PRD) - PHIÊN BẢN CHUYÊN NGHIỆP
## DỰ ÁN: HỆ THỐNG QUẢN LÝ PHÁP SỰ & WEBSITE CHÙA (ERP MINI)

---

### PHẦN 1: TỔNG QUAN HỆ THỐNG
Đây là hệ thống quản lý toàn diện cho nhà chùa, không chỉ là website thông tin mà còn là hệ thống ERP thu nhỏ để quản lý Phật tử, phiếu Cầu An/Cầu Siêu, cúng dường, và in ấn sớ chuyên nghiệp.

### PHẦN 2: CẤU TRÚC PHÂN QUYỀN (RBAC - ROLE BASED ACCESS CONTROL)
Sử dụng mô hình Permission-based để mở rộng linh hoạt:
1. **ADMIN**: Full schema control, cấu hình hệ thống, xem Audit Log, quản lý toàn bộ.
2. **MONK (Tăng Ni)**: Kiểm duyệt nội dung (Sự kiện/Bài viết), quản lý phiếu, cấp mã số hậu tố (99A), cấu hình sự kiện/giờ đọc.
3. **VOLUNTEER (Phụng sự viên)**: Soạn thảo nội dung (nháp), tạo phiếu thủ công, sửa lỗi phiếu, in sớ, xác nhận cúng dường tại chùa.
4. **USER (Phật tử)**: Đăng ký tài khoản, gửi phiếu, tra cứu, chỉnh sửa phiếu (trong 24h & chưa in).

### PHẦN 3: CÁC MODULE NGHIỆP VỤ CỐT LÕI
1. **Quản lý Phiếu (State Machine & Workflow)**:
   - Các trạng thái (State Machine): Draft -> Submitted -> Waiting Verification -> Accepted -> Printed -> Completed.
   - Trạng thái bổ sung: Rejected, Cancelled, Expired, Need Reprint, Archived.
   - Soft Delete: Mọi thao tác xóa đều sử dụng `deleted_at` để bảo toàn dữ liệu cho Audit Log.
   - Phiếu Cầu An và Cầu Siêu dùng bộ đếm số độc lập (CA-001, CS-001).

2. **Quản lý Sự kiện & Load Balancing (Cân bằng tải)**:
   - Cấu hình khung giờ (7:00, 14:00, 18:00) và giới hạn sức chứa (Max Capacity).
   - Phật tử chủ động chọn giờ hoặc chọn "Ủy nhiệm cho chùa". Nếu ủy nhiệm, thuật toán sẽ tự động phân bổ vào ca trống nhất để cân bằng.

3. **In ấn & Quản lý Biểu mẫu (Dynamic Templating)**:
   - Hỗ trợ Upload phôi `.docx` (cầu an, bản đọc của thầy, biên lai) với placeholders: `{form_code}`, `{owner_name}`, `{target_names}`, `{donation_amount}`.
   - Hỗ trợ "Sớ 4 cột" bằng HTML-Overlay & **Line-Weight Algorithm**: 
     + Tối đa 28 dòng/cột. 
     + Trọng số: Form Code = 4 dòng, Tên ngắn = 1 dòng, Tên dài = 2 dòng. 
     + Tự động ngắt cột, chèn lại mã số (ví dụ: [CS-147 (Tiếp)]) khi hết 28 dòng.

4. **Luồng Cúng dường O2O (Online to Offline)**:
   - Online chỉ để đăng ký. Trạng thái phiếu là `PENDING`. 
   - Tại chùa, Phụng sự viên nhận tiền, in biên lai nhiệt, xác nhận phiếu thành `ACCEPTED`.
   - Hệ thống thống kê tổng tiền mặt theo ngày/ca/người thu.

### PHẦN 4: CƠ SỞ DỮ LIỆU CHUẨN HÓA (SUPABASE/POSTGRESQL)
- **users**: id, full_name, role, phone, email, ...
- **events**: id, title, type, time_slots, max_capacity, ...
- **forms**: id, form_code, status (State machine), is_delegated, scheduled_date, ...
- **target_persons**: (TÁCH BẢNG) id, form_id, full_name, dharma_name, relation, type.
- **donations**: (TÁCH BẢNG) id, form_id, amount, payment_method, collector, receipt_no.
- **form_revisions**: (LƯU VẾT SỬA) id, form_id, field, old_val, new_val, changed_by.
- **print_history**: (NHẬT KÝ IN) id, form_id, printed_by, reason.
- **templates**: (VERSIONING) id, template_type, file_url, version.
- **audit_logs**: id, user_id, action, table, record_id, details.
- **media_library**: (MEDIA) id, folder, album, tag.
- **settings**: (CONFIG) id, key, value.

### PHẦN 5: BỔ SUNG KHÁC
- Notification: Email/Web thông báo trạng thái phiếu.
- Dashboard: Thống kê thời gian thực (Phiếu mới, Tiền cúng dường, Tình trạng sớ).
- SEO & Sitemap: Tối ưu cho website chùa.

---
## PROMPT CHO AI BUILDER (DÀNH CHO CURSOR / ANTIGRAVITY)
(Copy đoạn dưới đây để AI tự sinh code)

"Act as an expert Full-stack Developer. Build a Pagoda ERP System using Next.js, Supabase, and Tailwind. 
Implement the following architecture strictly:
1. RBAC with RLS: Roles: ADMIN, MONK, VOLUNTEER, USER.
2. Form Workflow: Use a State Machine for status: [Draft -> Submitted -> Waiting Verification -> Accepted -> Printed -> Completed]. Use Soft Delete for all data.
3. Database: Normalize tables (donations, target_persons, form_revisions, print_history). 
4. Load Balancing: Backend logic to auto-assign slots for `is_delegated=true` based on lowest occupancy.
5. Templating: 
   - Docx-template engine for CauAn_Vertical, CauSieu_Reading, Receipt.
   - HTML-Overlay + Line-Weight Algorithm for CauSieu_Board: Max 28 lines/col. Form Code=4 lines, Short Name=1 line, Long Name=2 lines. Handle column-breaks with repeating form_code.
6. O2O Donation: Status 'PENDING' until confirmed by Volunteer at the desk, trigger thermal receipt print.
7. System: Implement Audit Logs, Form Revisions, Print History, Dashboard statistics, Media Library, and Global Settings table."
