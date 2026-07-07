import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import PrintStation from './PrintStation'

export const dynamic = 'force-dynamic'

export default async function PrintPage() {
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

  // 3. Fetch danh sách forms sẵn sàng in (Accepted)
  const { data: acceptedForms } = await supabase
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
      users (
        full_name,
        phone
      ),
      targets: target_persons (
        id,
        full_name,
        dharma_name,
        birth_year,
        death_year,
        relation,
        type
      )
    `)
    .eq('status', 'Accepted')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  // 4. Fetch danh sách phôi sớ đang kích hoạt
  const { data: templates } = await supabase
    .from('templates')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  return (
    <PrintStation
      acceptedForms={(acceptedForms as any) || []}
      templates={templates || []}
    />
  )
}
