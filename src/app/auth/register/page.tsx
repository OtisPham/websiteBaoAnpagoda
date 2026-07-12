'use client'

import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  RefreshCw,
  Eye,
  EyeOff,
  ArrowLeft,
  Lock,
  Mail,
  User,
  Phone,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import PagodaLogo from '@/components/PagodaLogo'
import { signup } from '../actions'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [error, setError] = useState(urlError || '')
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await signup(formData)
      if (res.success) {
        router.push(
          '/auth/login?message=' +
            encodeURIComponent('Đăng ký thành công! Vui lòng đăng nhập.')
        )
      } else {
        setError(res.error || 'Có lỗi xảy ra trong quá trình đăng ký.')
      }
    })
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#f6faf3] dark:bg-[#0f1614] text-[#1c2b27] dark:text-[#E6F2DD] selection:bg-[#88BDA4]/30">
      {/* Left Column: Sanctuary Visual & Philosophy */}
      <div className="hidden lg:flex lg:col-span-7 relative overflow-hidden bg-gradient-to-br from-[#172421] via-[#1f312c] to-[#243732] p-14 flex-col justify-between border-r border-[#659287]/30">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105"
          style={{ backgroundImage: "url('/images/avatarofficial.png')" }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#88BDA4]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <PagodaLogo className="h-11 w-11 transition-transform duration-500 group-hover:scale-105" />
            <div>
              <span className="font-serif text-xl font-bold tracking-wide text-[#E6F2DD] block">
                Chùa Báo Ân
              </span>
              <span className="text-[10px] tracking-[0.24em] uppercase font-semibold text-[#88BDA4] block">
                Bổn Tự Pháp Ấn
              </span>
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#88BDA4] text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-[#88BDA4]" />
            <span>Chốn Tổ Thiền Môn</span>
          </div>
        </div>

        <div className="relative z-10 max-w-xl space-y-6">
          <div className="inline-block px-3.5 py-1 rounded-lg bg-[#88BDA4]/15 border border-[#88BDA4]/30 text-[#88BDA4] text-xs font-bold uppercase tracking-widest">
            Tạo Tài Khoản Phật Tử
          </div>
          <h1 className="font-serif text-4xl xl:text-5xl font-bold text-white leading-[1.2]">
            Hương linh siêu thoát • <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E6F2DD] via-[#B1D3B9] to-[#88BDA4]">
              Gia đạo trường an
            </span>
          </h1>
          <p className="text-[#E6F2DD]/85 text-sm xl:text-base leading-relaxed font-light">
            Tạo tài khoản Phật tử để kết nối cùng Chùa Báo Ân, cập nhật tin tức phật sự, thông báo
            khóa tu và quản lý thông tin phật tử tiện lợi.
          </p>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/10 flex items-center justify-between text-xs text-[#B1D3B9]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#88BDA4]" />
            <span>Thông tin được bảo mật trang nghiêm tuyệt đối</span>
          </div>
          <span>© 2026 Chùa Báo Ân</span>
        </div>
      </div>

      {/* Right Column: Editorial Register Form Card */}
      <div className="lg:col-span-5 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-14 relative">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-[#B1D3B9]/40 dark:border-[#659287]/30">
            <Link href="/" className="flex items-center gap-2.5">
              <PagodaLogo className="h-9 w-9" />
              <span className="font-serif text-lg font-bold text-[#1c2b27] dark:text-white">
                Chùa Báo Ân
              </span>
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-[#659287] dark:text-[#88BDA4] inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Trang chủ
            </Link>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-[#1c2b27] dark:text-white">
              Đăng Ký Tài Khoản
            </h2>
            <p className="text-sm text-[#1c2b27]/75 dark:text-[#E6F2DD]/75">
              Đã có tài khoản Phật tử?{' '}
              <Link
                href="/auth/login"
                className="font-semibold text-[#659287] hover:text-[#52786e] dark:text-[#88BDA4] dark:hover:text-[#B1D3B9] underline underline-offset-4 transition"
              >
                Đăng nhập ngay
              </Link>
            </p>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4 border border-red-200 dark:border-red-800/80 animate-fade-in">
              <p className="text-xs font-semibold text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="block text-xs font-bold uppercase tracking-wider text-[#1c2b27] dark:text-[#E6F2DD]"
              >
                Họ và Tên Phật Tử <span className="text-[#659287] dark:text-[#88BDA4]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#659287]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Diệu Pháp / Nguyễn Văn A"
                  className="block w-full rounded-xl border border-[#88BDA4]/50 dark:border-[#659287]/40 bg-white dark:bg-[#16201c] pl-10 pr-4 py-3 text-sm text-[#1c2b27] dark:text-white placeholder-[#659287]/60 focus:border-[#659287] focus:outline-none focus:ring-2 focus:ring-[#88BDA4]/30 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="phone"
                className="block text-xs font-bold uppercase tracking-wider text-[#1c2b27] dark:text-[#E6F2DD]"
              >
                Số điện thoại liên lạc
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#659287]">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0901234567"
                  className="block w-full rounded-xl border border-[#88BDA4]/50 dark:border-[#659287]/40 bg-white dark:bg-[#16201c] pl-10 pr-4 py-3 text-sm text-[#1c2b27] dark:text-white placeholder-[#659287]/60 focus:border-[#659287] focus:outline-none focus:ring-2 focus:ring-[#88BDA4]/30 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#1c2b27] dark:text-[#E6F2DD]"
              >
                Địa chỉ Email <span className="text-[#659287] dark:text-[#88BDA4]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#659287]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="phattu@example.com"
                  className="block w-full rounded-xl border border-[#88BDA4]/50 dark:border-[#659287]/40 bg-white dark:bg-[#16201c] pl-10 pr-4 py-3 text-sm text-[#1c2b27] dark:text-white placeholder-[#659287]/60 focus:border-[#659287] focus:outline-none focus:ring-2 focus:ring-[#88BDA4]/30 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#1c2b27] dark:text-[#E6F2DD]"
              >
                Mật khẩu <span className="text-[#659287] dark:text-[#88BDA4]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#659287]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  className="block w-full rounded-xl border border-[#88BDA4]/50 dark:border-[#659287]/40 bg-white dark:bg-[#16201c] pl-10 pr-12 py-3 text-sm text-[#1c2b27] dark:text-white placeholder-[#659287]/60 focus:border-[#659287] focus:outline-none focus:ring-2 focus:ring-[#88BDA4]/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#659287] hover:text-[#1c2b27] dark:hover:text-[#E6F2DD] transition"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#659287] to-[#4e746a] hover:from-[#578177] hover:to-[#43645b] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#1c2b27]/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
              >
                {isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Đang xử lý đăng ký...</span>
                  </>
                ) : (
                  <span>Đăng Ký Tài Khoản</span>
                )}
              </button>
            </div>
          </form>

          <div className="pt-6 border-t border-[#B1D3B9]/40 dark:border-[#659287]/30 flex items-center justify-between text-xs font-medium text-[#1c2b27]/70 dark:text-[#E6F2DD]/70">
            <Link
              href="/"
              className="hover:text-[#659287] dark:hover:text-[#88BDA4] transition inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Quay lại Trang Chủ Chùa Báo Ân</span>
            </Link>
            <span>Bổn Tự Pháp Ấn</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f6faf3] dark:bg-[#0f1614]">
          <div className="text-sm font-serif italic text-[#659287]">Đang tải trang đăng ký...</div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  )
}
