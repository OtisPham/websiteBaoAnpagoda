import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Compass, LayoutDashboard, FileText, Calendar, Landmark, Printer, Settings, LogOut, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { signout } from '../auth/actions'
import PagodaLogo from '@/components/PagodaLogo'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Kiểm tra session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login')
  }

  // 2. Lấy profile và role
  const { data: profile } = await supabase
    .from('users')
    .select('full_name, email, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role === 'USER') {
    // Phật tử thường không được vào ban quản trị
    redirect('/unauthorized')
  }

  const role = profile.role

  // Định nghĩa các menu theo phân quyền
  const menuItems = [
    {
      title: 'Tổng quan',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'MONK', 'VOLUNTEER']
    },
    {
      title: 'Quản lý Phiếu Sớ',
      href: '/dashboard/forms',
      icon: FileText,
      roles: ['ADMIN', 'MONK', 'VOLUNTEER']
    },
    {
      title: 'Đại Lễ & Ca Cúng',
      href: '/dashboard/events',
      icon: Calendar,
      roles: ['ADMIN', 'MONK', 'VOLUNTEER', 'MASTER']
    },
    {
      title: 'Quầy Công Đức O2O',
      href: '/dashboard/donations',
      icon: Landmark,
      roles: ['ADMIN', 'MONK', 'VOLUNTEER']
    },
    {
      title: 'Trạm In Sớ',
      href: '/dashboard/print',
      icon: Printer,
      roles: ['ADMIN', 'MONK', 'VOLUNTEER']
    },
    {
      title: 'Quản Lý Phôi Sớ',
      href: '/dashboard/templates',
      icon: FileText,
      roles: ['ADMIN']
    },
    {
      title: 'Cấu hình & Nhật ký',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['ADMIN']
    }
  ]

  const activeMenus = menuItems.filter(item => item.roles.includes(role) || role === 'MASTER' || role === 'ADMIN')

  return (
    <div className="flex min-h-screen bg-[#faf8f5] dark:bg-[#12100e] text-stone-900 dark:text-stone-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#1c1816] border-r border-stone-200 dark:border-stone-850 flex flex-col justify-between fixed inset-y-0 left-0 z-20 print:hidden">
        <div className="flex flex-col flex-1">
          {/* Logo */}
          <div className="h-16 flex items-center gap-2.5 px-5 border-b border-stone-100 dark:border-stone-850">
            <PagodaLogo className="h-9 w-9 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-serif font-bold tracking-wider text-base text-amber-800 dark:text-amber-400">
                Chùa Báo Ân
              </span>
              <span className="text-[9px] tracking-widest uppercase font-semibold text-stone-500 dark:text-stone-400 -mt-0.5">
                Hệ Thống Nội Bộ
              </span>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-stone-100 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-amber-100 dark:bg-amber-950/20 text-amber-700 dark:text-amber-500 flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{profile.full_name}</p>
                <span className="inline-block text-[9px] uppercase font-extrabold tracking-widest px-1.5 py-0.5 rounded bg-amber-700/10 text-amber-700 dark:text-amber-500">
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {activeMenus.map((item, index) => {
              const Icon = item.icon
              return (
                <Link
                  key={index}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-stone-700 hover:bg-stone-50 hover:text-amber-700 dark:text-stone-300 dark:hover:bg-stone-900 dark:hover:text-amber-500 transition"
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-850">
          <form action={async () => {
            'use server'
            await signout()
          }}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 transition"
            >
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col flex-1 w-full min-h-screen print:pl-0 print:bg-white print:m-0 print:p-0">
        <div className="flex-1 p-6 md:p-8 overflow-x-hidden print:p-0 print:m-0 print:bg-white print:overflow-visible">
          {children}
        </div>
      </div>
    </div>
  )
}
