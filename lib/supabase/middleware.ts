import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { DEMO_SESSION_COOKIE, parseDemoSession } from "@/lib/demo-auth"

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const demoSession = parseDemoSession(request.cookies.get(DEMO_SESSION_COOKIE)?.value)
  const pathname = request.nextUrl.pathname

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/protected") ||
    pathname.startsWith("/api/alerts") ||
    pathname.startsWith("/api/ml")

  const isAuth = pathname.startsWith("/auth")

  // Local demo sessions work without Supabase
  if (demoSession) {
    if (isAuth && !pathname.includes("/auth/sign-up-success")) {
      const url = request.nextUrl.clone()
      url.pathname = "/dashboard"
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isProtected) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
    return supabaseResponse
  }

  let user = null

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    })

    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser()
    user = supabaseUser
  } catch {
    user = null
  }

  if (isAuth && user && !pathname.includes("/auth/sign-up-success")) {
    const url = request.nextUrl.clone()
    url.pathname = "/dashboard"
    return NextResponse.redirect(url)
  }

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
