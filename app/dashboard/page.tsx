"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/firebase"
import { collection, getDocs, query } from "firebase/firestore"
import { FileText, Users, Briefcase, PlusCircle, LineChart } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface JobRating {
  id: string
  jobTitle: string
  rating: number
  date: Date
}

interface JobStats {
  jobId: string
  jobTitle: string
  ratings: JobRating[]
  averageRating: number
  totalApplications: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCVs: 0,
    highRatedCVs: 0,
    totalJobs: 0,
  })
  const [loading, setLoading] = useState(true)
  const [jobStats, setJobStats] = useState<JobStats[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>("")
  const [loadingJobStats, setLoadingJobStats] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get CV analysis count
        const cvAnalysisQuery = query(collection(db, "cv analysis"))
        const cvAnalysisSnapshot = await getDocs(cvAnalysisQuery)
        const totalCVs = cvAnalysisSnapshot.size

        // Count high-rated CVs (vote >= 8 on a 10-point scale)
        let highRatedCVs = 0
        cvAnalysisSnapshot.forEach((doc) => {
          const data = doc.data()
          if (data.VOTE && Number.parseInt(data.VOTE) >= 8) {
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

    const fetchJobRatings = async () => {
      try {
        setLoadingJobStats(true)

        // Get all job posts
        const jobPostsQuery = query(collection(db, "job-posts"))
        const jobPostsSnapshot = await getDocs(jobPostsQuery)

        const jobsMap = new Map()
        jobPostsSnapshot.forEach((doc) => {
          jobsMap.set(doc.id, {
            id: doc.id,
            title: doc.data().title,
          })
        })

        // Get CV analysis with job information
        const cvAnalysisQuery = query(collection(db, "cv analysis"))
        const cvAnalysisSnapshot = await getDocs(cvAnalysisQuery)

        const jobStatsMap = new Map<string, JobStats>()

        cvAnalysisSnapshot.forEach((doc) => {
          const data = doc.data()
          const jobId = data.JobId || "unknown"
          const jobTitle = data.JOB_APPLIED || jobsMap.get(jobId)?.title || "Unknown Job"
          const rating = data.VOTE ? Number.parseInt(data.VOTE) : 0
          const date = data.submittedAt ? new Date(data.submittedAt) : new Date()

          if (!jobStatsMap.has(jobId)) {
            jobStatsMap.set(jobId, {
              jobId,
              jobTitle,
              ratings: [],
              averageRating: 0,
              totalApplications: 0,
            })
          }

          const jobStat = jobStatsMap.get(jobId)!
          jobStat.ratings.push({
            id: doc.id,
            jobTitle,
            rating,
            date,
          })
          jobStat.totalApplications++
        })

        // Calculate average ratings and sort by date
        const jobStatsArray: JobStats[] = []

        jobStatsMap.forEach((stats) => {
          // Sort ratings by date
          stats.ratings.sort((a, b) => a.date.getTime() - b.date.getTime())

          // Calculate average rating
          const sum = stats.ratings.reduce((acc, curr) => acc + curr.rating, 0)
          stats.averageRating = stats.totalApplications > 0 ? sum / stats.totalApplications : 0

          jobStatsArray.push(stats)
        })

        // Sort by total applications
        jobStatsArray.sort((a, b) => b.totalApplications - a.totalApplications)

        setJobStats(jobStatsArray)

        // Set default selected job to the one with most applications
        if (jobStatsArray.length > 0 && !selectedJobId) {
          setSelectedJobId(jobStatsArray[0].jobId)
        }
      } catch (error) {
        console.error("Error fetching job ratings:", error)
      } finally {
        setLoadingJobStats(false)
      }
    }

    fetchStats()
    fetchJobRatings()
  }, [selectedJobId])

  // Get the selected job stats
  const selectedJobStats = jobStats.find((job) => job.jobId === selectedJobId)

  // Function to render the line chart
  const renderLineChart = () => {
    if (!selectedJobStats || selectedJobStats.ratings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground">
          <LineChart className="h-12 w-12 mb-2 text-blue-200" />
          <p>No rating data available for this job</p>
        </div>
      )
    }

    const ratings = selectedJobStats.ratings
    const maxRating = 10 // Using 10-point scale
    const chartHeight = 200
    const chartWidth = "100%"

    // Calculate points for the line
    const points = ratings
      .map((rating, index) => {
        const x = `${(index / (ratings.length - 1)) * 100}%`
        const y = chartHeight - (rating.rating / maxRating) * chartHeight
        return `${x},${y}`
      })
      .join(" ")

    return (
      <div className="relative h-[200px] w-full mt-4">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>10</span>
          <span>5</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-6 right-0 h-full">
          {/* Horizontal grid lines */}
          <div className="absolute w-full h-full flex flex-col justify-between">
            <div className="border-t border-gray-200 w-full"></div>
            <div className="border-t border-gray-200 w-full"></div>
            <div className="border-t border-gray-200 w-full"></div>
          </div>

          {/* SVG for line chart */}
          <svg width={chartWidth} height={chartHeight} className="overflow-visible">
            {/* Line */}
            <polyline
              points={points}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {ratings.map((rating, index) => {
              const x = `${(index / (ratings.length - 1)) * 100}%`
              const y = chartHeight - (rating.rating / maxRating) * chartHeight
              return (
                <g key={index}>
                  <circle cx={x} cy={y} r="4" fill="#3b82f6" stroke="white" strokeWidth="2" />
                  <title>Rating: {rating.rating}/10</title>
                </g>
              )
            })}
          </svg>

          {/* X-axis labels (show first, middle, and last date) */}
          <div className="absolute bottom-[-20px] w-full flex justify-between text-xs text-gray-500">
            {ratings.length > 0 && (
              <>
                <span>{ratings[0].date.toLocaleDateString()}</span>
                {ratings.length > 2 && <span>{ratings[Math.floor(ratings.length / 2)].date.toLocaleDateString()}</span>}
                <span>{ratings[ratings.length - 1].date.toLocaleDateString()}</span>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

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
            <p className="text-xs text-muted-foreground">Candidates with rating 8 or higher</p>
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle>Job Rating Trends</CardTitle>
                <CardDescription>CV ratings over time by job position</CardDescription>
              </div>

              <Select
                value={selectedJobId}
                onValueChange={setSelectedJobId}
                disabled={loadingJobStats || jobStats.length === 0}
              >
                <SelectTrigger className="w-full sm:w-[200px] text-xs sm:text-sm h-8 border-amber-200">
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobStats.map((job) => (
                    <SelectItem key={job.jobId} value={job.jobId} className="text-xs sm:text-sm">
                      {job.jobTitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {loadingJobStats ? (
              <div className="flex justify-center items-center h-[200px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : jobStats.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No CV rating data available</p>
              </div>
            ) : (
              <div>
                {selectedJobStats && (
                  <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <h3 className="font-medium">{selectedJobStats.jobTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        {selectedJobStats.totalApplications} applications • Avg. Rating:{" "}
                        {selectedJobStats.averageRating.toFixed(1)}/10
                      </p>
                    </div>
                    <Link href="/dashboard/cv-analysis">
                      <Button variant="outline" size="sm" className="mt-2 sm:mt-0 text-xs">
                        View All CVs
                      </Button>
                    </Link>
                  </div>
                )}
                {renderLineChart()}
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
              <Link href="/dashboard/cv-analysis">
                <Card className="p-4 hover:bg-blue-50 cursor-pointer border-blue-200 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <FileText className="h-6 w-6 mb-2 text-blue-600" />
                    <span className="text-sm">View CV Analysis</span>
                  </div>
                </Card>
              </Link>
              <Link href="/dashboard/job-posts/new">
                <Card className="p-4 hover:bg-purple-50 cursor-pointer border-purple-200 transition-colors">
                  <div className="flex flex-col items-center text-center">
                    <PlusCircle className="h-6 w-6 mb-2 text-purple-600" />
                    <span className="text-sm">Add Job Post</span>
                  </div>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

