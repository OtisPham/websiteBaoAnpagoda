'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { TargetPersonInput } from '@/app/phat-tu/actions'

// Hàm kiểm tra xem user hiện tại có quyền Volunteer trở lên không
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
    throw new Error('Không có quyền thực hiện thao tác này')
  }

  return { supabase, user, role }
}

export async function updateFormStatus(formId: string, newStatus: string) {
  try {
    const { supabase } = await checkAuthAndRole()

    const { error } = await supabase
      .from('forms')
      .update({ status: newStatus })
      .eq('id', formId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/forms')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateAdminForm(
  formId: string, 
  formType: 'CAU_AN' | 'CAU_SIEU',
  isDelegated: boolean,
  selectedTimeSlot: string | null,
  eventId: string | null,
  scheduledDate: string,
  note: string,
  targets: TargetPersonInput[]
) {
  try {
    const { supabase } = await checkAuthAndRole()

    // 1. Cập nhật forms
    const { error: formError } = await supabase
      .from('forms')
      .update({
        is_delegated: isDelegated,
        event_id: eventId || null,
        scheduled_date: scheduledDate,
        selected_time_slot: isDelegated ? null : (selectedTimeSlot || null),
        note: note
      })
      .eq('id', formId)

    if (formError) {
      return { success: false, error: formError.message }
    }

    // 2. Xóa danh sách targets cũ và thêm mới
    const { error: deleteError } = await supabase
      .from('target_persons')
      .delete()
      .eq('form_id', formId)

    if (deleteError) {
      return { success: false, error: 'Không thể cập nhật danh sách người thụ lễ' }
    }

    const targetRecords = targets.map((t) => ({
      form_id: formId,
      full_name: t.full_name,
      dharma_name: t.dharma_name || null,
      birth_year: t.birth_year || null,
      death_year: t.death_year || null,
      relation: t.relation || '',
      type: formType
    }))

    const { error: targetsError } = await supabase
      .from('target_persons')
      .insert(targetRecords)

    if (targetsError) {
      return { success: false, error: 'Không thể lưu danh sách người thụ lễ mới' }
    }

    revalidatePath('/dashboard/forms')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function softDeleteForm(formId: string) {
  try {
    const { supabase } = await checkAuthAndRole()

    const { error } = await supabase
      .from('forms')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', formId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/forms')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
