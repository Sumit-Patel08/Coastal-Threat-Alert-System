"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { AppUser } from "@/lib/auth/session"
import { clearBrowserDemoSession, getClientAppSession } from "@/lib/auth/session"

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null

    const getInitialSession = async () => {
      const session = await getClientAppSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    try {
      const supabase = createClient()
      const { data } = supabase.auth.onAuthStateChange(async () => {
        const session = await getClientAppSession()
        setUser(session?.user ?? null)
        setLoading(false)
      })
      subscription = data.subscription
    } catch {
      // Supabase may be unavailable; demo sessions still work via cookie.
    }

    return () => subscription?.unsubscribe()
  }, [])

  const signOut = async () => {
    clearBrowserDemoSession()

    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch {
      // Ignore Supabase errors while signing out of a local demo session.
    }

    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
