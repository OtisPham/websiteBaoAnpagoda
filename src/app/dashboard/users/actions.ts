'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Interface cho thông tin người dùng
export interface UserRecord {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  role: 'ADMIN' | 'MONK' | 'VOLUNTEER' | 'USER'
  created_at: string
  updated_at: string
  deleted_at?: string | null
}

// Kiểm tra quyền ADMIN hoặc MONK
async function checkAdminOrMonkAuth() {
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
  if (!['ADMIN', 'MONK'].includes(role)) {
    throw new Error('Bạn không có quyền thực hiện thao tác quản lý người dùng')
  }

  return { supabase, currentUser: user, currentRole: role }
}

// 1. Lấy danh sách người dùng kèm bộ lọc và tìm kiếm
export async function getUsers(query?: string, roleFilter?: string) {
  try {
    const { supabase } = await checkAdminOrMonkAuth()

    let req = supabase
      .from('users')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (roleFilter && roleFilter !== 'ALL') {
      req = req.eq('role', roleFilter)
    }

    if (query && query.trim()) {
      const q = `%${query.trim()}%`
      req = req.or(`full_name.ilike.${q},email.ilike.${q},phone.ilike.${q}`)
    }

    const { data, error } = await req

    if (error) {
      return { success: false, error: error.message, users: [] }
    }

    return { success: true, users: (data || []) as UserRecord[] }
  } catch (err: any) {
    return { success: false, error: err.message, users: [] }
  }
}

// 2. Cập nhật phân quyền Role cho người dùng
export async function updateUserRole(targetUserId: string, newRole: 'ADMIN' | 'MONK' | 'VOLUNTEER' | 'USER') {
  try {
    const { supabase, currentUser } = await checkAdminOrMonkAuth()

    // Lấy thông tin user cũ
    const { data: oldUser } = await supabase
      .from('users')
      .select('role, full_name, email')
      .eq('id', targetUserId)
      .single()

    const oldRole = oldUser?.role || 'Chưa xác định'

    // Cập nhật role mới
    const { error } = await supabase
      .from('users')
      .update({ 
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Ghi nhận Audit Log
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'UPDATE_ROLE',
      table_name: 'users',
      record_id: targetUserId,
      details: {
        target_name: oldUser?.full_name,
        target_email: oldUser?.email,
        old_role: oldRole,
        new_role: newRole
      }
    })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 3. Cập nhật thông tin cá nhân (Họ tên, SĐT) người dùng
export async function updateUserProfile(
  targetUserId: string,
  fullName: string,
  phone: string
) {
  try {
    const { supabase, currentUser } = await checkAdminOrMonkAuth()

    const { error } = await supabase
      .from('users')
      .update({
        full_name: fullName,
        phone: phone,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Ghi nhận Audit Log
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'UPDATE_PROFILE',
      table_name: 'users',
      record_id: targetUserId,
      details: {
        new_name: fullName,
        new_phone: phone
      }
    })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 4. Soft Delete (Khóa/Xóa người dùng)
export async function softDeleteUser(targetUserId: string) {
  try {
    const { supabase, currentUser, currentRole } = await checkAdminOrMonkAuth()

    if (currentRole !== 'ADMIN') {
      return { success: false, error: 'Chỉ Admin tối cao mới được quyền xóa/khóa tài khoản.' }
    }

    if (targetUserId === currentUser.id) {
      return { success: false, error: 'Bạn không thể tự khóa tài khoản của chính mình!' }
    }

    const { error } = await supabase
      .from('users')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', targetUserId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Ghi audit log
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'DELETE_USER',
      table_name: 'users',
      record_id: targetUserId,
      details: { timestamp: new Date().toISOString() }
    })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
