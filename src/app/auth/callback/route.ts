import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  
  // The 'next' param is used to redirect the user after login
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    
    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // If a specific next path is requested, go there
      if (searchParams.has('next')) {
        return NextResponse.redirect(`${origin}${next}`)
      }
      
      // Otherwise, redirect based on user role
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
          
        const role = profile?.role || 'USER'
        const targetPath = role === 'USER' ? '/phat-tu' : '/dashboard'
        return NextResponse.redirect(`${origin}${targetPath}`)
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/login?error=Xác thực email thất bại hoặc mã không hợp lệ`)
}
