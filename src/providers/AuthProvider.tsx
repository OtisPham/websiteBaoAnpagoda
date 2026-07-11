'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  role: string | null
  fullName: string | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  fullName: null,
  loading: true,
  refreshProfile: async () => {}
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [fullName, setFullName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProfile = async (currentUser: User) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', currentUser.id)
        .maybeSingle()
      
      if (!error && data) {
        setRole(data.role)
        setFullName(data.full_name)
      } else {
        setRole('USER')
        setFullName(currentUser.user_metadata?.full_name || '')
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
      setRole('USER')
    }
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user)
    }
  }

  useEffect(() => {
    // 1. Kiểm tra xác thực token chính xác với server (tránh dính token cũ trong localStorage)
    const validateAndGetSession = async () => {
      try {
        const { data: { user: activeUser }, error } = await supabase.auth.getUser()
        if (error || !activeUser) {
          // Token cũ / hết hạn / không hợp lệ -> dọn sạch session để tránh lỗi hiển thị sai nút
          setUser(null)
          setRole(null)
          setFullName(null)
          await supabase.auth.signOut()
        } else {
          setUser(activeUser)
          await fetchProfile(activeUser)
        }
      } catch (err) {
        console.error('Error validating session:', err)
        setUser(null)
        setRole(null)
        setFullName(null)
      } finally {
        setLoading(false)
      }
    }

    validateAndGetSession()

    // 2. Tự động gia hạn token định kỳ mỗi 10 phút khi chương trình đang chạy
    const intervalId = setInterval(async () => {
      try {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        if (error || !currentUser) {
          setUser(null)
          setRole(null)
          setFullName(null)
        } else {
          setUser(currentUser)
        }
      } catch {
        // im lặng nếu mất kết nối mạng tạm thời
      }
    }, 10 * 60 * 1000) // 10 phút

    // 3. Gia hạn token khi người dùng quay lại tab (window focus)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        if (error || !currentUser) {
          setUser(null)
          setRole(null)
          setFullName(null)
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // 4. Lắng nghe sự kiện đăng nhập / đăng xuất / gia hạn từ Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user)
        } else {
          setUser(null)
          setRole(null)
          setFullName(null)
        }
        setLoading(false)
      }
    )

    return () => {
      clearInterval(intervalId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, role, fullName, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
