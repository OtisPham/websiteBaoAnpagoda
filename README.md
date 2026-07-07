# Pagoda Management System (Hệ thống Quản lý Chùa O2O)

Hệ thống quản lý tổng thể cho Chùa Báo Ân, kết nối giữa Phật tử và Ban Trị Sự (Tăng Ni, Tình nguyện viên). 

## Các tính năng chính
1. **Phật tử (O2O)**: Đăng ký sớ Cầu An, Cầu Siêu trực tuyến. Cập nhật trạng thái sớ, theo dõi lịch sử cúng dường.
2. **Quầy Công Đức (Donation Desk)**: Ban Trị Sự tiếp nhận đóng góp tịnh tài tại quầy, in biên lai công đức K80 bằng máy in nhiệt.
3. **Quản lý Đại Lễ**: Lên lịch các sự kiện lớn (Vu Lan, Cầu An Đầu Năm), chia ca cúng để Phật tử hoặc Chùa tự động sắp xếp.
4. **Trạm In Sớ**: In sớ hàng loạt dồn phải theo khổ giấy truyền thống. Hỗ trợ in dọc (vertical writing).
5. **Quản lý Phôi Sớ Động (Dynamic Print Templates)**: Admin có thể tải lên các file hình ảnh phôi sớ mới. Tại trạm in, Tăng Ni có thể chọn phôi phù hợp, nội dung sớ sẽ tự động được in đè lên trên hình nền phôi đã chọn.

## Cài đặt & Chạy dự án

```bash
npm install
npm run dev
```

## Cấu trúc CSDL (Supabase)
Dự án sử dụng Supabase làm Backend-as-a-Service (BaaS). Các bảng chính bao gồm:
- `users`: Quản lý người dùng và phân quyền (ADMIN, MONK, VOLUNTEER, USER).
- `forms`: Quản lý các phiếu sớ.
- `target_persons`: Quản lý danh sách người thụ lễ (Hương linh / Phật tử).
- `donations`: Quản lý đóng góp tịnh tài.
- `events`: Quản lý Đại lễ.
- `templates`: Quản lý phôi sớ động.
