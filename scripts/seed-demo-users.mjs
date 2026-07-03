/**
 * Creates demo Supabase Auth users for each dashboard role.
 * Uses the public Auth API (anon key). Prefer scripts/007_seed_demo_users.sql
 * in the Supabase SQL Editor when you have dashboard access.
 *
 * Usage:
 *   node scripts/seed-demo-users.mjs
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
 * in .env.local (or the environment).
 */

import { createClient } from "@supabase/supabase-js"
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local")
  if (!existsSync(envPath)) return

  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

const DEMO_PASSWORD = "demo123"

const DEMO_USERS = [
  {
    email: "disaster@demo.com",
    first_name: "Demo",
    last_name: "Disaster",
    organization: "State Disaster Management Authority",
    role: "disaster_management",
  },
  {
    email: "government@demo.com",
    first_name: "Demo",
    last_name: "Government",
    organization: "Coastal City Municipal Corporation",
    role: "coastal_government",
  },
  {
    email: "ngo@demo.com",
    first_name: "Demo",
    last_name: "NGO",
    organization: "Blue Coast Environmental Trust",
    role: "environmental_ngo",
  },
  {
    email: "fisher@demo.com",
    first_name: "Demo",
    last_name: "Fisher",
    organization: "Coastal Fishing Cooperative",
    role: "fisherfolk",
  },
  {
    email: "defence@demo.com",
    first_name: "Demo",
    last_name: "Defence",
    organization: "Civil Defence Response Unit",
    role: "civil_defence",
  },
]

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY")
  process.exit(1)
}

const supabase = createClient(url, anonKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function ensureUser(user) {
  const { data, error } = await supabase.auth.signUp({
    email: user.email,
    password: DEMO_PASSWORD,
    options: {
      data: {
        first_name: user.first_name,
        last_name: user.last_name,
        organization: user.organization,
        role: user.role,
      },
    },
  })

  if (error) {
    // User may already exist — try signing in to confirm credentials work
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: DEMO_PASSWORD,
    })
    await supabase.auth.signOut()

    if (signInError) {
      return { email: user.email, status: "failed", detail: error.message }
    }
    return { email: user.email, status: "exists", detail: "login ok" }
  }

  const userId = data.user?.id
  if (!userId) {
    return {
      email: user.email,
      status: "pending",
      detail: "created but email confirmation may be required",
    }
  }

  // Best-effort profile upsert (RLS allows insert/update for own row while session is active)
  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    first_name: user.first_name,
    last_name: user.last_name,
    organization: user.organization,
    role: user.role,
  })

  await supabase.auth.signOut()

  if (profileError) {
    return {
      email: user.email,
      status: "partial",
      detail: `user created; profile: ${profileError.message}`,
    }
  }

  return { email: user.email, status: "created", detail: user.role }
}

console.log("Seeding demo dashboard users...\n")

for (const user of DEMO_USERS) {
  const result = await ensureUser(user)
  console.log(`${result.status.padEnd(8)} ${result.email} — ${result.detail}`)
}

console.log("\nDemo password for all accounts: demo123")
console.log("If any account failed, run scripts/007_seed_demo_users.sql in the Supabase SQL Editor.")
