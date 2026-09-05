import React from 'react'

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="bg-white/50 dark:bg-stone-900/50 p-8 rounded-2xl flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-300">
        <div className="relative w-32 h-32 mb-2 animate-bounce">
          {/* We assume the user will save their image as /images/chu-tieu-loading.png */}
          <img 
            src="/images/chu-tieu-loading.png" 
            alt="Chú tiểu đang chạy" 
            className="w-full h-full object-contain"
          />
        </div>
        <div className="space-y-1 text-center">
          <p className="font-serif font-bold text-amber-950 dark:text-amber-100 text-lg">
            Chờ chú tiểu xíu...
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Đang chạy đi lấy dữ liệu cho quý vị
          </p>
        </div>
      </div>
    </div>
  )
}
