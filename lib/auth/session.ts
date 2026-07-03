import {
  DEMO_SESSION_COOKIE,
  type DashboardRole,
  type DemoSession,
  parseDemoSession,
} from "@/lib/demo-auth"
import { createClient } from "@/lib/supabase/client"

export interface AppProfile {
  first_name: string | null
  last_name: string | null
  organization: string | null
  role: DashboardRole
}

export interface AppUser {
  id: string
  email: string
  created_at?: string
  last_sign_in_at?: string
  user_metadata?: {
    first_name?: string
    last_name?: string
    organization?: string
    role?: DashboardRole
    avatar_url?: string
  }
}

export interface AppSession {
  user: AppUser
  profile: AppProfile
  role: DashboardRole
  isDemo: boolean
}

function sessionFromDemo(demo: DemoSession): AppSession {
  return {
    user: {
      id: demo.id,
      email: demo.email,
      user_metadata: {
        first_name: demo.first_name,
        last_name: demo.last_name,
        organization: demo.organization,
        role: demo.role,
      },
    },
    profile: {
      first_name: demo.first_name,
      last_name: demo.last_name,
      organization: demo.organization,
      role: demo.role,
    },
    role: demo.role,
    isDemo: true,
  }
}

export function getDemoSessionFromCookieValue(value: string | undefined | null): AppSession | null {
  const demo = parseDemoSession(value)
  return demo ? sessionFromDemo(demo) : null
}

export function getBrowserDemoSession(): AppSession | null {
  if (typeof document === "undefined") return null

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${DEMO_SESSION_COOKIE}=`))

  if (!match) return null
  return getDemoSessionFromCookieValue(match.slice(DEMO_SESSION_COOKIE.length + 1))
}

export function setBrowserDemoSession(session: DemoSession) {
  document.cookie = `${DEMO_SESSION_COOKIE}=${encodeURIComponent(JSON.stringify(session))}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

export function clearBrowserDemoSession() {
  document.cookie = `${DEMO_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}

async function withTimeout<T>(promise: Promise<T>, ms = 2500): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      promise,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), ms)
      }),
    ])
  } finally {
    if (timer) clearTimeout(timer)
  }
}

/** Client-safe session lookup. Never imports next/headers. */
export async function getClientAppSession(): Promise<AppSession | null> {
  const demoSession = getBrowserDemoSession()
  if (demoSession) return demoSession

  try {
    const supabase = createClient()
    const authResult = await withTimeout(supabase.auth.getUser())
    const user = authResult?.data.user
    if (!user) return null

    const profileResult = await withTimeout(
      supabase
        .from("profiles")
        .select("first_name, last_name, organization, role")
        .eq("id", user.id)
        .maybeSingle(),
    )
    const profile = profileResult?.data

    const role = (profile?.role || "fisherfolk") as DashboardRole

    return {
      user: {
        id: user.id,
        email: user.email || "",
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        user_metadata: user.user_metadata,
      },
      profile: {
        first_name: profile?.first_name ?? null,
        last_name: profile?.last_name ?? null,
        organization: profile?.organization ?? null,
        role,
      },
      role,
      isDemo: false,
    }
  } catch {
    return null
  }
}
