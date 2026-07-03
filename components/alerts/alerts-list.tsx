import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Alert = {
  id: string
  title: string
  message: string
  severity: "info" | "watch" | "warning" | "severe"
  audience: "all" | "admin" | "agency" | "community" | "resident" | "researcher"
  status: "draft" | "sent"
  created_at: string
}

function severityClasses(s: Alert["severity"]) {
  switch (s) {
    case "info":
      return "text-teal-700"
    case "watch":
      return "text-amber-700"
    case "warning":
      return "text-orange-700"
    case "severe":
      return "text-red-700"
    default:
      return "text-foreground"
  }
}

export async function AlertsList({ title = "Alerts" }: { title?: string }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Default role: resident (used in landing demos prior to signup)
  let role = "resident"

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    role = profile?.role || "resident"
  }

  const audiences = role === "admin" ? undefined : ["all", role]
  const query = supabase.from("alerts").select("*").order("created_at", { ascending: false })
  const { data: alerts, error } = audiences ? await query.in("audience", audiences) : await query

  // Handle missing table (42P01) gracefully with an init hint
  const isNotInitialized = (error as any)?.code === "42P01"

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isNotInitialized ? (
          <p className="text-sm text-amber-700">
            Database not initialized. Please run scripts/001_profiles.sql through scripts/006_detections.sql.
          </p>
        ) : !alerts?.length && !error ? (
          <p className="text-sm text-muted-foreground">No alerts to display.</p>
        ) : error ? (
          <p className="text-sm text-red-600">Failed to load alerts.</p>
        ) : (
          <ul className="space-y-4">
            {alerts!.map((a: Alert) => (
              <li key={a.id} className="rounded border p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xs font-medium ${severityClasses(a.severity)}`}>
                      {a.severity.toUpperCase()}
                    </span>
                    <span className="text-xs text-muted-foreground">• {a.audience}</span>
                    <span className="text-xs text-muted-foreground">• {a.status}</span>
                  </div>
                  <time className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</time>
                </div>
                <h4 className="mt-1 text-sm font-medium">{a.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{a.message}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
