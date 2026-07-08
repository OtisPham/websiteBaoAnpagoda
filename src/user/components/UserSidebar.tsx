'use client'

import React from 'react'
import Link from 'next/link'
import { Home, FileText, Heart, Compass } from 'lucide-react'

export default function UserSidebar({ currentPath = '/phat-tu' }: { currentPath?: string }) {
  const userLinks = [
    { title: 'Cổng Phật Tử', href: '/phat-tu', icon: Home },
    { title: 'Đăng Ký Sớ Cúng', href: '/phat-tu', icon: FileText },
    { title: 'Lịch Sử Cúng Dường', href: '/phat-tu', icon: Heart },
    { title: 'Trở Về Trang Chủ', href: '/', icon: Compass },
  ]

  return (
    <div className="w-64 bg-white dark:bg-[#1c1816] border-r border-stone-200 dark:border-stone-850 p-4 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="px-3 py-2 text-amber-700 dark:text-amber-500 font-serif font-bold text-base border-b border-stone-100 dark:border-stone-800 pb-3">
          CỔNG PHẬT TỬ CÁ NHÂN
        </div>
        <nav className="space-y-1">
          {userLinks.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                currentPath === item.href && idx === 0
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
