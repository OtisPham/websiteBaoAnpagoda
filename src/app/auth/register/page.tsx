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
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#f4f9fc] dark:bg-[#051420] text-[#093C5D] dark:text-[#e8f7fd] selection:bg-[#6FD1D7]/35">
      {/* Left Column: Sanctuary Visual & Philosophy */}
      <div className="hidden lg:flex lg:col-span-7 relative overflow-hidden bg-gradient-to-br from-[#062134] via-[#093C5D] to-[#0d4a70] p-14 flex-col justify-between border-r border-[#3B7597]/40">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 mix-blend-luminosity scale-105"
          style={{ backgroundImage: "url('/images/avatarofficial.png')" }}
        />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#5DF8D8]/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3.5 group">
            <PagodaLogo className="h-11 w-11 transition-transform duration-500 group-hover:scale-105" />
            <div>
              <span className="font-serif text-xl font-bold tracking-wide text-white block">
                Chùa Báo Ân
              </span>
              <span className="text-[10px] tracking-[0.24em] uppercase font-semibold text-[#5DF8D8] block">
                Bổn Tự Pháp Ấn
              </span>
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#5DF8D8] text-xs font-medium">
            <Sparkles className="h-3.5 w-3.5 text-[#5DF8D8]" />
            <span>Chốn Tổ Thiền Môn</span>
          </div>
        </div>

        <div className="relative z-10 max-w-xl space-y-6">
          <div className="inline-block px-3.5 py-1 rounded-lg bg-[#5DF8D8]/15 border border-[#5DF8D8]/30 text-[#5DF8D8] text-xs font-bold uppercase tracking-widest">
            Tạo Tài Khoản Phật Tử
          </div>
          <h1 className="font-serif text-4xl xl:text-5xl font-bold text-white leading-[1.2]">
            Hương linh siêu thoát • <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5DF8D8] via-[#6FD1D7] to-white">
              Gia đạo trường an
            </span>
          </h1>
          <p className="text-white/85 text-sm xl:text-base leading-relaxed font-light">
            Tạo tài khoản Phật tử để kết nối cùng Chùa Báo Ân, cập nhật tin tức phật sự, thông báo
            khóa tu và quản lý thông tin phật tử tiện lợi.
          </p>
        </div>

        <div className="relative z-10 pt-8 border-t border-white/15 flex items-center justify-between text-xs text-[#6FD1D7]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#5DF8D8]" />
            <span>Thông tin được bảo mật trang nghiêm tuyệt đối</span>
          </div>
          <span>© 2026 Chùa Báo Ân</span>
        </div>
      </div>

      {/* Right Column: Editorial Register Form Card */}
      <div className="lg:col-span-5 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-14 relative">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-between pb-4 border-b border-[#3B7597]/25 dark:border-[#6FD1D7]/25">
            <Link href="/" className="flex items-center gap-2.5">
              <PagodaLogo className="h-9 w-9" />
              <span className="font-serif text-lg font-bold text-[#093C5D] dark:text-white">
                Chùa Báo Ân
              </span>
            </Link>
            <Link
              href="/"
              className="text-xs font-semibold text-[#3B7597] dark:text-[#6FD1D7] inline-flex items-center gap-1"
            >
              <ArrowLeft className="h-3 w-3" /> Trang chủ
            </Link>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-[#093C5D] dark:text-white">
              Đăng Ký Tài Khoản
            </h2>
            <p className="text-sm text-[#093C5D]/75 dark:text-[#e8f7fd]/75">
              Đã có tài khoản Phật tử?{' '}
              <Link
                href="/auth/login"
                className="font-semibold text-[#3B7597] hover:text-[#093C5D] dark:text-[#6FD1D7] dark:hover:text-[#5DF8D8] underline underline-offset-4 transition"
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
                className="block text-xs font-bold uppercase tracking-wider text-[#093C5D] dark:text-[#e8f7fd]"
              >
                Họ và Tên Phật Tử <span className="text-[#3B7597] dark:text-[#6FD1D7]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3B7597]">
                  <User className="h-4 w-4" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Diệu Pháp / Nguyễn Văn A"
                  className="block w-full rounded-xl border border-[#3B7597]/40 dark:border-[#6FD1D7]/40 bg-white dark:bg-[#092134] pl-10 pr-4 py-3 text-sm text-[#093C5D] dark:text-white placeholder-[#3B7597]/60 focus:border-[#3B7597] focus:outline-none focus:ring-2 focus:ring-[#6FD1D7]/40 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="phone"
                className="block text-xs font-bold uppercase tracking-wider text-[#093C5D] dark:text-[#e8f7fd]"
              >
                Số điện thoại liên lạc
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3B7597]">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0901234567"
                  className="block w-full rounded-xl border border-[#3B7597]/40 dark:border-[#6FD1D7]/40 bg-white dark:bg-[#092134] pl-10 pr-4 py-3 text-sm text-[#093C5D] dark:text-white placeholder-[#3B7597]/60 focus:border-[#3B7597] focus:outline-none focus:ring-2 focus:ring-[#6FD1D7]/40 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#093C5D] dark:text-[#e8f7fd]"
              >
                Địa chỉ Email <span className="text-[#3B7597] dark:text-[#6FD1D7]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3B7597]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="phattu@example.com"
                  className="block w-full rounded-xl border border-[#3B7597]/40 dark:border-[#6FD1D7]/40 bg-white dark:bg-[#092134] pl-10 pr-4 py-3 text-sm text-[#093C5D] dark:text-white placeholder-[#3B7597]/60 focus:border-[#3B7597] focus:outline-none focus:ring-2 focus:ring-[#6FD1D7]/40 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#093C5D] dark:text-[#e8f7fd]"
              >
                Mật khẩu <span className="text-[#3B7597] dark:text-[#6FD1D7]">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#3B7597]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  className="block w-full rounded-xl border border-[#3B7597]/40 dark:border-[#6FD1D7]/40 bg-white dark:bg-[#092134] pl-10 pr-12 py-3 text-sm text-[#093C5D] dark:text-white placeholder-[#3B7597]/60 focus:border-[#3B7597] focus:outline-none focus:ring-2 focus:ring-[#6FD1D7]/40 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#3B7597] hover:text-[#093C5D] dark:hover:text-[#5DF8D8] transition"
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
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#093C5D] to-[#3B7597] hover:from-[#3B7597] hover:to-[#093C5D] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#093C5D]/30 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60"
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

          <div className="pt-6 border-t border-[#3B7597]/25 dark:border-[#6FD1D7]/25 flex items-center justify-between text-xs font-medium text-[#093C5D]/75 dark:text-[#e8f7fd]/75">
            <Link
              href="/"
              className="hover:text-[#3B7597] dark:hover:text-[#6FD1D7] transition inline-flex items-center gap-1.5"
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
        <div className="flex min-h-screen items-center justify-center bg-[#f4f9fc] dark:bg-[#051420]">
          <div className="text-sm font-serif italic text-[#3B7597]">Đang tải trang đăng ký...</div>
        </div>
      }
    >
      <RegisterContent />
    </Suspense>
  )
}
