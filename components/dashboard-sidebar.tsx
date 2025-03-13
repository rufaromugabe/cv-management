"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, FileText, Home, LogOut, Menu, PlusCircle } from "lucide-react"
import { auth } from "@/lib/firebase"
import { signOut } from "firebase/auth"

export default function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <>
      <div className="md:hidden p-4 border-b">
        <Button variant="outline" size="icon" onClick={() => setIsOpen(!isOpen)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </div>

      <div
        className={`fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden ${isOpen ? "block" : "hidden"}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <div
        className={`fixed top-0 left-0 z-50 h-[100vh] w-3/4 max-w-xs bg-gradient-to-b from-blue-50 to-indigo-50 shadow-lg transition-transform duration-300 ease-in-out md:sticky md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:block border-r border-blue-200`}
      >
        <div className="flex flex-col h-[100vh]">
          <div className="flex-grow">
            <div className="p-6 border-b border-blue-200">
              <h2 className="text-xl font-bold text-blue-800">Admin Dashboard</h2>
            </div>
            <nav className="space-y-1 p-4">
              <Link href="/dashboard">
                <Button variant={isActive("/dashboard") ? "default" : "ghost"} className="w-full justify-start">
                  <Home className="mr-2 h-5 w-5" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/cv-analysis">
                <Button
                  variant={isActive("/dashboard/cv-analysis") ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  CV Analysis
                </Button>
              </Link>
              <Link href="/dashboard/job-posts">
                <Button
                  variant={isActive("/dashboard/job-posts") ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Job Posts
                </Button>
              </Link>
              <Link href="/dashboard/job-posts/new">
                <Button
                  variant={isActive("/dashboard/job-posts/new") ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <PlusCircle className="mr-2 h-5 w-5" />
                  New Job Post
                </Button>
              </Link>
            </nav>
          </div>
          <div className="border-t border-blue-200 p-4 w-full">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

