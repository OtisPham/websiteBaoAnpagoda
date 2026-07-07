'use client'

import { useState } from 'react'
import { FileText, Plus, Trash2, Image as ImageIcon, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { createTemplate, toggleTemplateStatus, deleteTemplate } from './actions'

interface TemplateRecord {
  id: string
  name: string
  form_type: string
  file_url: string
  is_active: boolean
  created_at: string
}

interface Props {
  templates: TemplateRecord[]
}

export default function AdminTemplates({ templates }: Props) {
  const supabase = createClient()
  const [isUploading, setIsUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  
  // Form State
  const [name, setName] = useState('')
  const [formType, setFormType] = useState('CAU_AN')
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0]
      if (selectedFile.type.startsWith('image/')) {
        setFile(selectedFile)
      } else {
        alert('Vui lòng chọn file hình ảnh (.jpg, .png)')
      }
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !file) {
      setErrorMsg('Vui lòng nhập tên và chọn file ảnh phôi sớ.')
      return
    }

    setIsUploading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      // 1. Upload to Supabase Storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
      const filePath = `${formType.toLowerCase()}/${fileName}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('print_templates')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('print_templates')
        .getPublicUrl(filePath)

      // 3. Save to database via Server Action
      const res = await createTemplate(name, formType, publicUrl)

      if (res.success) {
        setSuccessMsg('Đã tải lên phôi sớ thành công!')
        setName('')
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        throw new Error(res.error)
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi khi upload file.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await toggleTemplateStatus(id, !currentStatus)
    if (!res.success) alert(res.error)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa phôi này khỏi hệ thống? (Các phiếu đã in sẽ không bị ảnh hưởng)')) {
      const res = await deleteTemplate(id)
      if (!res.success) alert(res.error)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Quản Lý Phôi Sớ Động</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1">
          Tải lên các mẫu phôi sớ mới để chư Tăng Ni có thể sử dụng khi in ấn.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {/* Form Upload */}
        <div className="md:col-span-1 bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm">
          <h3 className="font-serif text-lg font-bold mb-4">Tải lên phôi mới</h3>
          
          {errorMsg && <p className="text-red-500 text-sm mb-4 font-semibold">{errorMsg}</p>}
          {successMsg && (
            <p className="text-green-600 text-sm mb-4 font-semibold flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" /> {successMsg}
            </p>
          )}

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">Tên mẫu sớ</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Sớ Cầu An Vu Lan 2026"
                className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">Áp dụng cho loại sớ</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-sm focus:border-amber-500 focus:ring-amber-500"
              >
                <option value="CAU_AN" className="bg-white dark:bg-[#1c1816]">Cầu An</option>
                <option value="CAU_SIEU" className="bg-white dark:bg-[#1c1816]">Cầu Siêu</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 dark:text-stone-300">File ảnh phôi (JPG/PNG)</label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                required
                onChange={handleFileChange}
                className="mt-1 block w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
              />
            </div>

            <button
              type="submit"
              disabled={isUploading}
              className="w-full flex justify-center items-center gap-2 bg-amber-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-amber-800 transition disabled:opacity-70"
            >
              <Plus className="h-4 w-4" />
              {isUploading ? 'Đang tải lên...' : 'Thêm phôi sớ'}
            </button>
          </form>
        </div>

        {/* Danh sách phôi */}
        <div className="md:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.length === 0 && (
              <div className="sm:col-span-2 p-8 text-center bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-850 text-stone-500 italic">
                Chưa có phôi sớ nào trong hệ thống.
              </div>
            )}
            {templates.map((template) => (
              <div key={template.id} className="bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-850 overflow-hidden shadow-sm flex flex-col">
                <div 
                  className="h-40 w-full bg-stone-100 bg-cover bg-center border-b border-stone-200 dark:border-stone-850"
                  style={{ backgroundImage: `url(${template.file_url})` }}
                />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-stone-900 dark:text-stone-100 leading-tight">{template.name}</h4>
                      <span className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded shrink-0 ${template.form_type === 'CAU_AN' ? 'bg-green-50 text-green-700 border border-green-200/50' : 'bg-rose-50 text-rose-700 border border-rose-200/50'}`}>
                        {template.form_type === 'CAU_AN' ? 'Cầu An' : 'Cầu Siêu'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800">
                    <button
                      onClick={() => handleToggle(template.id, template.is_active)}
                      className={`flex items-center gap-1.5 text-xs font-semibold ${template.is_active ? 'text-green-600' : 'text-stone-400'}`}
                    >
                      {template.is_active ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                      {template.is_active ? 'Đang bật' : 'Đã tắt'}
                    </button>

                    <button
                      onClick={() => handleDelete(template.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded hover:bg-red-50 transition"
                      title="Xóa phôi"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
