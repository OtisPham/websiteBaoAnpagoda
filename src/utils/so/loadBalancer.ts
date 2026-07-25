import { SupabaseClient } from '@supabase/supabase-js'

export interface TimeSlotOption {
  time: string
  max_capacity?: number
  current_count?: number
}

// Danh sách khung giờ tiêu chuẩn của nhà chùa (nếu không gắn sự kiện cụ thể)
export const DEFAULT_PAGODA_SLOTS = ['07:00', '14:00', '18:00']

/**
 * Thuật toán Cân bằng tải ca cúng (Load Balancing) cho các phiếu đăng ký `is_delegated = true`
 * Tự động tìm khung giờ (Time Slot) có số lượng người đăng ký ít nhất để phân bổ.
 */
export async function autoAssignOptimalSlot(
  supabase: SupabaseClient,
  eventId: string | null | undefined,
  scheduledDate: string
): Promise<string> {
  try {
    let availableSlots: string[] = DEFAULT_PAGODA_SLOTS

    // 1. Nếu có eventId, lấy danh sách time_slots được cấu hình trong bảng events
    if (eventId) {
      const { data: eventData } = await supabase
        .from('events')
        .select('time_slots')
        .eq('id', eventId)
        .single()

      if (eventData && Array.isArray(eventData.time_slots) && eventData.time_slots.length > 0) {
        availableSlots = eventData.time_slots.map((s: any) => typeof s === 'string' ? s : s.time)
      }
    }

    if (availableSlots.length === 0) {
      return DEFAULT_PAGODA_SLOTS[0]
    }

    // 2. Đếm số lượng phiếu sớ hiện tại ở từng ca cúng trong ngày đó
    let query = supabase
      .from('forms')
      .select('selected_time_slot')
      .eq('scheduled_date', scheduledDate)
      .is('deleted_at', null)
      .not('selected_time_slot', 'is', null)
      .neq('status', 'Cancelled')
      .neq('status', 'Rejected')

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const { data: existingForms } = await query

    // Thống kê số lượng theo từng slot
    const slotCounts: Record<string, number> = {}
    availableSlots.forEach((slot) => {
      slotCounts[slot] = 0
    })

    if (existingForms && existingForms.length > 0) {
      existingForms.forEach((form) => {
        if (form.selected_time_slot && slotCounts[form.selected_time_slot] !== undefined) {
          slotCounts[form.selected_time_slot]++
        }
      })
    }

    // 3. Tìm slot có số phiếu đăng ký nhỏ nhất (Lowest Occupancy)
    let bestSlot = availableSlots[0]
    let minCount = slotCounts[bestSlot]

    for (const slot of availableSlots) {
      if (slotCounts[slot] < minCount) {
        minCount = slotCounts[slot]
        bestSlot = slot
      }
    }

    return bestSlot
  } catch (err) {
    console.error('Lỗi khi chạy Load Balancer phân bổ ca cúng:', err)
    return DEFAULT_PAGODA_SLOTS[0]
  }
}
