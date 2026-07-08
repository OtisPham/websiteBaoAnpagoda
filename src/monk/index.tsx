import React from 'react'
import MonkSidebar from './components/MonkSidebar'

export default function MonkRoleDashboard() {
  return (
    <div className="flex min-h-screen bg-[#faf8f5] dark:bg-[#12100e]">
      <MonkSidebar currentPath="/monk" />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
            <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
              Cổng Điều Hành Phật Sự - Quý Thầy (Tăng Ni)
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mt-1">
              Quản lý các sự kiện Đại Lễ, thẩm định Phiếu Sớ và chứng minh ca cúng.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-800">
              <h3 className="font-serif font-bold text-lg text-amber-700 dark:text-amber-500">Thiết Lập Sự Kiện Lễ</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                Tạo và chỉnh sửa thời gian diễn ra các Đại Lễ và Khóa Tu.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-800">
              <h3 className="font-serif font-bold text-lg text-amber-700 dark:text-amber-500">Duyệt Phiếu Sớ Cầu An / Cầu Siêu</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                Kiểm tra thông tin gia chủ và in ấn phôi sớ dán đàn lễ.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
