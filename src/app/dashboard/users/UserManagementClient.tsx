'use client'

import { useState } from 'react'
import { 
  Users, Search, Shield, UserCheck, ShieldAlert, Edit, Trash2, 
  CheckCircle2, RefreshCw, X, User, Phone, Mail, Filter, Plus
} from 'lucide-react'
import { UserRecord, updateUserRole, updateUserProfile, softDeleteUser } from './actions'

interface Props {
  initialUsers: UserRecord[]
  currentUserRole: string
}

export default function UserManagementClient({ initialUsers, currentUserRole }: Props) {
  const [users, setUsers] = useState<UserRecord[]>(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')

  // Modal States
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)

  // Form inputs
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editRole, setEditRole] = useState<'ADMIN' | 'MONK' | 'VOLUNTEER' | 'USER'>('USER')

  const [isLoading, setIsLoading] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Filtering
  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter
    const nameMatch = (u.full_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    const emailMatch = (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    const phoneMatch = (u.phone || '').includes(searchTerm)
    return matchesRole && (nameMatch || emailMatch || phoneMatch)
  })

  // Role Badge Styling
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <ShieldAlert className="h-3.5 w-3.5" />
            Ban Quản Trị (ADMIN)
          </span>
        )
      case 'MONK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Shield className="h-3.5 w-3.5" />
            Tăng Ni / Quý Thầy
          </span>
        )
      case 'VOLUNTEER':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <UserCheck className="h-3.5 w-3.5" />
            Phụng Sự Viên
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
            <User className="h-3.5 w-3.5" />
            Phật Tử (USER)
          </span>
        )
    }
  }

  // Open Edit Profile Modal
  const handleOpenEdit = (user: UserRecord) => {
    setSelectedUser(user)
    setEditName(user.full_name || '')
    setEditPhone(user.phone || '')
    setIsEditModalOpen(true)
  }

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUser) return

    setIsLoading(true)
    setFeedback(null)

    const res = await updateUserProfile(selectedUser.id, editName, editPhone)
    setIsLoading(false)

    if (res.success) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, full_name: editName, phone: editPhone } : u
        )
      )
      setFeedback({ type: 'success', message: 'Cập nhật thông tin thành công!' })
      setIsEditModalOpen(false)
    } else {
      setFeedback({ type: 'error', message: res.error || 'Có lỗi xảy ra' })
    }
  }

  // Open Role Change Modal
  const handleOpenRoleModal = (user: UserRecord) => {
    setSelectedUser(user)
    setEditRole(user.role)
    setIsRoleModalOpen(true)
  }

  // Save Role
  const handleSaveRole = async () => {
    if (!selectedUser) return

    setIsLoading(true)
    setFeedback(null)

    const res = await updateUserRole(selectedUser.id, editRole)
    setIsLoading(false)

    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, role: editRole } : u))
      )
      setFeedback({ type: 'success', message: `Đã đổi quyền thành công sang [${editRole}]!` })
      setIsRoleModalOpen(false)
    } else {
      setFeedback({ type: 'error', message: res.error || 'Có lỗi xảy ra' })
    }
  }

  // Soft Delete User
  const handleDeleteUser = async (user: UserRecord) => {
    if (!window.confirm(`Bạn có chắc chắn muốn khóa tài khoản của "${user.full_name || user.email}"?`)) {
      return
    }

    setIsLoading(true)
    const res = await softDeleteUser(user.id)
    setIsLoading(false)

    if (res.success) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setFeedback({ type: 'success', message: 'Đã khóa tài khoản thành công.' })
    } else {
      setFeedback({ type: 'error', message: res.error || 'Có lỗi xảy ra' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-3">
            <Users className="h-8 w-8 text-[#8B4513] dark:text-amber-400" />
            Quản Lý Phân Quyền & Người Dùng
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            Quản lý tài khoản Phật tử, Phụng sự viên, Tăng Ni và Ban Quản Trị chốn thiền môn.
          </p>
        </div>

        {/* Counter Cards */}
        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-[#1c1816] px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm text-center">
            <span className="text-xs text-stone-500 font-medium block">Tổng số người dùng</span>
            <span className="text-xl font-bold text-[#8B4513] dark:text-amber-400">{users.length}</span>
          </div>
        </div>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-800 dark:text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:opacity-75">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white dark:bg-[#1c1816] p-4 rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo Tên, Email hoặc SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]/40"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="h-4 w-4 text-stone-400 flex-shrink-0 hidden md:block" />
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'ADMIN', label: 'Ban Quản Trị' },
            { id: 'MONK', label: 'Tăng Ni' },
            { id: 'VOLUNTEER', label: 'Phụng Sự Viên' },
            { id: 'USER', label: 'Phật Tử' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRoleFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                roleFilter === item.id
                  ? 'bg-[#8B4513] text-white shadow-sm'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-[#1c1816] rounded-2xl border border-stone-200/80 dark:border-stone-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/70 dark:bg-stone-900/40 border-b border-stone-100 dark:border-stone-800 text-xs font-bold text-stone-500 uppercase tracking-wider">
                <th className="px-6 py-4">Họ và Tên / Email</th>
                <th className="px-6 py-4">Số điện thoại</th>
                <th className="px-6 py-4">Vai trò (Role)</th>
                <th className="px-6 py-4">Ngày đăng ký</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-sm">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-stone-50/40 dark:hover:bg-stone-900/20 transition-colors">
                  {/* User Profile */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-[#8B4513]/10 dark:bg-amber-950/40 text-[#8B4513] dark:text-amber-400 flex items-center justify-center font-bold font-serif text-base border border-[#8B4513]/20">
                        {(user.full_name || user.email || 'P')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 dark:text-stone-100">
                          {user.full_name || 'Chưa cập nhật tên'}
                        </p>
                        <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          {user.email || 'Không có email'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4 text-stone-600 dark:text-stone-300">
                    {user.phone ? (
                      <span className="flex items-center gap-1.5 font-mono text-xs">
                        <Phone className="h-3.5 w-3.5 text-stone-400" />
                        {user.phone}
                      </span>
                    ) : (
                      <span className="text-stone-400 text-xs italic">Chưa có SĐT</span>
                    )}
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">{renderRoleBadge(user.role)}</td>

                  {/* Created At */}
                  <td className="px-6 py-4 text-xs text-stone-500 font-mono">
                    {new Date(user.created_at).toLocaleDateString('vi-VN')}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenRoleModal(user)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800/50 transition-colors"
                      title="Phân quyền vai trò"
                    >
                      Sửa Quyền
                    </button>
                    <button
                      onClick={() => handleOpenEdit(user)}
                      className="p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {currentUserRole === 'ADMIN' && (
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Khóa tài khoản"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400 italic">
                    Không tìm thấy người dùng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: Edit Profile */}
      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1816] rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 dark:border-stone-800 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif text-lg font-bold">Chỉnh Sửa Hồ Sơ Người Dùng</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Họ và Tên
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Số điện thoại liên hệ
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-[#8B4513]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B4513] text-white hover:bg-[#72380f] flex items-center gap-2"
                >
                  {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Change Role (RBAC) */}
      {isRoleModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1c1816] rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 dark:border-stone-800 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h3 className="font-serif text-lg font-bold">Phân Quyền Hệ Thống (RBAC)</h3>
              <button onClick={() => setIsRoleModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl text-xs space-y-1">
              <p className="font-bold text-stone-800 dark:text-stone-200">{selectedUser.full_name || selectedUser.email}</p>
              <p className="text-stone-500">Email: {selectedUser.email}</p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                Chọn vai trò mới trong hệ thống:
              </label>

              {[
                { id: 'ADMIN', title: 'Ban Quản Trị (ADMIN)', desc: 'Toàn quyền cấu hình, quản lý người dùng, audit logs, bài viết & sớ' },
                { id: 'MONK', title: 'Quý Thầy / Tăng Ni (MONK)', desc: 'Duyệt bài, quản lý phiếu sớ, in sớ & xếp ca cúng' },
                { id: 'VOLUNTEER', title: 'Phụng Sự Viên (VOLUNTEER)', desc: 'Tiếp nhận công đức O2O tại quầy, lập sớ hộ & in ấn' },
                { id: 'USER', title: 'Phật Tử (USER)', desc: 'Đăng ký sớ cá nhân, tra cứu & quản lý lịch sử cúng dường' }
              ].map((roleOption) => (
                <label
                  key={roleOption.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    editRole === roleOption.id
                      ? 'border-[#8B4513] bg-[#8B4513]/5 dark:bg-amber-950/20'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="userRole"
                    value={roleOption.id}
                    checked={editRole === roleOption.id}
                    onChange={() => setEditRole(roleOption.id as any)}
                    className="mt-1 text-[#8B4513] focus:ring-[#8B4513]"
                  />
                  <div>
                    <p className="text-xs font-bold text-stone-900 dark:text-stone-100">{roleOption.title}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">{roleOption.desc}</p>
                  </div>
                </label>
              ))}
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsRoleModalOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#8B4513] text-white hover:bg-[#72380f] flex items-center gap-2"
              >
                {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                Xác nhận đổi quyền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
