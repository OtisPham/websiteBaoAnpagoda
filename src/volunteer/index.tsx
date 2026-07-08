import React from 'react'
import VolunteerSidebar from './components/VolunteerSidebar'

export default function VolunteerRoleDashboard() {
  return (
    <div className="flex min-h-screen bg-[#faf8f5] dark:bg-[#12100e]">
      <VolunteerSidebar currentPath="/volunteer" />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
            <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
              Khu Vực Làm Việc Tình Nguyện Viên (Volunteer)
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mt-1">
              Hỗ trợ tiếp nhận công đức, hướng dẫn Phật tử và quản lý sự kiện lễ.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-800">
              <h3 className="font-serif font-bold text-lg text-amber-700 dark:text-amber-500">Quầy Tiếp Nhận Công Đức O2O</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                Ghi nhận tịnh tài, xuất biên lai và liên kết phiếu sớ cầu an/cầu siêu cho Phật tử.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-800">
              <h3 className="font-serif font-bold text-lg text-amber-700 dark:text-amber-500">Hỗ Trợ Sự Kiện & Trạm In Sớ</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                Hỗ trợ in ấn phôi sớ, sắp xếp đàn cúng và điều phối Phật tử tham dự.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
