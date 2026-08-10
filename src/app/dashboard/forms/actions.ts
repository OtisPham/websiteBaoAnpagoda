'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { TargetPersonInput } from '@/app/phat-tu/actions'
import { autoAssignOptimalSlot } from '@/utils/so/loadBalancer'

// Hàm kiểm tra xem user hiện tại có quyền Volunteer trở lên không
async function checkAuthAndRole() {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) {
    throw new Error('Chưa đăng nhập')
  }

  const { data: profile } = await authClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role || 'USER'
  if (!['ADMIN', 'MONK', 'VOLUNTEER'].includes(role)) {
    throw new Error('Không có quyền thực hiện thao tác này')
  }

  return { supabase: supabaseAdmin, user, role }
}

// 1. Cập nhật Trạng thái Phiếu Sớ
export async function updateFormStatus(formId: string, newStatus: string) {
  try {
    const { supabase, user } = await checkAuthAndRole()

    // Lấy trạng thái cũ
    const { data: oldForm } = await supabase
      .from('forms')
      .select('status, form_code')
      .eq('id', formId)
      .single()

    const oldStatus = oldForm?.status || 'N/A'

    const { error } = await supabase
      .from('forms')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', formId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Ghi nhận Form Revision
    await supabase.from('form_revisions').insert({
      form_id: formId,
      field: 'status',
      old_val: oldStatus,
      new_val: newStatus,
      changed_by: user.id
    })

    // Ghi nhận Audit Log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'UPDATE_FORM_STATUS',
      table_name: 'forms',
      record_id: formId,
      details: {
        form_code: oldForm?.form_code,
        old_status: oldStatus,
        new_status: newStatus
      }
    })

    revalidatePath('/dashboard/forms')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 2. Cập nhật toàn bộ thông tin Phiếu Sớ
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
    const { supabase, user } = await checkAuthAndRole()

    // Lấy thông tin phiếu cũ
    const { data: oldForm } = await supabase
      .from('forms')
      .select('*')
      .eq('id', formId)
      .single()

    // Nếu ủy nhiệm cho chùa, chạy thuật toán Load Balancing tự chọn ca cúng trống nhất
    let finalSlot = selectedTimeSlot
    if (isDelegated) {
      finalSlot = await autoAssignOptimalSlot(supabase, eventId, scheduledDate)
    }

    // 1. Cập nhật forms
    const { error: formError } = await supabase
      .from('forms')
      .update({
        is_delegated: isDelegated,
        event_id: eventId || null,
        scheduled_date: scheduledDate,
        selected_time_slot: finalSlot || null,
        note: note,
        updated_at: new Date().toISOString()
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

    // Ghi nhận Form Revision
    await supabase.from('form_revisions').insert({
      form_id: formId,
      field: 'form_details',
      old_val: JSON.stringify({ slot: oldForm?.selected_time_slot, note: oldForm?.note }),
      new_val: JSON.stringify({ slot: finalSlot, note, targetCount: targets.length }),
      changed_by: user.id
    })

    // Ghi nhận Audit Log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'UPDATE_FORM',
      table_name: 'forms',
      record_id: formId,
      details: {
        form_code: oldForm?.form_code,
        is_delegated: isDelegated,
        assigned_slot: finalSlot,
        targets_count: targets.length
      }
    })

    revalidatePath('/dashboard/forms')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 3. Soft Delete phiếu sớ
export async function softDeleteForm(formId: string) {
  try {
    const { supabase, user } = await checkAuthAndRole()

    const { data: oldForm } = await supabase.from('forms').select('form_code').eq('id', formId).single()

    const { error } = await supabase
      .from('forms')
      .update({ 
        deleted_at: new Date().toISOString(),
        form_code: null
      })
      .eq('id', formId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Ghi nhận Audit Log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'DELETE_FORM',
      table_name: 'forms',
      record_id: formId,
      details: { form_code: oldForm?.form_code }
    })

    revalidatePath('/dashboard/forms')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 4. Ghi nhận Nhật ký In sớ (Print History)
export async function logPrintHistory(formId: string, reason: string = 'In sớ làm lễ') {
  try {
    const { supabase, user } = await checkAuthAndRole()

    // 1. Thêm bản ghi in sớ
    await supabase.from('print_history').insert({
      form_id: formId,
      printed_by: user.id,
      reason: reason
    })

    // 2. Cập nhật trạng thái phiếu sớ thành 'Printed'
    await supabase.from('forms').update({
      status: 'Printed',
      updated_at: new Date().toISOString()
    }).eq('id', formId)

    // 3. Ghi audit log
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      action: 'PRINT_FORM',
      table_name: 'forms',
      record_id: formId,
      details: { reason }
    })

    revalidatePath('/dashboard/forms')
    revalidatePath('/dashboard/print')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// 5. Lấy lịch sử chỉnh sửa phiếu (Form Revisions)
export async function getFormRevisions(formId: string) {
  try {
    const { supabase } = await checkAuthAndRole()

    const { data, error } = await supabase
      .from('form_revisions')
      .select('*, users(full_name, email)')
      .eq('form_id', formId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message, revisions: [] }
    }

    return { success: true, revisions: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message, revisions: [] }
  }
}

// 6. Lấy lịch sử in ấn (Print History)
export async function getPrintHistory(formId: string) {
  try {
    const { supabase } = await checkAuthAndRole()

    const { data, error } = await supabase
      .from('print_history')
      .select('*, users(full_name, email)')
      .eq('form_id', formId)
      .order('created_at', { ascending: false })

    if (error) {
      return { success: false, error: error.message, history: [] }
    }

    return { success: true, history: data || [] }
  } catch (err: any) {
    return { success: false, error: err.message, history: [] }
  }
}
