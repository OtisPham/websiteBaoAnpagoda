import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AdminSettingsDashboard from './AdminSettingsDashboard'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()

  // 1. Kiểm tra session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // 2. Kiểm tra role
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  // 3. Fetch settings
  const { data: settings } = await supabase
    .from('settings')
    .select('id, key, value, description')

  // 4. Fetch audit logs (tối đa 50 log gần nhất)
  const { data: auditLogs } = await supabase
    .from('audit_logs')
    .select(`
      id,
      action,
      table_name,
      record_id,
      details,
      created_at,
      users (
        full_name,
        email
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <AdminSettingsDashboard
      settings={settings || []}
      auditLogs={(auditLogs as any) || []}
    />
  )
}
