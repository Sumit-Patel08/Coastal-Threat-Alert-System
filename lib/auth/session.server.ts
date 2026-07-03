import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { DEMO_SESSION_COOKIE, type DashboardRole } from "@/lib/demo-auth"
import { createClient } from "@/lib/supabase/server"
import {
  getDemoSessionFromCookieValue,
  type AppSession,
} from "@/lib/auth/session"

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

export async function getServerAppSession(): Promise<AppSession | null> {
  const cookieStore = await cookies()
  const demoSession = getDemoSessionFromCookieValue(cookieStore.get(DEMO_SESSION_COOKIE)?.value)
  if (demoSession) return demoSession

  try {
    const supabase = await createClient()
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

export async function requireServerRole(expectedRole: DashboardRole): Promise<AppSession> {
  const session = await getServerAppSession()

  if (!session) {
    redirect("/auth/login")
  }

  if (session.role !== expectedRole) {
    redirect("/dashboard")
  }

  return session
}
