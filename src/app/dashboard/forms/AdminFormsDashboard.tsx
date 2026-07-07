'use client'

import { useState } from 'react'
import { FileText, Search, Edit2, Trash2, CheckCircle2, AlertTriangle, XCircle, ArrowRight, User, Calendar, Clock, RefreshCw } from 'lucide-react'
import { updateFormStatus, updateAdminForm, softDeleteForm } from './actions'
import { TargetPersonInput } from '@/app/phat-tu/actions'

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
  note?: string | null
  created_at: string
  users?: { full_name: string; phone: string; email: string } | null
  targets: TargetPerson[]
  donations?: { amount: number; payment_status: string }[]
}

interface Props {
  forms: FormRecord[]
  events: EventData[]
}

export default function AdminFormsDashboard({ forms, events }: Props) {
  // Lọc & Tìm kiếm
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [eventFilter, setEventFilter] = useState('')

  // Modal chỉnh sửa
  const [selectedForm, setSelectedForm] = useState<FormRecord | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDelegated, setIsDelegated] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [note, setNote] = useState('')
  const [targets, setTargets] = useState<TargetPersonInput[]>([])
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Lọc dữ liệu hiển thị
  const filteredForms = forms.filter((f) => {
    const codeMatch = f.form_code?.toLowerCase().includes(searchTerm.toLowerCase())
    const userMatch = f.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      f.users?.phone?.includes(searchTerm)
    const targetMatch = f.targets.some((t) => t.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesSearch = searchTerm === '' || codeMatch || userMatch || targetMatch
    const matchesStatus = statusFilter === '' || f.status === statusFilter
    const matchesType = typeFilter === '' || f.form_type === typeFilter
    const matchesEvent = eventFilter === '' || f.event_id === eventFilter

    return matchesSearch && matchesStatus && matchesType && matchesEvent
  })

  // Đổi trạng thái nhanh theo State Machine
  const handleStatusChange = async (formId: string, nextStatus: string) => {
    if (confirm(`Bạn có chắc chắn muốn chuyển phiếu này sang trạng thái [${nextStatus}]?`)) {
      const res = await updateFormStatus(formId, nextStatus)
      if (res.success) {
        alert('Cập nhật trạng thái thành công')
        window.location.reload()
      } else {
        alert('Lỗi: ' + res.error)
      }
    }
  }

  // Soft delete phiếu
  const handleDelete = async (formId: string) => {
    if (confirm('Bạn có chắc muốn xoá phiếu này? Dữ liệu sẽ được lưu trữ ẩn để phục vụ Audit Log.')) {
      const res = await softDeleteForm(formId)
      if (res.success) {
        alert('Đã xoá phiếu thành công.')
        window.location.reload()
      } else {
        alert('Lỗi: ' + res.error)
      }
    }
  }

  // Mở form edit cho admin
  const openEditModal = (form: FormRecord) => {
    setSelectedForm(form)
    setIsDelegated(form.is_delegated)
    setSelectedTimeSlot(form.selected_time_slot || '')
    setScheduledDate(form.scheduled_date)
    setNote(form.note || '')
    setTargets(form.targets.map((t) => ({
      full_name: t.full_name,
      dharma_name: t.dharma_name || undefined,
      birth_year: t.birth_year || undefined,
      death_year: t.death_year || undefined,
      relation: t.relation || undefined
    })))
    setErrorMsg('')
    setIsEditModalOpen(true)
  }

  const addTargetRow = () => {
    setTargets([...targets, { full_name: '', relation: '' }])
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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedForm) return
    setIsSubmitting(true)
    setErrorMsg('')

    const invalid = targets.some((t) => !t.full_name.trim())
    if (invalid) {
      setErrorMsg('Họ và tên của người thụ lễ không được để trống.')
      setIsSubmitting(false)
      return
    }

    const res = await updateAdminForm(
      selectedForm.id,
      selectedForm.form_type,
      isDelegated,
      isDelegated ? null : selectedTimeSlot,
      selectedForm.event_id || null,
      scheduledDate,
      note,
      targets
    )

    if (res.success) {
      setIsEditModalOpen(false)
      window.location.reload()
    } else {
      setErrorMsg(res.error || 'Có lỗi xảy ra khi lưu')
      setIsSubmitting(false)
    }
  }

  // Hiển thị nút chuyển trạng thái phù hợp cho State Machine
  const renderWorkflowButtons = (form: FormRecord) => {
    const current = form.status
    return (
      <div className="flex flex-wrap gap-1.5">
        {current === 'Submitted' && (
          <>
            <button
              onClick={() => handleStatusChange(form.id, 'Waiting Verification')}
              className="bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition"
            >
              Chờ duyệt tịnh tài
            </button>
            <button
              onClick={() => handleStatusChange(form.id, 'Accepted')}
              className="bg-amber-600 text-white hover:bg-amber-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition"
            >
              Duyệt sớ (Nhận lễ)
            </button>
            <button
              onClick={() => handleStatusChange(form.id, 'Rejected')}
              className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition"
            >
              Từ chối
            </button>
          </>
        )}

        {current === 'Waiting Verification' && (
          <>
            <button
              onClick={() => handleStatusChange(form.id, 'Accepted')}
              className="bg-amber-600 text-white hover:bg-amber-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition"
            >
              Duyệt sớ (Nhận lễ)
            </button>
            <button
              onClick={() => handleStatusChange(form.id, 'Rejected')}
              className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition"
            >
              Từ chối
            </button>
          </>
        )}

        {current === 'Accepted' && (
          <button
            onClick={() => handleStatusChange(form.id, 'Printed')}
            className="bg-green-600 text-white hover:bg-green-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition"
          >
            Đánh dấu Đã in sớ
          </button>
        )}

        {current === 'Printed' && (
          <>
            <button
              onClick={() => handleStatusChange(form.id, 'Completed')}
              className="bg-emerald-700 text-white hover:bg-emerald-800 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition"
            >
              Hoàn thành khóa lễ
            </button>
            <button
              onClick={() => handleStatusChange(form.id, 'Need Reprint')}
              className="bg-yellow-50 text-yellow-700 border border-yellow-200 hover:bg-yellow-100 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition"
            >
              Yêu cầu in lại sớ
            </button>
          </>
        )}

        {current === 'Need Reprint' && (
          <button
            onClick={() => handleStatusChange(form.id, 'Printed')}
            className="bg-green-600 text-white hover:bg-green-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 transition"
          >
            Đã in lại
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Quản Lý Phiếu Sớ</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Duyệt sớ, kiểm tra thông tin thụ lễ và quản lý vòng đời phiếu cúng.</p>
        </div>
      </div>

      {/* Lọc & Tìm kiếm */}
      <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm grid md:grid-cols-4 gap-4 items-end">
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
            <input
              type="text"
              placeholder="Mã phiếu, SĐT, Họ tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent text-stone-900 dark:text-white placeholder-stone-400 focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Trạng thái</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
          >
            <option value="" className="bg-white dark:bg-[#1c1816]">Tất cả trạng thái</option>
            <option value="Submitted" className="bg-white dark:bg-[#1c1816]">Mới gửi (Chờ duyệt)</option>
            <option value="Waiting Verification" className="bg-white dark:bg-[#1c1816]">Chờ duyệt tịnh tài</option>
            <option value="Accepted" className="bg-white dark:bg-[#1c1816]">Đã nhận, chờ đọc</option>
            <option value="Printed" className="bg-white dark:bg-[#1c1816]">Đã in sớ</option>
            <option value="Completed" className="bg-white dark:bg-[#1c1816]">Đã hoàn thành</option>
            <option value="Cancelled" className="bg-white dark:bg-[#1c1816]">Đã huỷ</option>
            <option value="Rejected" className="bg-white dark:bg-[#1c1816]">Bị từ chối</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Loại sớ</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
          >
            <option value="" className="bg-white dark:bg-[#1c1816]">Tất cả sớ</option>
            <option value="CAU_AN" className="bg-white dark:bg-[#1c1816]">Sớ Cầu An</option>
            <option value="CAU_SIEU" className="bg-white dark:bg-[#1c1816]">Sớ Cầu Siêu</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">Đại Lễ</label>
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
          >
            <option value="" className="bg-white dark:bg-[#1c1816]">Tất cả đại lễ</option>
            {events.map((e) => (
              <option key={e.id} value={e.id} className="bg-white dark:bg-[#1c1816]">
                {e.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bảng Danh Sách */}
      <div className="bg-white dark:bg-[#1c1816] border border-stone-200 dark:border-stone-850 rounded-2xl shadow-sm overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-left text-sm">
          <thead className="bg-stone-50 dark:bg-stone-900/40 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Mã Phiếu & Loại</th>
              <th className="px-6 py-4">Người Đăng Ký</th>
              <th className="px-6 py-4">Lễ & Ca Cúng</th>
              <th className="px-6 py-4">Thụ Lễ (Hương Linh)</th>
              <th className="px-6 py-4">Cúng Dường</th>
              <th className="px-6 py-4">Thao tác / Workflow</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
            {filteredForms.map((form) => {
              const donation = form.donations?.[0]
              return (
                <tr key={form.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/10">
                  <td className="px-6 py-4 space-y-1">
                    <span className="font-bold text-stone-900 dark:text-white">{form.form_code || 'Chưa cấp'}</span>
                    <div>
                      <span className={`inline-block text-[9px] uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded ${form.form_type === 'CAU_AN' ? 'bg-green-50 text-green-700 border border-green-200/50 dark:bg-green-950/20' : 'bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/20'}`}>
                        {form.form_type === 'CAU_AN' ? 'Cầu An' : 'Cầu Siêu'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 space-y-0.5">
                    <div className="font-semibold text-stone-800 dark:text-stone-200">
                      {form.users?.full_name || 'Phật tử ẩn danh'}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-450">{form.users?.phone || 'Không có SĐT'}</div>
                    {form.targets.find(t => t.relation === 'TRAI_CHU') && (
                      <div className="text-[10px] text-amber-700 font-bold mt-1">
                        Đứng tên: {form.targets.find(t => t.relation === 'TRAI_CHU')?.full_name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 space-y-1">
                    <div className="text-stone-700 dark:text-stone-300 font-medium text-xs">
                      {form.events?.title || 'Không theo sự kiện lớn'}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-stone-500 dark:text-stone-450">
                      <Clock className="h-3 w-3" />
                      {form.is_delegated ? (
                        <span className="italic text-amber-700 dark:text-amber-500 font-medium">Ủy nhiệm cho chùa</span>
                      ) : (
                        form.selected_time_slot || 'Chưa gán ca'
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ul className="list-disc pl-4 text-xs text-stone-600 dark:text-stone-400 space-y-0.5 max-w-xs truncate">
                      {form.targets.filter(t => t.relation !== 'TRAI_CHU').slice(0, 3).map((t, index) => (
                        <li key={t.id || index}>
                          <span className="font-semibold text-stone-800 dark:text-stone-300">{t.full_name}</span>
                          {t.dharma_name && ` (${t.dharma_name})`}
                          {t.birth_year && ` - ${t.birth_year}`}
                        </li>
                      ))}
                      {form.targets.filter(t => t.relation !== 'TRAI_CHU').length > 3 && (
                        <li className="list-none text-stone-400 dark:text-stone-600 font-medium">
                          và {form.targets.filter(t => t.relation !== 'TRAI_CHU').length - 3} người khác...
                        </li>
                      )}
                    </ul>
                  </td>
                  <td className="px-6 py-4">
                    {donation ? (
                      <div className="space-y-1">
                        <div className="font-bold text-stone-800 dark:text-stone-200">
                          {Number(donation.amount).toLocaleString('vi-VN')} đ
                        </div>
                        <span className={`inline-block text-[9px] uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded ${donation.payment_status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/20 dark:text-yellow-400'}`}>
                          {donation.payment_status === 'CONFIRMED' ? 'Đã thu' : 'Chưa thu'}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-400 italic">Không đóng góp</span>
                    )}
                  </td>
                  <td className="px-6 py-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(form)}
                        className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 transition"
                        title="Xem & Sửa thông tin"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(form.id)}
                        className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded text-stone-600 dark:text-stone-400 hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Xoá phiếu"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <span className="text-[11px] font-bold text-stone-500 bg-stone-100 dark:bg-stone-800/60 px-2 py-0.5 rounded">
                        {form.status}
                      </span>
                    </div>
                    {renderWorkflowButtons(form)}
                  </td>
                </tr>
              )
            })}
            {filteredForms.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-12 text-stone-400 italic">
                  Không tìm thấy phiếu sớ nào phù hợp bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Chỉnh Sửa Dành Cho Ban Quản Trị */}
      {isEditModalOpen && selectedForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#1c1816] rounded-2xl max-w-2xl w-full border border-stone-200 dark:border-stone-850 shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-stone-100 dark:border-stone-850 pb-4">
              <h3 className="font-serif text-2xl font-bold text-stone-950 dark:text-white">
                Sửa Phiếu Cúng (Mã: {selectedForm.form_code})
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
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

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="bg-stone-50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-200/50 dark:border-stone-800/40 text-xs space-y-1">
                <p className="font-semibold text-stone-700 dark:text-stone-300">Thông tin Phật tử đăng ký:</p>
                <p>Họ tên: {selectedForm.users?.full_name}</p>
                <p>Số điện thoại: {selectedForm.users?.phone}</p>
                <p>Email: {selectedForm.users?.email}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">Ngày làm lễ</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">Phân ca cúng</label>
                  <div className="mt-3 flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <input
                        type="checkbox"
                        id="adminIsDelegated"
                        checked={isDelegated}
                        onChange={(e) => setIsDelegated(e.target.checked)}
                        className="rounded text-amber-700 focus:ring-amber-500 h-4 w-4"
                      />
                      <label htmlFor="adminIsDelegated" className="text-xs font-semibold cursor-pointer">
                        Ủy nhiệm tự động
                      </label>
                    </div>
                    {!isDelegated && (
                      <input
                        type="text"
                        placeholder="Ví dụ: 07:00"
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        className="flex-1 rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-1 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-xs"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Danh sách người thụ lễ */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100">
                    Danh Sách Người Thụ Lễ
                  </label>
                  <button
                    type="button"
                    onClick={addTargetRow}
                    className="bg-amber-50 dark:bg-amber-950/20 border border-amber-600/20 text-amber-700 dark:text-amber-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-amber-100/30 transition"
                  >
                    + Thêm người
                  </button>
                </div>

                <div className="space-y-3">
                  {targets.map((target, index) => (
                    <div key={index} className="bg-stone-50 dark:bg-stone-900/40 p-4 rounded-xl border border-stone-200/65 dark:border-stone-800/45 space-y-3 relative">
                      {targets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTargetRow(index)}
                          className="absolute top-2 right-2 text-stone-400 hover:text-red-500 font-bold text-xs"
                        >
                          ✕
                        </button>
                      )}
                      
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Họ và Tên</label>
                          <input
                            type="text"
                            required
                            value={target.full_name}
                            onChange={(e) => updateTargetField(index, 'full_name', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-2.5 py-1.5 text-stone-900 dark:text-white sm:text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Pháp danh</label>
                          <input
                            type="text"
                            value={target.dharma_name || ''}
                            onChange={(e) => updateTargetField(index, 'dharma_name', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-2.5 py-1.5 text-stone-900 dark:text-white sm:text-xs"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Năm sinh</label>
                          <input
                            type="number"
                            value={target.birth_year || ''}
                            onChange={(e) => updateTargetField(index, 'birth_year', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-2.5 py-1.5 text-stone-900 dark:text-white sm:text-xs"
                          />
                        </div>
                        {selectedForm.form_type === 'CAU_SIEU' && (
                          <div>
                            <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Năm mất</label>
                            <input
                              type="number"
                              required={selectedForm.form_type === 'CAU_SIEU'}
                              value={target.death_year || ''}
                              onChange={(e) => updateTargetField(index, 'death_year', e.target.value ? parseInt(e.target.value) : undefined)}
                              className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-2.5 py-1.5 text-stone-900 dark:text-white sm:text-xs"
                            />
                          </div>
                        )}
                        <div className={selectedForm.form_type === 'CAU_SIEU' ? 'col-span-1' : 'col-span-2'}>
                          <label className="block text-[10px] font-semibold text-stone-500 uppercase tracking-wider">Mối quan hệ</label>
                          <input
                            type="text"
                            value={target.relation || ''}
                            onChange={(e) => updateTargetField(index, 'relation', e.target.value)}
                            className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-transparent px-2.5 py-1.5 text-stone-900 dark:text-white sm:text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">Ghi chú</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-stone-100 dark:border-stone-850 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
                    'Lưu thay đổi'
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
