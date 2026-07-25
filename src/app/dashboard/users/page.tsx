import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import UserManagementClient from './UserManagementClient'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const supabase = await createClient()

  // 1. Kiểm tra session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // 2. Lấy role của user hiện tại
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'USER'
  if (!['ADMIN', 'MONK'].includes(role)) {
    redirect('/unauthorized')
  }

  // 3. Lấy danh sách người dùng
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <UserManagementClient
      initialUsers={(users || []) as any[]}
      currentUserRole={role}
    />
  )
}
