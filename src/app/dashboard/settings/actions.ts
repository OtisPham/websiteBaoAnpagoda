'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Chỉ ADMIN được cấu hình hệ thống và xem log
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
  if (role !== 'ADMIN') {
    throw new Error('Không có quyền thực hiện thao tác này. Chỉ Admin được cấu hình hệ thống.')
  }

  return { supabase }
}

export async function updateSetting(key: string, value: string, description: string = '') {
  try {
    const { supabase } = await checkAuthAndRole()

    // Kiểm tra xem key đã tồn tại chưa
    const { data: existingSetting } = await supabase
      .from('settings')
      .select('id')
      .eq('key', key)
      .single()

    if (existingSetting) {
      const { error } = await supabase
        .from('settings')
        .update({ value, description, updated_at: new Date().toISOString() })
        .eq('id', existingSetting.id)

      if (error) return { success: false, error: error.message }
    } else {
      const { error } = await supabase
        .from('settings')
        .insert({ key, value, description })

      if (error) return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/settings')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
