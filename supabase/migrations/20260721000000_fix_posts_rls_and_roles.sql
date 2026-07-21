-- ==========================================
-- BỔ SUNG CÁC CỘT CÒN THIẾU TRONG BẢNG POSTS
-- ==========================================
alter table public.posts add column if not exists thumbnail_url text;
alter table public.posts add column if not exists category text default 'PHẬT PHÁP';
alter table public.posts add column if not exists approved_by uuid references public.users(id) on delete set null;

-- ==========================================
-- CHUẨN HÓA CÁC HÀM CHECK ROLE (RBAC)
-- ==========================================

create or replace function public.is_admin()
returns boolean as $$
begin
  return (select upper(role) in ('ADMIN', 'MASTER') from public.users where id = auth.uid() and deleted_at is null);
end;
$$ language plpgsql security definer;

create or replace function public.is_monk()
returns boolean as $$
begin
  return (select upper(role) in ('ADMIN', 'MASTER', 'MONK') from public.users where id = auth.uid() and deleted_at is null);
end;
$$ language plpgsql security definer;

-- LƯU Ý QUAN TRỌNG: is_volunteer() CHỈ trả về true nếu role chính xác là VOLUNTEER.
-- Không gộp MONK / ADMIN vào is_volunteer() để tránh tình trạng Quý Thầy bị dính điều kiện kiểm tra
-- WITH CHECK (status in ('DRAFT', 'PENDING_APPROVAL')) dành cho tình nguyện viên.
create or replace function public.is_volunteer()
returns boolean as $$
begin
  return (select upper(role) = 'VOLUNTEER' from public.users where id = auth.uid() and deleted_at is null);
end;
$$ language plpgsql security definer;

-- ==========================================
-- CẬP NHẬT LẠI ROW LEVEL SECURITY (RLS) CHO POSTS
-- ==========================================

drop policy if exists "Posts - published viewable by everyone" on public.posts;
drop policy if exists "Posts - monk and admin have full access" on public.posts;
drop policy if exists "Posts - volunteer can create and view all" on public.posts;

create policy "Posts - published viewable by everyone" 
  on public.posts 
  for select 
  using (status = 'PUBLISHED' or public.is_monk());

create policy "Posts - monk and admin have full access" 
  on public.posts 
  for all 
  to authenticated 
  using (public.is_monk()) 
  with check (public.is_monk());

create policy "Posts - volunteer can create and view all" 
  on public.posts 
  for all 
  to authenticated 
  using (public.is_volunteer()) 
  with check (public.is_volunteer() and status in ('DRAFT', 'PENDING_APPROVAL'));
