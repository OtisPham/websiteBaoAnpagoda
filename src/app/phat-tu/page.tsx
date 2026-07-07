import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import PhatTuDashboard from './PhatTuDashboard'

export const dynamic = 'force-dynamic'

export default async function PhatTuPage() {
  const supabase = await createClient()

  // 1. Kiểm tra session và lấy user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // 2. Lấy profile Phật tử
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login?error=Tài khoản chưa đồng bộ thông tin hồ sơ')
  }

  // 3. Lấy danh sách sự kiện lễ sắp diễn ra (để đăng ký)
  const today = new Date().toISOString().split('T')[0]
  const { data: events } = await supabase
    .from('events')
    .select('id, title, type, scheduled_date, time_slots')
    .gte('scheduled_date', today)
    .is('deleted_at', null)
    .order('scheduled_date', { ascending: true })

  // 4. Lấy lịch sử gửi phiếu của Phật tử này
  const { data: forms } = await supabase
    .from('forms')
    .select(`
      id,
      form_code,
      form_type,
      status,
      is_delegated,
      event_id,
      scheduled_date,
      selected_time_slot,
      note,
      created_at,
      events (
        title
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
      )
    `)
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <PhatTuDashboard
      userEmail={profile.email || user.email || ''}
      userFullName={profile.full_name || 'Phật tử vô danh'}
      events={events || []}
      forms={(forms as any) || []}
    />
  )
}
