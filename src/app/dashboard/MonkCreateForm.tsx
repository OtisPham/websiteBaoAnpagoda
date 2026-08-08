'use client'

import { useState } from 'react'
import { Plus, X, Trash2, CheckCircle, FileText } from 'lucide-react'
import { createForm, TargetPersonInput } from '../phat-tu/actions'

const LUNAR_DAYS = Array.from({ length: 30 }, (_, i) => (i + 1).toString())
const LUNAR_MONTHS = Array.from({ length: 12 }, (_, i) => (i + 1).toString())

interface MonkCreateFormProps {
  events: any[]
}

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 150 }, (_, i) => currentYear - i)

export default function MonkCreateForm({ events }: MonkCreateFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [formType, setFormType] = useState<'CAU_AN' | 'CAU_SIEU'>('CAU_AN')
  const [eventId, setEventId] = useState('')
  const [isDelegated, setIsDelegated] = useState(false)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
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
  const [submitAction, setSubmitAction] = useState<'SAVE_AND_CLOSE' | 'SAVE_AND_CONTINUE'>('SAVE_AND_CLOSE')

  const selectedEvent = events.find((e) => e.id === eventId)

  const handleAddTarget = () => {
    setTargets([...targets, { full_name: '', dharma_name: '', birth_year: undefined, death_year: undefined, relation: '' }])
    setTimeout(() => {
      const modal = document.getElementById('monk-form-modal-content')
      if (modal) {
        modal.scrollTo({ top: modal.scrollHeight, behavior: 'smooth' })
      }
      const nextIndex = targets.length
      const inputEl = document.getElementById(`monk-target-input-${nextIndex}`)
      if (inputEl) inputEl.focus()
    }, 50)
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

  const downloadTemplate = async () => {
    try {
      const { utils, writeFile } = await import('xlsx');
      const ws = utils.aoa_to_sheet([
        ['Họ và Tên', 'Pháp Danh', 'Năm Sinh', 'Năm Mất', 'Mối Quan Hệ'],
        ['Nguyễn Văn A', 'Tự Phúc Hạnh', 1980, '', 'Cha']
      ]);
      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, 'Mau_Nhap_So');
      writeFile(wb, 'Mau_Nhap_So.xlsx');
    } catch (err) {
      console.error(err);
      alert('Không thể tải file mẫu. Vui lòng thử lại sau.');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { read, utils } = await import('xlsx');
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target?.result;
        const wb = read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        // Skip header row
        const rows = jsonData.slice(1).filter(row => row.length > 0 && row[0]);
        
        const newTargets = rows.map(row => ({
          full_name: row[0] || '',
          dharma_name: row[1] || '',
          birth_year: row[2] ? parseInt(row[2]) : undefined,
          death_year: row[3] ? parseInt(row[3]) : undefined,
          relation: row[4] || ''
        }));

        if (newTargets.length > 0) {
          setTargets(prev => {
            const filteredPrev = prev.filter(t => t.full_name.trim() !== '');
            return [...filteredPrev, ...newTargets];
          });
          alert(`Đã nhập thành công ${newTargets.length} tên từ file Excel!`);
        } else {
          alert('Không tìm thấy dữ liệu hợp lệ trong file Excel.');
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      console.error(err);
      alert('Có lỗi xảy ra khi đọc file Excel.');
    }
    // reset input
    e.target.value = '';
  };

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
    if (eventId) {
      formData.append('scheduledDate', scheduledDate || (selectedEvent?.scheduled_date || new Date().toISOString().split('T')[0]))
    } else {
      let finalDate = scheduledDate
      if (formType === 'CAU_SIEU') {
        if (!scheduledDate || !scheduledDate.startsWith('Ngày')) {
           finalDate = 'Ngày 15 Tháng 7'
        }
      }
      formData.append('scheduledDate', finalDate || new Date().toISOString().split('T')[0])
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
        
        if (submitAction === 'SAVE_AND_CONTINUE') {
          setTimeout(() => {
            setSuccess('')
            setTargets([{ full_name: '', dharma_name: '', birth_year: undefined, death_year: undefined, relation: '' }])
            setFormCode('')
            setTraiChuName('')
            setTraiChuDharma('')
            setNote('')
            
            // Scroll lên đầu và focus vào tên trai chủ
            const modal = document.getElementById('monk-form-modal-content')
            if (modal) modal.scrollTo({ top: 0, behavior: 'smooth' })
            
            const traiChuInput = document.getElementById('trai-chu-input')
            if (traiChuInput) {
              traiChuInput.focus()
            } else {
              document.getElementById('monk-target-input-0')?.focus()
            }
          }, 1200) // Thời gian ngắn hơn để làm việc nhanh hơn
        } else {
          setTimeout(() => {
            setIsOpen(false)
            setSuccess('')
            setTargets([{ full_name: '', dharma_name: '', birth_year: undefined, death_year: undefined, relation: '' }])
            setFormCode('')
            setTraiChuName('')
            setTraiChuDharma('')
            setNote('')
          }, 2000)
        }
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
          <div id="monk-form-modal-content" className="bg-white dark:bg-[#1c1816] w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-stone-200/80 dark:border-stone-800/80 p-6 sm:p-8">
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
                    onChange={(e) => {
                      const newType = e.target.value as 'CAU_AN' | 'CAU_SIEU'
                      setFormType(newType)
                      if (newType === 'CAU_SIEU' && (!scheduledDate || !scheduledDate.startsWith('Ngày'))) {
                        setScheduledDate('Ngày 15 Tháng 7')
                      } else if (newType === 'CAU_AN' && scheduledDate.startsWith('Ngày')) {
                        setScheduledDate(new Date().toISOString().split('T')[0])
                      }
                    }}
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
                    onChange={(e) => {
                      setEventId(e.target.value)
                      const evt = events.find(ev => ev.id === e.target.value)
                      if (evt) {
                        if (formType === 'CAU_SIEU') {
                          if (!scheduledDate || !scheduledDate.startsWith('Ngày')) setScheduledDate('Ngày 15 Tháng 7')
                        } else {
                          setScheduledDate(evt.scheduled_date)
                        }
                      } else {
                        setScheduledDate(formType === 'CAU_SIEU' ? 'Ngày 15 Tháng 7' : '')
                      }
                    }}
                    className="w-full bg-white dark:bg-[#12100e] border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition"
                  >
                    <option value="">-- Chọn sự kiện {formType === 'CAU_SIEU' && '(Tùy chọn)'} --</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.title}</option>
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
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-500 uppercase mb-1">Ngày làm lễ</label>
                          {formType === 'CAU_SIEU' ? (
                            <div className="flex gap-2">
                              <select
                                value={scheduledDate && scheduledDate.startsWith('Ngày') ? scheduledDate.split('Ngày ')[1]?.split(' ')[0] : '15'}
                                onChange={(e) => setScheduledDate(`Ngày ${e.target.value} Tháng ${scheduledDate && scheduledDate.startsWith('Ngày') ? scheduledDate.split('Tháng ')[1] : '7'}`)}
                                required={!isDelegated}
                                className="w-1/2 bg-white dark:bg-[#12100e] border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition"
                              >
                                <option value="" disabled>Ngày</option>
                                {LUNAR_DAYS.map(d => <option key={d} value={d} className="bg-white dark:bg-[#1c1816]">Ngày {d}</option>)}
                              </select>
                              <select
                                value={scheduledDate && scheduledDate.startsWith('Ngày') ? scheduledDate.split('Tháng ')[1] : '7'}
                                onChange={(e) => setScheduledDate(`Ngày ${scheduledDate && scheduledDate.startsWith('Ngày') ? scheduledDate.split('Ngày ')[1]?.split(' ')[0] : '15'} Tháng ${e.target.value}`)}
                                required={!isDelegated}
                                className="w-1/2 bg-white dark:bg-[#12100e] border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition"
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
                              className="w-full bg-white dark:bg-[#12100e] border border-stone-200 dark:border-stone-800 rounded-xl px-4 py-2.5 outline-none focus:border-amber-500 transition"
                            />
                          )}
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-stone-500 uppercase mb-1">Ca cúng</label>
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
                        </div>
                      </div>
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
                      id="trai-chu-input"
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
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <h3 className="font-serif text-lg font-bold">Danh sách {formType === 'CAU_AN' ? 'Phật tử cầu an' : 'Hương linh'}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={downloadTemplate}
                      className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 px-3 py-1.5 rounded-lg transition border border-emerald-200 dark:border-emerald-800"
                    >
                      <FileText className="h-3.5 w-3.5" /> Tải file mẫu
                    </button>
                    
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-400 px-3 py-1.5 rounded-lg transition border border-blue-200 dark:border-blue-800 cursor-pointer">
                      <Plus className="h-3.5 w-3.5" /> Nhập từ Excel
                      <input 
                        type="file" 
                        accept=".xlsx, .xls" 
                        className="hidden" 
                        onChange={handleFileUpload} 
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleAddTarget}
                      className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg transition"
                    >
                      <Plus className="h-3.5 w-3.5" /> Thêm 1 người
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {targets.map((target, index) => (
                    <div key={index} className="grid sm:grid-cols-12 gap-4 items-start p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#12100e]">
                      <div className="sm:col-span-3 space-y-1">
                        <label className="text-[11px] font-semibold text-stone-500 uppercase">Họ và tên *</label>
                        <input
                          id={`monk-target-input-${index}`}
                          required
                          type="text"
                          value={target.full_name}
                          onChange={(e) => handleTargetChange(index, 'full_name', e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (index === targets.length - 1) handleAddTarget()
                            }
                          }}
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
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              if (index === targets.length - 1) handleAddTarget()
                            }
                          }}
                          className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-1.5 text-sm outline-none focus:border-amber-500 transition"
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[11px] font-semibold text-stone-500 uppercase">Năm sinh</label>
                        <select
                          value={target.birth_year || ''}
                          onChange={(e) => handleTargetChange(index, 'birth_year', e.target.value ? parseInt(e.target.value) : undefined)}
                          className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-1.5 text-sm outline-none focus:border-amber-500 transition"
                        >
                          <option value="">-- Chọn năm --</option>
                          {YEAR_OPTIONS.map(year => (
                            <option key={`birth-${year}`} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>

                      {formType === 'CAU_SIEU' ? (
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-stone-500 uppercase">Năm mất</label>
                          <select
                            value={target.death_year || ''}
                            onChange={(e) => handleTargetChange(index, 'death_year', e.target.value ? parseInt(e.target.value) : undefined)}
                            className="w-full bg-transparent border-b border-stone-200 dark:border-stone-800 py-1.5 text-sm outline-none focus:border-amber-500 transition"
                          >
                            <option value="">-- Chọn năm --</option>
                            {YEAR_OPTIONS.map(year => (
                              <option key={`death-${year}`} value={year}>{year}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="sm:col-span-2 space-y-1">
                          <label className="text-[11px] font-semibold text-stone-500 uppercase">Quan hệ</label>
                          <input
                            type="text"
                            value={target.relation || ''}
                            onChange={(e) => handleTargetChange(index, 'relation', e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                if (index === targets.length - 1) handleAddTarget()
                              }
                            }}
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
                  onClick={() => setSubmitAction('SAVE_AND_CLOSE')}
                  className="px-6 py-2.5 text-sm font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Lưu & Đóng
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  onClick={() => setSubmitAction('SAVE_AND_CONTINUE')}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded-xl transition shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang xử lý...' : 'Lưu & Nhập tiếp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
