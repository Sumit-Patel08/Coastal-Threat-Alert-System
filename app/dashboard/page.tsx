import { redirect } from "next/navigation"
import { getServerAppSession } from "@/lib/auth/session.server"

export default async function DashboardIndex() {
  const session = await getServerAppSession()

  if (!session) {
    redirect("/auth/login")
  }

  const path = {
    disaster_management: "/dashboard/disaster-management",
    coastal_government: "/dashboard/coastal-government",
    environmental_ngo: "/dashboard/environmental-ngo",
    fisherfolk: "/dashboard/fisherfolk",
    civil_defence: "/dashboard/civil-defence",
  }[session.role]

  redirect(path)
}
