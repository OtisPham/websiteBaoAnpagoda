import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] dark:bg-[#12100e] px-4 text-center">
      <div className="max-w-md rounded-2xl bg-white dark:bg-[#1c1816] p-8 shadow-xl border border-stone-200 dark:border-stone-800">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500">
          <ShieldAlert className="h-8 w-8" />
        </div>
        
        <h1 className="mt-6 font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
          Thiếu Quyền Truy Cập
        </h1>
        
        <p className="mt-4 text-stone-600 dark:text-stone-400 leading-relaxed">
          Tài khoản của bạn không được phân quyền để truy cập vào pháp sự hoặc trang quản trị này. 
          Vui lòng liên hệ với Ban Trị Sự nhà chùa để được cấp quyền phù hợp.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-800 transition shadow-sm"
          >
            Quay lại trang chủ
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-5 py-2.5 text-sm font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition"
          >
            Đăng nhập tài khoản khác
          </Link>
        </div>
      </div>
    </div>
  )
}
