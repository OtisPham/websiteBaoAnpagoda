# Original User Request

## Initial Request — 2026-07-24T16:25:57Z

<USER_REQUEST>
# Teamwork Project Prompt

Xây dựng và kiểm thử hệ thống Trạm In Ấn Sớ PDF cho ứng dụng React Native đa nền tảng, hỗ trợ đa chế độ in (Ngang dán chánh điện, Dọc A4, và mẫu Phụng Vì - Tọa Vị).

Working directory: c:/Users/ADMIN/Desktop/pagoda-app
Integrity mode: development

## Requirements

### R1. Phục hồi Mẫu in (Templates) cũ
Đặc vụ cần tìm và đọc các file mẫu in cũ từ thư mục dự án Next.js (c:/Users/ADMIN/Desktop/pagodaweb), sau đó thiết kế và tái tạo lại chúng bằng các thư viện phù hợp.

### R2. Xây dựng Trạm In Ấn Sớ
Xây dựng giao diện xem trước PDF (Preview) và in sớ (Print) trên React Native đa nền tảng. Đặc vụ được toàn quyền quyết định lựa chọn thư viện và phương pháp kỹ thuật xuất PDF tốt nhất.

## Acceptance Criteria

### Xác thực kỹ thuật (Technical Verification) bằng Agent-as-judge
- [ ] Phải có một file script hoặc hàm test nhỏ xuất HTML/PDF mẫu (Dummy Export) ra file vật lý.
- [ ] Một Đặc vụ đánh giá độc lập (Agent-as-judge) có thể đọc file Dummy Export đó và xác nhận rằng phôi in có chứa đủ các trường dữ liệu tĩnh (như "Chùa Báo Ân", "Sớ Cầu An/Cầu Siêu") mà không bị lỗi layout nghiêm trọng.
- [ ] Code không bị báo lỗi TypeScript khi chạy lệnh kiểm tra.
</USER_REQUEST>
