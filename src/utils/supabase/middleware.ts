import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Skip static files, API routes, or assets
  const path = request.nextUrl.pathname
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.includes('.')
  ) {
    return supabaseResponse
  }

  // Get current user session
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Fetch profile from public.users to check custom DB role in real-time
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'USER'

    // RBAC: Check route constraints
    
    // 1. Strict protection of the entire /dashboard area: Only ADMIN, MONK, VOLUNTEER, MASTER allowed.
    if (path.startsWith('/dashboard')) {
      if (!['ADMIN', 'MONK', 'VOLUNTEER', 'MASTER'].includes(role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // 2. Settings & logs are strictly for ADMIN & MASTER
    if (path.startsWith('/dashboard/settings') && !['ADMIN', 'MASTER'].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // 3. Events management is for ADMIN, MONK, VOLUNTEER, MASTER
    if (path.startsWith('/dashboard/events') && !['ADMIN', 'MONK', 'VOLUNTEER', 'MASTER'].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // 4. Donations reception is for ADMIN, MONK, VOLUNTEER, MASTER
    if (path.startsWith('/dashboard/donations') && !['ADMIN', 'MONK', 'VOLUNTEER', 'MASTER'].includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }

    // Redirect logged in user from auth page to appropriate home
    if (path.startsWith('/auth/')) {
      if (role === 'USER') {
        return NextResponse.redirect(new URL('/phat-tu', request.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  } else {
    // If not logged in and attempts to access protected directories
    if (
      path.startsWith('/dashboard') ||
      path.startsWith('/phat-tu')
    ) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return supabaseResponse
}
