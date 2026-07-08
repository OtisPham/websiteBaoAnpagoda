import Link from 'next/link'
import { Compass, Heart, Sparkles, Home as HomeIcon, ChevronDown } from 'lucide-react'
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
  
  // Lấy phiên đăng nhập hiện tại nếu có
  const { data: { user } } = await supabase.auth.getUser()
  
  let role = 'USER'
  if (user) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role || 'USER'
  }

  // Lấy danh sách sự kiện từ DB (để hiển thị lên timeline Sự Kiện Sắp Tới)
  const { data: upcomingEventsData } = await supabase
    .from('events')
    .select('id, title, scheduled_date, description')
    .is('deleted_at', null)
    .order('scheduled_date', { ascending: true })

  const upcomingEvents = upcomingEventsData && upcomingEventsData.length > 0 ? upcomingEventsData : [
    {
      id: 'default-1',
      title: 'Đại Lễ Phật Đản',
      scheduled_date: '15 Tháng 4, Giáp Thìn',
      description: 'Kỷ niệm ngày Đức Thế Tôn đản sinh với các nghi thức tắm Phật và cầu nguyện quốc thái dân an.'
    },
    {
      id: 'default-2',
      title: 'Khóa Tu Một Ngày An Lạc',
      scheduled_date: 'Chủ Nhật Hàng Tuần',
      description: 'Ngày tu tập tập trung dành cho cư sĩ, trải nghiệm đời sống tỉnh thức giữa nhịp sống hối hả.'
    }
  ]

  // Danh sách hoạt động hàng ngày (6 ảnh)
  const activities = [
    {
      title: "Morning Chanting",
      desc: "4:30 AM - Tụng kinh buổi sớm",
      img: "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Meditation",
      desc: "Daily - Thiền hành & Thiền tọa",
      img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Retreat",
      desc: "Monthly - khóa tu ngắn hạn",
      img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Charity",
      desc: "Weekly - Hoạt động thiện nguyện",
      img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Ceremonies",
      desc: "Calendar - Các ngày đại lễ",
      img: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80"
    },
    {
      title: "Study",
      desc: "Weekend - Lớp học Phật Pháp",
      img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80"
    }
  ]

  // Lấy danh sách bài viết & tin tức đã xuất bản (PUBLISHED) từ DB Supabase
  const { data: publishedPostsData } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'PUBLISHED')
    .order('created_at', { ascending: false })
    .limit(6)

  const defaultNews = [
    {
      id: "demo-1",
      category: "THÔNG BÁO",
      title: "Thông báo về việc trùng tu chính điện",
      desc: "Chùa Báo Ân xin thông báo kế hoạch trùng tu hạng mục chính điện nhằm đảm bảo an toàn...",
      img: "https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "demo-2",
      category: "PHẬT PHÁP",
      title: "Hạnh phúc đến từ sự buông bỏ",
      desc: "Chia sẻ của Thầy Trụ Trì về cách tìm thấy niềm vui tự tại trong những điều giản đơn nhất của...",
      img: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80"
    },
    {
      id: "demo-3",
      category: "SỰ KIỆN",
      title: "Tổng kết khóa tu mùa hè cho thanh thiếu niên",
      desc: "Những khoảnh khắc xúc động và những bài học ý nghĩa mà các em học sinh đã trải qua trong 7...",
      img: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80"
    }
  ]

  const news = publishedPostsData && publishedPostsData.length > 0
    ? publishedPostsData.map((p: any) => ({
        id: p.id,
        category: p.category || 'PHẬT PHÁP',
        title: p.title || 'Bài viết mới',
        desc: typeof p.content === 'string' ? p.content.replace(/<[^>]*>?/gm, '').replace(/!\[.*?\]\(.*?\)/g, '').slice(0, 115) + '...' : '',
        img: p.thumbnail_url || 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=600&q=80'
      }))
    : defaultNews

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-stone-200/50 dark:border-stone-850">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 group">
              <PagodaLogo className="h-10 w-10 sm:h-11 sm:w-11 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
              <div className="flex flex-col">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-wider text-primary dark:text-amber-400 group-hover:text-amber-700 transition-colors">
                  Chùa Báo Ân
                </span>
                <span className="text-[9px] tracking-widest uppercase font-semibold text-stone-500 dark:text-stone-400 -mt-0.5">
                  Báo Ân Pagoda
                </span>
              </div>
            </Link>
            
            {/* Menu Links */}
            <nav className="hidden md:flex space-x-8 text-sm font-semibold text-neutral/80 dark:text-stone-300">
              <a href="#" className="text-primary border-b-2 border-primary pb-1">Home</a>
              <a href="#about" className="hover:text-primary transition pb-1">About Temple</a>
              <a href="#activities" className="hover:text-primary transition pb-1">Activities</a>
              <a href="#news" className="hover:text-primary transition pb-1">News</a>
              <a href="#events" className="hover:text-primary transition pb-1">Events</a>
              <a href="#gallery" className="hover:text-primary transition pb-1">Gallery</a>
            </nav>

            {/* Auth Button */}
            <div className="flex items-center gap-4">
              {user ? (
                <Link
                  href={role === 'USER' ? '/phat-tu' : '/dashboard'}
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary/95 transition"
                >
                  Trang cá nhân
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-primary/95 transition"
                >
                  Login/Register
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      <section className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image overlayed with slow zoom animation and gradient */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat animate-hero-bg"
          style={{ 
            backgroundImage: "url('/images/banner.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-black/45 dark:bg-black/60 backdrop-brightness-95"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 lg:px-8 text-center text-white space-y-8">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight animate-fade-in-up drop-shadow-md">
            Nơi Tìm Thấy Sự Bình An Giữa<br />Lòng Đời
          </h1>
          
          <p className="mx-auto max-w-3xl text-sm sm:text-base lg:text-lg text-stone-200/90 leading-relaxed font-light animate-fade-in-up-delay-1">
            Chào mừng quý Phật tử và thiện hữu xa gần ghé thăm Chùa Báo Ân – điểm tựa tâm linh cho tâm hồn xao động.
          </p>

          <div className="pt-4 flex flex-wrap gap-4 justify-center animate-fade-in-up-delay-2">
            <Link
              href="/auth/register"
              className="rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white hover:bg-primary/90 hover:scale-105 hover:shadow-xl hover:shadow-primary/40 active:scale-95 transition-all duration-300 shadow-lg"
            >
              Khám Phá Chùa
            </Link>
            <a
              href="#activities"
              className="rounded-full border border-white/80 bg-white/5 backdrop-blur-sm px-8 py-3.5 text-sm font-semibold text-white hover:bg-white hover:text-stone-900 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              Hoạt Động Phật Sự
            </a>
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <a href="#activities" className="text-white/70 hover:text-white transition-colors duration-300 block p-2">
            <ChevronDown className="h-7 w-7" />
          </a>
        </div>
      </section>

      {/* Lịch Sử & Sứ Mệnh Section */}
      <section id="about" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
          
          {/* Họa tiết hoa sen phân cách */}
          <div className="flex items-center justify-center gap-4">
            <div className="h-px bg-stone-300 dark:bg-stone-850 w-24"></div>
            <Compass className="h-5 w-5 text-primary" />
            <div className="h-px bg-stone-300 dark:bg-stone-850 w-24"></div>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral dark:text-white">
              Lịch Sử & Sứ Mệnh
            </h2>
          </div>

          {/* Grid 3 Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group bg-card-bg/30 dark:bg-[#1f1a18] p-8 rounded-2xl border border-stone-200/40 dark:border-stone-800 shadow-sm hover:shadow-2xl hover:shadow-amber-500/20 dark:hover:shadow-amber-500/15 hover:border-amber-400/80 dark:hover:border-amber-500/60 hover:bg-amber-50/50 dark:hover:bg-[#2c221a] hover:-translate-y-2 transition-all duration-500 ease-out space-y-6 cursor-pointer">
              <div className="text-primary group-hover:scale-110 group-hover:text-amber-600 transition-transform duration-300">
                <HomeIcon className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-neutral dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">Kế Thừa Di Sản</h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                Gìn giữ những giá trị tâm linh quý báu từ ngàn xưa, kết nối hiện tại với dòng chảy văn hóa Phật giáo Việt Nam trường tồn qua các thế hệ.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-card-bg/30 dark:bg-[#1f1a18] p-8 rounded-2xl border border-stone-200/40 dark:border-stone-800 shadow-sm hover:shadow-2xl hover:shadow-amber-500/20 dark:hover:shadow-amber-500/15 hover:border-amber-400/80 dark:hover:border-amber-500/60 hover:bg-amber-50/50 dark:hover:bg-[#2c221a] hover:-translate-y-2 transition-all duration-500 ease-out space-y-6 cursor-pointer">
              <div className="text-primary group-hover:scale-110 group-hover:text-amber-600 transition-transform duration-300">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-neutral dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">Gieo Mầm Từ Bi</h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                Thực hành hạnh nguyện cứu khổ ban vui, lan tỏa lòng nhân ái và sự thấu cảm đến cộng đồng qua các hoạt động thiện nguyện thiết thực.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-card-bg/30 dark:bg-[#1f1a18] p-8 rounded-2xl border border-stone-200/40 dark:border-stone-800 shadow-sm hover:shadow-2xl hover:shadow-amber-500/20 dark:hover:shadow-amber-500/15 hover:border-amber-400/80 dark:hover:border-amber-500/60 hover:bg-amber-50/50 dark:hover:bg-[#2c221a] hover:-translate-y-2 transition-all duration-500 ease-out space-y-6 cursor-pointer">
              <div className="text-primary group-hover:scale-110 group-hover:text-amber-600 transition-transform duration-300">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="font-serif text-xl font-bold text-neutral dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">Kiến Tạo Tương Lai</h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                Hướng đến sự giải thoát và an lạc trong tâm hồn thông qua việc giáo dục Phật pháp và rèn luyện chánh niệm cho mọi lứa tuổi.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Hoạt Động Hàng Ngày Section */}
      <section id="activities" className="hidden py-24 bg-card-bg/25 dark:bg-[#15110f]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
          
          <div className="flex justify-between items-end">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Thực hành & Tu tập</span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral dark:text-white">
                Hoạt Động Hàng Ngày
              </h2>
            </div>
            <a href="#" className="text-xs font-semibold text-neutral hover:text-primary underline transition">
              Tất cả hoạt động
            </a>
          </div>

          {/* Grid 6 ảnh hoạt động */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((act, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-[#1c1816] border border-stone-200/60 dark:border-stone-800 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500"
              >
                {/* Image container */}
                <div className="aspect-[4/3] w-full overflow-hidden bg-stone-100 dark:bg-stone-800">
                  <img
                    src={act.img}
                    alt={act.title}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                </div>
                {/* Metadata */}
                <div className="p-6 space-y-2">
                  <h4 className="font-serif text-lg font-bold text-neutral dark:text-white">
                    {act.title}
                  </h4>
                  <p className="text-stone-600 dark:text-stone-400 text-sm">
                    {act.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Sự Kiện Sắp Tới Section */}
      <section id="events" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-16">
          
          <div className="text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral dark:text-white">
              Sự Kiện Sắp Tới
            </h2>
          </div>

          {/* Timeline Layout */}
          <div className="relative max-w-3xl mx-auto">
            {/* Trục dọc timeline ở giữa */}
            <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-stone-300 dark:bg-stone-800 h-full"></div>

            {upcomingEvents.map((evt, idx) => {
              const isEven = idx % 2 === 0
              const formattedDate = evt.scheduled_date.includes('-') 
                ? formatVietnamEventDate(evt.scheduled_date) 
                : evt.scheduled_date

              return (
                <div key={evt.id} className="group relative grid grid-cols-2 gap-8 items-center mb-12 last:mb-0">
                  {isEven ? (
                    <>
                      {/* Cột trái: Ngày tháng */}
                      <div className="text-right pr-4">
                        <span className="font-serif text-lg sm:text-xl font-bold text-neutral dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {formattedDate}
                        </span>
                      </div>
                      {/* Chấm giữa */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10 group-hover:scale-150 group-hover:bg-amber-500 group-hover:shadow-lg group-hover:shadow-amber-500/50 transition-all duration-300"></div>
                      {/* Cột phải: Card nội dung */}
                      <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-250/50 dark:border-stone-800 shadow-sm hover:shadow-2xl hover:shadow-amber-500/25 dark:hover:shadow-amber-500/15 hover:border-amber-400 dark:hover:border-amber-500/80 hover:bg-amber-50/60 dark:hover:bg-[#2a2019] hover:-translate-y-1.5 transition-all duration-500 ease-out ml-4 cursor-pointer">
                        <h4 className="font-serif text-base font-bold text-neutral dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors mb-2">{evt.title}</h4>
                        {evt.description && (
                          <p className="text-stone-600 dark:text-stone-400 text-xs leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Cột trái: Card nội dung */}
                      <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-250/50 dark:border-stone-800 shadow-sm hover:shadow-2xl hover:shadow-amber-500/25 dark:hover:shadow-amber-500/15 hover:border-amber-400 dark:hover:border-amber-500/80 hover:bg-amber-50/60 dark:hover:bg-[#2a2019] hover:-translate-y-1.5 transition-all duration-500 ease-out mr-4 text-right cursor-pointer">
                        <h4 className="font-serif text-base font-bold text-neutral dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors mb-2">{evt.title}</h4>
                        {evt.description && (
                          <p className="text-stone-600 dark:text-stone-400 text-xs leading-relaxed">
                            {evt.description}
                          </p>
                        )}
                      </div>
                      {/* Chấm giữa */}
                      <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background z-10 group-hover:scale-150 group-hover:bg-amber-500 group-hover:shadow-lg group-hover:shadow-amber-500/50 transition-all duration-300"></div>
                      {/* Cột phải: Ngày tháng */}
                      <div className="pl-4">
                        <span className="font-serif text-lg sm:text-xl font-bold text-neutral dark:text-stone-300 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                          {formattedDate}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* Tin Tức & Thông Báo Section */}
      <section id="news" className="py-24 bg-card-bg/25 dark:bg-[#15110f]">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 space-y-12">
          
          <div className="text-center">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-neutral dark:text-white">
              Tin Tức & Thông Báo
            </h2>
          </div>

          {/* Grid 3 Card tin tức */}
          <div className="grid md:grid-cols-3 gap-8">
            {news.map((item, index) => (
              <Link key={index} href={`/tin-tuc/${item.id}`} className="space-y-4 cursor-pointer group block">
                {/* Image */}
                <div className="aspect-[1.5] w-full rounded-2xl overflow-hidden shadow-sm">
                  <img 
                    src={item.img} 
                    alt={item.title}
                    className="object-cover w-full h-full transition duration-500 group-hover:scale-105"
                  />
                </div>
                {/* Metadata */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-primary tracking-wider block uppercase">{item.category}</span>
                  <h4 className="font-serif text-lg font-bold text-neutral dark:text-white group-hover:text-primary transition leading-snug">
                    {item.title}
                  </h4>
                  <p className="text-stone-600 dark:text-stone-400 text-xs leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-250/60 dark:border-stone-850 bg-card-bg/20 dark:bg-[#0c0a09] py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-stone-500 dark:text-stone-400">
          <div className="space-y-2 text-center md:text-left">
            <p className="font-serif text-sm font-bold text-primary">Chùa Báo Ân</p>
            <p>Địa chỉ: 53 Lê Bình, Phường Tân Sơn Nhất, TP. Hồ Chí Minh</p>
            <p>Số điện thoại: 0901234567</p>
          </div>
          <div className="flex flex-col items-center md:items-end gap-2">
            <p>© 2026 Chùa Báo Ân. Bảo lưu mọi quyền.</p>
            <Link href="/auth/login" className="hover:text-primary transition flex items-center gap-1 font-semibold">
              Cổng quản trị Ban Trị Sự →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
