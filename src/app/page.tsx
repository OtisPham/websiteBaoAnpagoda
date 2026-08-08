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
  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#093C5D] via-[#0b486f] to-[#093C5D] flex items-center justify-center p-6 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay pointer-events-none"></div>
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#5DF8D8]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-2xl w-full bg-[#051420]/60 backdrop-blur-md border border-[#3B7597]/40 rounded-3xl p-10 md:p-14 shadow-2xl relative z-10 space-y-6">
          <PagodaLogo className="h-16 w-16 mx-auto text-amber-500 mb-6 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-amber-400 tracking-wide">
            Nam Mô Bổn Sư Thích Ca Mâu Ni Phật
          </h1>
          <div className="space-y-4 text-stone-200 text-sm md:text-base leading-relaxed max-w-xl mx-auto font-medium">
            <p>
              Kính bạch Chư Tôn Đức Tăng Ni,<br/>
              Kính thưa Quý Phật tử gần xa,
            </p>
            <p>
              Trang web hiện tại đang được nâng cấp và bảo trì hệ thống định kỳ.
              Kính mong Quý vị hoan hỷ cảm thông và quay lại sau ít phút nữa.
            </p>
            <p className="text-amber-500/90 font-serif italic mt-6 pt-6 border-t border-[#3B7597]/30">
              Nguyện cầu hồng ân Tam Bảo gia hộ Quý vị thân tâm thường an lạc.
            </p>
          </div>
        </div>
      </div>
    )
  }

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
    <div className="flex flex-col min-h-screen bg-[#f4f9fc] dark:bg-[#051420] text-[#093C5D] dark:text-[#e8f7fd] selection:bg-[#6FD1D7]/35 selection:text-[#093C5D] dark:selection:text-[#e8f7fd]">
      {/* Top Philosophy Strip (#093C5D deep sapphire banner) */}
      <div className="bg-gradient-to-r from-[#062134] via-[#093C5D] to-[#062134] text-[#e8f7fd]/95 text-xs py-2 px-4 border-b border-[#3B7597]/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[#5DF8D8] animate-pulse" />
            <span className="font-serif italic tracking-wide">
              &ldquo;Tâm bình thế giới bình • Hương giới đức tỏa ngát khắp muôn phương&rdquo;
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[11px] text-[#6FD1D7] font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-[#5DF8D8]" /> 53 Lê Bình, Q. Tân Bình, TP.HCM
            </span>
          </div>
        </div>
      </div>

      {/* Main Sanctuary Navigation */}
      <header className="sticky top-0 z-50 bg-[#f4f9fc]/90 dark:bg-[#051420]/90 backdrop-blur-xl border-b border-[#3B7597]/25 dark:border-[#3B7597]/30 transition-all">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo & Brand Identity */}
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-[#5DF8D8]/30 opacity-0 group-hover:opacity-100 blur transition-opacity duration-500" />
                <PagodaLogo className="h-11 w-11 sm:h-12 sm:w-12 relative flex-shrink-0 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-wide text-[#093C5D] dark:text-white group-hover:text-[#3B7597] dark:group-hover:text-[#5DF8D8] transition-colors">
                  Chùa Báo Ân
                </span>
                <span className="text-[10px] tracking-[0.22em] uppercase font-semibold text-[#3B7597] dark:text-[#6FD1D7] -mt-0.5">
                  Báo Ân Cổ Tự • Pháp Ấn
                </span>
              </div>
            </Link>

            {/* Editorial Navigation Links */}
            <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-[#093C5D]/80 dark:text-[#e8f7fd]/80">
              <Link
                href="/"
                className="text-[#093C5D] dark:text-[#5DF8D8] font-semibold border-b-2 border-[#093C5D] dark:border-[#5DF8D8] pb-1"
              >
                Trang Chủ
              </Link>
              <a
                href="#heritage"
                className="hover:text-[#3B7597] dark:hover:text-[#6FD1D7] transition-colors pb-1"
              >
                Đạo Phong & Sứ Mệnh
              </a>
              <a
                href="#events"
                className="hover:text-[#3B7597] dark:hover:text-[#6FD1D7] transition-colors pb-1"
              >
                Lịch Pháp Sự
              </a>
              <a
                href="#news"
                className="hover:text-[#3B7597] dark:hover:text-[#6FD1D7] transition-colors pb-1"
              >
                Tin Tức & Thông Báo
              </a>
            </nav>

            {/* Action Area */}
            <div className="flex items-center gap-3 sm:gap-4">
              {user ? (
                <Link
                  href={role === 'USER' ? '/phat-tu' : '/dashboard'}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#093C5D] to-[#3B7597] hover:from-[#3B7597] hover:to-[#093C5D] text-white px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md shadow-[#093C5D]/25 hover:shadow-lg transition-all duration-300 active:scale-95"
                >
                  <span>Trang cá nhân</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="inline-flex items-center gap-2 rounded-full bg-[#093C5D] hover:bg-[#3B7597] text-white px-5 sm:px-6 py-2.5 text-xs sm:text-sm font-semibold shadow-md transition-all duration-300 active:scale-95"
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
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-[#051420]/70 to-[#051420] dark:to-[#051420]" />
        </div>

        {/* Subtle Cyan Atmospheric Glow (#5DF8D8) */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#5DF8D8]/15 rounded-full blur-[130px] pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8 py-20 text-center text-white space-y-8">
          {/* Spiritual Eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#6FD1D7]/35 text-[#5DF8D8] text-xs font-medium tracking-wider uppercase">
            <Sun className="h-3.5 w-3.5 text-[#5DF8D8]" />
            <span>Chốn Tổ Thiền Môn • Bình An Gia Đạo</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.12] drop-shadow-lg max-w-4xl mx-auto">
            Nơi Tìm Thấy Sự Bình An <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DF8D8] via-[#6FD1D7] to-white">
              Giữa Lòng Đời
            </span>
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-white/90 leading-relaxed font-light">
            Chào mừng quý Phật tử và thiện hữu xa gần bước vào chốn thanh tịnh Chùa Báo Ân — điểm
            tựa tâm linh ấm cúng, nơi lắng nghe pháp thoại và tìm về chánh niệm vững vàng.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a
              href="#events"
              className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#093C5D] via-[#215a7d] to-[#3B7597] hover:from-[#3B7597] hover:to-[#093C5D] text-white px-8 py-4 text-sm font-bold shadow-xl shadow-[#093C5D]/40 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Lịch Pháp Sự & Khóa Tu</span>
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#heritage"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-md px-7 py-4 text-sm font-semibold text-white hover:bg-white hover:text-[#093C5D] hover:border-white hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Đạo Phong & Sứ Mệnh</span>
            </a>
          </div>

          {/* Key Sanctuary Highlights Bar */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-[#6FD1D7]/25 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#5DF8D8]/20 text-[#5DF8D8]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-[#6FD1D7] font-medium">Tu Học Chánh Niệm</p>
                <p className="text-sm font-bold text-white">Khóa Tu Tỉnh Thức Định Kỳ</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-[#6FD1D7]/25 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#5DF8D8]/20 text-[#5DF8D8]">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-[#6FD1D7] font-medium">Hoằng Pháp Lợi Sinh</p>
                <p className="text-sm font-bold text-white">Pháp Thoại & Kế Thừa Di Sản</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/5 backdrop-blur-md border border-[#6FD1D7]/25 flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#5DF8D8]/20 text-[#5DF8D8]">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-[#6FD1D7] font-medium">Từ Bi Thiện Nguyện</p>
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
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] uppercase text-[#3B7597] dark:text-[#6FD1D7]">
              <Compass className="h-4 w-4" />
              <span>Đạo Phong • Kế Thừa Di Sản</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#093C5D] dark:text-white leading-tight">
              Duy trì mạch nguồn từ bi & trí tuệ qua các thế hệ
            </h2>
          </div>

          {/* Asymmetric Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Featured Tile (col-span-7) */}
            <div className="lg:col-span-7 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#e8f4fa] via-white to-[#6FD1D7]/15 dark:from-[#092134] dark:via-[#09283e] dark:to-[#0a314c] border border-[#3B7597]/25 dark:border-[#6FD1D7]/30 p-8 sm:p-12 flex flex-col justify-between space-y-8 hover:border-[#3B7597]/60 transition-all duration-500">
              <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#5DF8D8]/15 rounded-full blur-3xl pointer-events-none" />
              <div className="space-y-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-[#093C5D]/15 dark:bg-[#5DF8D8]/15 flex items-center justify-center text-[#093C5D] dark:text-[#5DF8D8] group-hover:scale-110 transition-transform duration-500">
                  <Compass className="h-6 w-6" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#093C5D] dark:text-white leading-snug">
                  Kế Thừa Di Sản Văn Hóa & Tâm Linh Phật Giáo
                </h3>
                <p className="text-[#093C5D]/80 dark:text-[#e8f7fd]/80 text-sm sm:text-base leading-relaxed max-w-2xl">
                  Chùa Báo Ân là chốn cổ tự linh thiêng lưu giữ truyền thống hoằng pháp lợi sinh và
                  tu tập thanh tịnh. Nơi hội tụ thiện duyên, hướng dẫn quý Phật tử tu dưỡng chánh
                  niệm và gieo trồng những phước điền cao quý.
                </p>
              </div>
              <div className="pt-4 border-t border-[#3B7597]/20 dark:border-[#6FD1D7]/25 flex items-center justify-between">
                <span className="text-xs font-semibold text-[#3B7597] dark:text-[#6FD1D7]">
                  Duy trì mạch nguồn chánh pháp lâu dài
                </span>
                <span className="text-xs font-serif italic text-[#093C5D]/80 dark:text-[#6FD1D7]">
                  Báo Ân Pháp Ấn
                </span>
              </div>
            </div>

            {/* Supporting Tiles Column (col-span-5 stack) */}
            <div className="lg:col-span-5 grid grid-cols-1 gap-6 sm:gap-8">
              {/* Tile 2 */}
              <div className="group rounded-3xl bg-white dark:bg-[#092134] border border-[#3B7597]/25 dark:border-[#6FD1D7]/30 p-8 flex flex-col justify-between space-y-6 hover:shadow-xl hover:border-[#3B7597]/60 transition-all duration-500">
                <div className="w-11 h-11 rounded-xl bg-[#093C5D]/15 dark:bg-[#5DF8D8]/15 flex items-center justify-center text-[#093C5D] dark:text-[#5DF8D8] group-hover:scale-110 transition-transform">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#093C5D] dark:text-white mb-2">
                    Gieo Mầm Từ Bi & Thiện Nguyện
                  </h3>
                  <p className="text-[#093C5D]/75 dark:text-[#e8f7fd]/75 text-sm leading-relaxed">
                    Thực hành hạnh nguyện cứu khổ ban vui, chia sẻ với những hoàn cảnh khó khăn qua
                    các hoạt động từ thiện và phóng sinh định kỳ.
                  </p>
                </div>
              </div>

              {/* Tile 3 */}
              <div className="group rounded-3xl bg-white dark:bg-[#092134] border border-[#3B7597]/25 dark:border-[#6FD1D7]/30 p-8 flex flex-col justify-between space-y-6 hover:shadow-xl hover:border-[#3B7597]/60 transition-all duration-500">
                <div className="w-11 h-11 rounded-xl bg-[#093C5D]/15 dark:bg-[#5DF8D8]/15 flex items-center justify-center text-[#093C5D] dark:text-[#5DF8D8] group-hover:scale-110 transition-transform">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#093C5D] dark:text-white mb-2">
                    Tu Học Chánh Niệm
                  </h3>
                  <p className="text-[#093C5D]/75 dark:text-[#e8f7fd]/75 text-sm leading-relaxed">
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
      <section id="events" className="py-24 bg-[#e8f4fa]/60 dark:bg-[#071b2b] border-y border-[#3B7597]/25 dark:border-[#6FD1D7]/25">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#3B7597] dark:text-[#6FD1D7]">
                Lịch Pháp Sự & Khóa Tu
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#093C5D] dark:text-white">
                Sự Kiện Phật Sự Sắp Diễn Ra
              </h2>
            </div>
            <p className="text-sm text-[#093C5D]/75 dark:text-[#e8f7fd]/75 max-w-md">
              Kính mời quý Phật tử sắp xếp thời gian quang lâm tham dự các thời khóa hành lễ trang
              nghiêm tại chùa.
            </p>
          </div>

          {/* Modern Timeline Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingEvents.map((evt) => {
              const formattedDate = evt.scheduled_date.includes('-')
                ? formatVietnamEventDate(evt.scheduled_date)
                : evt.scheduled_date

              return (
                <div
                  key={evt.id}
                  className="group relative bg-white dark:bg-[#092134] rounded-2xl p-7 border border-[#3B7597]/25 dark:border-[#6FD1D7]/30 shadow-sm hover:shadow-xl hover:border-[#3B7597]/60 hover:-translate-y-1.5 transition-all duration-500 flex flex-col justify-between space-y-6"
                >
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#e8f4fa] dark:bg-[#0c2c45] border border-[#6FD1D7]/40 text-[#093C5D] dark:text-[#5DF8D8] text-xs font-bold">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formattedDate}</span>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#093C5D] dark:text-white group-hover:text-[#3B7597] dark:group-hover:text-[#5DF8D8] transition-colors leading-snug">
                      {evt.title}
                    </h3>
                    {evt.description && (
                      <p className="text-[#093C5D]/75 dark:text-[#e8f7fd]/75 text-sm leading-relaxed line-clamp-3">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#3B7597]/20 dark:border-[#6FD1D7]/25 flex items-center justify-between text-xs font-semibold text-[#093C5D]/75 dark:text-[#e8f7fd]/75">
                    <span>Tại Chánh Điện Chùa Báo Ân</span>
                    <span className="text-[#3B7597] dark:text-[#6FD1D7] group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
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
              <span className="text-xs font-bold uppercase tracking-widest text-[#3B7597] dark:text-[#6FD1D7]">
                Bản Tin & Pháp Thoại
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#093C5D] dark:text-white">
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
                className="group flex flex-col bg-white dark:bg-[#092134] rounded-2xl border border-[#3B7597]/25 dark:border-[#6FD1D7]/30 overflow-hidden shadow-sm hover:shadow-2xl hover:border-[#3B7597]/60 hover:-translate-y-1.5 transition-all duration-500"
              >
                <div className="aspect-[16/10] w-full overflow-hidden relative bg-[#e8f4fa] dark:bg-[#0c2c45]">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#093C5D]/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase">
                    {item.category}
                  </div>
                </div>

                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="text-[11px] text-[#3B7597] dark:text-[#6FD1D7] font-medium">
                      {item.created_at}
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#093C5D] dark:text-white group-hover:text-[#3B7597] dark:group-hover:text-[#5DF8D8] transition-colors leading-snug line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-[#093C5D]/75 dark:text-[#e8f7fd]/75 text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {item.desc}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#3B7597]/20 dark:border-[#6FD1D7]/25 flex items-center justify-between text-xs font-semibold text-[#3B7597] dark:text-[#6FD1D7]">
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
      <section className="py-20 bg-gradient-to-br from-[#093C5D] via-[#0b486f] to-[#093C5D] text-white relative overflow-hidden border-t border-[#3B7597]/30">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#5DF8D8]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="mx-auto max-w-5xl px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#5DF8D8]">
              Chiêm Bái & Lễ Phật
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Bước Vào Chốn Tĩnh Lặng • Tìm Về An Nhiên
            </h2>
            <p className="mx-auto max-w-2xl text-white/90 text-sm sm:text-base leading-relaxed">
              Kính mời quý Phật tử và thiện hữu xa gần sắp xếp thời gian quang lâm nhà chùa chiêm bái,
              tham dự các thời khóa tu học và trải nghiệm đời sống chánh niệm thanh tịnh.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#events"
              className="inline-flex items-center gap-2 rounded-full bg-[#3B7597] hover:bg-[#2b5974] text-white px-8 py-4 text-sm font-bold shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <span>Xem Lịch Khóa Tu & Sự Kiện</span>
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* SANCTUARY EDITORIAL FOOTER */}
      <footer className="border-t border-[#3B7597]/25 dark:border-[#6FD1D7]/25 bg-white dark:bg-[#051420] py-14">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <PagodaLogo className="h-9 w-9" />
                <span className="font-serif text-lg font-bold text-[#093C5D] dark:text-white">
                  Chùa Báo Ân
                </span>
              </div>
              <p className="text-xs text-[#093C5D]/75 dark:text-[#e8f7fd]/75 max-w-md leading-relaxed">
                Địa chỉ: 53 Lê Bình, Phường Tân Sơn Nhất, Quận Tân Bình, TP. Hồ Chí Minh <br />
                Điện thoại liên hệ hành chính phật sự: 0901.234.567
              </p>
            </div>

            {/* Giờ hoạt động ở Footer */}
            <div className="bg-[#e8f4fa] dark:bg-[#092134] border border-[#3B7597]/30 px-6 py-4 rounded-2xl text-left md:text-right space-y-1.5 shadow-sm">
              <div className="flex items-center md:justify-end gap-2 text-[#3B7597] dark:text-[#6FD1D7] font-bold text-xs uppercase tracking-wider">
                <Clock className="h-4 w-4" />
                <span>Thời gian chùa hoạt động</span>
              </div>
              <p className="text-sm font-bold text-[#093C5D] dark:text-white">
                Sáng: (8:00 - 11:00) &nbsp;•&nbsp; Chiều: (14:00 - 20:00)
              </p>
              <p className="text-[11px] text-[#093C5D]/65 dark:text-[#e8f7fd]/65 italic">
                Mở cửa đón tiếp Phật tử & viếng chùa hàng ngày
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-[#3B7597]/20 dark:border-[#6FD1D7]/25 space-y-6">
            {/* Disclaimer Section */}
            <div className="bg-[#093C5D]/5 dark:bg-[#e8f7fd]/5 rounded-2xl p-6 border border-[#3B7597]/10 dark:border-[#6FD1D7]/10">
              <div className="space-y-4 text-xs md:text-sm text-[#093C5D]/80 dark:text-[#e8f7fd]/80 leading-relaxed text-justify md:text-left font-medium">
                <p className="font-bold text-[#3B7597] dark:text-[#6FD1D7] text-sm md:text-base mb-2">Nam mô Bổn Sư Thích Ca Mâu Ni Phật.</p>
                <p>Kính bạch Chư Tôn Đức Tăng Ni,<br/>Kính thưa Quý Phật tử gần xa,</p>
                <p>
                  Website của Chùa hiện đang trong quá trình xây dựng và hoàn thiện. Trong thời gian này, một số nội dung, giao diện hoặc chức năng có thể chưa đầy đủ, còn phát sinh sai sót hoặc hiển thị chưa đúng như mong muốn. Đội ngũ kỹ sư đang nỗ lực rà soát, chỉnh sửa và hoàn thiện từng chi tiết, với tâm nguyện sớm mang đến một trang thông tin trang nghiêm, dễ sử dụng và phục vụ tốt cho Quý Chư Tôn Đức cùng Quý Phật tử.
                </p>
                <p>
                  Kính mong Chư Tôn Đức và Quý Phật tử hoan hỷ cảm thông, bỏ qua những điều còn khiếm khuyết trong giai đoạn đầu này. Mọi ý kiến đóng góp hoặc báo lỗi xin hoan hỷ liên hệ báo về <strong>Phật tử Quảng Minh</strong> để khắc phục ngay, xin cảm ơn.
                </p>
                <p className="font-bold text-[#3B7597] dark:text-[#6FD1D7]">Nam mô Công Đức Lâm Bồ Tát Ma Ha Tát.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#093C5D]/65 dark:text-[#e8f7fd]/65">
              <p>© 2026 Chùa Báo Ân. Tất cả các quyền được bảo lưu trang nghiêm.</p>
              <Link
                href="/auth/login"
                className="text-[#3B7597] dark:text-[#6FD1D7] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Cổng Quản Trị Ban Trị Sự & Tăng Ni</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
