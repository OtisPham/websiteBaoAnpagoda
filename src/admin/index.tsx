import React from 'react'
import AdminSidebar from './components/AdminSidebar'

export interface AdminRoleOverviewProps {
  userName?: string
  userEmail?: string
}

export default function AdminRoleDashboard({ userName = 'Admin', userEmail }: AdminRoleOverviewProps) {
  return (
    <div className="flex min-h-screen bg-[#faf8f5] dark:bg-[#12100e]">
      <AdminSidebar currentPath="/admin" />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
            <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
              Bảng Điều Khiển Quản Trị Viên (Admin)
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mt-1">
              Trung tâm kiểm soát toàn diện hệ thống quản lý Chùa Báo Ân.
            </p>
          </div>
          {/* Module Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-800">
              <h3 className="font-serif font-bold text-lg text-amber-700 dark:text-amber-500">Hệ Thống Phiếu Sớ</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                Duyệt, chỉnh sửa và cấu hình phôi sớ tự động.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-800">
              <h3 className="font-serif font-bold text-lg text-amber-700 dark:text-amber-500">Đại Lễ & Sự Kiện</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                Cấu hình lịch đàn lễ, ca cúng và đồng bộ lên Trang Chủ.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-800">
              <h3 className="font-serif font-bold text-lg text-amber-700 dark:text-amber-500">Cấu Hình & Nhật Ký</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                Phân quyền người dùng và kiểm toán nhật ký hệ thống.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
