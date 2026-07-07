'use client'

import { useState, useTransition, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Compass, RefreshCw } from 'lucide-react'
import { signup } from '../actions'

function RegisterContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')

  const [error, setError] = useState(urlError || '')
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await signup(formData)
      if (res.success) {
        router.push('/auth/login?message=' + encodeURIComponent('Đăng ký thành công! Vui lòng đăng nhập.'))
      } else {
        setError(res.error || 'Có lỗi xảy ra trong quá trình đăng ký.')
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#faf8f5] dark:bg-[#12100e] py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-500">
          <Compass className="h-10 w-10 animate-spin-slow" />
          <span className="font-serif text-2xl font-bold tracking-wider">PAGODA ERP</span>
        </Link>
        <h2 className="mt-6 font-serif text-3xl font-bold tracking-tight text-stone-950 dark:text-white">
          Đăng ký tài khoản Phật tử
        </h2>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          Đã có tài khoản?{' '}
          <Link href="/auth/login" className="font-medium text-amber-700 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400">
            Đăng nhập ngay
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#1c1816] py-8 px-4 shadow-xl rounded-2xl border border-stone-200 dark:border-stone-800 sm:px-10">
          
          {error && (
            <div className="mb-4 rounded-md bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Họ và Tên Phật tử <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  className="block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Số điện thoại liên lạc
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="0901234567"
                  className="block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Tối thiểu 6 ký tự"
                  className="block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white placeholder-stone-400 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex w-full justify-center rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition disabled:opacity-50"
              >
                {isPending ? (
                  <span className="flex items-center gap-1.5">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Đang đăng ký...
                  </span>
                ) : (
                  'Đăng ký tài khoản'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-stone-200 dark:border-stone-800 pt-6 text-center">
            <Link href="/" className="text-sm font-medium text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300">
              ← Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#faf8f5] dark:bg-[#12100e]">Đang tải...</div>}>
      <RegisterContent />
    </Suspense>
  )
}

