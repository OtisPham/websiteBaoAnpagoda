'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type PostStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED'

export interface PostData {
  id: string
  title: string
  content: string
  thumbnail_url: string
  category: string
  author_id: string
  author_name: string
  author_role: string
  approved_by?: string
  rejection_reason?: string
  status: PostStatus
  created_at: string
  updated_at: string
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
    // Trường hợp bảng posts chưa tạo trên Supabase, trả về mảng rỗng để không crash
    return { posts: [], currentUserId: user.id, currentUserRole: role }
  }

  return {
    posts: (data || []) as PostData[],
    currentUserId: user.id,
    currentUserRole: role
  }
}

// Tạo hoặc cập nhật bài viết
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
  const authorName = input.author_name || profile?.full_name || 'Phật tử'

  // Ràng buộc bảo mật: VOLUNTEER không bao giờ được phép trực tiếp đặt status là 'PUBLISHED'
  let targetStatus = input.status
  if (role === 'VOLUNTEER' && targetStatus === 'PUBLISHED') {
    targetStatus = 'PENDING_APPROVAL'
  }

  const now = new Date().toISOString()

  if (input.id) {
    // Cập nhật bài viết hiện có
    const updatePayload: Partial<PostData> = {
      title: input.title,
      content: input.content,
      thumbnail_url: input.thumbnail_url,
      category: input.category,
      author_name: authorName,
      status: targetStatus,
      updated_at: now
    }

    // Nếu gởi lại chờ duyệt sau khi bị từ chối, xoá lý do từ chối cũ
    if (targetStatus === 'PENDING_APPROVAL') {
      updatePayload.rejection_reason = undefined
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

    revalidatePath('/dashboard/posts')
    revalidatePath('/')
    return { success: true, post: data as PostData }
  } else {
    // Tạo bài viết mới
    const newPayload = {
      title: input.title,
      content: input.content,
      thumbnail_url: input.thumbnail_url,
      category: input.category,
      author_id: user.id,
      author_name: authorName,
      author_role: role,
      status: targetStatus,
      created_at: now,
      updated_at: now
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

    revalidatePath('/dashboard/posts')
    revalidatePath('/')
    return { success: true, post: data as PostData }
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

  const now = new Date().toISOString()

  const updateData: Record<string, any> = {
    updated_at: now
  }

  if (params.editedTitle) updateData.title = params.editedTitle
  if (params.editedContent) updateData.content = params.editedContent
  if (params.editedCategory) updateData.category = params.editedCategory

  if (params.action === 'APPROVE') {
    updateData.status = 'PUBLISHED'
    updateData.approved_by = user.id
    updateData.rejection_reason = null
  } else {
    updateData.status = 'REJECTED'
    updateData.rejection_reason = params.rejection_reason || 'Nội dung chưa phù hợp'
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
