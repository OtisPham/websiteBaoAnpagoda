-- Cập nhật RLS bảng donations: Chỉ cho phép Quý Thầy (MONK/ADMIN) xem và quản lý tiền cúng dường.
-- Tình nguyện viên (VOLUNTEER) sẽ không được phép truy cập.

drop policy if exists "Donations - admin/monk/volunteer can manage" on public.donations;

create policy "Donations - monk can manage" 
  on public.donations 
  for all 
  to authenticated 
  using (public.is_monk());
