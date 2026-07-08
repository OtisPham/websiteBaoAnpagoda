import React from 'react'
import UserSidebar from './components/UserSidebar'

export default function UserRoleDashboard() {
  return (
    <div className="flex min-h-screen bg-[#faf8f5] dark:bg-[#12100e]">
      <UserSidebar currentPath="/user" />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="border-b border-stone-200 dark:border-stone-800 pb-4">
            <h1 className="font-serif text-3xl font-bold text-stone-900 dark:text-stone-100">
              Cổng Phật Tử - Thiện Tín Cư Sĩ
            </h1>
            <p className="text-stone-600 dark:text-stone-400 mt-1">
              Gửi sớ cầu an, cầu siêu, dâng tịnh tài cúng dường và tra cứu chứng nhận tâm linh.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-800">
              <h3 className="font-serif font-bold text-lg text-amber-700 dark:text-amber-500">Gửi Phiếu Sớ Cúng Dường</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                Điền thông tin gia quyến cầu an, cầu siêu chư hương linh trong các kỳ đại lễ.
              </p>
            </div>
            <div className="p-6 bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200 dark:border-stone-800">
              <h3 className="font-serif font-bold text-lg text-amber-700 dark:text-amber-500">Lịch Sử & Bằng Công Đức</h3>
              <p className="text-sm text-stone-600 dark:text-stone-400 mt-2">
                Xem lại danh sách phiếu sớ đã đăng ký và chứng nhận công đức trực tuyến.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
