import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { fetchPosts } from './actions'
import PostsDashboardClient from './PostsDashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPostsPage() {
  const supabase = await createClient()

  // 1. Kiểm tra session đăng nhập
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // 2. Kiểm tra vai trò
  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['ADMIN', 'MONK', 'VOLUNTEER', 'MASTER'].includes(profile.role)) {
    redirect('/unauthorized')
  }

  // 3. Lấy danh sách bài viết hợp lệ theo vai trò
  const { posts, currentUserId, currentUserRole } = await fetchPosts()

  return (
    <PostsDashboardClient
      initialPosts={posts}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      authorFullName={profile.full_name || 'Phật tử'}
    />
  )
}
