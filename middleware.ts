import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Public routes (no auth required)
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/admin-login', '/verified', '/pending']
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  // API routes should be handled by their own auth - skip middleware
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return response
  }

  // Check for impersonation cookie - allows admin access without auth
  const impersonationCookie = request.cookies.get('supplier_impersonation')?.value
  const isImpersonating = !!impersonationCookie

  // If impersonating, allow access to all routes except public auth pages
  if (isImpersonating) {
    // Redirect away from login/signup if impersonating
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return response
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    // If auth error or no user, and not on public route, redirect to login
    if ((error || !user) && !isPublicRoute) {
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
      // Clear any stale cookies to prevent loops
      redirectResponse.cookies.delete('sb-access-token')
      redirectResponse.cookies.delete('sb-refresh-token')
      return redirectResponse
    }

    // If user exists and on login/signup page, redirect to dashboard
    if (user && !error && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } catch (e) {
    // On any error, if not on public route, redirect to login
    if (!isPublicRoute) {
      const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
      redirectResponse.cookies.delete('sb-access-token')
      redirectResponse.cookies.delete('sb-refresh-token')
      return redirectResponse
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
