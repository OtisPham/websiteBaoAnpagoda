'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
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

// Helper: Lấy Admin Client để xử lý các nghiệp vụ kiểm duyệt và xuất bản cho Quý Thầy / Admin (bypass RLS)
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    return null
  }
  return createSupabaseAdminClient(url, serviceKey)
}

// Lấy danh sách bài viết theo đúng quyền truy cập (VOLUNTEER chỉ xem bài của mình, MONK/ADMIN xem tất cả)
export async function fetchPosts(): Promise<{ posts: PostData[]; currentUserId: string; currentUserRole: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { posts: [], currentUserId: '', currentUserRole: '', error: 'Bạn chưa đăng nhập' }
  }

  // Lấy role của user từ bảng users
  const { data: profile } = await supabase
    .from('users')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'VOLUNTEER'
  const isPrivileged = ['MONK', 'ADMIN', 'MASTER'].includes(role.toUpperCase())
  const db = isPrivileged && getAdminClient() ? getAdminClient()! : supabase

  let query = db
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

  // Nếu là VOLUNTEER, chỉ xem bài do chính mình tạo
  if (!isPrivileged) {
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
    const { data: usersData } = await db
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

// Tạo hoặc cập nhật bài viết (Chỉ gửi các cột chuẩn hoặc tự động fallback nếu schema chưa migrate đủ cột)
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
  const isPrivileged = ['MONK', 'ADMIN', 'MASTER'].includes(role.toUpperCase())
  const db = isPrivileged && getAdminClient() ? getAdminClient()! : supabase

  // Ràng buộc bảo mật: VOLUNTEER không bao giờ được phép trực tiếp đặt status là 'PUBLISHED'
  let targetStatus = input.status
  if (!isPrivileged && targetStatus === 'PUBLISHED') {
    targetStatus = 'PENDING_APPROVAL'
  }

  if (input.id) {
    // Cập nhật bài viết hiện có
    const fullPayload: Record<string, any> = {
      title: input.title,
      content: input.content,
      thumbnail_url: input.thumbnail_url || null,
      category: input.category || 'PHẬT PHÁP',
      status: targetStatus
    }
    if (targetStatus === 'PUBLISHED') {
      fullPayload.approved_by = user.id
    }

    let { data, error } = await db
      .from('posts')
      .update(fullPayload)
      .eq('id', input.id)
      .select('*')
      .single()

    // TỰ ĐỘNG KHẮC PHỤC LỖI THIẾU CỘT TRONG SCHEMA (như category, thumbnail_url, approved_by...)
    if (error) {
      console.warn('Cập nhật payload đầy đủ gặp lỗi schema/cột, fallback sang payload chuẩn cơ bản:', error.message)
      const safePayload: Record<string, any> = {
        title: input.title,
        content: input.content,
        status: targetStatus
      }
      const fallbackRes = await db
        .from('posts')
        .update(safePayload)
        .eq('id', input.id)
        .select('*')
        .single()
      data = fallbackRes.data
      error = fallbackRes.error
    }

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
    const fullPayload: Record<string, any> = {
      title: input.title,
      content: input.content,
      thumbnail_url: input.thumbnail_url || null,
      category: input.category || 'PHẬT PHÁP',
      author_id: user.id,
      status: targetStatus,
      approved_by: targetStatus === 'PUBLISHED' ? user.id : null,
      created_at: new Date().toISOString()
    }

    let { data, error } = await db
      .from('posts')
      .insert(fullPayload)
      .select('*')
      .single()

    // TỰ ĐỘNG KHẮC PHỤC LỖI THIẾU CỘT TRONG SCHEMA (như category, thumbnail_url, approved_by...)
    if (error) {
      console.warn('Tạo mới payload đầy đủ gặp lỗi schema/cột, fallback sang payload chuẩn cơ bản:', error.message)
      const safePayload: Record<string, any> = {
        title: input.title,
        content: input.content,
        author_id: user.id,
        status: targetStatus
      }
      const fallbackRes = await db
        .from('posts')
        .insert(safePayload)
        .select('*')
        .single()
      data = fallbackRes.data
      error = fallbackRes.error
    }

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
  if (!role || !['MONK', 'ADMIN', 'MASTER'].includes(role.toUpperCase())) {
    return { success: false, error: 'Chỉ Quý Thầy (MONK) hoặc Quản trị viên mới có quyền duyệt bài' }
  }

  const db = getAdminClient() || supabase

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

  let { error } = await db
    .from('posts')
    .update(updateData)
    .eq('id', params.id)

  if (error) {
    const safeData: Record<string, any> = {
      status: params.action === 'APPROVE' ? 'PUBLISHED' : 'REJECTED'
    }
    if (params.editedTitle) safeData.title = params.editedTitle
    if (params.editedContent) safeData.content = params.editedContent
    const fallbackRes = await db.from('posts').update(safeData).eq('id', params.id)
    error = fallbackRes.error
  }

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

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'VOLUNTEER'
  const isPrivileged = ['MONK', 'ADMIN', 'MASTER'].includes(role.toUpperCase())
  const db = isPrivileged && getAdminClient() ? getAdminClient()! : supabase

  const { error } = await db
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
