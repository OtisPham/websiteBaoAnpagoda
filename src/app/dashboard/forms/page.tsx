import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AdminFormsDashboard from './AdminFormsDashboard'

export const dynamic = 'force-dynamic'

export default async function AdminFormsPage() {
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

  if (!profile || !['ADMIN', 'MONK', 'VOLUNTEER'].includes(profile.role)) {
    redirect('/unauthorized')
  }

  // 3. Fetch toàn bộ danh sách forms chưa bị xoá
  const { data: forms } = await supabase
    .from('forms')
    .select(`
      id,
      form_code,
      form_type,
      status,
      is_delegated,
      scheduled_date,
      selected_time_slot,
      note,
      created_at,
      event_id,
      users (
        full_name,
        phone,
        email
      ),
      targets: target_persons (
        id,
        full_name,
        dharma_name,
        birth_year,
        death_year,
        relation
      ),
      donations (
        amount,
        payment_status
      ),
      events (
        title
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  // 4. Fetch danh sách events để làm bộ lọc
  const { data: events } = await supabase
    .from('events')
    .select('id, title, type, scheduled_date, time_slots')
    .is('deleted_at', null)
    .order('scheduled_date', { ascending: true })

  return (
    <AdminFormsDashboard
      forms={(forms as any) || []}
      events={events || []}
    />
  )
}
