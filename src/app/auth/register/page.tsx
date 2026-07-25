'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { signup } from '../actions'

const THEME = {
  bgLight: '#EEF5F7',
  textPrimary: '#0D3A4B',
  darkTeal: '#2B697D',
  accentTeal: '#5DA8A8',
  white: '#FFFFFF',
}

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('fullName', fullName)
    formData.append('phone', phone)
    
    try {
      const res = await signup(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#EEF5F7] flex flex-col font-sans">
      <div className="p-5 sm:p-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#2B697D] font-semibold text-sm hover:opacity-80 transition">
          <ArrowLeft className="w-4 h-4" /> Quay lại
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-6 sm:px-8 max-w-md mx-auto w-full pb-20">
        <h1 className="text-3xl font-bold text-[#0D3A4B] mb-2">Đăng Ký Tài Khoản</h1>
        <div className="flex gap-1 mb-8 text-sm">
          <span className="text-[#0D3A4B]/80">Đã có tài khoản Phật tử?</span>
          <Link href="/auth/login" className="text-[#2B697D] font-bold hover:underline">
            Đăng nhập ngay
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-6 text-sm border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#0D3A4B] uppercase tracking-wide">
              HỌ VÀ TÊN PHẬT TỬ *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Diệu Pháp / Nguyễn Văn A"
              required
              className="w-full bg-white border border-[#2B697D]/30 rounded-xl p-4 text-base text-[#0D3A4B] placeholder-slate-400 focus:outline-none focus:border-[#5DA8A8] focus:ring-1 focus:ring-[#5DA8A8] transition"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#0D3A4B] uppercase tracking-wide">
              SỐ ĐIỆN THOẠI
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0901234567"
              className="w-full bg-white border border-[#2B697D]/30 rounded-xl p-4 text-base text-[#0D3A4B] placeholder-slate-400 focus:outline-none focus:border-[#5DA8A8] focus:ring-1 focus:ring-[#5DA8A8] transition"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#0D3A4B] uppercase tracking-wide">
              ĐỊA CHỈ EMAIL *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="phattu@example.com"
              required
              className="w-full bg-white border border-[#2B697D]/30 rounded-xl p-4 text-base text-[#0D3A4B] placeholder-slate-400 focus:outline-none focus:border-[#5DA8A8] focus:ring-1 focus:ring-[#5DA8A8] transition"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#0D3A4B] uppercase tracking-wide">
              MẬT KHẨU *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
                className="w-full bg-white border border-[#2B697D]/30 rounded-xl p-4 pr-12 text-base text-[#0D3A4B] placeholder-slate-400 focus:outline-none focus:border-[#5DA8A8] focus:ring-1 focus:ring-[#5DA8A8] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2B697D] hover:opacity-80 transition"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D3A4B] text-white font-bold text-base p-4 rounded-xl mt-4 hover:bg-[#0D3A4B]/90 transition shadow-lg shadow-[#0D3A4B]/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Đăng Ký Tài Khoản'}
          </button>
        </form>
      </div>
    </div>
  )
}
