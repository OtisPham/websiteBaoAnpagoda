'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Calendar, Clock, RefreshCw, FileText, CheckCircle } from 'lucide-react'
import { createEvent, updateEvent, deleteEvent } from './actions'

interface TimeSlot {
  time: string
  max_capacity: number
}

interface EventData {
  id: string
  title: string
  type: 'CAU_AN' | 'CAU_SIEU' | 'KHAC'
  scheduled_date: string
  time_slots: TimeSlot[]
  description?: string | null
}

interface Props {
  events: EventData[]
}

export default function AdminEventsDashboard({ events }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null)

  // State nhập liệu
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'CAU_AN' | 'CAU_SIEU' | 'KHAC'>('CAU_AN')
  const [scheduledDate, setScheduledDate] = useState('')
  const [description, setDescription] = useState('')
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { time: '07:00', max_capacity: 100 },
    { time: '14:00', max_capacity: 100 },
    { time: '18:00', max_capacity: 100 }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Quản lý time slot động
  const addSlotRow = () => {
    setTimeSlots([...timeSlots, { time: '', max_capacity: 100 }])
  }

  const removeSlotRow = (index: number) => {
    if (timeSlots.length > 1) {
      setTimeSlots(timeSlots.filter((_, i) => i !== index))
    }
  }

  const updateSlotField = (index: number, field: keyof TimeSlot, value: any) => {
    const updated = [...timeSlots]
    updated[index] = { ...updated[index], [field]: value }
    setTimeSlots(updated)
  }

  // Mở modal tạo mới
  const openCreateModal = () => {
    setEditingEvent(null)
    setTitle('')
    setType('CAU_AN')
    setScheduledDate('')
    setDescription('')
    setTimeSlots([
      { time: '07:00', max_capacity: 100 },
      { time: '14:00', max_capacity: 100 },
      { time: '18:00', max_capacity: 100 }
    ])
    setErrorMsg('')
    setIsModalOpen(true)
  }

  // Mở modal sửa
  const openEditModal = (evt: EventData) => {
    setEditingEvent(evt)
    setTitle(evt.title)
    setType(evt.type)
    setScheduledDate(evt.scheduled_date)
    setDescription(evt.description || '')
    setTimeSlots(evt.time_slots)
    setErrorMsg('')
    setIsModalOpen(true)
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    // Validate slots
    const invalidSlot = timeSlots.some(s => !s.time.trim() || s.max_capacity <= 0)
    if (invalidSlot) {
      setErrorMsg('Vui lòng điền đúng thông tin ca cúng và sức chứa tối đa.')
      setIsSubmitting(false)
      return
    }

    let res
    if (editingEvent) {
      res = await updateEvent(editingEvent.id, title, type, scheduledDate, timeSlots, description)
    } else {
      res = await createEvent(title, type, scheduledDate, timeSlots, description)
    }

    if (res.success) {
      setIsModalOpen(false)
      window.location.reload()
    } else {
      setErrorMsg(res.error || 'Lỗi khi lưu sự kiện lễ')
      setIsSubmitting(false)
    }
  }

  // Xoá sự kiện
  const handleDelete = async (eventId: string) => {
    if (confirm('Bạn có chắc chắn muốn xoá sự kiện lễ này? Mọi phiếu cúng đã liên kết sẽ được giữ nguyên nhưng sự kiện sẽ bị ẩn khỏi Phật tử.')) {
      const res = await deleteEvent(eventId)
      if (res.success) {
        alert('Xoá sự kiện thành công.')
        window.location.reload()
      } else {
        alert('Lỗi: ' + res.error)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Đại Lễ & Khung Giờ Cúng</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Cấu hình các sự kiện lễ của bổn tự và cài đặt sức chứa cho từng ca cúng.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-amber-700 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-amber-800 transition text-sm"
        >
          <Plus className="h-4.5 w-4.5" />
          Thêm sự kiện lễ mới
        </button>
      </div>

      {/* Danh sách sự kiện lễ */}
      {events.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm">
          <Calendar className="mx-auto h-12 w-12 text-stone-400 dark:text-stone-600" />
          <h3 className="mt-4 font-serif text-lg font-bold text-stone-900 dark:text-white">Chưa cấu hình sự kiện nào</h3>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Hãy nhấp "Thêm sự kiện lễ mới" để cấu hình ngày đại lễ tiếp theo.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <div key={evt.id} className="bg-white dark:bg-[#1c1816] border border-stone-200 dark:border-stone-850 rounded-2xl p-6 shadow-sm flex flex-col justify-between hover:border-amber-600 transition">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <span className={`inline-block text-[9px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded ${evt.type === 'CAU_AN' ? 'bg-green-50 text-green-700 border border-green-200/50 dark:bg-green-950/20' : evt.type === 'CAU_SIEU' ? 'bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/20' : 'bg-stone-100 text-stone-700 dark:bg-stone-800'}`}>
                    {evt.type === 'CAU_AN' ? 'Cầu An' : evt.type === 'CAU_SIEU' ? 'Cầu Siêu' : 'Sự kiện khác'}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(evt)}
                      className="p-1 hover:bg-stone-50 dark:hover:bg-stone-800 rounded text-stone-500 hover:text-amber-700 transition"
                      title="Sửa"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(evt.id)}
                      className="p-1 hover:bg-stone-50 dark:hover:bg-stone-800 rounded text-stone-500 hover:text-red-650 transition"
                      title="Xoá"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <h3 className="font-serif text-lg font-bold text-stone-950 dark:text-white leading-snug">
                  {evt.title}
                </h3>

                <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Ngày tổ chức: <span className="font-semibold">{evt.scheduled_date}</span>
                </p>

                {evt.description && (
                  <p className="text-xs text-stone-600 dark:text-stone-450 leading-relaxed italic line-clamp-2">
                    {evt.description}
                  </p>
                )}

                <div className="border-t border-stone-100 dark:border-stone-800 pt-3 space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Các ca cúng và Sức chứa:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {evt.time_slots.map((slot, index) => (
                      <div key={index} className="bg-stone-50 dark:bg-stone-900/60 p-2 rounded border border-stone-200/50 dark:border-stone-800/40 text-xs space-y-0.5">
                        <p className="flex items-center gap-1 font-semibold">
                          <Clock className="h-3 w-3 text-stone-400" />
                          {slot.time}
                        </p>
                        <p className="text-[10px] text-stone-500">Tối đa: {slot.max_capacity} sớ</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Thêm / Sửa sự kiện */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1c1816] rounded-2xl max-w-2xl w-full border border-stone-200 dark:border-stone-850 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-4">
              <h3 className="font-serif text-2xl font-bold text-stone-950 dark:text-white">
                {editingEvent ? 'Cập Nhật Sự Kiện Lễ' : 'Cấu Hình Sự Kiện Lễ Mới'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 dark:text-stone-600 dark:hover:text-stone-400 font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400 font-semibold">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
                    Tên Đại Lễ / Khóa Tu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Đại Lễ Vu Lan Báo Hiếu"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">Phân loại</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
                  >
                    <option value="CAU_AN" className="bg-white dark:bg-[#1c1816]">Lễ Cầu An</option>
                    <option value="CAU_SIEU" className="bg-white dark:bg-[#1c1816]">Lễ Cầu Siêu</option>
                    <option value="KHAC" className="bg-white dark:bg-[#1c1816]">Sự kiện lễ hội khác</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
                  Ngày cử hành lễ <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">Mô tả sự kiện</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ý nghĩa khóa lễ, hướng dẫn Phật tử..."
                  className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
                />
              </div>

              {/* Danh sách ca cúng */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Cấu Hình Các Ca Cúng (Khung giờ) <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addSlotRow}
                    className="bg-amber-50 dark:bg-amber-950/20 border border-amber-600/20 text-amber-700 dark:text-amber-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-amber-100/30 transition"
                  >
                    + Thêm ca cúng
                  </button>
                </div>

                <div className="space-y-3">
                  {timeSlots.map((slot, index) => (
                    <div key={index} className="flex gap-4 items-center bg-stone-50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-200/50 dark:border-stone-850 relative">
                      {timeSlots.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSlotRow(index)}
                          className="absolute top-2 right-2 text-stone-400 hover:text-red-500 font-bold text-xs"
                        >
                          ✕
                        </button>
                      )}
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Giờ đọc sớ</label>
                          <input
                            type="text"
                            required
                            placeholder="Ví dụ: 07:00"
                            value={slot.time}
                            onChange={(e) => updateSlotField(index, 'time', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-2.5 py-1.5 text-stone-900 dark:text-white sm:text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Sức chứa tối đa (Số sớ)</label>
                          <input
                            type="number"
                            required
                            min={1}
                            placeholder="100"
                            value={slot.max_capacity}
                            onChange={(e) => updateSlotField(index, 'max_capacity', parseInt(e.target.value) || 0)}
                            className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-2.5 py-1.5 text-stone-900 dark:text-white sm:text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-stone-100 dark:border-stone-850 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-lg border border-stone-300 dark:border-stone-700 px-4 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-amber-800 transition"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    'Lưu sự kiện lễ'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
