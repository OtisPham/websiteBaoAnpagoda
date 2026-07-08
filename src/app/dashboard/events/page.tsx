import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AdminEventsDashboard from './AdminEventsDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminEventsPage() {
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

  if (!profile || !['ADMIN', 'MONK', 'VOLUNTEER', 'MASTER'].includes(profile.role)) {
    redirect('/unauthorized')
  }

  // 3. Fetch toàn bộ danh sách events chưa bị xoá
  const { data: events } = await supabase
    .from('events')
    .select('id, title, type, scheduled_date, time_slots, description')
    .is('deleted_at', null)
    .order('scheduled_date', { ascending: true })

  return (
    <AdminEventsDashboard
      events={events || []}
    />
  )
}
