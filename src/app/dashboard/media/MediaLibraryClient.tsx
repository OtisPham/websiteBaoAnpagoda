'use client'

import { useState } from 'react'
import { 
  Image as ImageIcon, Folder, Copy, Trash2, CheckCircle2, 
  Upload, Search, Filter, ExternalLink, RefreshCw, X, Plus
} from 'lucide-react'
import { MediaItem, createMediaItem, deleteMediaItem } from './actions'
import { createClient } from '@/utils/supabase/client'

interface Props {
  initialItems: MediaItem[]
  userRole: string
}

export default function MediaLibraryClient({ initialItems, userRole }: Props) {
  const [items, setItems] = useState<MediaItem[]>(initialItems)
  const [activeFolder, setActiveFolder] = useState<string>('ALL')
  const [searchTerm, setSearchTerm] = useState('')

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadUrl, setUploadUrl] = useState('')
  const [uploadName, setUploadName] = useState('')
  const [uploadFolder, setUploadFolder] = useState('Phôi Sớ')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  
  const [isUploading, setIsUploading] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const folders = ['ALL', 'Phôi Sớ', 'Đại Lễ', 'Bài Viết', 'Bổn Tự', 'Chung']

  const filteredItems = items.filter((item) => {
    const matchesFolder = activeFolder === 'ALL' || item.folder === activeFolder
    const matchesSearch = 
      (item.file_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.folder || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.tag || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFolder && matchesSearch
  })

  // Copy Image Link
  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Handle File Upload to Supabase Storage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      if (!uploadName) {
        setUploadName(file.name)
      }
    }
  }

  // Submit Upload Form
  const handleSubmitMedia = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setFeedback(null)

    try {
      let finalUrl = uploadUrl.trim()

      if (selectedFile) {
        const supabase = createClient()
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`
        const filePath = `media/${fileName}`

        const { data, error } = await supabase.storage
          .from('temple_assets')
          .upload(filePath, selectedFile)

        if (error) {
          throw new Error('Upload ảnh lên storage thất bại: ' + error.message)
        }

        const { data: publicData } = supabase.storage
          .from('temple_assets')
          .getPublicUrl(filePath)

        finalUrl = publicData.publicUrl
      }

      if (!finalUrl) {
        throw new Error('Vui lòng nhập link ảnh hoặc chọn file tải lên.')
      }

      const res = await createMediaItem(
        finalUrl,
        uploadName || 'Ảnh media',
        uploadFolder
      )

      if (res.success && res.item) {
        setItems([res.item, ...items])
        setFeedback({ type: 'success', message: 'Tải ảnh lên thư viện thành công!' })
        setIsUploadOpen(false)
        setUploadUrl('')
        setUploadName('')
        setSelectedFile(null)
      } else {
        throw new Error(res.error || 'Có lỗi xảy ra khi lưu media')
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Lỗi xử lý' })
    } finally {
      setIsUploading(false)
    }
  }

  // Delete Media Item
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa hình ảnh này khỏi thư viện?')) return

    const res = await deleteMediaItem(id)
    if (res.success) {
      setItems(items.filter(i => i.id !== id))
      setFeedback({ type: 'success', message: 'Đã xóa ảnh khỏi thư viện.' })
    } else {
      setFeedback({ type: 'error', message: res.error || 'Xóa thất bại' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-3">
            <ImageIcon className="h-8 w-8 text-[#8B4513] dark:text-amber-400" />
            Thư Viện Media & Phôi Mẫu
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            Lưu trữ hình ảnh bổn tự, phôi sớ nền, ảnh sự kiện đại lễ và minh họa bài viết phật sự.
          </p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-2 bg-[#8B4513] hover:bg-[#72380f] text-white font-semibold px-4 py-2.5 rounded-xl shadow-md transition text-sm"
        >
          <Plus className="h-4 w-4" />
          Tải Ảnh Mới Lên
        </button>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-[#1c1816] p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo tên file hoặc tag..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
          />
        </div>

        {/* Folder Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Folder className="h-4 w-4 text-stone-400 flex-shrink-0 hidden md:block" />
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeFolder === f
                  ? 'bg-[#8B4513] text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {f === 'ALL' ? 'Tất cả thư mục' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Media */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="group relative bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition"
          >
            {/* Image Preview */}
            <div className="relative aspect-square w-full bg-stone-100 dark:bg-stone-900 overflow-hidden">
              <img
                src={item.file_url}
                alt={item.file_name || 'Media'}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  // Fallback
                  ;(e.target as any).src = 'https://placehold.co/400x400/8B4513/FFF?text=Pagoda+Media'
                }}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => handleCopyLink(item.file_url, item.id)}
                  className="p-2 rounded-xl bg-white/90 text-stone-800 hover:bg-white text-xs font-bold flex items-center gap-1 shadow"
                  title="Sao chép link ảnh"
                >
                  {copiedId === item.id ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
                <a
                  href={item.file_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-white/90 text-stone-800 hover:bg-white text-xs shadow"
                  title="Mở tab mới"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                {userRole !== 'VOLUNTEER' && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs shadow"
                    title="Xóa ảnh"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Content info */}
            <div className="p-3">
              <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate" title={item.file_name || 'Media'}>
                {item.file_name || 'HÌNH ĐẠO PHONG'}
              </p>
              <div className="flex items-center justify-between mt-1 text-[10px] text-stone-400">
                <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded-full font-medium text-stone-600 dark:text-stone-300">
                  {item.folder || 'Chung'}
                </span>
                <span>{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200/80 dark:border-stone-800 p-12 text-center text-stone-400 space-y-3">
          <ImageIcon className="h-12 w-12 mx-auto text-stone-300" />
          <p className="font-serif text-lg text-stone-600 dark:text-stone-300">Chưa có hình ảnh nào trong thư mục này</p>
          <p className="text-xs">Nhấn "Tải Ảnh Mới Lên" ở góc trên để bổ sung phôi sớ hoặc hình ảnh bài viết.</p>
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1816] rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 dark:border-stone-800 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif text-lg font-bold">Tải Ảnh Mới Lên Thư Viện</h3>
              <button onClick={() => setIsUploadOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitMedia} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Chọn file từ máy tính
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#8B4513]/10 file:text-[#8B4513] hover:file:bg-[#8B4513]/20"
                />
              </div>

              <div className="text-center text-xs text-stone-400 font-bold uppercase tracking-widest my-1">
                Hoặc nhập link trực tiếp (URL)
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Link ảnh (URL)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={uploadUrl}
                  onChange={(e) => setUploadUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Tên file / Mô tả ngắn
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phôi sớ Cầu An A4 chuẩn"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Phân loại Thư Mục
                </label>
                <select
                  value={uploadFolder}
                  onChange={(e) => setUploadFolder(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                >
                  <option value="Phôi Sớ">Phôi Sớ (Templates)</option>
                  <option value="Đại Lễ">Đại Lễ & Ca Cúng</option>
                  <option value="Bài Viết">Bài Viết & Tin Tức</option>
                  <option value="Bổn Tự">Hình Ảnh Bổn Tự</option>
                  <option value="Chung">Chung</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B4513] text-white hover:bg-[#72380f] flex items-center gap-2"
                >
                  {isUploading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  Tải lên ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
