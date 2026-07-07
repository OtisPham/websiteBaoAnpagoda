import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import AdminTemplates from './AdminTemplates'

export const dynamic = 'force-dynamic'

export default async function TemplatesPage() {
  const supabase = await createClient()

  // 1. Kiểm tra session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // 2. Kiểm tra quyền ADMIN
  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    redirect('/unauthorized')
  }

  // 3. Fetch danh sách phôi sớ
  const { data: templates, error } = await supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <AdminTemplates templates={templates || []} />
  )
}
