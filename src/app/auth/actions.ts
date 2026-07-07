'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { success: false, error: 'Vui lòng nhập đầy đủ thông tin' }
    }

    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    // Lấy role từ bảng profiles (public.users)
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    const role = profile?.role || 'USER'

    revalidatePath('/', 'layout')
    
    return { success: true, role }
  } catch (err: any) {
    console.error('Login error:', err)
    return { 
      success: false, 
      error: 'Lỗi kết nối cơ sở dữ liệu. Vui lòng kiểm tra cấu hình Supabase trong .env.local: ' + err.message 
    }
  }
}

export async function signup(formData: FormData) {
  try {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string

    if (!email || !password || !fullName) {
      return { success: false, error: 'Vui lòng điền các thông tin bắt buộc' }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          phone: phone || '',
          role: 'USER', // mặc định là Phật tử
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Signup error:', err)
    return { 
      success: false, 
      error: 'Lỗi kết nối cơ sở dữ liệu. Vui lòng kiểm tra cấu hình Supabase trong .env.local: ' + err.message 
    }
  }
}

export async function signout() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error('Signout error:', err)
    return { success: false, error: err.message }
  }
}
