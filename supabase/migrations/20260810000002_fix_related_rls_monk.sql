-- Sửa lỗi RLS trên bảng target_persons và donations khiến tài khoản MONK không thấy dữ liệu
drop policy if exists "Targets - admin/monk/volunteer can view and manage all" on public.target_persons;
create policy "Targets - admin/monk/volunteer can view and manage all" 
  on public.target_persons 
  for all 
  to authenticated 
  using (public.is_volunteer() or public.is_monk());

drop policy if exists "Donations - admin/monk/volunteer can manage" on public.donations;
create policy "Donations - admin/monk/volunteer can manage" 
  on public.donations 
  for all 
  to authenticated 
  using (public.is_volunteer() or public.is_monk());
