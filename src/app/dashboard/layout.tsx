import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { signout } from '../auth/actions'
import DashboardShell from './DashboardShell'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Kiểm tra session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // 2. Lấy profile và role
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.role === 'USER') {
    // Phật tử thường không được vào ban quản trị
    redirect('/unauthorized')
  }

  const role = profile.role

  const roleLabel =
    role === 'MONK'
      ? 'Quý Thầy / Tăng Ni'
      : role === 'ADMIN'
      ? 'Ban Quản Trị'
      : role === 'VOLUNTEER'
      ? 'Tình Nguyện Viên'
      : role

  return (
    <DashboardShell 
      profile={profile as { full_name: string; email: string; role: string }}
      roleLabel={roleLabel}
      signoutAction={async () => {
        'use server'
        await signout()
      }}
    >
      {children}
    </DashboardShell>
  )
}
