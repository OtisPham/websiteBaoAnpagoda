'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Calendar, Clock, FileText, ChevronRight, LogOut, Compass, Info, CheckCircle2, RefreshCw } from 'lucide-react'
import { signout } from '../auth/actions'
import { createForm, updateForm, cancelForm, TargetPersonInput } from './actions'
import PagodaLogo from '@/components/PagodaLogo'

interface EventData {
  id: string
  title: string
  type: 'CAU_AN' | 'CAU_SIEU' | 'KHAC'
  scheduled_date: string
  time_slots: { time: string; max_capacity: number }[]
}

interface TargetPerson {
  id: string
  full_name: string
  dharma_name?: string | null
  birth_year?: number | null
  death_year?: number | null
  relation?: string | null
}

interface FormRecord {
  id: string
  form_code: string
  form_type: 'CAU_AN' | 'CAU_SIEU'
  status: string
  is_delegated: boolean
  scheduled_date: string
  selected_time_slot?: string | null
  event_id?: string | null
  note?: string | null
  created_at: string
  events?: { title: string } | null
  targets: TargetPerson[]
  donations?: { amount: number; payment_status: string }[]
}

interface Props {
  userEmail: string
  userFullName: string
  events: EventData[]
  forms: FormRecord[]
}

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: currentYear - 1800 + 1 }, (_, i) => currentYear - i)
const LUNAR_DAYS = Array.from({ length: 30 }, (_, i) => (i + 1).toString())
const LUNAR_MONTHS = Array.from({ length: 12 }, (_, i) => (i + 1).toString())

