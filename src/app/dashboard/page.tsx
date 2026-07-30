import { createClient } from '@/utils/supabase/server'
import { FileText, Users, Heart, Landmark, CheckCircle, Clock } from 'lucide-react'
import DashboardCharts from './DashboardCharts'
import MonkCreateForm from './MonkCreateForm'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // 1. Lấy ngày hôm nay định dạng YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]
  
  // 2. Fetch thống kê trạng thái phiếu
  const { data: statusCounts } = await supabase
    .from('forms')
    .select('status')
    .is('deleted_at', null)

  const counts = {
    Submitted: 0,
    WaitingVerification: 0,
    Accepted: 0,
    Printed: 0,
    Completed: 0,
    Total: 0
  }

  statusCounts?.forEach((f) => {
    counts.Total++
    if (f.status === 'Submitted') counts.Submitted++
    else if (f.status === 'Waiting Verification') counts.WaitingVerification++
    else if (f.status === 'Accepted') counts.Accepted++
    else if (f.status === 'Printed') counts.Printed++
    else if (f.status === 'Completed') counts.Completed++
  })

  // 3. Tính tổng tiền cúng dường thu được hôm nay
  const startOfDay = `${today}T00:00:00.000Z`
  const endOfDay = `${today}T23:59:59.999Z`

  const { data: donationsToday } = await supabase
    .from('donations')
    .select('amount')
    .eq('payment_status', 'CONFIRMED')
    .gte('created_at', startOfDay)
    .lte('created_at', endOfDay)

  const totalDonationsToday = donationsToday?.reduce((sum, d) => sum + Number(d.amount), 0) || 0

  // 4. Fetch danh sách 5 phiếu đăng ký mới nhất
  const { data: recentForms } = await supabase
    .from('forms')
    .select(`
      id,
      form_code,
      form_type,
      status,
      scheduled_date,
      selected_time_slot,
      created_at,
      users (
        full_name
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(5)

  // 5. Thống kê theo ca cúng để vẽ biểu đồ
  const { data: formsBySlot } = await supabase
    .from('forms')
    .select('selected_time_slot, form_type')
    .eq('scheduled_date', today)
    .is('deleted_at', null)
    .not('selected_time_slot', 'is', null)

  const slotStats: Record<string, { time: string; CauAn: number; CauSieu: number }> = {}
  formsBySlot?.forEach((f) => {
    const slot = f.selected_time_slot || 'Không rõ'
    if (!slotStats[slot]) {
      slotStats[slot] = { time: slot, CauAn: 0, CauSieu: 0 }
    }
    if (f.form_type === 'CAU_AN') {
      slotStats[slot].CauAn++
    } else {
      slotStats[slot].CauSieu++
    }
  })

  const chartData = Object.values(slotStats).sort((a, b) => a.time.localeCompare(b.time))

  // Đếm tổng số Phật tử
  const { count: totalPhatTu } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'USER')
    .is('deleted_at', null)

  // Lấy sự kiện sắp tới cho Form Tăng Ni
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .is('deleted_at', null)
    .order('scheduled_date', { ascending: true })

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto">
      {/* Tiêu đề & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200/60 dark:border-stone-800/60">
        <div>
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-[#8B4513] dark:text-amber-400 mb-1">
            Không Gian Quản Trị Tăng Ni
          </span>
          <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100">
            Tổng Quan Phật Sự
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Thống kê hoạt động, phiếu sớ cầu an cầu siêu & công đức chốn thiền môn.
          </p>
        </div>
        <MonkCreateForm events={events || []} />
      </div>

      {/* ASYMMETRIC SPIRITUAL BENTO GRID (Anti-slop 4-equal cards) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Featured Card: Phiếu mới nhận (Span 5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 md:p-7 rounded-2xl border border-stone-800 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#8B4513]/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400/90">
              Cần Xử Lý Hôm Nay
            </span>
            <Clock className="h-5 w-5 text-amber-400/80" />
          </div>
          <div className="my-6">
            <p className="text-4xl md:text-5xl font-serif font-bold tracking-tight">{counts.Submitted}</p>
            <p className="text-sm text-stone-300 mt-1.5 font-medium">
              Phiếu sớ mới tiếp nhận chờ Quý Thầy duyệt
            </p>
          </div>
          <div className="pt-4 border-t border-stone-700/60 flex items-center justify-between text-xs text-stone-400">
            <span>Tổng cộng {counts.Total} sớ trong hệ thống</span>
            <span className="text-amber-400 font-semibold">● Đang hoạt động</span>
          </div>
        </div>

        {/* Right Side Cards (Span 7 cols) */}
        <div className="md:col-span-7 grid sm:grid-cols-2 gap-5">
          {/* Card: Sớ đã in */}
          <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Sớ Đã In (Chờ Xướng)
              </span>
              <div className="h-9 w-9 rounded-xl bg-[#8B4513]/10 dark:bg-amber-950/40 text-[#8B4513] dark:text-amber-400 flex items-center justify-center">
                <FileText className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">{counts.Printed}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Sẵn sàng dâng sớ trước Chánh Điện</p>
            </div>
          </div>

          {/* Card: Tổng đạo hữu */}
          <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Đạo Hữu Phật Tử
              </span>
              <div className="h-9 w-9 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center">
                <Users className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold font-serif text-stone-900 dark:text-stone-100">{totalPhatTu || 0}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">Phật tử chính thức đăng ký</p>
            </div>
          </div>

          {/* Card: Tổng công đức hôm nay (Span 2 cols on mobile/tablet) */}
          <div className="sm:col-span-2 bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-sm flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                Tổng Công Đức Hôm Nay
              </span>
              <p className="text-2xl md:text-3xl font-bold font-serif text-emerald-800 dark:text-emerald-400">
                {totalDonationsToday.toLocaleString('vi-VN')} đ
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <Landmark className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid Biểu đồ & Phiếu mới */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Biểu đồ phân bổ ca cúng */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1c1816] p-6 md:p-7 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-sm space-y-4">
          <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
            <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Lượng Phiếu Phân Bổ Theo Khung Giờ</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Số lượng sớ Cầu An / Cầu Siêu được xếp lịch cúng trong các sự kiện sắp tới.</p>
          </div>
          <div className="h-80 w-full pt-2">
            <DashboardCharts chartData={chartData} />
          </div>
        </div>

        {/* 5 phiếu đăng ký mới nhất */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1c1816] p-6 md:p-7 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <div className="border-b border-stone-100 dark:border-stone-800 pb-4">
              <h3 className="font-serif text-lg font-bold text-stone-900 dark:text-stone-100">Phiếu Đăng Ký Mới Gửi</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Danh sách các sớ vừa được Phật tử gửi trực tuyến.</p>
            </div>

            <div className="flow-root mt-2">
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {recentForms?.map((form) => (
                  <li key={form.id} className="py-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-stone-900 dark:text-stone-100">
                        {form.form_code || 'Chưa cấp mã'}
                      </span>
                      <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                        form.form_type === 'CAU_AN'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60 dark:bg-emerald-950/30 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-800 border border-amber-200/60 dark:bg-amber-950/30 dark:text-amber-400'
                      }`}>
                        {form.form_type === 'CAU_AN' ? 'Cầu An' : 'Cầu Siêu'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs text-stone-500 dark:text-stone-400">
                      <span className="font-medium text-stone-700 dark:text-stone-300">
                        {(Array.isArray(form.users) ? form.users[0]?.full_name : (form.users as any)?.full_name) || 'Phật tử ẩn danh'}
                      </span>
                      <span className="text-[11px]">{form.selected_time_slot || 'Chưa phân ca'}</span>
                    </div>
                  </li>
                ))}
                {(!recentForms || recentForms.length === 0) && (
                  <div className="py-10 text-center space-y-2">
                    <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Chưa có phiếu cúng nào gửi trong hôm nay</p>
                    <p className="text-[11px] text-stone-400">Hệ thống sẽ cập nhật ngay khi Phật tử gửi sớ trực tuyến.</p>
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
