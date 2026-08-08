'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface MenuItem {
  title: string
  href: string
  icon: any
}

export default function ClientSidebarNav({ items }: { items: MenuItem[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {items.map((item, index) => {
        const Icon = item.icon
        // Active when exact match or starts with path (except for /dashboard itself)
        const isActive = 
          item.href === '/dashboard' 
            ? pathname === '/dashboard' 
            : pathname.startsWith(item.href)

        return (
          <Link
            key={index}
            href={item.href}
            className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 active:scale-[0.99] ${
              isActive
                ? 'bg-[#8B4513] text-white dark:bg-amber-500 dark:text-stone-900 shadow-md shadow-[#8B4513]/20 dark:shadow-amber-900/20'
                : 'text-stone-700 dark:text-stone-300 hover:bg-[#8B4513]/10 hover:text-[#8B4513] dark:hover:bg-stone-900 dark:hover:text-amber-400'
            }`}
          >
            <Icon className="h-4 w-4 flex-shrink-0" />
            <span>{item.title}</span>
          </Link>
        )
      })}
    </nav>
  )
}
