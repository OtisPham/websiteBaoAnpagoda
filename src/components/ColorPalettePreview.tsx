'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Check,
  Copy,
  Compass,
  Calendar,
  ArrowRight,
  Palette,
  Eye,
} from 'lucide-react'

export interface ColorTheme {
  id: string
  name: string
  subtitle: string
  badge: string
  description: string
  spiritualMeaning: string
  colors: {
    background: string
    foreground: string
    primary: string
    secondary: string
    accent: string
    cardBg: string
    border: string
    heroGradFrom: string
    heroGradTo: string
  }
  swatches: { name: string; hex: string; role: string }[]
}

export const PAGODA_COLOR_THEMES: ColorTheme[] = [
  {
    id: 'jade-gold',
    name: 'Xanh Ngọc Thiền & Vàng Kim Sen',
    subtitle: 'Jade Celadon & Temple Gold',
    badge: 'Khuyên Dùng Nhất Cho Chùa',
    description:
      'Tone xanh ngọc bích lụa nhạt thanh tịnh kết hợp với sắc vàng kim trang nghiêm của hoa sen và tượng Phật.',
    spiritualMeaning:
      'Xanh ngọc tượng trưng cho tâm thiền thanh tịnh, nhẫn nhục và trí tuệ sáng trong. Vàng kim tượng trưng cho ánh sáng Phật pháp bao trùm và sự vĩnh cửu.',
    colors: {
      background: '#EEF6F4',
      foreground: '#0F3C33',
      primary: '#113E35',
      secondary: '#2A6E60',
      accent: '#C8963E',
      cardBg: '#F8FCFA',
      border: '#D0E7E1',
      heroGradFrom: '#113E35',
      heroGradTo: '#0C2D26',
    },
    swatches: [
      { name: 'Nền Thanh Tịnh', hex: '#EEF6F4', role: 'Background' },
      { name: 'Xanh Ngọc Bích', hex: '#113E35', role: 'Primary & Text' },
      { name: 'Vàng Kim Sen', hex: '#C8963E', role: 'Accent & Button' },
      { name: 'Ngọc Lụa Sáng', hex: '#F8FCFA', role: 'Card Background' },
      { name: 'Nâu Trầm Hương', hex: '#8A5E38', role: 'Warm Wood Detail' },
    ],
  },
  {
    id: 'serene-teal',
    name: 'Xanh Lam Thanh Tịnh & Vàng Đồng',
    subtitle: 'Serene Teal & Warm Temple Bronze',
    badge: 'Hiện Đại & Uy Nghiêm',
    description:
      'Sắc xanh lam sương mai dịu mát kết hợp với xanh chàm sâu và ánh vàng đồng cổ kính vương giả.',
    spiritualMeaning:
      'Xanh lam đại diện cho lòng từ bi và biển tuệ vô biên. Vàng đồng cổ mang lại cảm giác vững chãi, uy nghi trường tồn của ngôi bảo tháp.',
    colors: {
      background: '#EEF5F7',
      foreground: '#0D3A4B',
      primary: '#0D3A4B',
      secondary: '#2B697D',
      accent: '#D69F4C',
      cardBg: '#F6FAFA',
      border: '#CCE0E8',
      heroGradFrom: '#0D3A4B',
      heroGradTo: '#082531',
    },
    swatches: [
      { name: 'Sương Mai Lam', hex: '#EEF5F7', role: 'Background' },
      { name: 'Lam Chàm Sâu', hex: '#0D3A4B', role: 'Primary & Text' },
      { name: 'Vàng Đồng Cổ', hex: '#D69F4C', role: 'Accent & Button' },
      { name: 'Trắng Lam Ngọc', hex: '#F6FAFA', role: 'Card Background' },
      { name: 'Ngọc Bích Nhạt', hex: '#5DA8A8', role: 'Secondary Highlight' },
    ],
  },
  {
    id: 'forest-moss',
    name: 'Xanh Rêu Cổ Kính & Trắng Gốm Sứ',
    subtitle: 'Forest Moss & Porcelain Cream',
    badge: 'Mộc Mạc & Thiền Vị',
    description:
      'Cảm giác thanh tịnh giữa rừng thông thiền tịnh mạc, phối cùng màu trắng gốm sứ tinh khôi và vàng trầm hương.',
    spiritualMeaning:
      'Xanh rêu tượng trưng cho tịnh thất ẩn mình giữa thiên nhiên, hòa hợp thân tâm. Trắng gốm sứ và vàng trầm hương tôn lên nét thuần khiết vô ngã.',
    colors: {
      background: '#EAF0EB',
      foreground: '#1B3B2B',
      primary: '#1B3B2B',
      secondary: '#366049',
      accent: '#B8860B',
      cardBg: '#FBFDFB',
      border: '#CFDCD3',
      heroGradFrom: '#1B3B2B',
      heroGradTo: '#11251B',
    },
    swatches: [
      { name: 'Rêu Khói Dịu', hex: '#EAF0EB', role: 'Background' },
      { name: 'Rêu Thông Thẳm', hex: '#1B3B2B', role: 'Primary & Text' },
      { name: 'Vàng Trầm Hương', hex: '#B8860B', role: 'Accent & Button' },
      { name: 'Trắng Gốm Sứ', hex: '#FBFDFB', role: 'Card Background' },
      { name: 'Cam Sen Nhạt', hex: '#E8A578', role: 'Warm Peach Lotus' },
    ],
  },
]

