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
    .gte('scheduled_date', today)
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
    .gte('scheduled_date', today)
    .order('scheduled_date', { ascending: true })

  return (
    <div className="space-y-8">
      {/* Tiêu đề & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">Tổng Quan Phật Sự</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Thống kê hoạt động của chùa.</p>
        </div>
        <MonkCreateForm events={events || []} />
      </div>

      {/* Grid thẻ thông tin */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Phiếu mới nhận</p>
            <p className="text-2xl font-bold font-serif">{counts.Submitted}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Sớ đã in (Chờ đọc)</p>
            <p className="text-2xl font-bold font-serif">{counts.Printed}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <FileText className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Tổng công đức hôm nay</p>
            <p className="text-xl font-bold font-serif text-emerald-700 dark:text-emerald-500">
              {totalDonationsToday.toLocaleString('vi-VN')} đ
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Landmark className="h-6 w-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Tổng đạo hữu Phật tử</p>
            <p className="text-2xl font-bold font-serif">{totalPhatTu || 0}</p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Grid Biểu đồ & Phiếu mới */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Biểu đồ phân bổ ca cúng */}
        <div className="lg:col-span-8 bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold">Lượng Phiếu Phân Bổ Theo Khung Giờ</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">Số lượng sớ Cầu An / Cầu Siêu được xếp lịch cúng trong các sự kiện sắp tới.</p>
          </div>
          <div className="h-80 w-full">
            <DashboardCharts chartData={chartData} />
          </div>
        </div>

        {/* 5 phiếu đăng ký mới nhất */}
        <div className="lg:col-span-4 bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold">Phiếu Đăng Ký Mới Gửi</h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">Danh sách các sớ vừa được Phật tử gửi trực tuyến.</p>
          </div>

          <div className="flow-root">
            <ul className="-my-5 divide-y divide-stone-100 dark:divide-stone-800">
              {recentForms?.map((form) => (
                <li key={form.id} className="py-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 dark:text-white">
                      {form.form_code || 'Chưa cấp mã'}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${form.form_type === 'CAU_AN' ? 'bg-green-50 text-green-700 dark:bg-green-950/20' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20'}`}>
                      {form.form_type === 'CAU_AN' ? 'Cầu An' : 'Cầu Siêu'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-medium">{(Array.isArray(form.users) ? form.users[0]?.full_name : (form.users as any)?.full_name) || 'Phật tử ẩn danh'}</span>
                    <span>{form.selected_time_slot || 'Chưa phân ca'}</span>
                  </div>
                </li>
              ))}
              {(!recentForms || recentForms.length === 0) && (
                <p className="text-xs text-stone-400 text-center py-6">Chưa có phiếu cúng nào trong hôm nay</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
