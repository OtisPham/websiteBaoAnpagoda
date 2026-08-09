-- Fix Users RLS policy for MONK so they can view the user list
drop policy if exists "Users - monk/volunteer can view all profiles" on public.users;

create policy "Users - monk and volunteer can view all profiles" 
on public.users 
for select 
to authenticated 
using (public.is_monk() or public.is_volunteer() or public.is_admin());
