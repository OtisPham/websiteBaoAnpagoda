'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Calendar, Landmark, Printer, Settings, PenTool, Users, Image as ImageIcon } from 'lucide-react'

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
    title: 'Đăng Bài & CMS',
    href: '/dashboard/posts',
    icon: PenTool,
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
    title: 'Thư Viện Media',
    href: '/dashboard/media',
    icon: ImageIcon,
    roles: ['ADMIN', 'MONK', 'VOLUNTEER']
  },
  {
    title: 'Quản Lý Phôi Sớ',
    href: '/dashboard/templates',
    icon: FileText,
    roles: ['ADMIN']
  },
  {
    title: 'Quản Lý Phân Quyền',
    href: '/dashboard/users',
    icon: Users,
    roles: ['ADMIN', 'MONK']
  },
  {
    title: 'Cấu hình & Nhật ký',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['ADMIN']
  }
]

export default function ClientSidebarNav({ role }: { role: string }) {
  const pathname = usePathname()
  
  const activeMenus = menuItems.filter(item => item.roles.includes(role) || role === 'MASTER' || role === 'ADMIN')

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {activeMenus.map((item, index) => {
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
            prefetch={true}
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