export default function ColorPalettePreview() {
  const [activeThemeId, setActiveThemeId] = useState<string>('serene-teal')
  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'interactive' | 'side-by-side'>('interactive')

  const activeTheme =
    PAGODA_COLOR_THEMES.find((t) => t.id === activeThemeId) || PAGODA_COLOR_THEMES[0]

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex)
    setCopiedHex(hex)
    setTimeout(() => setCopiedHex(null), 2000)
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500"
      style={{ backgroundColor: activeTheme.colors.background, color: activeTheme.colors.foreground }}>
      <div className="max-w-7xl mx-auto">
        {/* Header Preview Controls */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 shadow-sm border"
            style={{ 
              backgroundColor: activeTheme.colors.cardBg, 
              color: activeTheme.colors.accent,
              borderColor: activeTheme.colors.border 
            }}>
            <Palette className="w-4 h-4" />
            Trực Quan Bộ Màu Trang Web Chùa Bảo An
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold tracking-tight mb-4"
            style={{ color: activeTheme.colors.primary }}>
            Trải Nghiệm Phối Màu Xanh Thiền Định
          </h1>
          <p className="max-w-2xl mx-auto text-sm sm:text-base opacity-85 leading-relaxed">
            Chọn một trong 3 phương án dưới đây để xem giao diện Chùa Bảo An thay đổi trực tiếp với màu nền, màu chữ, điểm nhấn hoa sen vàng và thẻ bài viết.
          </p>

          {/* View Mode Toggle */}
          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm flex items-center gap-2 ${
                viewMode === 'interactive' ? 'ring-2 ring-offset-2' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: viewMode === 'interactive' ? activeTheme.colors.primary : activeTheme.colors.cardBg,
                color: viewMode === 'interactive' ? '#ffffff' : activeTheme.colors.foreground,
              }}
            >
              <Eye className="w-4 h-4" />
              Xem Trải Nghiệm Sống Động
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all shadow-sm flex items-center gap-2 ${
                viewMode === 'side-by-side' ? 'ring-2 ring-offset-2' : 'opacity-70 hover:opacity-100'
              }`}
              style={{
                backgroundColor: viewMode === 'side-by-side' ? activeTheme.colors.primary : activeTheme.colors.cardBg,
                color: viewMode === 'side-by-side' ? '#ffffff' : activeTheme.colors.foreground,
              }}
            >
              <Compass className="w-4 h-4" />
              So Sánh 3 Phương Án Cạnh Nhau
            </button>
          </div>
        </div>

        {/* Theme Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {PAGODA_COLOR_THEMES.map((theme) => {
            const isSelected = theme.id === activeThemeId
            return (
              <button
                key={theme.id}
                onClick={() => setActiveThemeId(theme.id)}
                className={`p-5 rounded-2xl text-left transition-all duration-300 border relative overflow-hidden ${
                  isSelected
                    ? 'shadow-xl scale-[1.02] ring-2'
                    : 'shadow-md hover:shadow-lg opacity-85 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: theme.colors.cardBg,
                  borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                  boxShadow: isSelected ? `0 12px 30px -10px ${theme.colors.primary}33` : undefined,
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: `${theme.colors.accent}20`,
                      color: theme.colors.accent,
                    }}
                  >
                    {theme.badge}
                  </span>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: theme.colors.accent }}>
                      <Check className="w-4 h-4" />
                      Đang chọn
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-serif font-bold mb-1" style={{ color: theme.colors.primary }}>
                  {theme.name}
                </h3>
                <p className="text-xs opacity-75 mb-4">{theme.subtitle}</p>

                {/* Swatch Mini Bar */}
                <div className="flex items-center gap-1.5">
                  {theme.swatches.map((s, idx) => (
                    <div
                      key={idx}
                      className="h-6 flex-1 rounded-md border border-black/10 transition-transform hover:scale-110"
                      style={{ backgroundColor: s.hex }}
                      title={`${s.name} (${s.hex})`}
                    />
                  ))}
                </div>
              </button>
            )
          })}
        </div>

        {/* INTERACTIVE MODE PREVIEW */}
        {viewMode === 'interactive' && (
          <div className="space-y-10">
            {/* Swatch Detail & Meaning */}
            <div className="p-6 sm:p-8 rounded-3xl border shadow-lg transition-all"
              style={{ backgroundColor: activeTheme.colors.cardBg, borderColor: activeTheme.colors.border }}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <h3 className="text-xl font-serif font-bold mb-2" style={{ color: activeTheme.colors.primary }}>
                    Ý Nghĩa Tâm Linh & Thẩm Mỹ
                  </h3>
                  <p className="text-sm leading-relaxed mb-4 opacity-85">
                    {activeTheme.description}
                  </p>
                  <div className="p-4 rounded-xl border-l-4 text-xs sm:text-sm leading-relaxed"
                    style={{
                      backgroundColor: `${activeTheme.colors.accent}15`,
                      borderLeftColor: activeTheme.colors.accent,
                      color: activeTheme.colors.foreground,
                    }}>
                    {activeTheme.spiritualMeaning}
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <h4 className="text-sm font-semibold uppercase tracking-wider mb-4 opacity-80">
                    Bảng Mã Màu Chi Tiết (Nhấp để sao chép Hex)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    {activeTheme.swatches.map((swatch) => (
                      <div
                        key={swatch.hex}
                        onClick={() => handleCopyHex(swatch.hex)}
                        className="group cursor-pointer p-3 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-md"
                        style={{
                          backgroundColor: '#ffffff',
                          borderColor: activeTheme.colors.border,
                        }}
                      >
                        <div
                          className="h-14 w-full rounded-xl mb-2.5 border shadow-inner flex items-center justify-center relative overflow-hidden"
                          style={{ backgroundColor: swatch.hex }}
                        >
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Copy className="w-3 h-3" /> Copy
                          </span>
                        </div>
                        <div className="text-xs font-bold truncate text-gray-800">{swatch.name}</div>
                        <div className="text-[11px] font-mono text-gray-500 flex items-center justify-between">
                          <span>{swatch.hex}</span>
                          {copiedHex === swatch.hex && (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 truncate mt-0.5">{swatch.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE WEBSITE MOCKUP PREVIEW */}
            <div className="rounded-3xl border-2 shadow-2xl overflow-hidden transition-all"
              style={{ borderColor: activeTheme.colors.border }}>
              {/* Mockup Browser Bar */}
              <div className="px-4 py-3 bg-gray-900 text-white flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-2 font-mono opacity-80">chua-bao-an.org — Trải nghiệm giao diện</span>
                </div>
                <span className="font-semibold text-amber-400">{activeTheme.name}</span>
              </div>

              {/* Simulated Pagoda Header */}
              <header
                className="px-6 py-4 flex items-center justify-between border-b"
                style={{
                  backgroundColor: activeTheme.colors.cardBg,
                  borderColor: activeTheme.colors.border,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
                    style={{ backgroundColor: activeTheme.colors.primary, color: activeTheme.colors.accent }}>
                    <Compass className="w-6 h-6 animate-spin-slow" />
                  </div>
                  <div>
                    <h2 className="font-serif font-bold text-lg leading-tight" style={{ color: activeTheme.colors.primary }}>
                      CHÙA BẢO AN
                    </h2>
                    <p className="text-[10px] tracking-widest uppercase opacity-75">
                      Đạo Pháp & Dân Tộc
                    </p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-sm font-medium">
                  <span className="hover:opacity-100 opacity-85 cursor-pointer">Trang Chủ</span>
                  <span className="hover:opacity-100 opacity-85 cursor-pointer">Giới Thiệu</span>
                  <span className="hover:opacity-100 opacity-85 cursor-pointer">Phật Sự & Lễ Hội</span>
                  <span className="hover:opacity-100 opacity-85 cursor-pointer">Kinh Sách</span>
                </div>
                <button
                  className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-transform hover:scale-105 shadow-md"
                  style={{
                    backgroundColor: activeTheme.colors.accent,
                    color: '#ffffff',
                  }}
                >
                  Cúng Dường Tam Bảo
                </button>
              </header>

              {/* Simulated Hero Section */}
              <section
                className="py-16 px-6 text-center relative overflow-hidden text-white"
                style={{
                  background: `linear-gradient(135deg, ${activeTheme.colors.heroGradFrom} 0%, ${activeTheme.colors.heroGradTo} 100%)`,
                }}
              >
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />
                <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                  <div
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest border border-white/20 bg-white/10 backdrop-blur-md"
                    style={{ color: activeTheme.colors.accent }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Đạo Pháp Trường Tồn — Tâm Thanh Tịnh
                  </div>
                  <h2 className="text-3xl sm:text-5xl font-serif font-bold tracking-tight leading-tight">
                    Chào Mừng Quý Phật Tử Đến Với Ngôi Nhà Tâm Linh Chùa Bảo An
                  </h2>
                  <p className="text-sm sm:text-base text-white/85 max-w-2xl mx-auto leading-relaxed">
                    Nơi quay về an trú trong chánh niệm, thanh lọc thân tâm giữa muôn trùng vội vã. Kính mời quý thiện hữu tri thức cùng tu tập hành lễ.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                    <button
                      className="px-6 py-3 rounded-full font-bold text-sm shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                      style={{
                        backgroundColor: activeTheme.colors.accent,
                        color: '#111827',
                      }}
                    >
                      Lịch Lễ Phật Sự Sắp Tới
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      className="px-6 py-3 rounded-full font-semibold text-sm border border-white/30 bg-white/10 hover:bg-white/20 transition-all text-white"
                    >
                      Đăng Ký Khóa Tu
                    </button>
                  </div>
                </div>
              </section>

              {/* Simulated Content Section (Cards & Announcements) */}
              <section
                className="py-12 px-6"
                style={{ backgroundColor: activeTheme.colors.background }}
              >
                <div className="max-w-5xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: activeTheme.colors.accent }}>
                        Phật Sự Nổi Bật
                      </span>
                      <h3 className="text-2xl font-serif font-bold" style={{ color: activeTheme.colors.primary }}>
                        Tin Tức & Thông Báo Định Kỳ
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      {
                        category: 'ĐẠI LỄ PHẬT ĐẢN',
                        title: 'Thông báo chương trình Đại Lễ Phật Đản PL.2570 trang nghiêm',
                        date: '15 Tháng 4 Âm Lịch',
                      },
                      {
                        category: 'KHÓA TU AN LẠC',
                        title: 'Khóa tu thiền tọa và tụng kinh chánh niệm định kỳ Chủ Nhật',
                        date: 'Chủ Nhật Hàng Tuần',
                      },
                      {
                        category: 'TỪ THIỆN PHẬT GIÁO',
                        title: 'Chương trình sẻ chia yêu thương tặng quà cho bà con vùng xa',
                        date: '30 Tháng Này',
                      },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="p-6 rounded-2xl border transition-all hover:-translate-y-1.5 shadow-md flex flex-col justify-between"
                        style={{
                          backgroundColor: activeTheme.colors.cardBg,
                          borderColor: activeTheme.colors.border,
                        }}
                      >
                        <div>
                          <div
                            className="text-[11px] font-bold uppercase tracking-wider mb-2"
                            style={{ color: activeTheme.colors.accent }}
                          >
                            {item.category}
                          </div>
                          <h4 className="font-serif font-bold text-base mb-3 leading-snug" style={{ color: activeTheme.colors.primary }}>
                            {item.title}
                          </h4>
                        </div>
                        <div className="pt-4 mt-2 border-t flex items-center justify-between text-xs opacity-75"
                          style={{ borderColor: activeTheme.colors.border }}>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {item.date}
                          </span>
                          <span className="font-semibold flex items-center gap-1 hover:underline cursor-pointer" style={{ color: activeTheme.colors.primary }}>
                            Xem chi tiết <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* SIDE BY SIDE PREVIEW MODE */}
        {viewMode === 'side-by-side' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {PAGODA_COLOR_THEMES.map((theme) => (
              <div
                key={theme.id}
                className="rounded-3xl border-2 overflow-hidden shadow-xl flex flex-col justify-between"
                style={{
                  backgroundColor: theme.colors.background,
                  borderColor: theme.id === activeThemeId ? theme.colors.accent : theme.colors.border,
                }}
              >
                <div>
                  {/* Card Header */}
                  <div className="p-6 border-b" style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold uppercase px-3 py-1 rounded-full"
                        style={{ backgroundColor: `${theme.colors.accent}20`, color: theme.colors.accent }}>
                        {theme.badge}
                      </span>
                    </div>
                    <h3 className="text-xl font-serif font-bold" style={{ color: theme.colors.primary }}>
                      {theme.name}
                    </h3>
                    <p className="text-xs opacity-75 mt-1">{theme.subtitle}</p>
                  </div>

                  {/* Mini Hero Mockup */}
                  <div className="p-6 text-white text-center"
                    style={{ background: `linear-gradient(135deg, ${theme.colors.heroGradFrom}, ${theme.colors.heroGradTo})` }}>
                    <div className="text-xs font-serif opacity-90 uppercase tracking-widest mb-1">Chùa Bảo An</div>
                    <h4 className="font-serif font-bold text-lg mb-3">Tâm Thanh Tịnh - Đạo Trang Nghiêm</h4>
                    <button className="px-4 py-1.5 rounded-full text-xs font-bold text-gray-900 shadow-md"
                      style={{ backgroundColor: theme.colors.accent }}>
                      Nút Cúng Dường / Khóa Tu
                    </button>
                  </div>

                  {/* Sample Card Mockup */}
                  <div className="p-6">
                    <div className="p-4 rounded-2xl border shadow-sm"
                      style={{ backgroundColor: theme.colors.cardBg, borderColor: theme.colors.border }}>
                      <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: theme.colors.accent }}>
                        Thông báo Phật sự
                      </div>
                      <div className="font-serif font-semibold text-sm leading-snug mb-2" style={{ color: theme.colors.primary }}>
                        Đại lễ Phật Đản PL.2570 chánh niệm
                      </div>
                      <div className="text-xs opacity-75 flex items-center justify-between">
                        <span>15/04 Âm Lịch</span>
                        <span style={{ color: theme.colors.primary }} className="font-semibold">Chi tiết →</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Select Button */}
                <div className="p-6 pt-0">
                  <button
                    onClick={() => setActiveThemeId(theme.id)}
                    className="w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: theme.id === activeThemeId ? theme.colors.accent : theme.colors.primary,
                      color: theme.id === activeThemeId ? '#111827' : '#ffffff',
                    }}
                  >
                    {theme.id === activeThemeId ? (
                      <>
                        <Check className="w-4 h-4" /> Đang Xem Phương Án Này
                      </>
                    ) : (
                      'Chọn Xem Chi Tiết'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
