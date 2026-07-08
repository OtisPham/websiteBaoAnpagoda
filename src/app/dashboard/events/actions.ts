'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

// Chỉ ADMIN, MONK, VOLUNTEER, MASTER mới được quản lý sự kiện lễ
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
  if (!['ADMIN', 'MONK', 'VOLUNTEER', 'MASTER'].includes(role)) {
    throw new Error('Không có quyền thực hiện thao tác này. Chỉ Tăng Ni, Tình nguyện viên hoặc Admin được cấu hình sự kiện.')
  }

  return { supabase }
}

export async function createEvent(
  title: string,
  type: 'CAU_AN' | 'CAU_SIEU' | 'KHAC',
  scheduledDate: string,
  timeSlots: { time: string; max_capacity: number }[],
  description: string
) {
  try {
    const { supabase } = await checkAuthAndRole()

    const { error } = await supabase
      .from('events')
      .insert({
        title,
        type,
        scheduled_date: scheduledDate,
        time_slots: timeSlots,
        description
      })

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/events')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateEvent(
  eventId: string,
  title: string,
  type: 'CAU_AN' | 'CAU_SIEU' | 'KHAC',
  scheduledDate: string,
  timeSlots: { time: string; max_capacity: number }[],
  description: string
) {
  try {
    const { supabase } = await checkAuthAndRole()

    const { error } = await supabase
      .from('events')
      .update({
        title,
        type,
        scheduled_date: scheduledDate,
        time_slots: timeSlots,
        description
      })
      .eq('id', eventId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/events')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const { supabase } = await checkAuthAndRole()

    // Soft delete events
    const { error } = await supabase
      .from('events')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', eventId)

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/events')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
