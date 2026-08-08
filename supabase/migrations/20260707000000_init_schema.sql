-- Setup Extensions
create extension if not exists "uuid-ossp";

-- 1. BẢNG USERS (Profiles kết nối với auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text not null default 'USER' check (role in ('ADMIN', 'MONK', 'VOLUNTEER', 'USER')),
  phone text,
  email text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

-- Bật RLS cho users
alter table public.users enable row level security;

-- 2. BẢNG EVENTS (Sự kiện lớn, Lễ Cầu An/Cầu Siêu)
create table public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  type text not null check (type in ('CAU_AN', 'CAU_SIEU', 'KHAC')),
  scheduled_date date not null,
  time_slots jsonb not null, -- Định dạng: [{"time": "07:00", "max_capacity": 100}, ...]
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

alter table public.events enable row level security;

-- 3. BẢNG FORMS (Phiếu đăng ký Pháp sự)
create table public.forms (
  id uuid default gen_random_uuid() primary key,
  form_code text unique, -- CA-0001, CS-0001
  form_type text not null check (form_type in ('CAU_AN', 'CAU_SIEU')),
  status text not null default 'Draft' check (status in ('Draft', 'Submitted', 'Waiting Verification', 'Accepted', 'Printed', 'Completed', 'Rejected', 'Cancelled', 'Expired', 'Need Reprint', 'Archived')),
  is_delegated boolean not null default false,
  event_id uuid references public.events(id) on delete set null,
  scheduled_date date not null,
  selected_time_slot text,
  user_id uuid references public.users(id) on delete set null,
  note text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  deleted_at timestamp with time zone
);

alter table public.forms enable row level security;

-- 4. BẢNG TARGET_PERSONS (Hương linh / Người cầu an chi tiết)
create table public.target_persons (
  id uuid default gen_random_uuid() primary key,
  form_id uuid references public.forms(id) on delete cascade not null,
  full_name text not null,
  dharma_name text, -- Pháp danh
  birth_year integer,
  death_year integer, -- Chỉ dành cho cầu siêu
  relation text, -- Mối quan hệ với chủ phiếu
  type text not null check (type in ('CAU_AN', 'CAU_SIEU')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.target_persons enable row level security;

-- 5. BẢNG DONATIONS (Cúng dường O2O)
create table public.donations (
  id uuid default gen_random_uuid() primary key,
  form_id uuid references public.forms(id) on delete cascade not null,
  amount numeric(15, 2) not null default 0.00 check (amount >= 0),
  payment_method text check (payment_method in ('CASH', 'BANK_TRANSFER')),
  collector uuid references public.users(id) on delete set null,
  receipt_no text unique,
  payment_status text not null default 'PENDING' check (payment_status in ('PENDING', 'CONFIRMED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.donations enable row level security;

-- 6. BẢNG FORM_REVISIONS (Lưu vết thay đổi phiếu)
create table public.form_revisions (
  id uuid default gen_random_uuid() primary key,
  form_id uuid references public.forms(id) on delete cascade not null,
  field text not null,
  old_val text,
  new_val text,
  changed_by uuid references public.users(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.form_revisions enable row level security;

-- 7. BẢNG PRINT_HISTORY (Nhật ký in ấn)
create table public.print_history (
  id uuid default gen_random_uuid() primary key,
  form_id uuid references public.forms(id) on delete cascade not null,
  printed_by uuid references public.users(id) on delete set null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.print_history enable row level security;

-- 8. BẢNG TEMPLATES (Phôi mẫu sớ / Biên lai)
create table public.templates (
  id uuid default gen_random_uuid() primary key,
  template_type text not null unique check (template_type in ('CauAn_Vertical', 'CauSieu_Reading', 'Receipt')),
  file_url text not null,
  version integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.templates enable row level security;

-- 9. BẢNG AUDIT_LOGS (Log hệ thống chi tiết)
create table public.audit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  table_name text not null,
  record_id uuid not null,
  details jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.audit_logs enable row level security;

-- 10. BẢNG SETTINGS (Cấu hình chung của chùa)
create table public.settings (
  id uuid default gen_random_uuid() primary key,
  key text unique not null,
  value text,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.settings enable row level security;

-- 11. BẢNG MEDIA_LIBRARY (Hình ảnh)
create table public.media_library (
  id uuid default gen_random_uuid() primary key,
  folder text,
  album text,
  tag text,
  file_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.media_library enable row level security;

-- 12. BẢNG POSTS (Bài viết / Tin tức Phật sự)
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author_id uuid references public.users(id) on delete set null,
  approved_by uuid references public.users(id) on delete set null,
  status text not null default 'DRAFT' check (status in ('DRAFT', 'PENDING_APPROVAL', 'PUBLISHED')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.posts enable row level security;

-- ==========================================
-- SEQUENCES CHO FORM CODES & RECEIPTS
-- ==========================================
create sequence if not exists public.cau_an_seq start with 1;
create sequence if not exists public.cau_sieu_seq start with 1;
create sequence if not exists public.receipt_seq start with 1;

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- A. Tự động đồng bộ user từ auth.users sang public.users
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, full_name, email, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    new.email,
    new.phone,
    coalesce(new.raw_user_meta_data->>'role', 'USER')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- B. Tự động sinh Form Code & Receipt Code
create or replace function public.generate_codes_before_insert()
returns trigger as $$
begin
  if tg_table_name = 'forms' then
    if new.form_code is null then
      if new.form_type = 'CAU_AN' then
        new.form_code := 'CA' || lpad(nextval('public.cau_an_seq')::text, 3, '0');
      else
        new.form_code := 'CS' || lpad(nextval('public.cau_sieu_seq')::text, 3, '0');
      end if;
    end if;
  elsif tg_table_name = 'donations' then
    if new.receipt_no is null and new.payment_status = 'CONFIRMED' then
      new.receipt_no := 'BL-' || lpad(nextval('public.receipt_seq')::text, 6, '0');
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_forms_code_gen
  before insert on public.forms
  for each row execute procedure public.generate_codes_before_insert();

create trigger trg_donations_code_gen
  before insert or update of payment_status on public.donations
  for each row execute procedure public.generate_codes_before_insert();

-- C. Thuật toán Load Balancing phân phối ca cúng trống nhất
create or replace function public.get_least_occupied_slot(p_event_id uuid, p_scheduled_date date)
returns text as $$
declare
  v_slots jsonb;
  v_selected_slot text;
  v_min_occupancy numeric := 999999;
  v_slot_record record;
  v_current_count integer;
  v_max_capacity integer;
  v_occupancy numeric;
begin
  select time_slots into v_slots from public.events where id = p_event_id;
  
  if v_slots is null or jsonb_array_length(v_slots) = 0 then
    return null;
  end if;
  
  for v_slot_record in select * from jsonb_to_recordset(v_slots) as x(time text, max_capacity integer) loop
    select count(*) into v_current_count 
    from public.forms 
    where event_id = p_event_id 
      and scheduled_date = p_scheduled_date 
      and selected_time_slot = v_slot_record.time
      and status not in ('Draft', 'Cancelled', 'Rejected')
      and deleted_at is null;
      
    v_max_capacity := coalesce(v_slot_record.max_capacity, 100);
    v_occupancy := v_current_count::numeric / v_max_capacity::numeric;
    
    if v_occupancy < v_min_occupancy and v_current_count < v_max_capacity then
      v_min_occupancy := v_occupancy;
      v_selected_slot := v_slot_record.time;
    end if;
  end loop;
  
  if v_selected_slot is null then
    select x.time into v_selected_slot
    from jsonb_to_recordset(v_slots) as x(time text, max_capacity integer)
    order by x.max_capacity desc
    limit 1;
  end if;
  
  return v_selected_slot;
end;
$$ language plpgsql security definer;

-- Trigger tự động load balance khi is_delegated = true và selected_time_slot trống
create or replace function public.auto_assign_form_slot()
returns trigger as $$
begin
  if new.is_delegated = true and new.selected_time_slot is null and new.event_id is not null then
    new.selected_time_slot := public.get_least_occupied_slot(new.event_id, new.scheduled_date);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_auto_assign_slot
  before insert or update of is_delegated, event_id, scheduled_date on public.forms
  for each row execute procedure public.auto_assign_form_slot();

-- D. Tự động ghi nhận Form Revisions (lịch sử sửa đổi)
create or replace function public.process_form_revision()
returns trigger as $$
declare
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  
  if tg_op = 'UPDATE' then
    if old.status <> new.status then
      insert into public.form_revisions (form_id, field, old_val, new_val, changed_by)
      values (new.id, 'status', old.status, new.status, v_user_id);
    end if;
    
    if old.scheduled_date <> new.scheduled_date then
      insert into public.form_revisions (form_id, field, old_val, new_val, changed_by)
      values (new.id, 'scheduled_date', old.scheduled_date::text, new.scheduled_date::text, v_user_id);
    end if;

    if coalesce(old.selected_time_slot, '') <> coalesce(new.selected_time_slot, '') then
      insert into public.form_revisions (form_id, field, old_val, new_val, changed_by)
      values (new.id, 'selected_time_slot', old.selected_time_slot, new.selected_time_slot, v_user_id);
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger trg_forms_revision_logger
  after update on public.forms
  for each row execute procedure public.process_form_revision();

-- E. Audit Log logger trigger
create or replace function public.process_audit_log()
returns trigger as $$
declare
  v_user_id uuid;
  v_rec_id uuid;
  v_details jsonb;
begin
  v_user_id := auth.uid();
  
  if tg_op = 'DELETE' then
    v_rec_id := old.id;
    v_details := jsonb_build_object('old', to_jsonb(old));
  elsif tg_op = 'UPDATE' then
    v_rec_id := new.id;
    v_details := jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new));
  else
    v_rec_id := new.id;
    v_details := jsonb_build_object('new', to_jsonb(new));
  end if;

  insert into public.audit_logs (user_id, action, table_name, record_id, details)
  values (v_user_id, tg_op, tg_table_name, v_rec_id, v_details);
  
  return null;
end;
$$ language plpgsql security definer;

create trigger trg_audit_events after insert or update or delete on public.events for each row execute procedure public.process_audit_log();
create trigger trg_audit_forms after insert or update or delete on public.forms for each row execute procedure public.process_audit_log();
create trigger trg_audit_donations after insert or update or delete on public.donations for each row execute procedure public.process_audit_log();
create trigger trg_audit_settings after insert or update or delete on public.settings for each row execute procedure public.process_audit_log();
create trigger trg_audit_posts after insert or update or delete on public.posts for each row execute procedure public.process_audit_log();

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Helper functions to check roles
create or replace function public.is_admin()
returns boolean as $$
begin
  return (select role = 'ADMIN' from public.users where id = auth.uid() and deleted_at is null);
end;
$$ language plpgsql security definer;

create or replace function public.is_monk()
returns boolean as $$
begin
  return (select role in ('ADMIN', 'MONK') from public.users where id = auth.uid() and deleted_at is null);
end;
$$ language plpgsql security definer;

create or replace function public.is_volunteer()
returns boolean as $$
begin
  return (select role in ('ADMIN', 'MONK', 'VOLUNTEER') from public.users where id = auth.uid() and deleted_at is null);
end;
$$ language plpgsql security definer;

-- Policies for USERS table
create policy "Users - admin has full access" on public.users for all to authenticated using (public.is_admin());
create policy "Users - monk/volunteer can view all profiles" on public.users for select to authenticated using (public.is_volunteer());
create policy "Users - individuals can select their own profile" on public.users for select to authenticated using (auth.uid() = id);
create policy "Users - individuals can update their own profile" on public.users for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- Policies for EVENTS table
create policy "Events - viewable by everyone" on public.events for select using (deleted_at is null);
create policy "Events - writeable by monk and admin" on public.events for all to authenticated using (public.is_monk());

-- Policies for FORMS table
create policy "Forms - admin has full access" on public.forms for all to authenticated using (public.is_admin());
create policy "Forms - volunteer and monk can manage all active forms" on public.forms for all to authenticated using (public.is_volunteer());
create policy "Forms - users can select their own forms" on public.forms for select to authenticated using (auth.uid() = user_id and deleted_at is null);
create policy "Forms - users can insert their own forms" on public.forms for insert to authenticated with check (auth.uid() = user_id);
create policy "Forms - users can update their own forms within 24h if not printed" on public.forms for update to authenticated 
  using (auth.uid() = user_id and status in ('Draft', 'Submitted', 'Waiting Verification') and created_at > (now() - interval '24 hours'))
  with check (auth.uid() = user_id and status in ('Draft', 'Submitted', 'Waiting Verification'));

-- Policies for TARGET_PERSONS table
create policy "Targets - admin/monk/volunteer can view and manage all" on public.target_persons for all to authenticated using (public.is_volunteer());
create policy "Targets - user can view targets on their own forms" on public.target_persons for select to authenticated 
  using (exists (select 1 from public.forms f where f.id = form_id and f.user_id = auth.uid() and f.deleted_at is null));
create policy "Targets - user can insert/update targets on their own active forms" on public.target_persons for all to authenticated
  using (exists (select 1 from public.forms f where f.id = form_id and f.user_id = auth.uid() and f.status in ('Draft', 'Submitted', 'Waiting Verification') and f.created_at > (now() - interval '24 hours')));

-- Policies for DONATIONS table
create policy "Donations - admin/monk/volunteer can manage" on public.donations for all to authenticated using (public.is_volunteer());
create policy "Donations - user can select their own donations" on public.donations for select to authenticated 
  using (exists (select 1 from public.forms f where f.id = form_id and f.user_id = auth.uid()));

-- Policies for FORM_REVISIONS table
create policy "Revisions - admin/monk/volunteer can view" on public.form_revisions for select to authenticated using (public.is_volunteer());

-- Policies for PRINT_HISTORY table
create policy "Print history - admin/monk/volunteer can view and manage" on public.print_history for all to authenticated using (public.is_volunteer());

-- Policies for TEMPLATES table
create policy "Templates - viewable by volunteer/monk/admin" on public.templates for select to authenticated using (public.is_volunteer());
create policy "Templates - manage by admin only" on public.templates for all to authenticated using (public.is_admin());

-- Policies for AUDIT_LOGS table
create policy "Audit logs - viewable by admin only" on public.audit_logs for select to authenticated using (public.is_admin());

-- Policies for SETTINGS table
create policy "Settings - viewable by everyone" on public.settings for select using (true);
create policy "Settings - manage by admin only" on public.settings for all to authenticated using (public.is_admin());

-- Policies for MEDIA_LIBRARY table
create policy "Media - viewable by everyone" on public.media_library for select using (true);
create policy "Media - manage by volunteer/monk/admin" on public.media_library for all to authenticated using (public.is_volunteer());

-- Policies for POSTS table
create policy "Posts - published viewable by everyone" on public.posts for select using (status = 'PUBLISHED');
create policy "Posts - monk and admin have full access" on public.posts for all to authenticated using (public.is_monk());
create policy "Posts - volunteer can create and view all" on public.posts for all to authenticated using (public.is_volunteer()) with check (status in ('DRAFT', 'PENDING_APPROVAL'));
