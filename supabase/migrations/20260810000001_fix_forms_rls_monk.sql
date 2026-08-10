-- Sửa lỗi RLS trên bảng forms khiến tài khoản MONK không thấy dữ liệu
drop policy if exists "Forms - volunteer and monk can manage all active forms" on public.forms;

create policy "Forms - volunteer and monk can manage all active forms" 
  on public.forms 
  for all 
  to authenticated 
  using (public.is_volunteer() or public.is_monk());
