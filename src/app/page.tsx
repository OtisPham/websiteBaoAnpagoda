import Link from 'next/link'
import {
  Compass,
  Heart,
  Sparkles,
  Calendar,
  ArrowRight,
  Clock,
  MapPin,
  BookOpen,
  Sun,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import PagodaLogo from '@/components/PagodaLogo'

export const dynamic = 'force-dynamic'

function formatVietnamEventDate(dateStr: string) {
  if (!dateStr) return 'Sắp diễn ra'
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const year = parts[0]
      const month = parseInt(parts[1], 10)
      const day = parseInt(parts[2], 10)
      return `${day} Tháng ${month}, ${year}`
    }
    return dateStr
  } catch {
    return dateStr
  }
}

export default async function HomePage() {
  const supabase = await createClient()

  // 1. Lấy thông tin người dùng đang đăng nhập
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let role = 'USER'
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    role = profile?.role || 'USER'
  }

  // 2. Lấy sự kiện sắp tới từ DB
  const { data: upcomingEventsData } = await supabase
    .from('events')
    .select('id, title, scheduled_date, description')
    .is('deleted_at', null)
    .order('scheduled_date', { ascending: true })

  const upcomingEvents =
    upcomingEventsData && upcomingEventsData.length > 0
      ? upcomingEventsData
      : [
          {
            id: 'default-1',
            title: 'Đại Lễ Phật Đản PL.2570',
            scheduled_date: '15 Tháng 4, Giáp Thìn',
            description:
              'Kỷ niệm ngày Đức Thế Tôn đản sinh với nghi thức tắm Phật trang nghiêm và đàn lễ cầu nguyện quốc thái dân an.',
          },
          {
            id: 'default-2',
            title: 'Khóa Tu Tỉnh Thức Một Ngày An Lạc',
            scheduled_date: 'Chủ Nhật Hàng Tuần',
            description:
              'Thời gian tu tập thanh tịnh dành cho quý cư sĩ Phật tử, thiền tọa chánh niệm và lắng nghe pháp thoại.',
          },
          {
            id: 'default-3',
            title: 'Lễ Sám Hối & Tụng Kinh Dược Sư',
            scheduled_date: '14 & 30 Âm Lịch Hàng Tháng',
            description:
              'Khóa lễ định kỳ hàng tháng giúp thanh lọc thân tâm, hướng nguyện tiêu tai giải ức và gia đạo bình an.',
          },
        ]

  // 3. Lấy bài viết & thông báo đã xuất bản từ DB
  const { data: publishedPostsData } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })
    .limit(6)

  const defaultNews = [
    {
      id: 'demo-1',
      category: 'THÔNG BÁO PHẬT SỰ',
      title: 'Thông báo lịch tu tập và thời khóa hành lễ định kỳ dịp Đại lễ',
      desc: 'Chùa Báo Ân trân trọng kính báo đến toàn thể thiện nam tín nữ phật tử xa gần lịch trình khóa lễ và các buổi giảng pháp thoại...',
      img: 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-07-10',
    },
    {
      id: 'demo-2',
      category: 'PHÁP THOẠI',
      title: 'Hạnh phúc đích thực đến từ tâm xả ly và bình an nội tại',
      desc: 'Chia sẻ sâu sắc từ chốn thiền môn về nghệ thuật sống chánh niệm giữa những biến động của đời sống thường nhật...',
      img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-07-08',
    },
    {
      id: 'demo-3',
      category: 'HOẠT ĐỘNG CHÙA',
      title: 'Tổng kết chương trình thiện nguyện trao tặng học bổng từ bi',
      desc: 'Hơn 200 phần quà và học bổng ý nghĩa đã được Ban Từ Thiện Chùa Báo Ân trao gửi đến các em học sinh hiếu học...',
      img: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
      created_at: '2026-07-05',
    },
  ]

  const news =
    publishedPostsData && publishedPostsData.length > 0
      ? publishedPostsData.map((p: any) => ({
          id: p.id,
          category: p.category || 'PHẬT PHÁP',
          title: p.title || 'Bài viết mới',
          desc:
            typeof p.content === 'string'
              ? p.content
                  .replace(/<[^>]*>?/gm, '')
                  .replace(/!\[.*?\]\(.*?\)/g, '')
                  .slice(0, 130) + '...'
              : '',
          img:
            p.thumbnail_url ||
            'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=800&q=80',
          created_at: p.created_at?.split('T')[0] || 'Gần đây',
        }))
      : defaultNews

  return (
    <div className="flex flex-col min-h-screen bg-[#f6faf3] dark:bg-[#0f1614] text-[#1c2b27] dark:text-[#E6F2DD] selection:bg-[#88BDA4]/30 selection:text-[#1c2b27] dark:selection:text-[#E6F2DD]">
      {/* Top Philosophy Strip (#659287 deep sage banner) */}
      <div className="bg-gradient-to-r from-[#172421] via-[#1f312c] to-[#172421] text-[#E6F2DD]/90 text-xs py-2 px-4 border-b border-[#659287]/30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#88BDA4] animate-pulse" />
            <span className="font-serif italic tracking-wide">
              &ldquo;Tâm bình thế giới bình • Hương giới đức tỏa ngát khắp muôn phương&rdquo;
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] text-[#B1D3B9] font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#88BDA4]" /> 53 Lê Bình, Q. Tân Bình, TP.HCM
            </span>
          </div>
        </div>
      </div>

      {/* Main Sanctuary Navigation */}
      <header className="sticky top-0 z-50 bg-[#f6faf3]/90 dark:bg-[#0f1614]/90 backdrop-blur-xl border-b border-[#B1D3B9]/40 dark:border-[#659287]/25 transition-all">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo & Brand Identity */}
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-[#88BDA4]/25 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
                <PagodaLogo className="h-11 w-11 sm:h-12 sm:w-12 relative flex-shrink-0 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[#1c2b27] dark:text-[#E6F2DD] group-hover:text-[#659287] dark:group-hover:text-[#88BDA4] transition-colors">
                  Chùa Báo Ân
                </span>
                <span className="text-[10px] tracking-[0.22em] uppercase font-semibold text-[#659287] dark:text-[#88BDA4] -mt-0.5">
                  Báo Ân Cổ Tự • Pháp Ấn
                </span>
              </div>
            </Link>

            {/* Editorial Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#1c2b27]/80 dark:text-[#E6F2DD]/80">
              <Link
                href="/"
                className="text-[#659287] dark:text-[#88BDA4] font-semibold border-b-2 border-[#659287]/80 pb-1"
              >
                Trang Chủ
              </Link>
              <a
                href="#heritage"
                className="hover:text-[#659287] dark:hover:text-[#88BDA4] transition-colors pb-1"
              >
                Đạo Phong & Sứ Mệnh
              </a>
              <a
                href="#events"
                className="hover:text-[#659287] dark:hover:text-[#88BDA4] transition-colors pb-1"
              >
                Lịch Pháp Sự
              </a>
              <a
                href="#news"
                className="hover:text-[#659287] dark:hover:text-[#88BDA4] transition-colors pb-1"
              >
                Tin Tức & Thông Báo
              </a>
            </nav>

            {/* Action Area */}
            <div className="flex items-center gap-3 sm:gap-4">
              {user ? (
                <Link
                  href={role === 'USER' ? '/phat-tu' : '/dashboard'}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#659287] to-[#4c7168] hover:from-[#578177] hover:to-[#416259] text-white px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-[#659287]/25 hover:shadow-lg hover:shadow-[#659287]/35 transition-all duration-300 active:scale-95"
                >
                  <span>Trang cá nhân</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 rounded-full bg-[#659287] hover:bg-[#52786e] text-white px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md transition-all duration-300 active:scale-95"
                >
                  <span>Đăng Nhập</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* HERO SANCTUARY SECTION */}
      <section className="relative min-h-[85vh] lg:min-h-[760px] flex items-center justify-center overflow-hidden">
        {/* Editorial Background Image with Depth & Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 animate-hero-bg"
          style={{
            backgroundImage: "url('/images/avatarofficial.png')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-[#0f1614]/65 to-[#0f1614] dark:to-[#0f1614]" />
        </div>

        {/* Subtle Jade Atmospheric Glow (#88BDA4) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#88BDA4]/15 rounded-full blur-[130px] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8 py-20 text-center text-white space-y-8">
          {/* Spiritual Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#88BDA4]/30 text-[#E6F2DD] text-xs font-medium tracking-wider uppercase">
            <Sun className="h-3.5 w-3.5 text-[#88BDA4]" />
            <span>Chốn Tổ Thiền Môn • Bình An Gia Đạo</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.12] drop-shadow-lg max-w-4xl mx-auto">
            Nơi Tìm Thấy Sự Bình An <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E6F2DD] via-[#B1D3B9] to-[#88BDA4]">
              Giữa Lòng Đời
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-[#E6F2DD]/90 leading-relaxed font-light">
            Chào mừng quý Phật tử và thiện hữu xa gần bước vào chốn thanh tịnh Chùa Báo Ân — điểm
            tựa tâm linh ấm cúng, nơi lắng nghe pháp thoại và tìm về chánh niệm vững vàng.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#events"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#659287] via-[#598379] to-[#4e746a] hover:from-[#578177] hover:to-[#43645b] text-white px-8 py-4 text-sm font-bold shadow-xl shadow-[#1c2b27]/40 hover:shadow-[#659287]/30 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Lịch Pháp Sự & Khóa Tu</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#heritage"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 backdrop-blur-md px-7 py-4 text-sm font-semibold text-[#E6F2DD] hover:bg-white hover:text-[#1c2b27] hover:border-white hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Đạo Phong & Sứ Mệnh</span>
            </a>
          </div>

          {/* Key Sanctuary Highlights Bar */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-[#88BDA4]/20 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#88BDA4]/20 text-[#88BDA4]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-[#B1D3B9] font-medium">Tu Học Chánh Niệm</p>
                <p className="text-sm font-bold text-white">Khóa Tu Tỉnh Thức Định Kỳ</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-[#88BDA4]/20 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#88BDA4]/20 text-[#88BDA4]">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-[#B1D3B9] font-medium">Hoằng Pháp Lợi Sinh</p>
                <p className="text-sm font-bold text-white">Pháp Thoại & Kế Thừa Di Sản</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-[#88BDA4]/20 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#88BDA4]/20 text-[#88BDA4]">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-[#B1D3B9] font-medium">Từ Bi Thiện Nguyện</p>
                <p className="text-sm font-bold text-white">Lan Tỏa Yêu Thương</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 1: HERITAGE & MISSION (ASYMMETRIC EDITORIAL BENTO GRID) */}
      <section id="heritage" className="py-24 sm:py-32 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
          {/* Editorial Header */}
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#659287] dark:text-[#88BDA4]">
              <Compass className="h-4 w-4" />
              <span>Đạo Phong • Kế Thừa Di Sản</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#1c2b27] dark:text-white leading-tight">
              Duy trì mạch nguồn từ bi & trí tuệ qua các thế hệ
            </h2>
          </div>

          {/* Asymmetric Bento Grid (2-col + 1-col layout) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Featured Tile (col-span-7) */}
            <div className="lg:col-span-7 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#E6F2DD]/60 via-white to-[#B1D3B9]/20 dark:from-[#16201c] dark:via-[#141d1a] dark:to-[#1a2924] border border-[#659287]/20 dark:border-[#659287]/30 p-8 sm:p-12 flex flex-col justify-between space-y-8 hover:border-[#659287]/50 transition-all duration-500">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#88BDA4]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#659287]/15 dark:bg-[#88BDA4]/15 flex items-center justify-center text-[#659287] dark:text-[#88BDA4] group-hover:scale-110 transition-transform duration-500">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1c2b27] dark:text-white leading-snug">
                  Kế Thừa Di Sản Văn Hóa & Tâm Linh Phật Giáo
                </h3>
                <p className="text-[#1c2b27]/80 dark:text-[#E6F2DD]/80 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Chùa Báo Ân là chốn cổ tự linh thiêng lưu giữ truyền thống hoằng pháp lợi sinh và
                  tu tập thanh tịnh. Nơi hội tụ thiện duyên, hướng dẫn quý Phật tử tu dưỡng chánh
                  niệm và gieo trồng những phước điền cao quý.
                </p>
              </div>
              <div className="pt-4 border-t border-[#659287]/15 dark:border-[#659287]/30 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#659287] dark:text-[#88BDA4]">
                  Duy trì mạch nguồn chánh pháp lâu dài
                </span>
                <span className="text-xs font-serif italic text-[#659287]/80">Báo Ân Pháp Ấn</span>
              </div>
            </div>

            {/* Supporting Tiles Column (col-span-5 stack) */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-6 sm:gap-8">
              {/* Tile 2 */}
              <div className="group rounded-3xl bg-white dark:bg-[#16201c] border border-[#B1D3B9]/40 dark:border-[#659287]/30 p-8 flex flex-col justify-between space-y-6 hover:shadow-xl hover:border-[#659287]/50 transition-all duration-500">
                <div className="w-11 h-11 rounded-xl bg-[#659287]/15 dark:bg-[#88BDA4]/15 flex items-center justify-center text-[#659287] dark:text-[#88BDA4] group-hover:scale-110 transition-transform">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1c2b27] dark:text-white mb-2">
                    Gieo Mầm Từ Bi & Thiện Nguyện
                  </h3>
                  <p className="text-[#1c2b27]/75 dark:text-[#E6F2DD]/75 text-sm leading-relaxed">
                    Thực hành hạnh nguyện cứu khổ ban vui, chia sẻ với những hoàn cảnh khó khăn qua
                    các hoạt động từ thiện và phóng sinh định kỳ.
                  </p>
                </div>
              </div>

              {/* Tile 3 */}
              <div className="group rounded-3xl bg-white dark:bg-[#16201c] border border-[#B1D3B9]/40 dark:border-[#659287]/30 p-8 flex flex-col justify-between space-y-6 hover:shadow-xl hover:border-[#659287]/50 transition-all duration-500">
                <div className="w-11 h-11 rounded-xl bg-[#659287]/15 dark:bg-[#88BDA4]/15 flex items-center justify-center text-[#659287] dark:text-[#88BDA4] group-hover:scale-110 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1c2b27] dark:text-white mb-2">
                    Tu Học Chánh Niệm
                  </h3>
                  <p className="text-[#1c2b27]/75 dark:text-[#E6F2DD]/75 text-sm leading-relaxed">
                    Các khóa tu Bát Quan Trai và ngày an lạc được tổ chức thường xuyên nhằm hướng
                    dẫn cư sĩ ứng dụng lời Phật dạy vào đời sống thường nhật.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: UPCOMING EVENTS & TIMELINE */}
      <section id="events" className="py-24 bg-[#E6F2DD]/40 dark:bg-[#131d1a] border-y border-[#B1D3B9]/40 dark:border-[#659287]/25">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#659287] dark:text-[#88BDA4]">
                Lịch Pháp Sự & Khóa Tu
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1c2b27] dark:text-white">
                Sự Kiện Phật Sự Sắp Diễn Ra
              </h2>
            </div>
            <p className="text-sm text-[#1c2b27]/75 dark:text-[#E6F2DD]/75 max-w-md">
              Kính mời quý Phật tử sắp xếp thời gian quang lâm tham dự các thời khóa hành lễ trang
              nghiêm tại bổn tự.
            </p>
          </div>

          {/* Modern Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((evt, idx) => {
              const formattedDate = evt.scheduled_date.includes('-')
                ? formatVietnamEventDate(evt.scheduled_date)
                : evt.scheduled_date

              return (
                <div
                  key={evt.id}
                  className="group relative bg-white dark:bg-[#16201c] rounded-2xl p-7 border border-[#B1D3B9]/40 dark:border-[#659287]/30 shadow-sm hover:shadow-xl hover:border-[#659287]/60 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#E6F2DD] dark:bg-[#1f2f29] border border-[#88BDA4]/30 text-[#659287] dark:text-[#88BDA4] text-xs font-bold">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formattedDate}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#1c2b27] dark:text-white group-hover:text-[#659287] dark:group-hover:text-[#88BDA4] transition-colors leading-snug">
                      {evt.title}
                    </h3>
                    {evt.description && (
                      <p className="text-[#1c2b27]/75 dark:text-[#E6F2DD]/75 text-sm leading-relaxed line-clamp-3">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#B1D3B9]/30 dark:border-[#659287]/25 flex items-center justify-between text-xs font-semibold text-[#1c2b27]/70 dark:text-[#E6F2DD]/70">
                    <span>Tại Chánh Điện Chùa Báo Ân</span>
                    <span className="text-[#659287] dark:text-[#88BDA4] group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                      Chi tiết <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* SECTION 3: PUBLISHED NEWS & NOTICE BOARD */}
      <section id="news" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#659287] dark:text-[#88BDA4]">
                Bản Tin & Pháp Thoại
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1c2b27] dark:text-white">
                Tin Tức & Thông Báo Phật Sự
              </h2>
            </div>
          </div>

          {/* Editorial 3-Column Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <Link
                key={index}
                href={`/tin-tuc/${item.id}`}
                className="group flex flex-col bg-white dark:bg-[#16201c] rounded-2xl border border-[#B1D3B9]/40 dark:border-[#659287]/30 overflow-hidden shadow-sm hover:shadow-2xl hover:border-[#659287]/60 hover:-translate-y-1.5 transition-all duration-500"
              >
                <div className="aspect-[16/10] w-full overflow-hidden relative bg-[#E6F2DD] dark:bg-[#1f2f29]">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#1c2b27]/85 backdrop-blur-md text-[#E6F2DD] text-[10px] font-bold tracking-wider uppercase">
                    {item.category}
                  </div>
                </div>

                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-[11px] text-[#659287] dark:text-[#88BDA4] font-medium">
                      {item.created_at}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#1c2b27] dark:text-white group-hover:text-[#659287] dark:group-hover:text-[#88BDA4] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-[#1c2b27]/75 dark:text-[#E6F2DD]/75 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#B1D3B9]/30 dark:border-[#659287]/25 flex items-center justify-between text-xs font-semibold text-[#659287] dark:text-[#88BDA4]">
                    <span>Đọc toàn bộ bài viết</span>
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: SANCTUARY WELCOME BANNER */}
      <section className="py-20 bg-gradient-to-br from-[#1c2b27] via-[#16231f] to-[#243732] text-white relative overflow-hidden border-t border-[#659287]/30">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#88BDA4]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#88BDA4]">
              Chiêm Bái & Lễ Phật
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Bước Vào Chốn Tĩnh Lặng • Tìm Về An Nhiên
            </h2>
            <p className="mx-auto max-w-2xl text-[#E6F2DD]/90 text-sm sm:text-base leading-relaxed">
              Kính mời quý Phật tử và thiện hữu xa gần sắp xếp thời gian quang lâm bổn tự chiêm bái,
              tham dự các thời khóa tu học và trải nghiệm đời sống chánh niệm thanh tịnh.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#events"
              className="inline-flex items-center gap-2 rounded-full bg-[#659287] hover:bg-[#52786e] text-white px-8 py-4 text-sm font-bold shadow-lg hover:shadow-[#659287]/40 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Xem Lịch Khóa Tu & Sự Kiện</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* SANCTUARY EDITORIAL FOOTER */}
      <footer className="border-t border-[#B1D3B9]/40 dark:border-[#659287]/25 bg-white dark:bg-[#0f1614] py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <PagodaLogo className="h-9 w-9" />
                <span className="font-serif text-lg font-bold text-[#1c2b27] dark:text-white">
                  Chùa Báo Ân • Bổn Tự Pháp Ấn
                </span>
              </div>
              <p className="text-xs text-[#1c2b27]/70 dark:text-[#E6F2DD]/70 max-w-md leading-relaxed">
                Địa chỉ: 53 Lê Bình, Phường Tân Sơn Nhất, Quận Tân Bình, TP. Hồ Chí Minh <br />
                Điện thoại liên hệ hành chính phật sự: 0901.234.567
              </p>
            </div>

            {/* Giờ hoạt động ở Footer */}
            <div className="bg-[#E6F2DD]/70 dark:bg-[#16201c] border border-[#659287]/30 px-6 py-4 rounded-2xl text-left md:text-right space-y-1.5 shadow-sm">
              <div className="flex items-center md:justify-end gap-2 text-[#659287] dark:text-[#88BDA4] font-bold text-xs uppercase tracking-wider">
                <Clock className="h-4 w-4" />
                <span>Thời gian chùa hoạt động</span>
              </div>
              <p className="text-sm font-bold text-[#1c2b27] dark:text-white">
                Sáng: (8:00 - 11:00) &nbsp;•&nbsp; Chiều: (14:00 - 20:00)
              </p>
              <p className="text-[11px] text-[#1c2b27]/65 dark:text-[#E6F2DD]/65 italic">
                Mở cửa đón tiếp Phật tử & viếng chùa hàng ngày
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-[#B1D3B9]/30 dark:border-[#659287]/25 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#1c2b27]/65 dark:text-[#E6F2DD]/65">
            <p>© 2026 Chùa Báo Ân. Tất cả các quyền được bảo lưu trang nghiêm.</p>
            <Link
              href="/auth/login"
              className="text-[#659287] dark:text-[#88BDA4] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Cổng Quản Trị Ban Trị Sự & Tăng Ni</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
