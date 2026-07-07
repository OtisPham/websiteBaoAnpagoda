'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export interface TargetPersonInput {
  full_name: string
  dharma_name?: string
  birth_year?: number
  death_year?: number
  relation?: string
}

export async function createForm(formData: FormData, targets: TargetPersonInput[]) {
  const supabase = await createClient()

  // Lấy thông tin user hiện tại
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Chưa đăng nhập')
  }

  const formType = formData.get('formType') as 'CAU_AN' | 'CAU_SIEU'
  const eventId = formData.get('eventId') as string
  const scheduledDate = formData.get('scheduledDate') as string
  const isDelegated = formData.get('isDelegated') === 'true'
  const selectedTimeSlot = formData.get('selectedTimeSlot') as string | undefined
  const note = formData.get('note') as string | undefined
  const formCode = formData.get('formCode') as string | undefined

  if (!formType || !scheduledDate || targets.length === 0) {
    return { success: false, error: 'Vui lòng nhập đầy đủ thông tin và danh sách thụ lễ' }
  }

  // Kiểm tra sức chứa của ca cúng nếu Phật tử tự chọn giờ
  if (!isDelegated && selectedTimeSlot && eventId) {
    const { data: eventData } = await supabase.from('events').select('time_slots').eq('id', eventId).single()
    if (eventData && eventData.time_slots) {
      const slot = eventData.time_slots.find((s: any) => s.time === selectedTimeSlot)
      if (slot) {
        const { count } = await supabase.from('forms')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId)
          .eq('selected_time_slot', selectedTimeSlot)
          .neq('status', 'Cancelled')
          .neq('status', 'Rejected')
          
        if (count !== null && count >= slot.max_capacity) {
          return { success: false, error: `Ca cúng ${selectedTimeSlot} đã đầy. Vui lòng chọn ca khác hoặc check "Ủy nhiệm cho nhà chùa".` }
        }
      }
    }
  }

  // 1. Tạo phiếu forms
  const { data: form, error: formError } = await supabase
    .from('forms')
    .insert({
      form_type: formType,
      form_code: formCode || undefined,
      status: 'Submitted',
      is_delegated: isDelegated,
      event_id: eventId || null,
      scheduled_date: scheduledDate,
      selected_time_slot: isDelegated ? null : (selectedTimeSlot || null), // Nếu ủy nhiệm thì để null để trigger DB tự tính slot trống nhất
      user_id: user.id,
      note: note || ''
    })
    .select('id, form_code, selected_time_slot')
    .single()

  if (formError) {
    return { success: false, error: formError.message }
  }

  // 2. Tạo danh sách target_persons liên kết
  const targetRecords = targets.map((t) => ({
    form_id: form.id,
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
    // Nếu lỗi tạo người thì soft-delete forms luôn
    await supabase.from('forms').update({ deleted_at: new Date().toISOString() }).eq('id', form.id)
    return { success: false, error: 'Lỗi khi lưu danh sách người thụ lễ: ' + targetsError.message }
  }

  // Lấy lại phiếu sau khi trigger tự phân ca hoạt động
  const { data: updatedForm } = await supabase
    .from('forms')
    .select('selected_time_slot')
    .eq('id', form.id)
    .single()

  revalidatePath('/phat-tu')
  
  return { 
    success: true, 
    formCode: form.form_code, 
    assignedSlot: updatedForm?.selected_time_slot 
  }
}

export async function updateForm(formId: string, formData: FormData, targets: TargetPersonInput[]) {
  const supabase = await createClient()

  // Lấy thông tin user hiện tại
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Chưa đăng nhập')
  }

  // Kiểm tra điều kiện sửa: trong vòng 24h và chưa in
  const { data: existingForm, error: fetchError } = await supabase
    .from('forms')
    .select('created_at, status, user_id')
    .eq('id', formId)
    .single()

  if (fetchError || !existingForm) {
    return { success: false, error: 'Không tìm thấy phiếu cần chỉnh sửa' }
  }

  if (existingForm.user_id !== user.id) {
    return { success: false, error: 'Bạn không có quyền chỉnh sửa phiếu này' }
  }

  const createdTime = new Date(existingForm.created_at).getTime()
  const now = new Date().getTime()
  const hoursPassed = (now - createdTime) / (1000 * 60 * 60)

  if (hoursPassed > 24) {
    return { success: false, error: 'Đã quá hạn 24 giờ kể từ lúc gửi phiếu, không thể chỉnh sửa.' }
  }

  if (!['Draft', 'Submitted', 'Waiting Verification', 'Rejected', 'Need Reprint'].includes(existingForm.status)) {
    return { success: false, error: `Trạng thái phiếu hiện tại là [${existingForm.status}], không thể chỉnh sửa.` }
  }

  const isDelegated = formData.get('isDelegated') === 'true'
  const selectedTimeSlot = formData.get('selectedTimeSlot') as string | undefined
  const note = formData.get('note') as string | undefined
  const eventId = formData.get('eventId') as string
  const scheduledDate = formData.get('scheduledDate') as string

  // Kiểm tra sức chứa của ca cúng nếu Phật tử tự chọn giờ
  if (!isDelegated && selectedTimeSlot && eventId) {
    const { data: eventData } = await supabase.from('events').select('time_slots').eq('id', eventId).single()
    if (eventData && eventData.time_slots) {
      const slot = eventData.time_slots.find((s: any) => s.time === selectedTimeSlot)
      if (slot) {
        const { count } = await supabase.from('forms')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', eventId)
          .eq('selected_time_slot', selectedTimeSlot)
          .neq('id', formId)
          .neq('status', 'Cancelled')
          .neq('status', 'Rejected')
          
        if (count !== null && count >= slot.max_capacity) {
          return { success: false, error: `Ca cúng ${selectedTimeSlot} đã đầy. Vui lòng chọn ca khác hoặc check "Ủy nhiệm cho nhà chùa".` }
        }
      }
    }
  }

  // 1. Cập nhật phiếu forms
  const { error: formUpdateError } = await supabase
    .from('forms')
    .update({
      is_delegated: isDelegated,
      event_id: eventId || null,
      scheduled_date: scheduledDate,
      selected_time_slot: isDelegated ? null : (selectedTimeSlot || null),
      note: note || '',
      status: 'Submitted' // reset lại trạng thái chờ duyệt
    })
    .eq('id', formId)

  if (formUpdateError) {
    return { success: false, error: formUpdateError.message }
  }

  // 2. Xóa danh sách target_persons cũ và thêm mới
  const { error: deleteError } = await supabase
    .from('target_persons')
    .delete()
    .eq('form_id', formId)

  if (deleteError) {
    return { success: false, error: 'Lỗi khi cập nhật danh sách người thụ lễ' }
  }

  const formType = formData.get('formType') as 'CAU_AN' | 'CAU_SIEU'
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
    return { success: false, error: 'Lỗi khi lưu danh sách người thụ lễ mới' }
  }

  revalidatePath('/phat-tu')
  return { success: true }
}

export async function cancelForm(formId: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Chưa đăng nhập')
  }

  const { error } = await supabase
    .from('forms')
    .update({ status: 'Cancelled' })
    .eq('id', formId)
    .eq('user_id', user.id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/phat-tu')
  return { success: true }
}
