import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ChevronRight, BookOpen, Heart, Bell } from 'lucide-react'

const THEME = {
  bgLight: '#EEF5F7',
  textPrimary: '#0D3A4B',
  accentGold: '#D69F4C',
  accentTeal: '#5DA8A8',
  darkTeal: '#2B697D',
  white: '#FFFFFF',
}

export default function HomeScreen() {
  return (
    <div className="min-h-screen bg-[#EEF5F7] font-sans text-[#0D3A4B]">
      {/* Header */}
      <header className="flex justify-between items-center px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#D69F4C] flex items-center justify-center text-white font-serif font-bold text-xl">
            BA
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0D3A4B] leading-tight">Chùa Báo Ân</h1>
            <p className="text-[10px] text-[#2B697D] font-semibold tracking-widest">BÁO ÂN CỔ TỰ • PHÁP ẤN</p>
          </div>
        </div>
        <Link
          href="/auth/login"
          className="bg-[#0D3A4B] text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#0D3A4B]/90 transition"
        >
          Đăng Nhập
        </Link>
      </header>

      {/* Hero Section */}
      <section className="relative h-[450px] flex items-center justify-center bg-[#0D3A4B]">
        <div 
          className="absolute inset-0 bg-black/60 z-10"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=1200&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.4 }}
        />
        <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-2xl">
          <div className="bg-white/10 px-4 py-1.5 rounded-full border border-[#5DA8A8] mb-6 backdrop-blur-sm">
            <span className="text-[#D69F4C] text-[10px] font-bold tracking-widest">
              CHỐN TỔ THIỀN MÔN • BÌNH AN GIA ĐẠO
            </span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 leading-tight">
            Nơi Tìm Thấy Sự Bình An
          </h2>
          <h2 className="text-3xl md:text-5xl font-bold text-[#D69F4C] mb-6">
            Giữa Lòng Đời
          </h2>
          
          <p className="text-[#e8f7fd] text-sm md:text-base leading-relaxed mb-8">
            Chào mừng quý Phật tử và thiện hữu xa gần bước vào chốn thanh tịnh Chùa Báo Ân — điểm tựa tâm linh ấm cúng, nơi lắng nghe pháp thoại và tìm về chánh niệm vững vàng.
          </p>

          <Link href="#events" className="bg-[#2B697D] text-white px-6 py-3 rounded-full text-sm font-bold hover:bg-[#2B697D]/90 transition shadow-lg">
            Lịch Pháp Sự & Khóa Tu
          </Link>
        </div>
      </section>

      {/* Highlights */}
      <section className="px-4 -mt-8 relative z-30 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-md border border-slate-100">
          <div className="w-12 h-12 rounded-lg bg-[#D69F4C]/20 flex items-center justify-center text-[#D69F4C]">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs text-[#5DA8A8] font-semibold mb-1 uppercase">Tu Học Chánh Niệm</h3>
            <p className="text-sm font-bold text-[#0D3A4B]">Khóa Tu Tỉnh Thức Định Kỳ</p>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-md border border-slate-100">
          <div className="w-12 h-12 rounded-lg bg-[#D69F4C]/20 flex items-center justify-center text-[#D69F4C]">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs text-[#5DA8A8] font-semibold mb-1 uppercase">Hoằng Pháp Lợi Sinh</h3>
            <p className="text-sm font-bold text-[#0D3A4B]">Pháp Thoại & Kế Thừa Di Sản</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 flex items-center gap-4 shadow-md border border-slate-100">
          <div className="w-12 h-12 rounded-lg bg-[#D69F4C]/20 flex items-center justify-center text-[#D69F4C]">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xs text-[#5DA8A8] font-semibold mb-1 uppercase">Từ Bi Thiện Nguyện</h3>
            <p className="text-sm font-bold text-[#0D3A4B]">Lan Tỏa Yêu Thương</p>
          </div>
        </div>
      </section>

      {/* Lịch Pháp Sự */}
      <section id="events" className="py-16 px-4 max-w-5xl mx-auto">
        <div className="mb-10">
          <p className="text-[10px] font-bold text-[#5DA8A8] tracking-widest mb-2">LỊCH PHÁP SỰ & KHÓA TU</p>
          <h2 className="text-2xl font-bold text-[#0D3A4B]">Sự Kiện Sắp Diễn Ra</h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#2B697D]/10 shadow-sm hover:shadow-md transition">
            <span className="inline-block bg-[#F6FAFA] border border-[#5DA8A8]/30 px-3 py-1 rounded-lg text-xs font-bold text-[#0D3A4B] mb-4">
              15 Tháng 4, Giáp Thìn
            </span>
            <h3 className="text-lg font-bold text-[#0D3A4B] mb-2">Đại Lễ Phật Đản PL.2570</h3>
            <p className="text-sm text-[#0D3A4B]/70 leading-relaxed mb-4">
              Kỷ niệm ngày Đức Thế Tôn đản sinh với nghi thức tắm Phật trang nghiêm và đàn lễ cầu nguyện quốc thái dân an.
            </p>
            <div className="pt-4 border-t border-[#2B697D]/10 flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#0D3A4B]/70">Tại Chánh Điện Chùa Báo Ân</span>
              <a href="#" className="text-[11px] font-bold text-[#5DA8A8] flex items-center gap-1 hover:underline">Chi tiết <ChevronRight className="w-3 h-3" /></a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-[#2B697D]/10 shadow-sm hover:shadow-md transition">
            <span className="inline-block bg-[#F6FAFA] border border-[#5DA8A8]/30 px-3 py-1 rounded-lg text-xs font-bold text-[#0D3A4B] mb-4">
              Chủ Nhật Hàng Tuần
            </span>
            <h3 className="text-lg font-bold text-[#0D3A4B] mb-2">Khóa Tu Tỉnh Thức Một Ngày An Lạc</h3>
            <p className="text-sm text-[#0D3A4B]/70 leading-relaxed mb-4">
              Thời gian tu tập thanh tịnh dành cho quý cư sĩ Phật tử, thiền tọa chánh niệm và lắng nghe pháp thoại.
            </p>
            <div className="pt-4 border-t border-[#2B697D]/10 flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#0D3A4B]/70">Tại Chánh Điện Chùa Báo Ân</span>
              <a href="#" className="text-[11px] font-bold text-[#5DA8A8] flex items-center gap-1 hover:underline">Chi tiết <ChevronRight className="w-3 h-3" /></a>
            </div>
          </div>
        </div>
      </section>

      {/* Tin Tức & Thông Báo */}
      <section className="py-16 px-4 bg-[#F6FAFA] border-t border-[#2B697D]/10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p className="text-[10px] font-bold text-[#5DA8A8] tracking-widest mb-2">BẢN TIN & PHÁP THOẠI</p>
            <h2 className="text-2xl font-bold text-[#0D3A4B]">Tin Tức & Thông Báo Phật Sự</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl overflow-hidden border border-[#2B697D]/10 shadow-sm hover:shadow-md transition">
              <div className="h-48 relative bg-slate-200">
                <img src="https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=600&q=80" alt="News" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-[#0D3A4B]/90 px-3 py-1 rounded-md">
                  <span className="text-white text-[10px] font-bold tracking-wider">THÔNG BÁO PHẬT SỰ</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[11px] font-bold text-[#5DA8A8] mb-2">2026-07-10</p>
                <h3 className="text-base font-bold text-[#0D3A4B] mb-3 leading-snug">Thông báo lịch tu tập và thời khóa hành lễ định kỳ dịp Đại lễ</h3>
                <p className="text-sm text-[#0D3A4B]/70 line-clamp-2 mb-4">Chùa Báo Ân trân trọng kính báo đến toàn thể thiện nam tín nữ phật tử xa gần lịch trình khóa lễ và các buổi giảng pháp thoại...</p>
                <div className="pt-4 border-t border-[#2B697D]/10">
                  <a href="#" className="text-[11px] font-bold text-[#5DA8A8] hover:underline">Đọc toàn bộ bài viết →</a>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl overflow-hidden border border-[#2B697D]/10 shadow-sm hover:shadow-md transition">
              <div className="h-48 relative bg-slate-200">
                <img src="https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80" alt="News" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4 bg-[#0D3A4B]/90 px-3 py-1 rounded-md">
                  <span className="text-white text-[10px] font-bold tracking-wider">PHÁP THOẠI</span>
                </div>
              </div>
              <div className="p-6">
                <p className="text-[11px] font-bold text-[#5DA8A8] mb-2">2026-07-08</p>
                <h3 className="text-base font-bold text-[#0D3A4B] mb-3 leading-snug">Hạnh phúc đích thực đến từ tâm xả ly và bình an nội tại</h3>
                <p className="text-sm text-[#0D3A4B]/70 line-clamp-2 mb-4">Chia sẻ sâu sắc từ chốn thiền môn về nghệ thuật sống chánh niệm giữa những biến động của đời sống thường nhật...</p>
                <div className="pt-4 border-t border-[#2B697D]/10">
                  <a href="#" className="text-[11px] font-bold text-[#5DA8A8] hover:underline">Đọc toàn bộ bài viết →</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
