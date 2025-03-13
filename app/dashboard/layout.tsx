import type React from "react"
import AuthCheck from "@/components/auth-check"
import DashboardSidebar from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
   
      <div className="flex min-h-screen">
        <DashboardSidebar />
        <div className="flex-1 p-6">{children}</div>
      </div>
    
  )
}

