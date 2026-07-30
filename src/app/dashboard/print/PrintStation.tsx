'use client'

import React, { useState } from 'react'
import { Printer, Calendar, Clock, FileText, CheckCircle2, ChevronRight, RefreshCw, X } from 'lucide-react'
import { markAsPrinted } from './actions'

interface TargetPerson {
  id: string
  full_name: string
  dharma_name?: string | null
  birth_year?: number | null
  death_year?: number | null
  relation?: string | null
  type: 'CAU_AN' | 'CAU_SIEU'
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
  users?: { full_name: string; phone: string } | null
  targets: TargetPerson[]
}

interface TemplateRecord {
  id: string
  name: string
  form_type: string
  file_url: string
}

interface Props {
  acceptedForms: FormRecord[]
  templates: TemplateRecord[]
}

export default function PrintStation({ acceptedForms, templates }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isPrinting, setIsPrinting] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')
  const [printMode, setPrintMode] = useState<'READING' | 'POSTER' | 'PHUNG_VI'>('READING')
  const [isDownloadingWord, setIsDownloadingWord] = useState(false)

  const selectedTemplateUrl = templates.find(t => t.id === selectedTemplateId)?.file_url

  // Toggle chọn phiếu
  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.length === acceptedForms.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(acceptedForms.map((f) => f.id))
    }
  }

  // Bắt đầu chuẩn bị in sớ
  const handlePreparePrint = () => {
    if (selectedIds.length === 0) {
      alert('Vui lòng chọn ít nhất một phiếu cúng để in.')
      return
    }
    setIsPrinting(true)
  }

  // Đánh dấu đã in sớ thành công
  const handleConfirmPrinted = async () => {
    if (confirm('Hệ thống sẽ cập nhật trạng thái các phiếu này thành [Printed] và ghi nhận vào lịch sử in. Tiếp tục?')) {
      setIsSubmitting(true)
      const res = await markAsPrinted(selectedIds)
      if (res.success) {
        alert('Đã cập nhật trạng thái sớ thành công!')
        setIsPrinting(false)
        window.location.reload()
      } else {
        alert('Lỗi: ' + res.error)
      }
      setIsSubmitting(false)
    }
  }

  const selectedForms = acceptedForms.filter((f) => selectedIds.includes(f.id))

  const handleDownloadPdf = async () => {
    if (selectedForms.length === 0) return
    setIsDownloadingWord(true)
    try {
      const { toJpeg } = await import('html-to-image')
      const { jsPDF } = await import('jspdf')
      
      const elements = document.querySelectorAll('.so-page-block')
      if (elements.length === 0) {
        alert('Không tìm thấy nội dung để in.')
        setIsDownloadingWord(false)
        return
      }

      const orientation = printMode === 'READING' ? 'portrait' : 'landscape'
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement
        // Cố định kích thước khi chụp để không bị vỡ/cắt chữ trên màn hình nhỏ
        const isLandscape = printMode !== 'READING'
        const captureWidth = isLandscape ? 1122 : 794 // 297mm or 210mm at 96dpi

        // Render element thành Jpeg với chất lượng cao và nền trắng
        const dataUrl = await toJpeg(el, { 
          quality: 0.98, 
          pixelRatio: 2, 
          backgroundColor: '#ffffff',
          style: {
            width: `${captureWidth}px`,
            maxWidth: 'none',
            margin: '0',
            transform: 'none'
          }
        })
        
        if (i > 0) pdf.addPage()
        
        // Tính toán kích thước ảnh vừa khít với trang PDF A4
        const imgProps = pdf.getImageProperties(dataUrl)
        const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height)
        
        const scaledWidth = imgProps.width * ratio
        const scaledHeight = imgProps.height * ratio
        
        // Căn giữa ảnh trên trang PDF
        const x = (pdfWidth - scaledWidth) / 2
        const y = (pdfHeight - scaledHeight) / 2
        
        pdf.addImage(dataUrl, 'JPEG', x, y, scaledWidth, scaledHeight)
      }

      pdf.save(`Danh_Sach_So_${new Date().getTime()}.pdf`)

    } catch (err: any) {
      console.error(err)
      alert('Lỗi hệ thống khi tải file pdf: ' + (err.message || err))
    } finally {
      setIsDownloadingWord(false)
    }
  }

  return (
    <div className="space-y-6">
      {!isPrinting ? (
        // Giao diện trạm in sớ (Default view)
        <>
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Trạm Chuẩn Bị In Sớ Hàng Loạt</h1>
            <p className="text-stone-500 dark:text-stone-400 mt-1">
              Danh sách các phiếu sớ đã duyệt tịnh tài tại quầy, sẵn sàng để in ra sớ giấy để chư Tăng làm lễ đọc tụng.
            </p>
          </div>

          <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-serif text-lg font-bold">Phiếu Lễ Sẵn Sàng In ({acceptedForms.length})</h3>
              <div className="flex gap-3">
                {selectedIds.length > 0 && (
                  <button
                    onClick={handlePreparePrint}
                    className="flex items-center gap-2 bg-amber-700 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-amber-800 transition text-xs"
                  >
                    <Printer className="h-4 w-4" />
                    Chuẩn bị in sớ ({selectedIds.length} phiếu)
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto border border-stone-100 dark:border-stone-800 rounded-xl">
              <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-900/40 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === acceptedForms.length && acceptedForms.length > 0}
                        onChange={handleSelectAll}
                        className="rounded text-amber-700 focus:ring-amber-500 h-4 w-4"
                      />
                    </th>
                    <th className="px-6 py-4">Mã Phiếu & Loại</th>
                    <th className="px-6 py-4">Phật Tử Đăng Ký</th>
                    <th className="px-6 py-4">Ca Cúng</th>
                    <th className="px-6 py-4">Danh Sách Người Thụ Lễ</th>
                    <th className="px-6 py-4">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {acceptedForms.map((form) => (
                    <tr key={form.id} className="hover:bg-stone-50/30 dark:hover:bg-stone-900/10">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(form.id)}
                          onChange={() => handleToggleSelect(form.id)}
                          className="rounded text-amber-700 focus:ring-amber-500 h-4 w-4"
                        />
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <span className="font-bold text-stone-900 dark:text-white">{form.form_code}</span>
                        <div>
                          <span className={`inline-block text-[8px] uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded ${form.form_type === 'CAU_AN' ? 'bg-green-50 text-green-700 border border-green-200/50 dark:bg-green-950/20' : 'bg-rose-50 text-rose-700 border border-rose-200/50 dark:bg-rose-950/20'}`}>
                            {form.form_type === 'CAU_AN' ? 'Cầu An' : 'Cầu Siêu'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-stone-850 dark:text-stone-200">{form.users?.full_name}</p>
                        <p className="text-[10px] text-stone-500">{form.users?.phone}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-stone-700 dark:text-stone-300">
                        {form.is_delegated ? 'Ủy nhiệm cho chùa' : form.selected_time_slot}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-stone-800 dark:text-stone-300">
                          {form.targets.map(t => `${t.full_name} ${t.dharma_name ? `(${t.dharma_name})` : ''}`).join(', ')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 font-bold uppercase tracking-wider text-[9px]">
                          {form.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {acceptedForms.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-stone-400 italic">
                        Không có phiếu sớ nào ở trạng thái chờ in cúng dường.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        // GIAO DIỆN IN SỚ (Full-screen Overlay & Horizontal Writing Mode)
        <div className="space-y-6 print:space-y-0">
          <div className="print:hidden bg-white dark:bg-[#1c1816] p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex justify-between items-center shadow-sm flex-wrap gap-4">
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-bold text-amber-800 dark:text-amber-500">Xem Trước Bản In Sớ</h3>
              <p className="text-xs text-stone-500">Hãy nhấn nút in trình duyệt bên cạnh. Sớ đã được định dạng chuẩn in ngang dồn phải.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Chế độ in:</label>
              <select
                value={printMode}
                onChange={(e) => setPrintMode(e.target.value as 'READING' | 'POSTER' | 'PHUNG_VI')}
                className="rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-1.5 text-sm text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 font-semibold"
              >
                <option value="READING">Mẫu Quý Thầy Đọc (A4 Dọc Chuẩn)</option>
                <option value="POSTER">Mẫu Dán Chánh Điện (Bảng Biểu)</option>
                <option value="PHUNG_VI">Mẫu Linh Vị (Phụng Vì - Tọa Vị)</option>
              </select>
            </div>

            {printMode === 'READING' && (
              <div className="flex items-center gap-3">
                <label className="text-sm font-semibold text-stone-700 dark:text-stone-300">Phôi sớ:</label>
                <select
                  value={selectedTemplateId}
                  onChange={(e) => setSelectedTemplateId(e.target.value)}
                  className="rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-1.5 text-sm text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500"
                >
                  <option value="">-- Mặc định (Không nền) --</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({t.form_type === 'CAU_AN' ? 'Cầu An' : 'Cầu Siêu'})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-700 transition text-xs"
              >
                <Printer className="h-4 w-4" />
                Mở lệnh in sớ
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={isDownloadingWord}
                className="flex items-center gap-1.5 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition text-xs"
              >
                <FileText className="h-4 w-4" />
                {isDownloadingWord ? 'Đang tải...' : 'Tải sớ PDF'}
              </button>
              <button
                onClick={handleConfirmPrinted}
                disabled={isSubmitting}
                className="flex items-center gap-1.5 bg-amber-700 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-amber-800 transition text-xs"
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Đánh dấu ĐÃ IN thành công'}
              </button>
              <button
                onClick={() => setIsPrinting(false)}
                className="flex items-center gap-1.5 bg-transparent border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 px-4 py-2 rounded-lg hover:bg-stone-50 transition text-xs"
              >
                <X className="h-4 w-4" />
                Đóng bản in
              </button>
            </div>
          </div>

          {/* Vùng in ấn sớ */}
          <div className="so-print-layout print:m-0 print:p-0">
            {printMode === 'POSTER' || printMode === 'PHUNG_VI' ? (() => {
              // Gom TẤT CẢ các cột từ tất cả các sớ được chọn (selectedForms) để xếp kề bên nhau trên cùng trang
              const MAX_LINES_PER_COL = 13
              const MAX_COLS_PER_PAGE = 4

              const allColumns: { shortCode: string; names: string[] }[] = []

              selectedForms.forEach((form) => {
                const shortCode = form.form_code.slice(-3)
                const actualTargets = form.targets.filter(t => t.relation !== 'TRAI_CHU')

                let currentCol: string[] = []
                let currentLines = 0

                actualTargets.forEach((t) => {
                  const name = t.full_name.trim()
                  const wordCount = name.split(/\s+/).length
                  const linesNeeded = wordCount < 5 ? 1 : 2

                  if (currentLines + linesNeeded > MAX_LINES_PER_COL && currentCol.length > 0) {
                    allColumns.push({ shortCode, names: currentCol })
                    currentCol = []
                    currentLines = 0
                  }

                  currentCol.push(name)
                  currentLines += linesNeeded
                })
                if (currentCol.length > 0) {
                  allColumns.push({ shortCode, names: currentCol })
                }
              })

              // Nhóm các cột thành các trang A4 Ngang (mỗi trang tối đa 4 cột kế bên nhau)
              const pages: { shortCode: string; names: string[] }[][] = []
              for (let i = 0; i < allColumns.length; i += MAX_COLS_PER_PAGE) {
                pages.push(allColumns.slice(i, i + MAX_COLS_PER_PAGE))
              }

              return pages.map((pageCols, pageIdx) => (
                <div
                  key={`poster-page-${pageIdx}`}
                  className="so-page-block bg-white text-black p-8 print:p-4 w-full print:w-[277mm] print:max-w-[277mm] print:h-[190mm] print:max-h-[190mm] print:border-none print:shadow-none print:m-0 break-after-page flex justify-center min-h-[50vh] print:min-h-0 overflow-hidden"
                  style={{ pageBreakAfter: 'always', page: 'so-page' as any }}
                >
                  {pageCols.map((col, colIdx) => (
                    <div
                      key={colIdx}
                      className={`flex flex-col items-center justify-between flex-1 max-w-[265px] px-5 py-6 relative border-t-2 border-b-2 border-l-2 border-dashed border-stone-400 print:border-stone-500 ${
                        colIdx === pageCols.length - 1 ? 'border-r-2' : ''
                      }`}
                    >
                      {/* Biểu tượng cái kéo canh cắt ở các góc đường nét đứt */}
                      <span className="absolute -top-3.5 -left-2.5 text-xs text-stone-500 print:text-stone-600 select-none">
                        ✂
                      </span>
                      <span className="absolute -bottom-3.5 -left-2.5 text-xs text-stone-500 print:text-stone-600 select-none rotate-180">
                        ✂
                      </span>
                      {colIdx === pageCols.length - 1 && (
                        <>
                          <span className="absolute -top-3.5 -right-2.5 text-xs text-stone-500 print:text-stone-600 select-none">
                            ✂
                          </span>
                          <span className="absolute -bottom-3.5 -right-2.5 text-xs text-stone-500 print:text-stone-600 select-none rotate-180">
                            ✂
                          </span>
                        </>
                      )}

                      {printMode === 'PHUNG_VI' ? (
                        <>
                          {/* Đỉnh bài vị: PHỤNG VÌ */}
                          <div className="flex flex-col items-center mb-6 text-center w-full">
                            <div className="text-[11px] font-serif italic text-stone-500 mb-1">
                              Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật
                            </div>
                            <div className="text-3xl font-serif font-bold text-amber-950 uppercase tracking-widest border-b-2 border-amber-900/40 pb-2 w-full">
                              PHỤNG VÌ
                            </div>
                          </div>

                          {/* Ở giữa: Tên các hương linh */}
                          <div className="flex-1 flex flex-col justify-center gap-4 my-auto w-full py-2">
                            {col.names.map((name, nIdx) => (
                              <div
                                key={nIdx}
                                className="text-xl font-serif font-bold text-center text-stone-900 uppercase leading-snug"
                              >
                                {name}
                              </div>
                            ))}
                          </div>

                          {/* Cuối trang/cột: TỌA VỊ */}
                          <div className="mt-auto pt-4 border-t-2 border-amber-900/40 w-full text-center">
                            <div className="text-2xl font-serif font-bold text-amber-950 uppercase tracking-widest">
                              TỌA VỊ
                            </div>
                            <span className="text-[10px] italic text-stone-500 mt-1 block">
                              Chùa Báo Ân • Linh Vị
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          {/* Chế độ Dán Chánh Điện POSTER */}
                          <div className="text-[64px] font-bold leading-none mb-6 text-black text-center tracking-tight">
                            {col.shortCode}
                          </div>
                          <div className="flex flex-col gap-3 w-full my-auto">
                            {col.names.map((name, nIdx) => (
                              <div key={nIdx} className="text-xl font-bold text-center text-black uppercase leading-tight">
                                {name}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))
            })() : selectedForms.map((form, idx) => {
              const traiChuTarget = form.targets.find(t => t.relation === 'TRAI_CHU')
              const traiChuName = traiChuTarget ? traiChuTarget.full_name : form.users?.full_name
              const traiChuDharma = traiChuTarget?.dharma_name
              const actualTargets = form.targets.filter(t => t.relation !== 'TRAI_CHU')

              return (
                <div key={form.id}>
                  {idx > 0 && <hr className="my-12 border-t-[3px] border-dashed border-stone-300 dark:border-stone-700 print:hidden w-full max-w-[210mm] mx-auto" />}
                  <div
                    className="so-page-block bg-white text-stone-900 p-8 print:p-0 w-full max-w-[210mm] print:w-[180mm] print:max-w-[180mm] mx-auto break-after-page"
                    style={{ pageBreakAfter: 'always', page: 'so-portrait-page' as any }}
                  >
                  {/* Khung Sớ A4 Dọc Chuẩn gom vừa khít 1 trang A4 */}
                  <div
                    className="relative w-full h-[270mm] max-h-[270mm] print:h-[273mm] print:max-h-[273mm] print:w-full overflow-hidden border-2 border-amber-900/40 print:border-amber-900/60 rounded-xl p-8 print:p-6 bg-[#fdfbf7] flex flex-col justify-between shadow-sm print:shadow-none"
                    style={{
                      backgroundImage: selectedTemplateUrl ? `url(${selectedTemplateUrl})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {/* Phần trên sớ: Header & Thông tin Trai Chủ */}
                    <div className="space-y-4 overflow-hidden">
                      {/* Header sớ */}
                      <div className="flex items-start justify-between border-b-2 border-amber-900/30 pb-5">
                        {/* Ấn đỏ chùa */}
                        <div className="border-4 border-double border-red-700 text-red-700 font-serif font-bold px-3 py-2 text-xs rounded uppercase tracking-wider text-center leading-snug select-none">
                          Báo Ân Cổ Tự <br /> Pháp Ấn
                        </div>

                        {/* Tiêu đề chính */}
                        <div className="text-center flex-1 px-4">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500 mb-1">
                            Phật Giáo Việt Nam • Bổn Tự Chùa Báo Ân
                          </p>
                          <h2 className="font-serif text-2xl md:text-3xl font-bold text-amber-950 tracking-wide uppercase">
                            {form.form_type === 'CAU_AN' ? (
                              'Sớ Phục Nguyện Cầu An'
                            ) : (
                              <>Sớ Phục Nguyện<br />Cầu Siêu</>
                            )}
                          </h2>
                          <p className="font-serif italic text-sm text-amber-800 mt-1">
                            {form.form_type === 'CAU_AN'
                              ? 'Nam Mô Tiêu Tai Diên Thọ Dược Sư Lưu Ly Quang Vương Phật'
                              : 'Nam Mô Tiếp Dẫn Đạo Sư A Di Đà Phật'}
                          </p>
                        </div>

                        {/* Mã sớ & Ca lễ */}
                        <div className="text-right text-xs text-stone-700 font-medium space-y-1">
                          <div className="inline-block bg-amber-900/10 text-amber-950 font-bold px-2.5 py-1 rounded">
                            Mã: {form.form_code}
                          </div>
                          <div>Ngày: {form.scheduled_date || 'Hôm nay'}</div>
                          <div>Giờ: {form.is_delegated ? 'Chùa xếp' : form.selected_time_slot}</div>
                        </div>
                      </div>

                      {/* Khung Thông tin Gia Chủ / Trai Chủ */}
                      <div className="bg-amber-900/5 border border-amber-900/20 rounded-lg p-4 space-y-1.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-serif font-bold text-base text-amber-950">
                            Trai Chủ: <span className="text-amber-900">{traiChuName}</span>
                            {traiChuDharma ? ` (Pháp danh: ${traiChuDharma})` : ''}
                          </span>
                          <span className="text-xs text-stone-600">
                            {form.users?.phone || ''}
                          </span>
                        </div>
                        {form.note && (
                          <p className="text-xs text-stone-700 italic">
                            Lời khấn / Ghi chú: &ldquo;{form.note}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Danh Sách Khấn Nguyện */}
                      <div>
                        <h3 className="font-serif font-bold text-sm uppercase tracking-wider text-amber-900 border-b border-amber-900/20 pb-2 mb-3">
                          {form.form_type === 'CAU_AN'
                            ? 'Danh Sách Hương Linh & Phật Tử Cầu An Tiêu Tai'
                            : 'Danh Sách Chư Hương Linh Phục Nguyện Siêu Độ'}
                        </h3>

                        {actualTargets.length === 0 ? (
                          <p className="text-sm italic text-stone-500 py-4 text-center">
                            (Gia chủ cúng dường chung cho gia quyến)
                          </p>
                        ) : (() => {
                          // Điền đầy tối đa 15 tên mỗi cột rồi mới chuyển sang cột tiếp theo
                          const MAX_PER_COL = 15
                          const isCauSieu = form.form_type !== 'CAU_AN'

                          const cols: TargetPerson[][] = []
                          for (let i = 0; i < actualTargets.length; i += MAX_PER_COL) {
                            cols.push(actualTargets.slice(i, i + MAX_PER_COL))
                          }

                          return (
                            <div
                              className={`grid gap-x-4 gap-y-1 ${
                                cols.length === 1
                                  ? 'grid-cols-1'
                                  : cols.length === 2
                                  ? 'grid-cols-2'
                                  : cols.length === 3
                                  ? 'grid-cols-3'
                                  : 'grid-cols-4'
                              }`}
                            >
                              {cols.map((colItems, colIdx) => {
                                const startNumber = colIdx * MAX_PER_COL + 1
                                return (
                                  <div key={colIdx} className="space-y-1">
                                    {colItems.map((t, idx) => {
                                      const globalNum = startNumber + idx
                                      return (
                                        <div
                                          key={idx}
                                          className="flex items-baseline justify-between border-b border-stone-200/70 py-1 text-xs"
                                        >
                                          <div className="truncate">
                                            <span className="font-semibold text-stone-900">
                                              {globalNum}. {t.full_name}
                                            </span>
                                            {t.dharma_name && (
                                              <span className="text-amber-800 ml-1 font-medium">
                                                (PD: {t.dharma_name})
                                              </span>
                                            )}
                                          </div>
                                          {!isCauSieu && (
                                            <div className="text-[11px] text-stone-600 shrink-0 ml-1">
                                              {t.birth_year ? `SN: ${t.birth_year} ` : ''}
                                              {t.relation ? `• ${t.relation}` : ''}
                                            </div>
                                          )}
                                        </div>
                                      )
                                    })}
                                  </div>
                                )
                              })}
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Lời nguyện & Chữ ký phía dưới sớ gọn gàng trong 1 trang A4 */}
                    <div className="mt-3 pt-3 border-t border-amber-900/20 space-y-2 shrink-0">
                      <p className="font-serif italic text-center text-xs text-stone-700 leading-normal px-4">
                        {form.form_type === 'CAU_AN'
                          ? 'Đệ tử chúng đẳng thành tâm khấu bái, nguyện cầu Tam Bảo chứng minh, gia quyến khang ninh khương thái cát tường, sở cầu như ý, sở nguyện tòng tâm.'
                          : 'Đệ tử chúng đẳng thành tâm khấu bái, nguyện cầu Tiếp Dẫn Đạo Sư A Di Đà Phật phóng quang tiếp độ chư hương linh trút bỏ trần duyên, siêu sinh tịnh độ.'}
                      </p>

                      <div className="flex justify-between items-end text-center text-xs text-stone-600 pt-1">
                        <div>
                          <p className="font-semibold text-stone-800">Trai Chủ Khấn Nguyện</p>
                          <p className="mt-4 italic">(Đã đăng ký trực tuyến)</p>
                        </div>
                        <div>
                          <p className="font-serif font-bold text-stone-900 text-sm">Chùa Báo Ân • Bổn Tự Khâm Nguyện</p>
                          <p className="mt-4 font-semibold text-amber-900">Khám Ấn Duyệt Sớ</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          </div>
        </div>
      )}
    </div>
  )
}
