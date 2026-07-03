export const DEMO_PASSWORD = "demo123"
export const DEMO_SESSION_COOKIE = "cta_demo_session"

export type DashboardRole =
  | "disaster_management"
  | "coastal_government"
  | "environmental_ngo"
  | "fisherfolk"
  | "civil_defence"

export interface DemoAccount {
  email: string
  role: DashboardRole
  first_name: string
  last_name: string
  organization: string
  id: string
  label: string
}

export interface DemoSession {
  id: string
  email: string
  role: DashboardRole
  first_name: string
  last_name: string
  organization: string
  isDemo: true
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    email: "disaster@demo.com",
    role: "disaster_management",
    first_name: "Demo",
    last_name: "Disaster",
    organization: "State Disaster Management Authority",
    label: "Disaster Management",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    email: "government@demo.com",
    role: "coastal_government",
    first_name: "Demo",
    last_name: "Government",
    organization: "Coastal City Municipal Corporation",
    label: "Coastal Government",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    email: "ngo@demo.com",
    role: "environmental_ngo",
    first_name: "Demo",
    last_name: "NGO",
    organization: "Blue Coast Environmental Trust",
    label: "Environmental NGO",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    email: "fisher@demo.com",
    role: "fisherfolk",
    first_name: "Demo",
    last_name: "Fisher",
    organization: "Coastal Fishing Cooperative",
    label: "Fisherfolk",
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    email: "defence@demo.com",
    role: "civil_defence",
    first_name: "Demo",
    last_name: "Defence",
    organization: "Civil Defence Response Unit",
    label: "Civil Defence",
  },
]

export function authenticateDemo(email: string, password: string): DemoSession | null {
  const account = DEMO_ACCOUNTS.find(
    (item) => item.email.toLowerCase() === email.trim().toLowerCase(),
  )
  if (!account || password !== DEMO_PASSWORD) return null

  return {
    id: account.id,
    email: account.email,
    role: account.role,
    first_name: account.first_name,
    last_name: account.last_name,
    organization: account.organization,
    isDemo: true,
  }
}

export function encodeDemoSession(session: DemoSession): string {
  return encodeURIComponent(JSON.stringify(session))
}

export function parseDemoSession(value: string | undefined | null): DemoSession | null {
  if (!value) return null

  try {
    let session: DemoSession
    try {
      session = JSON.parse(decodeURIComponent(value)) as DemoSession
    } catch {
      session = JSON.parse(value) as DemoSession
    }

    if (!session?.isDemo || !session.email || !session.role || !session.id) return null

    const known = DEMO_ACCOUNTS.find((account) => account.email === session.email)
    if (!known || known.role !== session.role) return null

    return {
      id: known.id,
      email: known.email,
      role: known.role,
      first_name: known.first_name,
      last_name: known.last_name,
      organization: known.organization,
      isDemo: true,
    }
  } catch {
    return null
  }
}

export function getDemoCookieHeader(session: DemoSession): string {
  const value = encodeDemoSession(session)
  return `${DEMO_SESSION_COOKIE}=${value}; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

export function getClearDemoCookieHeader(): string {
  return `${DEMO_SESSION_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`
}
