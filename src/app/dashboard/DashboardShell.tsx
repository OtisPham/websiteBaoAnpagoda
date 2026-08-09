'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, User } from 'lucide-react'
import PagodaLogo from '@/components/PagodaLogo'
import ClientSidebarNav from './ClientSidebarNav'

interface DashboardShellProps {
  children: React.ReactNode
  profile: { full_name: string; email: string; role: string }
  roleLabel: string
  signoutAction: () => Promise<void>
}

export default function DashboardShell({
  children,
  profile,
  roleLabel,
  signoutAction
}: DashboardShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[#faf8f5] dark:bg-[#12100e] text-stone-900 dark:text-stone-100 font-sans">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-[#1c1816] 
        border-r border-stone-200/80 dark:border-stone-800/80 
        flex flex-col justify-between transition-transform duration-300 ease-in-out
        lg:translate-x-0 print:hidden
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col flex-1">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between gap-3 px-5 border-b border-stone-100 dark:border-stone-800">
            <div className="flex items-center gap-3">
              <PagodaLogo className="h-9 w-9 flex-shrink-0" />
              <div className="flex flex-col">
                <span className="font-serif font-bold tracking-tight text-base text-[#8B4513] dark:text-amber-400">
                  Chùa Báo Ân
                </span>
                <span className="text-[10px] tracking-widest uppercase font-bold text-stone-400 dark:text-stone-500 -mt-0.5">
                  Cổng Quản Trị
                </span>
              </div>
            </div>
            {/* Mobile close button */}
            <button 
              className="lg:hidden p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
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
          <div onClick={() => setIsMobileMenuOpen(false)}>
            <ClientSidebarNav role={profile.role} />
          </div>
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-stone-100 dark:border-stone-800">
          <form action={signoutAction}>
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
      <div className="flex flex-col flex-1 w-full min-h-screen lg:pl-64 print:pl-0 print:bg-white print:m-0 print:p-0">
        {/* Serene Spiritual Top Bar */}
        <div className="h-14 lg:h-10 border-b border-stone-200/60 dark:border-stone-800/60 bg-white/70 dark:bg-[#1c1816]/70 backdrop-blur-md px-4 md:px-8 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 print:hidden z-10 sticky top-0">
          <div className="flex items-center gap-3">
            {/* Hamburger button */}
            <button 
              className="lg:hidden p-1.5 -ml-1.5 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-300"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-serif italic text-stone-600 dark:text-stone-300 hidden sm:inline-block">
              &ldquo;Thanh tịnh chốn thiền môn • Thân tâm thường lạc, Phật sự viên thành.&rdquo;
            </span>
            <span className="font-serif italic text-stone-600 dark:text-stone-300 sm:hidden">
              &ldquo;Thanh tịnh chốn thiền môn&rdquo;
            </span>
          </div>
          
          <span className="hidden sm:inline font-mono text-[11px] text-stone-400">
            Hệ thống Quản trị Báo Ân Pagoda
          </span>
        </div>

        <div className="flex-1 p-4 sm:p-6 md:p-8 overflow-x-hidden print:p-0 print:m-0 print:bg-white print:overflow-visible">
          {children}
        </div>
      </div>
    </div>
  )
}
