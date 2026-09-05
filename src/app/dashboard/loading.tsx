import React from 'react'
import { Loader2 } from 'lucide-react'

export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="bg-white/50 dark:bg-stone-900/50 p-8 rounded-2xl flex flex-col items-center justify-center gap-4 animate-in fade-in zoom-in duration-300">
        <Loader2 className="h-10 w-10 text-amber-600 dark:text-amber-500 animate-spin" />
        <div className="space-y-1 text-center">
          <p className="font-serif font-bold text-amber-950 dark:text-amber-100 text-lg">
            Đang tải dữ liệu...
          </p>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Xin quý vị hoan hỷ chờ trong giây lát
          </p>
        </div>
      </div>
    </div>
  )
}
