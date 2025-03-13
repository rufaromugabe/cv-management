"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { collection, getDocs, query } from "firebase/firestore"
import { FileText, Users, Briefcase, PlusCircle } from "lucide-react"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCVs: 0,
    highRatedCVs: 0,
    totalJobs: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get CV analysis count
        const cvAnalysisQuery = query(collection(db, "cv analysis"))
        const cvAnalysisSnapshot = await getDocs(cvAnalysisQuery)
        const totalCVs = cvAnalysisSnapshot.size

        // Count high-rated CVs (vote >= 4)
        let highRatedCVs = 0
        cvAnalysisSnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.VOTE && Number.parseInt(data.VOTE) >= 4) {
            highRatedCVs++
          }
        })

        // Get job posts count
        const jobPostsQuery = query(collection(db, "job-posts"))
        const jobPostsSnapshot = await getDocs(jobPostsQuery)
        const totalJobs = jobPostsSnapshot.size

        setStats({
          totalCVs,
          highRatedCVs,
          totalJobs,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of CV applications and job posts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-200 shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-blue-50 border-b border-blue-100">
            <CardTitle className="text-sm font-medium">Total CV Submissions</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{loading ? "Loading..." : stats.totalCVs}</div>
            <p className="text-xs text-muted-foreground">Total CVs analyzed in the system</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-green-50 border-b border-green-100">
            <CardTitle className="text-sm font-medium">High-Rated Candidates</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{loading ? "Loading..." : stats.highRatedCVs}</div>
            <p className="text-xs text-muted-foreground">Candidates with rating 4 or higher</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 shadow-md overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-purple-50 border-b border-purple-100">
            <CardTitle className="text-sm font-medium">Active Job Posts</CardTitle>
            <Briefcase className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{loading ? "Loading..." : stats.totalJobs}</div>
            <p className="text-xs text-muted-foreground">Current job openings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-amber-200 shadow-md overflow-hidden">
          <CardHeader className="bg-amber-50 border-b border-amber-100">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest CV submissions and job posts</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <p>Loading recent activity...</p>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {stats.totalCVs > 0 ? <p>Recent activity will appear here</p> : <p>No recent activity to display</p>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-indigo-200 shadow-md overflow-hidden">
          <CardHeader className="bg-indigo-50 border-b border-indigo-100">
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Card className="p-4 hover:bg-blue-50 cursor-pointer border-blue-200 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <FileText className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="text-sm">View CV Analysis</span>
                </div>
              </Card>
              <Card className="p-4 hover:bg-purple-50 cursor-pointer border-purple-200 transition-colors">
                <div className="flex flex-col items-center text-center">
                  <PlusCircle className="h-6 w-6 mb-2 text-purple-600" />
                  <span className="text-sm">Add Job Post</span>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

