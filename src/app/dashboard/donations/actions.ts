'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Kiểm tra quyền: Admin, Monk, Volunteer được thu cúng dường
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

export async function confirmDonation(
  formId: string,
  amount: number,
  paymentMethod: 'CASH' | 'BANK_TRANSFER'
) {
  try {
    const { supabase, user } = await checkAuthAndRole()

    // 1. Kiểm tra xem đã có bản ghi donation chưa
    const { data: existingDonation } = await supabase
      .from('donations')
      .select('id')
      .eq('form_id', formId)
      .single()

    if (existingDonation) {
      // Nếu có rồi, cập nhật
      const { error: donationError } = await supabase
        .from('donations')
        .update({
          amount: amount,
          payment_method: paymentMethod,
          payment_status: 'CONFIRMED',
          collector: user.id
        })
        .eq('id', existingDonation.id)

      if (donationError) {
        return { success: false, error: donationError.message }
      }
    } else {
      // Nếu chưa có, tạo mới
      const { error: donationError } = await supabase
        .from('donations')
        .insert({
          form_id: formId,
          amount: amount,
          payment_method: paymentMethod,
          payment_status: 'CONFIRMED',
          collector: user.id
        })

      if (donationError) {
        return { success: false, error: donationError.message }
      }
    }

    // 2. Cập nhật trạng thái phiếu cúng sang 'Accepted' (để chuyển vào luồng chuẩn bị in sớ)
    const { error: formError } = await supabase
      .from('forms')
      .update({ status: 'Accepted' })
      .eq('id', formId)

    if (formError) {
      return { success: false, error: 'Cập nhật trạng thái phiếu thất bại: ' + formError.message }
    }

    revalidatePath('/dashboard/donations')
    revalidatePath('/dashboard/forms')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
