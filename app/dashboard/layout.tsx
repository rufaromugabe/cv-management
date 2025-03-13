import type React from "react"
import AuthCheck from "@/components/auth-check"
import DashboardSidebar from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthCheck>
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex-1 md:p-6 pt-[72px] md:pt-6 px-6">{children}</div>
      </div>
    </AuthCheck>
  )
}

