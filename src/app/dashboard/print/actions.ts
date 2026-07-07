'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Kiểm tra quyền: Admin, Monk, Volunteer được in sớ
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
    throw new Error('Không có quyền thực hiện thao tác này.')
  }

  return { supabase, user }
}

export async function markAsPrinted(formIds: string[], reason: string = 'In sớ hàng loạt tại trạm in') {
  try {
    const { supabase, user } = await checkAuthAndRole()

    if (formIds.length === 0) {
      return { success: false, error: 'Chưa chọn phiếu nào.' }
    }

    // 1. Cập nhật trạng thái phiếu sang 'Printed'
    const { error: formError } = await supabase
      .from('forms')
      .update({ status: 'Printed' })
      .in('id', formIds)

    if (formError) {
      return { success: false, error: formError.message }
    }

    // 2. Ghi nhận lịch sử in
    const printRecords = formIds.map((id) => ({
      form_id: id,
      printed_by: user.id,
      reason: reason
    }))

    const { error: historyError } = await supabase
      .from('print_history')
      .insert(printRecords)

    if (historyError) {
      return { success: false, error: 'Ghi nhật ký in thất bại: ' + historyError.message }
    }

    revalidatePath('/dashboard/print')
    revalidatePath('/dashboard/forms')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
