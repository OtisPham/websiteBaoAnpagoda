import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import PagodaLogo from '@/components/PagodaLogo'

export const dynamic = 'force-dynamic'

// Hàm chuyển đổi nội dung markdown đơn giản sang HTML/JSX trang nhã
function renderArticleContent(content: string) {
  if (!content) return null

  const lines = content.split('\n')
  return lines.map((line, idx) => {
    const trimmed = line.trim()
    if (!trimmed) return <div key={idx} className="h-4" />

    // Ảnh markdown: ![alt](url)
    const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/)
    if (imgMatch) {
      return (
        <div key={idx} className="my-8 rounded-2xl overflow-hidden shadow-lg border border-stone-200 dark:border-stone-800">
          <img
            src={imgMatch[2]}
            alt={imgMatch[1] || 'Hình ảnh bài viết'}
            className="w-full max-h-[600px] object-cover mx-auto"
          />
          {imgMatch[1] && (
            <p className="text-center text-xs text-stone-500 dark:text-stone-400 py-2.5 bg-stone-50 dark:bg-stone-900/50 italic">
              {imgMatch[1]}
            </p>
          )}
        </div>
      )
    }

    // Tiêu đề H2
    if (trimmed.startsWith('## ')) {
      return (
        <h2 key={idx} className="font-serif text-2xl font-bold text-stone-900 dark:text-amber-400 mt-8 mb-4">
          {trimmed.replace(/^##\s+/, '')}
        </h2>
      )
    }

    // Tiêu đề H3
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={idx} className="font-serif text-xl font-bold text-stone-800 dark:text-stone-200 mt-6 mb-3">
          {trimmed.replace(/^###\s+/, '')}
        </h3>
      )
    }

    // Trích dẫn blockquote
    if (trimmed.startsWith('> ')) {
      return (
        <blockquote key={idx} className="border-l-4 border-[#8B4513] bg-amber-50/50 dark:bg-amber-950/20 px-5 py-4 my-6 rounded-r-xl italic text-stone-700 dark:text-stone-300">
          {trimmed.replace(/^>\s+/, '')}
        </blockquote>
      )
    }

    // Danh sách
    if (trimmed.startsWith('- ')) {
      return (
        <li key={idx} className="ml-6 list-disc text-stone-700 dark:text-stone-300 leading-relaxed my-1">
          {trimmed.replace(/^-\s+/, '')}
        </li>
      )
    }

    return (
      <p key={idx} className="text-stone-700 dark:text-stone-300 leading-8 text-base md:text-lg my-3">
        {trimmed}
      </p>
    )
  })
}

export default async function ArticleDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  let post: any = null

  if (!params.id.startsWith('demo-')) {
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('id', params.id)
      .single()
    post = data
  }

  // Nếu bài viết demo hoặc không tìm thấy ID trong DB, dùng dữ liệu demo
  if (!post) {
    if (params.id === 'demo-1') {
      post = {
        title: 'Thông báo về việc trùng tu chính điện Chùa Báo Ân',
        category: 'THÔNG BÁO',
        created_at: new Date().toISOString(),
        author_name: 'Ban Trị Sự Chùa Báo Ân',
        thumbnail_url: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1200&q=80',
        content: `Chùa Báo Ân kính thông báo đến toàn thể thiện nam tín nữ Phật tử xa gần:

## Kế Hoạch Trùng Tu Hạng Mục Chính Điện
Nhằm đảm bảo an toàn cho Quý Phật tử về chùa hành lễ và bảo tồn các giá trị kiến trúc tâm linh lịch sử, từ ngày đầu tháng tới, nhà chùa sẽ chính thức khởi công trùng tu và tu bổ khu vực Chính Điện.

> "Trùng tu ngôi Tam Bảo là công đức vô lượng, giúp chốn thiền môn thêm trang nghiêm thanh tịnh cho muôn đời sau."

Trong thời gian thi công sửa chữa, các thời khóa tụng kinh hằng ngày và khóa lễ sẽ được tạm thời chuyển sang khu vực nhà giảng đường phía Đông. Kính mong toàn thể Quý Đạo hữu và Phật tử hoan hỷ chia sẻ.`
      }
    } else if (params.id === 'demo-2') {
      post = {
        title: 'Hạnh phúc đến từ sự buông bỏ phiền não',
        category: 'PHẬT PHÁP',
        created_at: new Date().toISOString(),
        author_name: 'Thầy Trụ Trì',
        thumbnail_url: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
        content: `Cuộc sống hiện đại mang đến nhiều tiện nghi, nhưng đồng thời cũng khiến tâm trí chúng ta luôn vướng bận lo âu và mong cầu không dứt.

## Nghệ Thuật Buông Bỏ Trong Đạo Phật
Buông bỏ không phải là bất cần hay trốn tránh trách nhiệm, mà là thấu hiểu lẽ vô thường, không chấp thủ vào những danh lợi huyễn hoặc hay những phiền muộn đã qua.

- Nhìn nhận sự thật như nó vốn là
- Thực tập chánh niệm trong từng hơi thở
- Sống trọn vẹn và tỉnh thức trong giây phút hiện tại

Xin nguyện cầu cho toàn thể Phật tử thân tâm thường an lạc, đạo tâm kiên cố.`
      }
    } else {
      post = {
        title: 'Tổng kết khóa tu mùa hè cho thanh thiếu niên',
        category: 'SỰ KIỆN',
        created_at: new Date().toISOString(),
        author_name: 'Ban Hướng Dẫn Phật Tử',
        thumbnail_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1200&q=80',
        content: `Khóa tu mùa hè đã khép lại với rất nhiều khoảnh khắc xúc động và ý nghĩa của các em học sinh sinh viên.

## Những Trải Nghiệm Khó Quên
Trong suốt 7 ngày sinh hoạt tại chùa, các bạn trẻ đã được rèn luyện nếp sống tự lập, lắng nghe các thời pháp về công ơn cha mẹ và thực tập ngồi thiền an tĩnh tâm hồn.`
      }
    }
  }

  // Tra cứu tên tác giả nếu là bài viết thật
  let authorName = post.author_name || 'Ban Biên Tập Chùa Báo Ân'
  if (post.author_id && !post.author_name) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', post.author_id)
      .single()
    if (userProfile?.full_name) {
      authorName = userProfile.full_name
    }
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] dark:bg-[#12100e] text-stone-900 dark:text-stone-100 pb-20">
      {/* Header gọn gàng */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#1c1816]/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 text-amber-800 dark:text-amber-500 font-serif font-bold text-lg">
            <PagodaLogo className="h-8 w-8" />
            <span>Chùa Báo Ân</span>
          </Link>
          <Link
            href="/#news"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-amber-800 dark:hover:text-amber-400 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại Tin tức
          </Link>
        </div>
      </header>

      {/* Nội dung bài viết */}
      <article className="mx-auto max-w-3xl px-6 pt-10">
        {/* Category & Date */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-wider mb-4">
          <span className="px-3 py-1 rounded-full bg-[#8B4513]/10 text-[#8B4513] dark:bg-amber-950/40 dark:text-amber-400 border border-[#8B4513]/20">
            {post.category || 'PHẬT PHÁP'}
          </span>
          <span className="text-stone-400">•</span>
          <span className="text-stone-500 dark:text-stone-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.created_at || Date.now()).toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>

        {/* Title */}
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-stone-950 dark:text-white leading-tight">
          {post.title}
        </h1>

        {/* Author info */}
        <div className="mt-6 pb-6 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-sm text-stone-600 dark:text-stone-400">
          <div className="flex items-center gap-2 font-medium">
            <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-950/50 text-[#8B4513] dark:text-amber-400 flex items-center justify-center font-bold">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-stone-900 dark:text-stone-100 font-semibold">{authorName}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Tác giả bài viết</p>
            </div>
          </div>
        </div>

        {/* Thumbnail chính */}
        {post.thumbnail_url && (
          <div className="mt-8 rounded-2xl overflow-hidden shadow-md border border-stone-200 dark:border-stone-800">
            <img
              src={post.thumbnail_url}
              alt={post.title}
              className="w-full max-h-[480px] object-cover"
            />
          </div>
        )}

        {/* Nội dung chi tiết */}
        <div className="mt-10 font-serif text-stone-800 dark:text-stone-200 leading-relaxed space-y-4">
          {renderArticleContent(post.content)}
        </div>

        {/* Nút chia sẻ hoặc quay lại trang chủ */}
        <div className="mt-16 pt-8 border-t border-stone-200 dark:border-stone-800 flex justify-between items-center">
          <Link
            href="/#news"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-sm font-semibold transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Xem các tin tức khác
          </Link>
        </div>
      </article>
    </div>
  )
}
