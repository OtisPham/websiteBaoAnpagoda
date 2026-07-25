'use client'

import { useState } from 'react'
import { Plus, X, Trash2, CheckCircle, FileText } from 'lucide-react'
import { createForm, TargetPersonInput } from '../phat-tu/actions'

interface MonkCreateFormProps {
  events: any[]
}

export default function MonkCreateForm({ events }: MonkCreateFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formType, setFormType] = useState<'CAU_AN' | 'CAU_SIEU'>('CAU_AN')
  const [eventId, setEventId] = useState('')
  const [isDelegated, setIsDelegated] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [note, setNote] = useState('')
  const [formCode, setFormCode] = useState('')
  const [traiChuName, setTraiChuName] = useState('')
  const [traiChuDharma, setTraiChuDharma] = useState('')
  
  const [targets, setTargets] = useState<TargetPersonInput[]>([
    { full_name: '', dharma_name: '', birth_year: undefined, death_year: undefined, relation: '' }
  ])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const selectedEvent = events.find((e) => e.id === eventId)

  const handleAddTarget = () => {
    setTargets([...targets, { full_name: '', dharma_name: '', birth_year: undefined, death_year: undefined, relation: '' }])
  }

  const handleRemoveTarget = (index: number) => {
    if (targets.length > 1) {
      setTargets(targets.filter((_, i) => i !== index))
    }
  }

  const handleTargetChange = (index: number, field: keyof TargetPersonInput, value: any) => {
    const newTargets = [...targets]
    newTargets[index] = { ...newTargets[index], [field]: value }
    setTargets(newTargets)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (formType !== 'CAU_SIEU' && !eventId) {
      setError('Vui lòng chọn sự kiện/đại lễ')
      setLoading(false)
      return
    }

    if (eventId && !isDelegated && !selectedTimeSlot) {
      setError('Vui lòng chọn ca lễ hoặc ủy nhiệm cho nhà chùa')
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('formType', formType)
    formData.append('eventId', eventId)
    if (selectedEvent) {
      formData.append('scheduledDate', selectedEvent.scheduled_date)
    } else {
      formData.append('scheduledDate', new Date().toISOString().split('T')[0])
    }
    formData.append('isDelegated', isDelegated.toString())
    if (!isDelegated && selectedTimeSlot) {
      formData.append('selectedTimeSlot', selectedTimeSlot)
    }
    if (note) formData.append('note', note)
    if (formCode) formData.append('formCode', formCode)

    const finalTargets = [...targets]
    if (traiChuName.trim()) {
      finalTargets.push({
        full_name: traiChuName,
        dharma_name: traiChuDharma,
        relation: 'TRAI_CHU'
      })
    }

    try {
      const res = await createForm(formData, finalTargets)
      if (res.success) {
        setSuccess(`Tạo sớ thành công. Mã phiếu: ${res.formCode}`)
        setTimeout(() => {
          setIsOpen(false)
          setSuccess('')
          setTargets([{ full_name: '', dharma_name: '', birth_year: undefined, death_year: undefined, relation: '' }])
          setFormCode('')
          setTraiChuName('')
          setTraiChuDharma('')
        }, 2000)
      } else {
        setError(res.error || 'Có lỗi xảy ra')
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 bg-[#8B4513] hover:bg-[#72380f] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 shadow-sm active:scale-[0.98]"
      >
        <FileText className="h-4 w-4" />
        <span>Tạo Sớ Mới (Tăng Ni)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1c1816] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-stone-200/80 dark:border-stone-800/80 p-6 sm:p-8">
            <div className="flex justify-between items-start border-b border-stone-200/60 dark:border-stone-800/60 pb-5 mb-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B4513] dark:text-amber-400">
                  Nghi Lễ & Pháp Sự
                </span>
                <h2 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                  Tạo Sớ Cầu An / Cầu Siêu Thủ Công
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Dành cho Quý Thầy ghi nhận trực tiếp tại chùa cho Phật tử hoặc gia chủ đến đăng ký.
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all duration-150"
                title="Đóng cửa sổ"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 text-green-700 border border-green-200 text-sm flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Thông tin chung */}
              <div className="grid sm:grid-cols-2 gap-6 bg-stone-50 dark:bg-stone-900/30 p-6 rounded-2xl border border-stone-100 dark:border-stone-800">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Loại sớ</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as 'CAU_AN' | 'CAU_SIEU')}
                    className="w-full bg-white dark:bg-[#12100e] border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition"
                  >
                    <option value="CAU_AN">Sớ Cầu An</option>
                    <option value="CAU_SIEU">Sớ Cầu Siêu</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Mã sớ thủ công (Tùy chọn)</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="VD: CA-99A"
                    className="w-full bg-white dark:bg-[#12100e] border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition"
                  />
                  <p className="text-[10px] text-stone-500">Nếu bỏ trống, hệ thống sẽ tự sinh mã.</p>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">
                    Đại lễ / Sự kiện {formType === 'CAU_SIEU' && '(Không bắt buộc)'}
                  </label>
                  <select
                    value={eventId}
                    onChange={(e) => setEventId(e.target.value)}
                    className="w-full bg-white dark:bg-[#12100e] border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition"
                  >
                    <option value="">-- Chọn sự kiện {formType === 'CAU_SIEU' && '(Tùy chọn)'} --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </div>

                {eventId && selectedEvent && (
                  <div className="space-y-4 sm:col-span-2">
                    <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Chọn Ca Lễ</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="monk-isDelegated"
                        checked={isDelegated}
                        onChange={(e) => {
                          setIsDelegated(e.target.checked)
                          if (e.target.checked) setSelectedTimeSlot('')
                        }}
                        className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                      />
                      <label htmlFor="monk-isDelegated" className="text-sm text-stone-600 dark:text-stone-400">
                        Ủy nhiệm cho nhà chùa tự phân bổ ca vắng nhất
                      </label>
                    </div>

                    {!isDelegated && (
                      <select
                        value={selectedTimeSlot}
                        onChange={(e) => setSelectedTimeSlot(e.target.value)}
                        className="w-full bg-white dark:bg-[#12100e] border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition"
                      >
                        <option value="">-- Chọn khung giờ --</option>
                        {selectedEvent.time_slots?.map((slot: any, idx: number) => (
                          <option key={idx} value={slot.time}>
                            {slot.time} (Sức chứa: {slot.max_capacity} sớ)
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* Thông tin Trai chủ */}
              <div className="bg-stone-50 dark:bg-stone-900/30 border border-stone-200 dark:border-stone-800 rounded-xl p-4 space-y-3">
                <label className="block text-sm font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Thông Tin Trai Chủ (Người đứng tên)
                </label>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Họ và tên Trai chủ *</label>
                    <input
                      type="text"
                      required
                      value={traiChuName}
                      onChange={(e) => setTraiChuName(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#12100e] px-3 py-2 text-stone-900 dark:text-white sm:text-sm focus:border-amber-500 focus:outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-stone-500 uppercase tracking-wider">Pháp danh (Nếu có)</label>
                    <input
                      type="text"
                      value={traiChuDharma}
                      onChange={(e) => setTraiChuDharma(e.target.value)}
                      className="mt-1 block w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-[#12100e] px-3 py-2 text-stone-900 dark:text-white sm:text-sm focus:border-amber-500 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Danh sách thụ lễ */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg font-bold">Danh sách {formType === 'CAU_AN' ? 'Phật tử cầu an' : 'Hương linh'}</h3>
                  <button
                    type="button"
                    onClick={handleAddTarget}
                    className="flex items-center gap-1 text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg transition"
                  >
                    <Plus className="h-4 w-4" /> Thêm người
                  </button>
                </div>

                <div className="space-y-4">
                  {targets.map((target, index) => (
                    <div key={index} className="grid sm:grid-cols-12 gap-4 items-start p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#12100e]">
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-semibold text-stone-500 uppercase">Họ và tên *</label>
                        <input
                          required
                          type="text"
                          value={target.full_name}
                          onChange={(e) => handleTargetChange(index, 'full_name', e.target.value)}
                          className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-1.5 text-sm outline-none focus:border-amber-500 transition"
                          placeholder="Nguyễn Văn A"
                        />
                      </div>
                      
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-semibold text-stone-500 uppercase">Pháp danh</label>
                        <input
                          type="text"
                          value={target.dharma_name || ''}
                          onChange={(e) => handleTargetChange(index, 'dharma_name', e.target.value)}
                          className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-1.5 text-sm outline-none focus:border-amber-500 transition"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] font-semibold text-stone-500 uppercase">Năm sinh</label>
                        <input
                          type="number"
                          value={target.birth_year || ''}
                          onChange={(e) => handleTargetChange(index, 'birth_year', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-1.5 text-sm outline-none focus:border-amber-500 transition"
                        />
                      </div>

                      {formType === 'CAU_SIEU' ? (
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-stone-500 uppercase">Năm mất</label>
                          <input
                            type="number"
                            value={target.death_year || ''}
                            onChange={(e) => handleTargetChange(index, 'death_year', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-1.5 text-sm outline-none focus:border-amber-500 transition"
                          />
                        </div>
                      ) : (
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-stone-500 uppercase">Quan hệ</label>
                          <input
                            type="text"
                            value={target.relation || ''}
                            onChange={(e) => handleTargetChange(index, 'relation', e.target.value)}
                            className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-1.5 text-sm outline-none focus:border-amber-500 transition"
                            placeholder="Vd: Con trai"
                          />
                        </div>
                      )}

                      <div className="sm:col-span-2 flex justify-end items-center gap-2 pt-5">
                        {index === targets.length - 1 && (
                          <button
                            type="button"
                            onClick={handleAddTarget}
                            className="inline-flex items-center gap-1 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-2.5 py-1.5 rounded-lg text-xs font-bold hover:bg-amber-200/60 transition"
                            title="Thêm dòng mới"
                          >
                            <Plus className="h-3.5 w-3.5" /> Thêm
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveTarget(index)}
                          className="text-stone-400 hover:text-red-500 transition p-2 rounded-lg hover:bg-red-50"
                          disabled={targets.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Nút cộng (+) ở hàng cuối cùng tiện lợi thêm tên mới không cần cuộn lên */}
                  <div className="pt-1 flex justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={handleAddTarget}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-600/30 text-amber-800 dark:text-amber-400 hover:bg-amber-100/50 dark:hover:bg-amber-900/40 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      {formType === 'CAU_SIEU' ? '+ Thêm hương linh tiếp theo' : '+ Thêm người cầu an tiếp theo'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Ghi chú thêm (Nếu có)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-white dark:bg-[#12100e] border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-3 outline-none focus:border-amber-500 transition min-h-[80px]"
                  placeholder="Ghi chú về việc in sớ hoặc sắp xếp ca lễ..."
                />
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2.5 text-sm font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Tạo Phiếu Sớ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
