"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Briefcase, Filter } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface JobPost {
  id: string
  title: string
  location: string
  department: string
  type: string
  status: string
  createdAt: any
}

export default function JobPostsPage() {
  const [jobPosts, setJobPosts] = useState<JobPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if we're on the client side
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(window.innerWidth < 768)
      }

      // Initial check
      checkMobile()

      // Add event listener for window resize
      window.addEventListener("resize", checkMobile)

      // Cleanup
      return () => window.removeEventListener("resize", checkMobile)
    }
  }, [])

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        const q = query(collection(db, "job-posts"), orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)

        const data: JobPost[] = []
        querySnapshot.forEach((doc) => {
          data.push({
            id: doc.id,
            ...doc.data(),
          } as JobPost)
        })

        setJobPosts(data)
        setFilteredPosts(data)
      } catch (error) {
        console.error("Error fetching job posts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobPosts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = jobPosts.filter((job) => {
        const searchable = `${job.title} ${job.location} ${job.department}`.toLowerCase()
        return searchable.includes(searchTerm.toLowerCase())
      })
      setFilteredPosts(filtered)
    } else {
      setFilteredPosts(jobPosts)
    }
  }, [searchTerm, jobPosts])

  const handleDeleteJob = async (id: string) => {
    try {
      await deleteDoc(doc(db, "job-posts", id))
      setJobPosts(jobPosts.filter((job) => job.id !== id))
    } catch (error) {
      console.error("Error deleting job post:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 hover:bg-green-200 border border-green-300"
      case "draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
      case "closed":
        return "bg-red-100 text-red-800 hover:bg-red-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  // Mobile card view for each job post
  const MobileJobCard = ({ job }: { job: JobPost }) => (
    <Card key={job.id} className="mb-4 border-blue-100 overflow-hidden">
      <CardHeader className="p-4 pb-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base text-blue-800">{job.title}</CardTitle>
          <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
        </div>
        <CardDescription className="text-xs flex items-center text-blue-600">
          <Briefcase className="h-3 w-3 mr-1" />
          {job.location}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-2 text-sm">
        <div className="flex items-center">
          <span className="font-medium w-24">Department:</span>
          <span>{job.department || "Not specified"}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium w-24">Type:</span>
          <span>{job.type}</span>
        </div>
        <div className="flex justify-between mt-3">
          <Link href={`/dashboard/job-posts/${job.id}`}>
            <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-xs">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-800 hover:bg-red-50 text-xs">
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  This will permanently delete the job post. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteJob(job.id)} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Job Posts</h1>
          <p className="text-muted-foreground text-sm">Manage your job postings</p>
        </div>
        <Link href="/dashboard/job-posts/new">
          <Button size={isMobile ? "sm" : "default"} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            New Job Post
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title, location or department..."
            className="pl-8 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="sm:w-auto w-full">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card className="border-blue-200 shadow-md overflow-hidden">
        <CardHeader className="bg-blue-50 border-b border-blue-100 p-4">
          <CardTitle className="text-lg sm:text-xl">Job Listings</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{filteredPosts.length} job posts found</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-sm">Loading job posts...</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Briefcase className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No job posts found</p>
              <Link href="/dashboard/job-posts/new" className="mt-4">
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first job post
                </Button>
              </Link>
            </div>
          ) : isMobile ? (
            <div className="p-4">
              {filteredPosts.map((job) => (
                <MobileJobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>{job.location}</TableCell>
                      <TableCell>{job.department}</TableCell>
                      <TableCell>{job.type}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/dashboard/job-posts/${job.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                          </Link>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete the job post. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

