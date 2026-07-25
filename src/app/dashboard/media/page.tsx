import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import MediaLibraryClient from './MediaLibraryClient'

export const dynamic = 'force-dynamic'

export default async function MediaPage() {
  const supabase = await createClient()

  // 1. Kiểm tra đăng nhập
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

  const role = profile?.role || 'USER'
  if (!['ADMIN', 'MONK', 'VOLUNTEER'].includes(role)) {
    redirect('/unauthorized')
  }

  // 3. Lấy dữ liệu media
  const { data: mediaItems } = await supabase
    .from('media_library')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <MediaLibraryClient
      initialItems={(mediaItems || []) as any[]}
      userRole={role}
    />
  )
}
