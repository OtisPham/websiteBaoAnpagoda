# Pagoda Management System (Hệ thống Quản lý Chùa O2O & Bổn Tự Pháp Ấn)

Hệ thống quản lý tổng thể cho Chùa Báo Ân, kết nối giữa Phật tử, Tăng Ni và Ban Trị Sự (Tình nguyện viên), được xây dựng theo chuẩn giao diện chốn thiền môn thanh tịnh.

## Các tính năng chính

1. **Cổng Thông Tin Công Khai & Quản Trị Người Dùng**:
   - Trang chủ giới thiệu Đạo phong, Di sản, Lịch Pháp Sự và Thông báo Phật sự.
   - Thời gian hoạt động bổn tự hiển thị chuẩn xác tại Footer: `Sáng (8:00 - 11:00) • Chiều (14:00 - 20:00)`.
   - Trang Đăng nhập/Đăng ký hỗ trợ nút ẩn/hiện mật khẩu tiện lợi, phân quyền rõ ràng (ADMIN, MONK, VOLUNTEER, USER).
   - *Lưu ý:* Tính năng tự do đăng ký sớ trực tuyến công khai ngoài trang chủ hiện tạm ẩn theo yêu cầu thực tế từ Nhà Chùa, tập trung việc lập sớ cho Ban Trị Sự và nội bộ.

2. **Quản Lý Form Phiếu Sớ Tối Ưu (`forms` & `target_persons`)**:
   - Lập và lưu trữ danh sách phiếu Cầu An, Cầu Siêu.
   - Trải nghiệm nhập liệu tối ưu với **nút `(+)` thêm tên ngay tại hàng điền cuối cùng**, giúp thao tác nhanh chóng không cần cuộn ngược lên trên.

3. **Trạm In Sớ Đa Chế Độ (`/dashboard/print`)**:
   - **Mẫu in ngang dán chánh điện:** Hiển thị số trang trọng, có hệ thống **đường nét đứt canh chuẩn trên/dưới và 2 cột biên ngoài cùng** để tiện cắt dán nối cột trên chánh điện.
   - **Mẫu in dọc chuẩn A4:** Gom tối ưu nội dung vừa vặn trong 1 trang A4, không bị tràn trang dưới.
   - **Mẫu Cầu Siêu tối ưu cột:** Chỉ hiển thị Tên & Pháp danh hương linh, khoảng cách các cột liền kề được thu hẹp để chứa nhiều danh sách nhất. Tự động ngắt cột sau tối đa 15 hương linh/cột.
   - **Mẫu chuyên biệt "Phụng vì - Tọa vị":** Bỏ số thứ tự trên cùng, thay thế bằng tiêu đề trang trọng **"PHỤNG VÌ"**, giữa là danh sách hương linh/đối tượng và kết thúc cuối trang bằng **"TỌA VỊ"**.

4. **Quản Lý Phôi Sớ Động (Dynamic Print Templates)**:
   - Admin có thể tải lên các file hình ảnh phôi sớ mới. Tại trạm in, Tăng Ni có thể chọn phôi phù hợp, nội dung sớ tự động canh chỉnh và in đè lên trên hình nền phôi đã chọn.

5. **Quầy Công Đức & In Biên Lai (Donation Desk)**:
   - Ban Trị Sự tiếp nhận đóng góp tịnh tài tại quầy, in biên lai công đức (hỗ trợ khổ giấy nhiệt K80 và trang in A4).

6. **Quản Lý Đại Lễ (`events`) & Tin Tức (`posts`)**:
   - Lên lịch các sự kiện lớn (Vu Lan, Phật Đản, Khóa Tu Tỉnh Thức), chia ca cúng.
   - Quản trị và đăng tải thông báo phật sự, pháp thoại lên trang tin tức.

## Cài đặt & Chạy dự án

```bash
npm install
npm run dev
```

## Cấu trúc CSDL (Supabase)
Dự án sử dụng Supabase làm Backend-as-a-Service (BaaS). Các bảng chính bao gồm:
- `users`: Quản lý người dùng và phân quyền (ADMIN, MONK, VOLUNTEER, USER).
- `forms`: Quản lý các phiếu sớ Cầu An, Cầu Siêu.
- `target_persons`: Quản lý danh sách người thụ lễ (Hương linh / Phật tử) kèm chi tiết hàng cột.
- `donations`: Quản lý đóng góp tịnh tài & biên lai công đức.
- `events`: Quản lý Lịch pháp sự & Đại lễ.
- `posts`: Quản lý bài viết, thông báo phật sự & pháp thoại.
- `templates`: Quản lý phôi sớ động nền hình ảnh.
