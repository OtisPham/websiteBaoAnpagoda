'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type PostStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED'

export interface PostData {
  id: string
  title: string
  content: string
  thumbnail_url?: string
  category?: string
  author_id: string
  author_name?: string
  author_role?: string
  approved_by?: string
  rejection_reason?: string
  status: PostStatus
  created_at?: string
  updated_at?: string
}

export interface SavePostInput {
  id?: string
  title: string
  content: string
  thumbnail_url: string
  category: string
  author_name?: string
  status: PostStatus
}

// Lấy danh sách bài viết theo đúng quyền truy cập (VOLUNTEER chỉ xem bài của mình, MONK/ADMIN xem tất cả)
export async function fetchPosts(): Promise<{ posts: PostData[]; currentUserId: string; currentUserRole: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { posts: [], currentUserId: '', currentUserRole: '', error: 'Bạn chưa đăng nhập' }
  }

  // Lấy role của user
  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'VOLUNTEER'

  let query = supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  // Nếu là VOLUNTEER, chỉ xem bài do chính mình tạo
  if (role === 'VOLUNTEER') {
    query = query.eq('author_id', user.id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Lỗi tải danh sách bài viết:', error.message)
    return { posts: [], currentUserId: user.id, currentUserRole: role }
  }

  const rawPosts = (data || []) as any[]

  // Nạp thông tin tên tác giả từ bảng users dựa vào author_id
  const authorIds = Array.from(new Set(rawPosts.map(p => p.author_id).filter(Boolean)))
  let userMap = new Map<string, { full_name: string; role: string }>()

  if (authorIds.length > 0) {
    const { data: usersData } = await supabase
      .from('users')
      .select('id, full_name, role')
      .in('id', authorIds)

    if (usersData) {
      usersData.forEach(u => {
        userMap.set(u.id, { full_name: u.full_name || 'Phật tử', role: u.role || 'VOLUNTEER' })
      })
    }
  }

  const enrichedPosts: PostData[] = rawPosts.map(post => ({
    ...post,
    author_name: userMap.get(post.author_id)?.full_name || profile?.full_name || 'Phật tử',
    author_role: userMap.get(post.author_id)?.role || role
  }))

  return {
    posts: enrichedPosts,
    currentUserId: user.id,
    currentUserRole: role
  }
}

// Tạo hoặc cập nhật bài viết (Chỉ gửi các cột chuẩn trong bảng posts: title, content, thumbnail_url, category, author_id, status, created_at)
export async function savePost(input: SavePostInput): Promise<{ success: boolean; error?: string; post?: PostData }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Vui lòng đăng nhập' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'VOLUNTEER'

  // Ràng buộc bảo mật: VOLUNTEER không bao giờ được phép trực tiếp đặt status là 'PUBLISHED'
  let targetStatus = input.status
  if (role === 'VOLUNTEER' && targetStatus === 'PUBLISHED') {
    targetStatus = 'PENDING_APPROVAL'
  }

  if (input.id) {
    // Cập nhật bài viết hiện có
    const updatePayload: Record<string, any> = {
      title: input.title,
      content: input.content,
      thumbnail_url: input.thumbnail_url,
      category: input.category,
      status: targetStatus
    }

    const { data, error } = await supabase
      .from('posts')
      .update(updatePayload)
      .eq('id', input.id)
      .select('*')
      .single()

    if (error) {
      console.error('Lỗi cập nhật bài viết:', error)
      return { success: false, error: error.message }
    }

    const enrichedPost: PostData = {
      ...data,
      author_name: profile?.full_name || input.author_name || 'Phật tử',
      author_role: role
    }

    revalidatePath('/dashboard/posts')
    revalidatePath('/')
    return { success: true, post: enrichedPost }
  } else {
    // Tạo bài viết mới
    const newPayload: Record<string, any> = {
      title: input.title,
      content: input.content,
      thumbnail_url: input.thumbnail_url,
      category: input.category,
      author_id: user.id,
      status: targetStatus
    }

    const { data, error } = await supabase
      .from('posts')
      .insert(newPayload)
      .select('*')
      .single()

    if (error) {
      console.error('Lỗi tạo bài viết:', error)
      return { success: false, error: error.message }
    }

    const enrichedPost: PostData = {
      ...data,
      author_name: profile?.full_name || input.author_name || 'Phật tử',
      author_role: role
    }

    revalidatePath('/dashboard/posts')
    revalidatePath('/')
    return { success: true, post: enrichedPost }
  }
}

// MONK / ADMIN Phê duyệt hoặc Từ chối bài viết
export async function reviewPost(params: {
  id: string
  action: 'APPROVE' | 'REJECT'
  rejection_reason?: string
  editedTitle?: string
  editedContent?: string
  editedCategory?: string
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Bạn chưa đăng nhập' }
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  if (!role || !['MONK', 'ADMIN', 'MASTER'].includes(role)) {
    return { success: false, error: 'Chỉ Quý Thầy (MONK) hoặc Quản trị viên mới có quyền duyệt bài' }
  }

  const updateData: Record<string, any> = {}

  if (params.editedTitle) updateData.title = params.editedTitle
  if (params.editedContent) updateData.content = params.editedContent
  if (params.editedCategory) updateData.category = params.editedCategory

  if (params.action === 'APPROVE') {
    updateData.status = 'PUBLISHED'
    updateData.approved_by = user.id
  } else {
    updateData.status = 'REJECTED'
  }

  const { error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', params.id)

  if (error) {
    console.error('Lỗi kiểm duyệt bài viết:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/posts')
  revalidatePath('/')
  return { success: true }
}

// Xoá bài viết
export async function deletePost(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Bạn chưa đăng nhập' }
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Lỗi xóa bài viết:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/posts')
  revalidatePath('/')
  return { success: true }
}
