'use client'

import React, { useState, useRef } from 'react'
import {
  FileText, Plus, Edit3, Trash2, CheckCircle2, XCircle, Clock,
  AlertCircle, Upload, Image as ImageIcon, Bold, Italic, Underline,
  Heading2, Heading3, List, ListOrdered, Quote, Eye, Filter,
  Send, Save, Check, X, ShieldCheck, User, Sparkles
} from 'lucide-react'
import PizZip from 'pizzip'
import { PostData, PostStatus, savePost, reviewPost, deletePost } from './actions'

interface PostsDashboardClientProps {
  initialPosts: PostData[]
  currentUserId: string
  currentUserRole: string
  authorFullName: string
}

const CATEGORIES = [
  'PHẬT PHÁP',
  'THÔNG BÁO',
  'SỰ KIỆN',
  'TỪ THIỆN',
  'HOẠT ĐỘNG CHÙA'
]

export default function PostsDashboardClient({
  initialPosts,
  currentUserId,
  currentUserRole,
  authorFullName
}: PostsDashboardClientProps) {
  const [posts, setPosts] = useState<PostData[]>(initialPosts)
  const [activeTab, setActiveTab] = useState<'LIST' | 'EDITOR'>('LIST')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')

  const isMonk = ['MONK', 'ADMIN', 'MASTER'].includes(currentUserRole)
  const isVolunteer = currentUserRole === 'VOLUNTEER'

  // Editor State
  const [editingPostId, setEditingPostId] = useState<string | undefined>(undefined)
  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [authorName, setAuthorName] = useState<string>(authorFullName)
  const [currentStatus, setCurrentStatus] = useState<PostStatus>('DRAFT')
  const [rejectionReason, setRejectionReason] = useState<string>('')

  // UI Feedback states
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [successMsg, setSuccessMsg] = useState<string>('')

  // Monk Rejection Modal state
  const [rejectModalPost, setRejectModalPost] = useState<PostData | null>(null)
  const [modalRejectionReason, setModalRejectionReason] = useState<string>('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const wordInputRef = useRef<HTMLInputElement>(null)

  // Kiểm tra xem Volunteer có bị khóa chỉnh sửa không
  const isVolunteerLocked = isVolunteer && (currentStatus === 'PENDING_APPROVAL' || currentStatus === 'PUBLISHED')

  // Đếm bài đang chờ duyệt
  const pendingCount = posts.filter(p => p.status === 'PENDING_APPROVAL').length

  // Bắt đầu viết bài mới
  const handleStartNewPost = () => {
    setEditingPostId(undefined)
    setTitle('')
    setContent('')
    setThumbnailUrl('https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=800&q=80')
    setCategory(CATEGORIES[0])
    setAuthorName(authorFullName)
    setCurrentStatus('DRAFT')
    setRejectionReason('')
    setErrorMsg('')
    setSuccessMsg('')
    setActiveTab('EDITOR')
  }

  // Chỉnh sửa bài viết
  const handleEditPost = (post: PostData) => {
    setEditingPostId(post.id)
    setTitle(post.title)
    setContent(post.content)
    setThumbnailUrl(post.thumbnail_url || 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=800&q=80')
    setCategory(post.category || CATEGORIES[0])
    setAuthorName(post.author_name || authorFullName)
    setCurrentStatus(post.status)
    setRejectionReason(post.rejection_reason || '')
    setErrorMsg('')
    setSuccessMsg('')
    setActiveTab('EDITOR')
  }

  // Xử lý upload ảnh bìa (chuyển sang base64 data url hoặc URL thật)
  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setThumbnailUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
  }

  // TỰ ĐỘNG ĐỌC VÀ TRÍCH XUẤT NỘI DUNG TỪ FILE WORD (.DOCX / .TXT)
  const handleWordFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      if (file.name.endsWith('.txt')) {
        const text = await file.text()
        setContent(text)
        setSuccessMsg('Đã nhập nội dung từ file văn bản (.txt) thành công!')
        return
      }

      // Xử lý file .docx bằng PizZip
      const arrayBuffer = await file.arrayBuffer()
      const zip = new PizZip(arrayBuffer)
      const xmlContent = zip.file('word/document.xml')?.asText() || ''
      
      // Phân tích các thẻ <w:p> thành các đoạn văn
      const paragraphs = xmlContent
        .split(/<w:p[^>]*>/)
        .map(p => {
          const texts = p.match(/<w:t[^>]*>([^<]*)<\/w:t>/g)
          if (!texts) return ''
          return texts.map(t => t.replace(/<[^>]+>/g, '')).join('')
        })
        .filter(Boolean)

      if (paragraphs.length > 0) {
        // Nếu tiêu đề chưa điền, tự động lấy đoạn đầu tiên làm tiêu đề
        if (!title.trim() && paragraphs[0]) {
          setTitle(paragraphs[0])
          setContent(paragraphs.slice(1).join('\n\n'))
        } else {
          setContent(paragraphs.join('\n\n'))
        }
        setSuccessMsg('Đã trích xuất nội dung từ file Word (.docx) thành công!')
      } else {
        setErrorMsg('Không tìm thấy văn bản trong file Word này.')
      }
    } catch (err: any) {
      console.error('Lỗi đọc file Word:', err)
      setErrorMsg('Không thể đọc file Word. Vui lòng đảm bảo file là định dạng .docx chuẩn.')
    }
  }

  // Chèn định dạng vào nội dung (Mini Rich Text Editor Helper)
  const insertFormatting = (prefix: string, suffix: string = '') => {
    if (isVolunteerLocked) return
    setContent(prev => `${prev}\n${prefix} `)
  }

  // LƯU BÀI VIẾT (Save Draft / Submit for Review / Publish Now)
  const handleSavePost = async (targetStatus: PostStatus) => {
    if (!title.trim()) {
      setErrorMsg('Vui lòng nhập tiêu đề bài viết')
      return
    }
    if (!content.trim()) {
      setErrorMsg('Vui lòng nhập nội dung bài viết')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    const res = await savePost({
      id: editingPostId,
      title,
      content,
      thumbnail_url: thumbnailUrl,
      category,
      author_name: authorName,
      status: targetStatus
    })

    setIsSubmitting(false)

    if (res.success && res.post) {
      setSuccessMsg(
        targetStatus === 'DRAFT'
          ? 'Đã lưu bản nháp thành công!'
          : targetStatus === 'PENDING_APPROVAL'
          ? 'Đã gửi bài viết cho Quý Thầy duyệt!'
          : 'Đã xuất bản bài viết thành công!'
      )
      // Cập nhật state danh sách
      if (editingPostId) {
        setPosts(prev => prev.map(p => p.id === editingPostId ? res.post! : p))
      } else {
        setPosts(prev => [res.post!, ...prev])
        setEditingPostId(res.post.id)
      }
      setCurrentStatus(res.post.status)
    } else {
      setErrorMsg(res.error || 'Có lỗi xảy ra khi lưu bài viết')
    }
  }

  // QUÝ THẦY DUYỆT BÀI NGAY TRÊN FORM SOẠN THẢO HOẶC TRONG DANH SÁCH
  const handleMonkReviewAction = async (post: PostData, action: 'APPROVE' | 'REJECT', reason?: string) => {
    setIsSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    const res = await reviewPost({
      id: post.id,
      action,
      rejection_reason: reason,
      // Cho phép Quý Thầy trực tiếp chỉnh sửa lỗi chính tả trước khi duyệt
      editedTitle: editingPostId === post.id ? title : undefined,
      editedContent: editingPostId === post.id ? content : undefined,
      editedCategory: editingPostId === post.id ? category : undefined
    })

    setIsSubmitting(false)

    if (res.success) {
      setPosts(prev => prev.map(p => {
        if (p.id === post.id) {
          return {
            ...p,
            status: action === 'APPROVE' ? 'PUBLISHED' : 'REJECTED',
            rejection_reason: action === 'REJECT' ? (reason || 'Nội dung chưa phù hợp') : undefined
          }
        }
        return p
      }))

      if (editingPostId === post.id) {
        setCurrentStatus(action === 'APPROVE' ? 'PUBLISHED' : 'REJECTED')
        if (action === 'REJECT' && reason) {
          setRejectionReason(reason)
        }
      }

      setSuccessMsg(action === 'APPROVE' ? 'Đã phê duyệt và xuất bản bài viết!' : 'Đã từ chối bài viết.')
      setRejectModalPost(null)
    } else {
      setErrorMsg(res.error || 'Lỗi xử lý kiểm duyệt')
    }
  }

  // Xóa bài viết
  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá bài viết này không?')) return
    const res = await deletePost(id)
    if (res.success) {
      setPosts(prev => prev.filter(p => p.id !== id))
      if (editingPostId === id) {
        setActiveTab('LIST')
      }
    }
  }

  // Lọc bài viết hiển thị theo Tab Filter
  const filteredPosts = posts.filter(p => {
    if (filterStatus === 'ALL') return true
    if (filterStatus === 'PENDING_APPROVAL') return p.status === 'PENDING_APPROVAL'
    if (filterStatus === 'PUBLISHED') return p.status === 'PUBLISHED'
    if (filterStatus === 'DRAFT') return p.status === 'DRAFT' || p.status === 'REJECTED'
    return true
  })

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* HEADER BAR & ROLE BADGE */}
      <div className="bg-white dark:bg-[#1c1816] border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              Quản Lý Bài Viết & Tin Tức (CMS)
            </h1>
            {isMonk ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#8B4513]/10 text-[#8B4513] dark:text-amber-400 border border-[#8B4513]/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                Quyền Ban Trị Sự / Quý Thầy
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                <User className="h-3.5 w-3.5" />
                Tình Nguyện Viên (Tác Giả)
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Hệ thống soạn thảo, tải nội dung từ file Word (.docx) và kiểm duyệt xuất bản tin tức cho Chùa Báo Ân.
          </p>
        </div>

        {/* Nút chuyển đổi Tab & Tạo mới */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('LIST')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'LIST'
                ? 'bg-[#8B4513] text-white shadow-md'
                : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 hover:bg-stone-200'
            }`}
          >
            <FileText className="h-4 w-4" />
            Danh Sách Bài ({posts.length})
          </button>
          <button
            onClick={handleStartNewPost}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
              activeTab === 'EDITOR' && !editingPostId
                ? 'bg-[#8B4513] text-white shadow-md'
                : 'border-2 border-[#8B4513] text-[#8B4513] dark:text-amber-400 hover:bg-[#8B4513]/10'
            }`}
          >
            <Plus className="h-4 w-4" />
            Soạn Bài Mới
          </button>
        </div>
      </div>

      {/* THÔNG BÁO TRẠNG THÁI */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg('')} className="text-red-600 hover:text-red-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ======================= TAB 1: DANH SÁCH BÀI VIỆT ======================= */}
      {activeTab === 'LIST' && (
        <div className="space-y-4">
          {/* THANH BỘ LỌC DÀNH CHO MONK HOẶC VOLUNTEER */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#1c1816] p-4 rounded-xl border border-stone-200 dark:border-stone-800">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilterStatus('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'ALL'
                    ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-900'
                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                Tất cả ({posts.length})
              </button>

              {isMonk && (
                <button
                  onClick={() => setFilterStatus('PENDING_APPROVAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    filterStatus === 'PENDING_APPROVAL'
                      ? 'bg-[#D4A017] text-white shadow-sm'
                      : 'bg-[#D4A017]/15 text-[#B8860B] dark:text-amber-400 border border-[#D4A017]/30 hover:bg-[#D4A017]/25'
                  }`}
                >
                  <Clock className="h-3.5 w-3.5" />
                  Chờ Duyệt (Needs Review)
                  {pendingCount > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white text-[#B8860B] text-[10px]">
                      {pendingCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setFilterStatus('PUBLISHED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'PUBLISHED'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-200'
                }`}
              >
                Đã Xuất Bản
              </button>

              <button
                onClick={() => setFilterStatus('DRAFT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterStatus === 'DRAFT'
                    ? 'bg-stone-600 text-white'
                    : 'bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400 hover:bg-stone-200'
                }`}
              >
                Bản Nháp / Từ Chối
              </button>
            </div>
          </div>

          {/* DANH SÁCH THẺ BÀI VIẾT */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-800 p-12 text-center space-y-3">
              <FileText className="h-12 w-12 text-stone-300 dark:text-stone-700 mx-auto" />
              <p className="text-stone-600 dark:text-stone-400 font-medium">
                Chưa có bài viết nào trong mục này.
              </p>
              <button
                onClick={handleStartNewPost}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#8B4513] text-white text-sm font-semibold hover:bg-[#70360D] transition"
              >
                <Plus className="h-4 w-4" />
                Viết Bài Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPosts.map(post => {
                const isPending = post.status === 'PENDING_APPROVAL'
                const isPublished = post.status === 'PUBLISHED'
                const isRejected = post.status === 'REJECTED'

                return (
                  <div
                    key={post.id}
                    className="bg-white dark:bg-[#1c1816] border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Ảnh bìa */}
                      <div className="relative h-44 w-full bg-stone-100 dark:bg-stone-900 overflow-hidden">
                        {post.thumbnail_url ? (
                          <img
                            src={post.thumbnail_url}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400">
                            <ImageIcon className="h-10 w-10" />
                          </div>
                        )}

                        {/* Status Badge theo chuẩn thiết kế */}
                        <div className="absolute top-3 left-3">
                          {isPending && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#D4A017] text-white shadow-sm flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Chờ Quý Thầy Duyệt
                            </span>
                          )}
                          {isPublished && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Đã Xuất Bản
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-600 text-white shadow-sm flex items-center gap-1">
                              <XCircle className="h-3 w-3" /> Từ Chối
                            </span>
                          )}
                          {post.status === 'DRAFT' && (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-stone-700 text-white shadow-sm">
                              Bản Nháp
                            </span>
                          )}
                        </div>

                        {/* Category Badge */}
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-black/60 text-white backdrop-blur-sm">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      {/* Nội dung tóm tắt */}
                      <div className="p-5 space-y-2">
                        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                          <span className="font-semibold text-stone-800 dark:text-stone-200">
                            ✍️ {post.author_name}
                          </span>
                          <span>{new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2">
                          {post.content}
                        </p>

                        {/* Nếu bị từ chối hiển thị lý do */}
                        {isRejected && post.rejection_reason && (
                          <div className="mt-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                            <strong>Lý do từ chối:</strong> {post.rejection_reason}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ACTIONS BAR */}
                    <div className="px-5 py-3.5 bg-stone-50 dark:bg-stone-900/40 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8B4513] dark:text-amber-400 hover:underline"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        {isMonk && isPending ? 'Biên Tập & Phê Duyệt' : 'Chỉnh Sửa / Xem'}
                      </button>

                      <div className="flex items-center gap-2">
                        {/* QUYỀN CỦA MONK TRÊN BÀI CHỜ DUYỆT */}
                        {isMonk && isPending && (
                          <>
                            <button
                              onClick={() => handleMonkReviewAction(post, 'APPROVE')}
                              disabled={isSubmitting}
                              className="px-2.5 py-1 rounded-lg bg-[#8B4513] text-white text-xs font-bold hover:bg-[#70360D] transition shadow-sm"
                              title="Duyệt và xuất bản ngay"
                            >
                              ✓ Duyệt
                            </button>
                            <button
                              onClick={() => setRejectModalPost(post)}
                              disabled={isSubmitting}
                              className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                              title="Từ chối kèm lý do"
                            >
                              ✕ Từ Chối
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 transition rounded-md"
                          title="Xóa bài viết"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: POST EDITOR (70% LEFT / 30% RIGHT) ======================= */}
      {activeTab === 'EDITOR' && (
        <div className="space-y-6">
          {/* THÔNG BÁO KHÓA SOẠN THẢO VỚI VOLUNTEER NẾU ĐÃ GỬI DUYỆT HOẶC XUẤT BẢN */}
          {isVolunteerLocked && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-[#D4A017] flex-shrink-0" />
              <div className="text-sm">
                <strong className="font-bold">Bài viết đang trong trạng thái {currentStatus === 'PUBLISHED' ? 'Đã Xuất Bản' : 'Chờ Sư Thầy Duyệt'}.</strong>
                <p>Bạn đang xem ở chế độ chỉ đọc (Read-only). Quý Thầy sẽ kiểm tra hoặc biên tập trước khi xuất bản lên trang chủ.</p>
              </div>
            </div>
          )}

          {/* AUTHOR TOP INFORMATION BAR */}
          <div className="bg-white dark:bg-[#1c1816] p-4 rounded-xl border border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Tên Tác Giả / Pháp Danh:
              </label>
              <input
                type="text"
                disabled={isVolunteerLocked}
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
                placeholder="Nhập tên tác giả..."
                className="px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500">Trạng thái hiện tại:</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                currentStatus === 'PENDING_APPROVAL'
                  ? 'bg-[#D4A017] text-white'
                  : currentStatus === 'PUBLISHED'
                  ? 'bg-emerald-600 text-white'
                  : currentStatus === 'REJECTED'
                  ? 'bg-red-600 text-white'
                  : 'bg-stone-700 text-white'
              }`}>
                {currentStatus === 'DRAFT' && 'Bản Nháp'}
                {currentStatus === 'PENDING_APPROVAL' && 'Chờ Duyệt'}
                {currentStatus === 'PUBLISHED' && 'Đã Xuất Bản'}
                {currentStatus === 'REJECTED' && 'Bị Từ Chối'}
              </span>
            </div>
          </div>

          {/* 2-COLUMN STRICT LAYOUT: LEFT 70% / RIGHT 30% */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
            {/* COLUMN LEFT (70% => lg:col-span-7): TITLE & RICH TEXT EDITOR + WORD IMPORT */}
            <div className="lg:col-span-7 space-y-4">
              {/* TITLE INPUT */}
              <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Tiêu Đề Bài Viết <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  disabled={isVolunteerLocked}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bài viết..."
                  className="w-full px-4 py-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-lg font-serif font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
                />
              </div>

              {/* WORD DOCUMENT (.DOCX) AUTO-IMPORT HELPER CARD */}
              {!isVolunteerLocked && (
                <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300/80 dark:border-amber-800/60 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[#8B4513] text-white flex items-center justify-center flex-shrink-0">
                      <Upload className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#8B4513] dark:text-amber-400">
                        Nhập Tự Động Từ File Word (.docx / .txt)
                      </p>
                      <p className="text-xs text-stone-600 dark:text-stone-400">
                        Chọn file Word, hệ thống sẽ tự động trích xuất toàn bộ nội dung vào trình soạn thảo bên dưới.
                      </p>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={wordInputRef}
                    onChange={handleWordFileUpload}
                    accept=".docx,.txt"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => wordInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-stone-900 border-2 border-[#8B4513] text-[#8B4513] dark:text-amber-400 text-xs font-bold hover:bg-[#8B4513]/10 transition flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Upload className="h-4 w-4" />
                    Chọn File Word (.docx)
                  </button>
                </div>
              )}

              {/* RICH TEXT EDITOR CARD */}
              <div className="bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
                {/* Formatting Toolbar */}
                {!isVolunteerLocked && (
                  <div className="p-3 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={() => insertFormatting('##')}
                      className="p-2 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center gap-1"
                      title="Tiêu đề H2"
                    >
                      <Heading2 className="h-4 w-4" /> H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('###')}
                      className="p-2 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold flex items-center gap-1"
                      title="Tiêu đề H3"
                    >
                      <Heading3 className="h-4 w-4" /> H3
                    </button>
                    <div className="h-4 w-[1px] bg-stone-300 dark:bg-stone-700 mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting('**', '**')}
                      className="p-2 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                      title="In đậm"
                    >
                      <Bold className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('_', '_')}
                      className="p-2 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                      title="In nghiêng"
                    >
                      <Italic className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-[1px] bg-stone-300 dark:bg-stone-700 mx-1" />
                    <button
                      type="button"
                      onClick={() => insertFormatting('-')}
                      className="p-2 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                      title="Danh sách"
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting('>')}
                      className="p-2 rounded hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300"
                      title="Trích dẫn"
                    >
                      <Quote className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Content Textarea / Rich Area */}
                <textarea
                  disabled={isVolunteerLocked}
                  rows={15}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Nhập nội dung chi tiết bài viết ở đây... (Bạn có thể gõ trực tiếp hoặc tải từ file Word phía trên)"
                  className="w-full p-6 bg-transparent text-stone-900 dark:text-stone-100 text-base leading-relaxed focus:outline-none resize-y min-h-[350px]"
                />
              </div>
            </div>

            {/* COLUMN RIGHT (30% => lg:col-span-3): STATUS CARD, THUMBNAIL UPLOADER, CATEGORY */}
            <div className="lg:col-span-3 space-y-6">
              {/* 1. POST STATUS & ACTION CARD */}
              <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-5">
                <h3 className="font-serif text-base font-bold text-stone-900 dark:text-stone-100 pb-3 border-b border-stone-100 dark:border-stone-800">
                  Xuất Bản & Kiểm Duyệt
                </h3>

                {/* Status Indicator */}
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-stone-500">Trạng thái:</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      currentStatus === 'PENDING_APPROVAL'
                        ? 'bg-[#D4A017] text-white'
                        : currentStatus === 'PUBLISHED'
                        ? 'bg-emerald-600 text-white'
                        : currentStatus === 'REJECTED'
                        ? 'bg-red-600 text-white'
                        : 'bg-stone-700 text-white'
                    }`}>
                      {currentStatus === 'DRAFT' && 'Bản Nháp (Draft)'}
                      {currentStatus === 'PENDING_APPROVAL' && 'Chờ Duyệt (Pending)'}
                      {currentStatus === 'PUBLISHED' && 'Đã Xuất Bản (Published)'}
                      {currentStatus === 'REJECTED' && 'Từ Chối (Rejected)'}
                    </span>
                  </div>
                </div>

                {/* Nếu bị từ chối, hiển thị lý do */}
                {currentStatus === 'REJECTED' && rejectionReason && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300">
                    <strong>Lý do từ chối:</strong> {rejectionReason}
                  </div>
                )}

                {/* ROLE-BASED WORKFLOW BUTTONS */}
                {!isVolunteerLocked && (
                  <div className="space-y-3 pt-2">
                    {/* VOLUNTEER ACTIONS: Save Draft or Submit for Review (NO PUBLISH BUTTON) */}
                    {isVolunteer && (
                      <>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSavePost('PENDING_APPROVAL')}
                          className="w-full py-3 px-4 rounded-xl bg-[#8B4513] hover:bg-[#70360D] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                        >
                          <Send className="h-4 w-4" />
                          Gửi Quý Thầy Duyệt (Submit)
                        </button>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSavePost('DRAFT')}
                          className="w-full py-2.5 px-4 rounded-xl border-2 border-[#A0522D] text-[#A0522D] hover:bg-[#A0522D]/10 font-bold text-sm transition flex items-center justify-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Lưu Nháp (Save Draft)
                        </button>
                      </>
                    )}

                    {/* MONK / ADMIN ACTIONS: Publish Now or Approve Pending or Save Draft */}
                    {isMonk && (
                      <>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSavePost('PUBLISHED')}
                          className="w-full py-3 px-4 rounded-xl bg-[#8B4513] hover:bg-[#70360D] text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Xuất Bản Ngay (Publish Now)
                        </button>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleSavePost('DRAFT')}
                          className="w-full py-2.5 px-4 rounded-xl border-2 border-[#A0522D] text-[#A0522D] hover:bg-[#A0522D]/10 font-bold text-sm transition flex items-center justify-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          Lưu Bản Nháp
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* 2. CATEGORY SELECTION */}
              <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Chuyên Mục Bài Viết
                </label>
                <select
                  disabled={isVolunteerLocked}
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm font-semibold text-stone-800 dark:text-stone-100 focus:outline-none focus:border-[#8B4513]"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* 3. THUMBNAIL UPLOADER CARD */}
              <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Hình Ảnh Bìa (Thumbnail)
                </label>

                {thumbnailUrl ? (
                  <div className="space-y-3">
                    <div className="relative h-40 w-full rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800">
                      <img
                        src={thumbnailUrl}
                        alt="Preview thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {!isVolunteerLocked && (
                      <div className="flex gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleThumbnailUpload}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-1.5 px-3 rounded-lg border border-stone-300 dark:border-stone-700 text-xs font-bold hover:bg-stone-50 transition"
                        >
                          Thay Đổi Ảnh
                        </button>
                        <button
                          type="button"
                          onClick={() => setThumbnailUrl('')}
                          className="py-1.5 px-3 rounded-lg border border-red-300 text-red-600 text-xs font-bold hover:bg-red-50 transition"
                        >
                          Xoá
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleThumbnailUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <div
                      onClick={() => !isVolunteerLocked && fileInputRef.current?.click()}
                      className="border-2 border-dashed border-stone-300 dark:border-stone-700 hover:border-[#8B4513] rounded-xl p-6 text-center cursor-pointer transition space-y-2"
                    >
                      <Upload className="h-8 w-8 text-stone-400 mx-auto" />
                      <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                        Kéo thả hình ảnh hoặc bấm chọn
                      </p>
                      <p className="text-[11px] text-stone-400">
                        PNG, JPG, WEBP tối đa 5MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================= MONK REJECTION REASON MODAL ======================= */}
      {rejectModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1c1816] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-stone-200 dark:border-stone-800">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                Từ Chối Bài Viết
              </h3>
              <button
                onClick={() => setRejectModalPost(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-stone-600 dark:text-stone-400">
              Vui lòng điền lý do từ chối để Tình Nguyện Viên <strong>({rejectModalPost.author_name})</strong> biết cần chỉnh sửa điểm nào:
            </p>

            <textarea
              rows={4}
              value={modalRejectionReason}
              onChange={e => setModalRejectionReason(e.target.value)}
              placeholder="Ví dụ: Lỗi chính tả ở đoạn 2, cần làm rõ thông tin thời gian..."
              className="w-full p-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-sm focus:outline-none focus:border-red-500"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectModalPost(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 dark:text-stone-300 text-sm font-semibold hover:bg-stone-50"
              >
                Hủy
              </button>
              <button
                disabled={isSubmitting}
                onClick={() => handleMonkReviewAction(rejectModalPost, 'REJECT', modalRejectionReason)}
                className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 shadow-md"
              >
                Xác Nhận Từ Chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
