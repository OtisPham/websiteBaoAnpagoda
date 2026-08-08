import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Compass, LayoutDashboard, FileText, Calendar, Landmark, Printer, Settings, LogOut, User, PenTool, Users, Image as ImageIcon } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { signout } from '../auth/actions'
import PagodaLogo from '@/components/PagodaLogo'
import ClientSidebarNav from './ClientSidebarNav'

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
    .maybeSingle()

  if (!profile || profile.role === 'USER') {
    // Phật tử thường không được vào ban quản trị
    redirect('/unauthorized')
  }

  const role = profile.role



  const roleLabel =
    role === 'MONK'
      ? 'Quý Thầy / Tăng Ni'
      : role === 'ADMIN'
      ? 'Ban Quản Trị'
      : role === 'VOLUNTEER'
      ? 'Tình Nguyện Viên'
      : role

  return (
    <div className="flex min-h-screen bg-[#faf8f5] dark:bg-[#12100e] text-stone-900 dark:text-stone-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#1c1816] border-r border-stone-200/80 dark:border-stone-800/80 flex flex-col justify-between fixed inset-y-0 left-0 z-20 print:hidden">
        <div className="flex flex-col flex-1">
          {/* Logo */}
          <div className="h-16 flex items-center gap-3 px-5 border-b border-stone-100 dark:border-stone-800">
            <PagodaLogo className="h-9 w-9 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-serif font-bold tracking-tight text-base text-[#8B4513] dark:text-amber-400">
                Chùa Báo Ân
              </span>
              <span className="text-[10px] tracking-widest uppercase font-bold text-stone-400 dark:text-stone-500 -mt-0.5">
                Cổng Quản Trị Phật Sự
              </span>
            </div>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#8B4513]/10 dark:bg-amber-950/40 border border-[#8B4513]/20 text-[#8B4513] dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-stone-800 dark:text-stone-100 truncate">{profile.full_name}</p>
                <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#8B4513]/10 dark:bg-amber-950/40 text-[#8B4513] dark:text-amber-400 border border-[#8B4513]/20">
                  {roleLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <ClientSidebarNav role={role} />
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800">
          <form action={async () => {
            'use server'
            await signout()
          }}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 active:scale-[0.99] transition-all duration-150"
            >
              <LogOut className="h-4 w-4 flex-shrink-0" />
              <span>Đăng xuất</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="pl-64 flex flex-col flex-1 w-full min-h-screen print:pl-0 print:bg-white print:m-0 print:p-0">
        {/* Serene Spiritual Top Bar */}
        <div className="h-10 border-b border-stone-200/60 dark:border-stone-800/60 bg-white/70 dark:bg-[#1c1816]/70 backdrop-blur-md px-6 md:px-8 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 print:hidden">
          <span className="font-serif italic text-stone-600 dark:text-stone-300">
            &ldquo;Thanh tịnh chốn thiền môn • Thân tâm thường lạc, Phật sự viên thành.&rdquo;
          </span>
          <span className="hidden sm:inline font-mono text-[11px] text-stone-400">
            Hệ thống Quản trị Báo Ân Pagoda
          </span>
        </div>

        <div className="flex-1 p-6 md:p-8 overflow-x-hidden print:p-0 print:m-0 print:bg-white print:overflow-visible">
          {children}
        </div>
      </div>
    </div>
  )
}