export default function PhatTuDashboard({ userEmail, userFullName, events, forms }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingForm, setEditingForm] = useState<FormRecord | null>(null)
  const [submitAction, setSubmitAction] = useState<'SAVE_AND_CLOSE' | 'SAVE_AND_CONTINUE'>('SAVE_AND_CLOSE')
  
  // State của form nhập liệu
  const [formType, setFormType] = useState<'CAU_AN' | 'CAU_SIEU'>('CAU_AN')
  const [selectedEventId, setSelectedEventId] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [isDelegated, setIsDelegated] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [note, setNote] = useState('')
  const [targets, setTargets] = useState<TargetPersonInput[]>([{ full_name: '', relation: '' }])
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Tìm các ca cúng khả dụng của sự kiện đang chọn
  const currentEvent = events.find(e => e.id === selectedEventId)
  const availableSlots = currentEvent?.time_slots || []

  // Xử lý thay đổi sự kiện lễ
  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId)
    const evt = events.find(e => e.id === eventId)
    if (evt) {
      const isCauSieu = evt.type === 'CAU_SIEU'
      setFormType(isCauSieu ? 'CAU_SIEU' : 'CAU_AN')
      if (isCauSieu) {
        if (!scheduledDate || !scheduledDate.startsWith('Ngày')) setScheduledDate('Ngày 15 Tháng 7')
      } else {
        setScheduledDate(evt.scheduled_date)
      }
      if (evt.time_slots.length > 0) {
        setSelectedTimeSlot(evt.time_slots[0].time)
      }
    } else {
      setScheduledDate(new Date().toISOString().split('T')[0])
      setSelectedTimeSlot('')
    }
  }

  // Quản lý danh sách người thụ lễ
  const addTargetRow = () => {
    setTargets([...targets, { full_name: '', relation: '' }])
    setTimeout(() => {
      const modal = document.getElementById('form-modal-content')
      if (modal) {
        modal.scrollTo({ top: modal.scrollHeight, behavior: 'smooth' })
      }
      const nextIndex = targets.length
      const inputEl = document.getElementById(`target-input-${nextIndex}`)
      if (inputEl) inputEl.focus()
    }, 50)
  }

  const removeTargetRow = (index: number) => {
    if (targets.length > 1) {
      setTargets(targets.filter((_, i) => i !== index))
    }
  }

  const updateTargetField = (index: number, field: keyof TargetPersonInput, value: any) => {
    const updated = [...targets]
    updated[index] = { ...updated[index], [field]: value }
    setTargets(updated)
  }

  // Mở modal thêm phiếu mới
  const openCreateModal = () => {
    setEditingForm(null)
    setFormType('CAU_AN')
    if (events.length > 0) {
      handleEventChange(events[0].id)
    } else {
      setSelectedEventId('')
      setScheduledDate('')
      setSelectedTimeSlot('')
    }
    setIsDelegated(false)
    setNote('')
    setTargets([{ full_name: '', relation: '' }])
    setErrorMsg('')
    setSuccessMsg('')
    setIsModalOpen(true)
  }

  // Mở modal chỉnh sửa phiếu
  const openEditModal = (form: FormRecord) => {
    // Kiểm tra thời hạn 24 giờ
    const createdTime = new Date(form.created_at).getTime()
    const now = new Date().getTime()
    const hoursPassed = (now - createdTime) / (1000 * 60 * 60)
    
    if (hoursPassed > 24) {
      alert('Đã quá hạn 24 giờ kể từ lúc tạo phiếu. Không thể tự chỉnh sửa nữa. Vui lòng liên hệ nhà chùa.')
      return
    }

    if (!['Draft', 'Submitted', 'Waiting Verification', 'Rejected', 'Need Reprint'].includes(form.status)) {
      alert('Phiếu đã được duyệt hoặc in, không thể chỉnh sửa.')
      return
    }

    setEditingForm(form)
    setFormType(form.form_type)
    setSelectedEventId(form.event_id || '')
    setScheduledDate(form.scheduled_date)
    setIsDelegated(form.is_delegated)
    setSelectedTimeSlot(form.selected_time_slot || '')
    setNote(form.note || '')
    setTargets(form.targets.map(t => ({
      full_name: t.full_name,
      dharma_name: t.dharma_name || undefined,
      birth_year: t.birth_year || undefined,
      death_year: t.death_year || undefined,
      relation: t.relation || undefined
    })))
    setErrorMsg('')
    setSuccessMsg('')
    setIsModalOpen(true)
  }

  // Gửi Form submit (Thêm/Sửa)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    if (formType !== 'CAU_SIEU' && !selectedEventId) {
      setErrorMsg('Vui lòng chọn sự kiện/đại lễ')
      setIsSubmitting(false)
      return
    }

    if (selectedEventId && !isDelegated && !selectedTimeSlot) {
      setErrorMsg('Vui lòng chọn ca lễ hoặc ủy nhiệm cho nhà chùa')
      setIsSubmitting(false)
      return
    }

    // Validate danh sách người thụ lễ
    const invalidTarget = targets.some(t => !t.full_name.trim())
    if (invalidTarget) {
      setErrorMsg('Vui lòng điền đầy đủ Họ và tên cho tất cả người thụ lễ.')
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append('formType', formType)
      formData.append('eventId', selectedEventId)
      let finalDate = scheduledDate
      if (formType === 'CAU_SIEU' && !selectedEventId) {
        if (!scheduledDate || !scheduledDate.startsWith('Ngày')) {
           finalDate = 'Ngày 15 Tháng 7'
        }
      }
      formData.append('scheduledDate', finalDate)
      formData.append('isDelegated', String(isDelegated))
      formData.append('selectedTimeSlot', selectedTimeSlot)
      formData.append('note', note)

      let res
      if (editingForm) {
        res = await updateForm(editingForm.id, formData, targets)
      } else {
        res = await createForm(formData, targets)
      }

      if (res.success) {
        setSuccessMsg(editingForm ? 'Cập nhật phiếu thành công!' : `Gửi phiếu thành công! Mã phiếu của bạn là: ${(res as any).formCode || ''}. ${(res as any).assignedSlot ? `Hệ thống đã tự động xếp vào ca cúng: ${(res as any).assignedSlot}` : ''}`)
        
        if (submitAction === 'SAVE_AND_CONTINUE' && !editingForm) {
          setTimeout(() => {
            setSuccessMsg('')
            setTargets([{ full_name: '', dharma_name: '', birth_year: undefined, death_year: undefined, relation: '' }])
            setNote('')
            
            const modal = document.getElementById('form-modal-content')
            if (modal) modal.scrollTo({ top: 0, behavior: 'smooth' })
            
            document.getElementById('target-input-0')?.focus()
          }, 1500)
        } else {
          setTimeout(() => {
            setIsModalOpen(false)
            window.location.reload()
          }, editingForm ? 1000 : 3000)
        }
      } else {
        setErrorMsg(res.error || 'Có lỗi xảy ra, vui lòng thử lại.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối máy chủ.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Huỷ phiếu
  const handleCancel = async (formId: string) => {
    if (confirm('Bạn có chắc chắn muốn hủy phiếu đăng ký này?')) {
      const res = await cancelForm(formId)
      if (res.success) {
        alert('Hủy phiếu thành công.')
        window.location.reload()
      } else {
        alert('Lỗi: ' + res.error)
      }
    }
  }

  // Format Badge trạng thái sớ
  const renderStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; label: string }> = {
      Draft: { bg: 'bg-stone-100 text-stone-700 dark:bg-stone-900/50 dark:text-stone-400', label: 'Bản nháp' },
      Submitted: { bg: 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800', label: 'Đã gửi phiếu' },
      'Waiting Verification': { bg: 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-800', label: 'Chờ duyệt cúng dường' },
      Accepted: { bg: 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800', label: 'Đã nhận, chờ đọc' },
      Printed: { bg: 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-800', label: 'Đã in sớ' },
      Completed: { bg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400', label: 'Hoàn thành pháp sự' },
      Cancelled: { bg: 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800', label: 'Đã huỷ' },
      Rejected: { bg: 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400', label: 'Bị từ chối' },
      'Need Reprint': { bg: 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-400', label: 'Cần sửa & in lại' }
    }
    const cfg = statusConfig[status] || { bg: 'bg-stone-100 text-stone-800', label: status }
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg}`}>
        {cfg.label}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#12100e]">
      {/* Banner / Navigation */}
      <header className="bg-white dark:bg-[#1c1816] border-b border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <PagodaLogo className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-serif text-base sm:text-lg font-bold tracking-wider text-amber-800 dark:text-amber-400">
                Chùa Báo Ân
              </span>
              <span className="text-[9px] tracking-widest uppercase font-semibold text-stone-500 dark:text-stone-400 -mt-0.5">
                Cổng Phật Tử
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-stone-900 dark:text-white">{userFullName}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">{userEmail}</p>
            </div>
            <button
              onClick={() => signout()}
              className="p-2 text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition"
              title="Đăng xuất"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner chào mừng */}
        <div className="rounded-2xl bg-gradient-to-r from-amber-800 to-amber-700 p-6 sm:p-8 text-white shadow-lg mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">Nam Mô A Di Đà Phật!</h1>
            <p className="text-amber-100 text-sm max-w-xl">
              Chào đạo hữu {userFullName}. Đạo hữu có thể gửi phiếu đăng ký Cầu An, Cầu Siêu và cúng dường trực tuyến tại đây. Các phiếu này sẽ được Tăng Ni và phụng sự viên nhà chùa tiếp nhận và chuẩn bị sớ điệp trang nghiêm.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-white text-amber-800 font-semibold px-5 py-2.5 rounded-lg shadow hover:bg-amber-50 transition whitespace-nowrap"
          >
            <Plus className="h-5 w-5" />
            Gửi phiếu cúng mới
          </button>
        </div>

        {/* Danh sách phiếu */}
        <h2 className="font-serif text-2xl font-bold text-stone-950 dark:text-white mb-6">Lịch Sử Gửi Phiếu Của Bạn</h2>

        {forms.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <FileText className="mx-auto h-12 w-12 text-stone-400 dark:text-stone-600" />
            <h3 className="mt-4 font-serif text-lg font-bold text-stone-900 dark:text-white">Chưa có phiếu cúng nào</h3>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400 max-w-md mx-auto">
              Đạo hữu chưa đăng ký phiếu pháp sự nào. Hãy nhấp nút "Gửi phiếu cúng mới" ở trên để bắt đầu đăng ký cho bản thân và gia quyến.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {forms.map((form) => {
              // Tính thời gian xem có được sửa không (24h)
              const createdTime = new Date(form.created_at).getTime()
              const now = new Date().getTime()
              const hoursPassed = (now - createdTime) / (1000 * 60 * 60)
              const isEditable = hoursPassed <= 24 && !['Printed', 'Completed', 'Cancelled'].includes(form.status)
              
              // Chi phí cúng dường nếu có
              const donation = form.donations?.[0]

              return (
                <div key={form.id} className="bg-white dark:bg-[#1c1816] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${form.form_type === 'CAU_AN' ? 'bg-green-100 text-green-800 dark:bg-green-950/20 dark:text-green-400' : 'bg-rose-100 text-rose-800 dark:bg-rose-950/20 dark:text-rose-400'}`}>
                          {form.form_type === 'CAU_AN' ? 'Cầu An' : 'Cầu Siêu'}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-stone-950 dark:text-white">
                          Mã sớ: {form.form_code || 'Chưa cấp'}
                        </h3>
                      </div>
                      {renderStatusBadge(form.status)}
                    </div>

                    <div className="border-t border-b border-stone-100 dark:border-stone-800 py-3 space-y-2 text-sm text-stone-600 dark:text-stone-400">
                      <p className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-stone-400" />
                        <span>Sự kiện: {form.events?.title || 'Không theo sự kiện lớn'}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-stone-400" />
                        <span>
                          Giờ làm lễ:{' '}
                          {form.is_delegated ? (
                            <span className="italic text-amber-700 dark:text-amber-500 font-medium">Ủy nhiệm cho chùa phân bổ</span>
                          ) : (
                            form.selected_time_slot || 'Chưa gán ca cúng'
                          )}
                        </span>
                      </p>
                      <p className="font-medium text-stone-900 dark:text-stone-200">
                        Danh sách thụ lễ ({form.targets.length} người):
                      </p>
                      <ul className="list-disc pl-5 space-y-1 text-xs">
                        {form.targets.map((t, idx) => (
                          <li key={t.id || idx}>
                            <span className="font-semibold text-stone-800 dark:text-stone-300">{t.full_name}</span>
                            {t.dharma_name && ` (Pháp danh: ${t.dharma_name})`}
                            {t.birth_year && ` - SN: ${t.birth_year}`}
                            {t.death_year && ` - Mất năm: ${t.death_year}`}
                            {t.relation && ` (${t.relation})`}
                          </li>
                        ))}
                      </ul>
                      {donation && (
                        <div className="mt-3 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 text-xs flex justify-between items-center">
                          <span className="text-stone-500">Cúng dường:</span>
                          <span className="font-bold text-amber-700 dark:text-amber-500">
                            {Number(donation.amount).toLocaleString('vi-VN')} VNĐ ({donation.payment_status === 'CONFIRMED' ? 'Đã thu' : 'Chưa thu'})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    {isEditable ? (
                      <>
                        <button
                          onClick={() => openEditModal(form)}
                          className="flex items-center gap-1.5 rounded-lg border border-stone-300 dark:border-stone-700 px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Chỉnh sửa
                        </button>
                      </>
                    ) : (
                      <span className="text-xs italic text-stone-400 flex items-center gap-1">
                        <Info className="h-3.5 w-3.5" />
                        Đã quá 24h hoặc sớ đã in, không thể sửa
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal đăng ký / chỉnh sửa phiếu */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div id="form-modal-content" className="bg-white dark:bg-[#1c1816] rounded-2xl max-w-2xl w-full border border-stone-200 dark:border-stone-800 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-800 pb-4">
              <h3 className="font-serif text-2xl font-bold text-stone-950 dark:text-white">
                {editingForm ? 'Cập Nhật Phiếu Đăng Ký' : 'Đăng Ký Khóa Lễ Trực Tuyến'}
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

            {successMsg && (
              <div className="rounded-lg bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-700 dark:text-green-400 font-semibold">{successMsg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
                    Sự Kiện Lễ Lớn {formType === 'CAU_SIEU' && '(Không bắt buộc)'}
                  </label>
                  <select
                    value={selectedEventId}
                    onChange={(e) => handleEventChange(e.target.value)}
                    required={formType !== 'CAU_SIEU'}
                    className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
                  >
                    <option value="">-- Chọn sự kiện {formType === 'CAU_SIEU' && '(Tùy chọn)'} --</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id} className="bg-white dark:bg-[#1c1816]">
                        {e.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
                    Loại sớ cúng
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as 'CAU_AN' | 'CAU_SIEU')}
                    disabled={!!selectedEventId}
                    className={`mt-1 block w-full rounded-lg border px-3 py-2 sm:text-sm font-semibold ${
                      selectedEventId 
                        ? 'border-stone-200 dark:border-stone-850 bg-stone-50 dark:bg-stone-900 text-stone-500 dark:text-stone-400 cursor-not-allowed'
                        : 'border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white focus:border-amber-500'
                    }`}
                  >
                    <option value="CAU_AN">Cầu An</option>
                    <option value="CAU_SIEU">Cầu Siêu</option>
                  </select>
                </div>
              </div>

              {/* Ca cúng & Cân bằng tải */}
              <div className="bg-amber-50/30 dark:bg-amber-950/5 border border-amber-500/10 rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isDelegated"
                    checked={isDelegated}
                    onChange={(e) => setIsDelegated(e.target.checked)}
                    className="rounded text-amber-700 focus:ring-amber-500 h-4 w-4"
                  />
                  <label htmlFor="isDelegated" className="text-sm font-semibold text-stone-900 dark:text-stone-200 cursor-pointer">
                    Ủy nhiệm chùa sắp xếp thời khóa đọc sớ
                  </label>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  <span className="font-bold text-amber-700 dark:text-amber-500">Lưu ý:</span> Khuyến khích quý Phật tử tham dự trực tiếp để cùng nhất tâm cầu nguyện. Trường hợp không thể tham dự, chùa sẽ thay mặt quý Phật tử thực hiện nghi lễ theo thời khóa phù hợp.
                </p>

                {!isDelegated && (
                  <div className="pt-2 grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Ngày làm lễ
                      </label>
                      {formType === 'CAU_SIEU' ? (
                        <div className="flex gap-2">
                          <select
                            value={scheduledDate && scheduledDate.startsWith('Ngày') ? scheduledDate.split('Ngày ')[1]?.split(' ')[0] : '15'}
                            onChange={(e) => setScheduledDate(`Ngày ${e.target.value} Tháng ${scheduledDate && scheduledDate.startsWith('Ngày') ? scheduledDate.split('Tháng ')[1] : '7'}`)}
                            required={!isDelegated}
                            className="block w-1/2 rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
                          >
                            <option value="" disabled>Ngày</option>
                            {LUNAR_DAYS.map(d => <option key={d} value={d} className="bg-white dark:bg-[#1c1816]">Ngày {d}</option>)}
                          </select>
                          <select
                            value={scheduledDate && scheduledDate.startsWith('Ngày') ? scheduledDate.split('Tháng ')[1] : '7'}
                            onChange={(e) => setScheduledDate(`Ngày ${scheduledDate && scheduledDate.startsWith('Ngày') ? scheduledDate.split('Ngày ')[1]?.split(' ')[0] : '15'} Tháng ${e.target.value}`)}
                            required={!isDelegated}
                            className="block w-1/2 rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
                          >
                            <option value="" disabled>Tháng</option>
                            {LUNAR_MONTHS.map(m => <option key={m} value={m} className="bg-white dark:bg-[#1c1816]">Tháng {m}</option>)}
                          </select>
                        </div>
                      ) : (
                        <input
                          type="date"
                          value={scheduledDate && !scheduledDate.startsWith('Ngày') ? scheduledDate : ''}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          required={!isDelegated}
                          className="block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                        Chọn ca cúng cụ thể
                      </label>
                      <select
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        required={!isDelegated}
                        className="block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
                      >
                        {availableSlots.map((s, index) => (
                          <option key={index} value={s.time} className="bg-white dark:bg-[#1c1816]">
                            Khung giờ: {s.time} (Tối đa {s.max_capacity} sớ)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Danh sách người thụ lễ */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Danh Sách Hương Linh<span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={addTargetRow}
                    className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/20 border border-amber-600/20 text-amber-700 dark:text-amber-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-amber-100/30 transition"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm người
                  </button>
                </div>

                <div className="space-y-3">
                  {targets.map((target, index) => (
                    <div key={index} className="bg-stone-50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-200/60 dark:border-stone-800/40 space-y-3 relative">
                      <div className="absolute top-2 right-2 flex items-center gap-1.5">
                        {index === targets.length - 1 && (
                          <button
                            type="button"
                            onClick={addTargetRow}
                            className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-bold hover:bg-amber-200/60 transition shadow-sm"
                            title="Thêm người tiếp theo"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Thêm
                          </button>
                        )}
                        {targets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTargetRow(index)}
                            className="text-stone-400 hover:text-red-500 font-bold text-xs p-1"
                            title="Xoá dòng"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                      
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Họ và Tên</label>
                          <input
                            id={`target-input-${index}`}
                            type="text"
                            required
                            placeholder="Nguyễn Văn B"
                            value={target.full_name}
                            onChange={(e) => updateTargetField(index, 'full_name', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                if (index === targets.length - 1) addTargetRow()
                              }
                            }}
                            className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-2.5 py-1.5 text-stone-900 dark:text-white sm:text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Pháp danh (nếu có)</label>
                          <input
                            type="text"
                            placeholder="Tự Phúc Hạnh"
                            value={target.dharma_name || ''}
                            onChange={(e) => updateTargetField(index, 'dharma_name', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                if (index === targets.length - 1) addTargetRow()
                              }
                            }}
                            className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-2.5 py-1.5 text-stone-900 dark:text-white sm:text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Năm sinh</label>
                          <select
                            value={target.birth_year || ''}
                            onChange={(e) => updateTargetField(index, 'birth_year', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-2.5 py-1.5 text-stone-900 dark:text-white sm:text-xs"
                          >
                            <option value="">-- Chọn năm --</option>
                            {YEAR_OPTIONS.map(year => (
                              <option key={`birth-${year}`} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                        {formType === 'CAU_SIEU' && (
                          <div>
                            <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Năm mất</label>
                            <select
                              required={formType === 'CAU_SIEU'}
                              value={target.death_year || ''}
                              onChange={(e) => updateTargetField(index, 'death_year', e.target.value ? parseInt(e.target.value) : undefined)}
                              className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-2.5 py-1.5 text-stone-900 dark:text-white sm:text-xs"
                            >
                              <option value="">-- Chọn năm --</option>
                              {YEAR_OPTIONS.map(year => (
                                <option key={`death-${year}`} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div className={formType === 'CAU_SIEU' ? 'col-span-1' : 'col-span-2'}>
                          <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Mối quan hệ</label>
                          <input
                            type="text"
                            placeholder="Gia chủ tự cầu, Cha, Mẹ..."
                            value={target.relation || ''}
                            onChange={(e) => updateTargetField(index, 'relation', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                if (index === targets.length - 1) addTargetRow()
                              }
                            }}
                            className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-2.5 py-1.5 text-stone-900 dark:text-white sm:text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Nút cộng (+) ở hàng cuối cùng tiện lợi thêm tên mới không cần cuộn lên */}
                  <div className="pt-1 flex justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={addTargetRow}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-600/30 text-amber-800 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/40 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      {formType === 'CAU_SIEU' ? '+ Thêm hương linh tiếp theo' : '+ Thêm người cầu an tiếp theo'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">
                  Ghi chú thêm cho nhà chùa (nếu có)
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Xin cúng dường thêm giò hoa, hoặc thông tin phụ khác..."
                  className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-stone-100 dark:border-stone-800 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-lg border border-stone-300 dark:border-stone-700 px-4 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  onClick={() => setSubmitAction('SAVE_AND_CLOSE')}
                  className={!editingForm ? "flex items-center gap-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 px-5 py-2.5 text-sm font-semibold hover:bg-amber-100 transition" : "flex items-center gap-1.5 rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-amber-800 transition"}
                >
                  {isSubmitting && submitAction === 'SAVE_AND_CLOSE' ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    editingForm ? 'Cập nhật & Gửi lại' : 'Gửi & Đóng'
                  )}
                </button>
                {!editingForm && (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    onClick={() => setSubmitAction('SAVE_AND_CONTINUE')}
                    className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-amber-800 transition"
                  >
                    {isSubmitting && submitAction === 'SAVE_AND_CONTINUE' ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Đang xử lý...
                      </>
                    ) : (
                      'Gửi & Nhập tiếp'
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
