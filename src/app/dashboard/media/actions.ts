'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export interface MediaItem {
  id: string
  folder: string | null
  album: string | null
  tag: string | null
  file_url: string
  file_name?: string | null
  created_at: string
}

async function checkAuthAndRole() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Chưa đăng nhập')
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'USER'
  if (!['ADMIN', 'MONK', 'VOLUNTEER'].includes(role)) {
    throw new Error('Không có quyền quản lý thư viện hình ảnh')
  }

  return { supabase, user, role }
}

// 1. Lấy danh sách media
export async function getMediaItems(folder?: string) {
  try {
    const { supabase } = await checkAuthAndRole()

    let query = supabase
      .from('media_library')
      .select('*')
      .order('created_at', { ascending: false })

    if (folder && folder !== 'ALL') {
      query = query.eq('folder', folder)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: error.message, items: [] }
    }

    return { success: true, items: (data || []) as MediaItem[] }
  } catch (err: any) {
    return { success: false, error: err.message, items: [] }
  }
}

// 2. Thêm mới bản ghi Media vào database
export async function createMediaItem(fileUrl: string, fileName: string, folder: string = 'General', album?: string, tag?: string) {
  try {
    const { supabase, user } = await checkAuthAndRole()

    const { data, error } = await supabase
      .from('media_library')
      .insert({
        file_url: fileUrl,
        file_name: fileName,
        folder: folder,
        album: album || null,
        tag: tag || null
      })
      .select('*')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Ghi audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'UPLOAD_MEDIA',
      table_name: 'media_library',
      record_id: data.id,
      details: { file_name: fileName, folder }
    })

    revalidatePath('/dashboard/media')
    return { success: true, item: data }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 3. Xóa media
export async function deleteMediaItem(id: string) {
  try {
    const { supabase, user, role } = await checkAuthAndRole()

    if (role === 'VOLUNTEER') {
      return { success: false, error: 'Tình nguyện viên không có quyền xóa media' }
    }

    const { error } = await supabase
      .from('media_library')
      .delete()
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    // Ghi audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'DELETE_MEDIA',
      table_name: 'media_library',
      record_id: id,
      details: { timestamp: new Date().toISOString() }
    })

    revalidatePath('/dashboard/media')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
