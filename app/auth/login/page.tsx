"use client"

import type React from "react"
import { useEffect } from "react"
import { createClient as createBrowserClient_ } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { authenticateDemo, DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/demo-auth"
import { setBrowserDemoSession } from "@/lib/auth/session"

export default function Page() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const urlError = searchParams.get("error")
    if (urlError) {
      setError(urlError)
    }
  }, [searchParams])

  const finishLogin = () => {
    const next = searchParams.get("next")
    router.push(next || "/dashboard")
    router.refresh()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Demo accounts work fully offline (no Supabase required)
    const demoSession = authenticateDemo(email, password)
    if (demoSession) {
      setBrowserDemoSession(demoSession)
      finishLogin()
      setIsLoading(false)
      return
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setError("Invalid credentials. Use a demo account or configure Supabase.")
      setIsLoading(false)
      return
    }

    const supabase = createBrowserClient_()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      finishLogin()
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch")) {
          setError(
            "Supabase is unavailable. Use a demo account below (password: demo123) to continue offline.",
          )
        } else {
          setError(error.message)
        }
      } else {
        setError("An unexpected error occurred")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login. Demo accounts work without Supabase.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/sign-up" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
                <div className="mt-4 rounded-md border bg-muted/40 p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Demo accounts (password: {DEMO_PASSWORD}) — work offline
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {DEMO_ACCOUNTS.map((account) => (
                      <Button
                        key={account.email}
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setEmail(account.email)
                          setPassword(DEMO_PASSWORD)
                          setError(null)
                        }}
                      >
                        {account.label}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex justify-center">
                  <Link
                    href="/"
                    className="inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent"
                  >
                    Go to Main Page
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
