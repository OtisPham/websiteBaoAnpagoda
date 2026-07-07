import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DonationCheckDesk from './DonationCheckDesk'

export const dynamic = 'force-dynamic'

export default async function DonationsPage() {
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

  // 3. Fetch danh sách forms chờ cúng dường (Submitted hoặc Waiting Verification)
  const { data: pendingForms } = await supabase
    .from('forms')
    .select(`
      id,
      form_code,
      form_type,
      status,
      scheduled_date,
      selected_time_slot,
      note,
      created_at,
      users (
        full_name,
        phone,
        email
      ),
      targets: target_persons (
        id,
        full_name,
        dharma_name,
        birth_year
      ),
      donations (
        id,
        amount,
        payment_status,
        receipt_no
      )
    `)
    .in('status', ['Submitted', 'Waiting Verification'])
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <DonationCheckDesk
      pendingForms={(pendingForms as any) || []}
    />
  )
}
