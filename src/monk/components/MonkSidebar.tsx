'use client'

import React from 'react'
import Link from 'next/link'
import { LayoutDashboard, FileText, Calendar, Landmark, Printer } from 'lucide-react'

export default function MonkSidebar({ currentPath = '/monk' }: { currentPath?: string }) {
  const monkLinks = [
    { title: 'Tổng quan Tăng Ni', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Quản lý Phiếu Sớ', href: '/dashboard/forms', icon: FileText },
    { title: 'Đại Lễ & Ca Cúng', href: '/dashboard/events', icon: Calendar },
    { title: 'Quầy Công Đức O2O', href: '/dashboard/donations', icon: Landmark },
    { title: 'Trạm In Sớ', href: '/dashboard/print', icon: Printer },
  ]

  return (
    <div className="w-64 bg-white dark:bg-[#1c1816] border-r border-stone-200 dark:border-stone-850 p-4 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="px-3 py-2 text-amber-700 dark:text-amber-500 font-serif font-bold text-base border-b border-stone-100 dark:border-stone-800 pb-3">
          BAN TRỊ SỰ (TĂNG NI)
        </div>
        <nav className="space-y-1">
          {monkLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                currentPath === item.href
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
