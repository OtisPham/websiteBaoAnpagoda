'use client'

import { useState } from 'react'
import { Settings, ShieldAlert, CheckCircle2, RefreshCw, Save, Clock, HelpCircle } from 'lucide-react'
import { updateSetting } from './actions'

interface AuditLog {
  id: string
  action: string
  table_name: string
  record_id: string
  details?: any
  created_at: string
  users?: { full_name: string; email: string } | null
}

interface SettingRecord {
  id: string
  key: string
  value: string
  description?: string | null
}

interface Props {
  settings: SettingRecord[]
  auditLogs: AuditLog[]
}

export default function AdminSettingsDashboard({ settings, auditLogs }: Props) {
  const [activeTab, setActiveTab] = useState<'config' | 'logs'>('config')

  // State cấu hình
  const [templeName, setTempleName] = useState(settings.find(s => s.key === 'temple_name')?.value || 'Chùa Báo Ân')
  const [templeAddress, setTempleAddress] = useState(settings.find(s => s.key === 'temple_address')?.value || '53 Lê Bình, Phường Tân Sơn Nhất, TP. Hồ Chí Minh')
  const [templePhone, setTemplePhone] = useState(settings.find(s => s.key === 'temple_phone')?.value || '0901234567')
  const [bankQr, setBankQr] = useState(settings.find(s => s.key === 'bank_qr')?.value || '')
  
  const [isSaving, setIsSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Lưu cấu hình hệ thống
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res1 = await updateSetting('temple_name', templeName, 'Tên chùa')
      const res2 = await updateSetting('temple_address', templeAddress, 'Địa chỉ chùa')
      const res3 = await updateSetting('temple_phone', templePhone, 'Số điện thoại chùa')
      const res4 = await updateSetting('bank_qr', bankQr, 'Link ảnh QR cúng dường')

      if (res1.success && res2.success && res3.success && res4.success) {
        setSuccessMsg('Cập nhật cấu hình hệ thống thành công!')
      } else {
        setErrorMsg('Có lỗi xảy ra trong quá trình lưu dữ liệu.')
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối.')
    } finally {
      setIsSaving(false)
    }
  }

  // Format hành động của audit log
  const renderActionBadge = (action: string) => {
    const colors: Record<string, string> = {
      INSERT: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400',
      UPDATE: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400',
      DELETE: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400'
    }
    return (
      <span className={`inline-block text-[9px] uppercase font-extrabold px-1.5 py-0.5 rounded border ${colors[action] || 'bg-stone-100'}`}>
        {action}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Tiêu đề */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight">Hệ Thống & Nhật Ký Audit Log</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1">Cấu hình thông tin nhà chùa và giám sát lịch sử thao tác của ban quản lý.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-850 gap-6">
        <button
          onClick={() => setActiveTab('config')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${activeTab === 'config' ? 'border-amber-700 text-amber-700 dark:text-amber-500 dark:border-amber-500' : 'border-transparent text-stone-500 hover:text-stone-750'}`}
        >
          Cấu hình chung
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-bold border-b-2 transition ${activeTab === 'logs' ? 'border-amber-700 text-amber-700 dark:text-amber-500 dark:border-amber-500' : 'border-transparent text-stone-500 hover:text-stone-750'}`}
        >
          Nhật ký Audit Logs
        </button>
      </div>

      {activeTab === 'config' ? (
        // TAB 1: CẤU HÌNH HỆ THỐNG
        <div className="bg-white dark:bg-[#1c1816] p-6 md:p-8 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm max-w-xl">
          <h3 className="font-serif text-lg font-bold border-b border-stone-100 dark:border-stone-800 pb-3 mb-6">
            Thông Tin Chùa
          </h3>

          {errorMsg && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-950/20 p-3 border border-red-200 dark:border-red-800 text-xs text-red-700">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-950/20 p-3 border border-green-200 dark:border-green-800 text-xs text-green-700 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-stone-750 dark:text-stone-300">Tên Chùa</label>
              <input
                type="text"
                required
                value={templeName}
                onChange={(e) => setTempleName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-750 dark:text-stone-300">Địa chỉ nhà chùa</label>
              <input
                type="text"
                required
                value={templeAddress}
                onChange={(e) => setTempleAddress(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-750 dark:text-stone-300">Số điện thoại liên hệ</label>
              <input
                type="text"
                required
                value={templePhone}
                onChange={(e) => setTemplePhone(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-750 dark:text-stone-300">Link ảnh QR nhận cúng dường</label>
              <input
                type="text"
                placeholder="https://api.vietqr.co/image/..."
                value={bankQr}
                onChange={(e) => setBankQr(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-stone-300 dark:border-stone-700 bg-transparent px-3 py-2 text-stone-900 dark:text-white focus:border-amber-500 focus:ring-amber-500 focus:outline-none sm:text-sm"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-lg bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-amber-800 transition"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Lưu cấu hình
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        // TAB 2: NHẬT KÝ AUDIT LOGS
        <div className="bg-white dark:bg-[#1c1816] p-6 rounded-2xl border border-stone-200 dark:border-stone-850 shadow-sm space-y-4">
          <h3 className="font-serif text-lg font-bold">Lịch Sử Hoạt Động (Giám Sát)</h3>

          <div className="overflow-x-auto border border-stone-100 dark:border-stone-800 rounded-xl">
            <table className="min-w-full divide-y divide-stone-200 dark:divide-stone-800 text-left text-xs">
              <thead className="bg-stone-50 dark:bg-stone-900/40 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Thời gian</th>
                  <th className="px-6 py-4">Thao tác</th>
                  <th className="px-6 py-4">Bảng dữ liệu</th>
                  <th className="px-6 py-4">Người thực hiện</th>
                  <th className="px-6 py-4">Chi tiết (JSON)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-50/20 dark:hover:bg-stone-900/10">
                    <td className="px-6 py-4 text-stone-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">{renderActionBadge(log.action)}</td>
                    <td className="px-6 py-4 font-mono font-semibold text-stone-700 dark:text-stone-300">
                      {log.table_name}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold">{log.users?.full_name || 'Hệ thống tự động'}</p>
                      <p className="text-[10px] text-stone-400">{log.users?.email}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-[10px] text-stone-500 max-w-xs truncate" title={JSON.stringify(log.details)}>
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-stone-400 italic">
                      Chưa có nhật ký hoạt động nào được ghi nhận.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
