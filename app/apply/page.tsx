"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Upload, Briefcase, Info, ArrowLeft, PartyPopper } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface JobPost {
  id: string
  title: string
  location: string
  department: string
  type: string
  status: string
  description: string
  requirements?: string
  benefits?: string
}

export default function ApplyPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState("")
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [jobPosts, setJobPosts] = useState<JobPost[]>([])
  const [isLoadingJobs, setIsLoadingJobs] = useState(true)

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        // Only fetch active job posts
        const q = query(collection(db, "job-posts"), where("status", "==", "Active"))
        const querySnapshot = await getDocs(q)

        const jobs: JobPost[] = []
        querySnapshot.forEach((doc) => {
          jobs.push({
            id: doc.id,
            title: doc.data().title,
            location: doc.data().location,
            department: doc.data().department,
            type: doc.data().type,
            status: doc.data().status,
            description: doc.data().description,
            requirements: doc.data().requirements,
            benefits: doc.data().benefits,
          })
        })

        setJobPosts(jobs)

        // Check if there's a job ID in the URL
        const params = new URLSearchParams(window.location.search)
        const jobIdFromUrl = params.get("job")
        if (jobIdFromUrl) {
          setJobId(jobIdFromUrl)

          // Find the job in the fetched jobs
          const job = jobs.find((j) => j.id === jobIdFromUrl)
          if (job) {
            setSelectedJob(job)
          } else {
            // If not found in the initial fetch, try to get it directly
            try {
              const jobDoc = await getDoc(doc(db, "job-posts", jobIdFromUrl))
              if (jobDoc.exists() && jobDoc.data().status === "Active") {
                const jobData = jobDoc.data()
                setSelectedJob({
                  id: jobIdFromUrl,
                  title: jobData.title,
                  location: jobData.location,
                  department: jobData.department,
                  type: jobData.type,
                  status: jobData.status,
                  description: jobData.description,
                  requirements: jobData.requirements,
                  benefits: jobData.benefits,
                })
              }
            } catch (err) {
              console.error("Error fetching specific job:", err)
            }
          }
        }
      } catch (err) {
        console.error("Error fetching job posts:", err)
        setError("Failed to load available job positions")
      } finally {
        setIsLoadingJobs(false)
      }
    }

    fetchJobPosts()
  }, [])

  // Update selected job when jobId changes
  useEffect(() => {
    if (jobId) {
      const job = jobPosts.find((j) => j.id === jobId)
      if (job) {
        setSelectedJob(job)
      }
    } else {
      setSelectedJob(null)
    }
  }, [jobId, jobPosts])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!name || !email || !file || !jobId || !selectedJob) {
      setError("Please fill in all fields, select a job position, and upload your CV")
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()

      // Applicant information
      formData.append("Name", name)
      formData.append("Email", email)
      formData.append("CV", file)

      // Basic job information
      formData.append("JobId", jobId)
      formData.append("JobTitle", selectedJob.title)
      formData.append("JobLocation", selectedJob.location)
      formData.append("JobDepartment", selectedJob.department || "")
      formData.append("JobType", selectedJob.type || "")

      // Detailed job information
      formData.append("JobDescription", selectedJob.description || "")
      formData.append("JobRequirements", selectedJob.requirements || "")
      formData.append("JobBenefits", selectedJob.benefits || "")

      // Metadata
      formData.append("submittedAt", new Date().toISOString())
      formData.append("formMode", "production")

      const response = await fetch("https://n8n.afrainity.com/webhook-test/24e1ab05-41b4-45d0-9d67-840b9888d46b", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to submit application")
      }

      setSuccess(true)
      setName("")
      setEmail("")
      setFile(null)
      setJobId("")
      setSelectedJob(null)

      // Scroll to top to ensure notification is visible
      window.scrollTo({ top: 0, behavior: "smooth" })

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/")
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-6 sm:py-12">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>

        {success && (
          <div className="max-w-md mx-auto mb-6 animate-fade-in">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 shadow-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                  <PartyPopper className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-green-800">Application Submitted Successfully!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Thank you for applying! We've received your CV and will review it shortly.</p>
                    <p className="mt-1">You'll be redirected to the homepage in a few seconds...</p>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="text-green-700 border-green-300 hover:bg-green-100"
                      onClick={() => router.push("/")}
                    >
                      Return to Home
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-200">
                <p className="text-xs text-green-600">
                  A confirmation email will be sent to {email}. Please check your inbox.
                </p>
              </div>
            </div>
          </div>
        )}

        {!success && (
          <div className="max-w-md mx-auto">
            <Card className="border-blue-200 shadow-md">
              <CardHeader className="bg-blue-50 border-b border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl">Submit Your Application</CardTitle>
                    <CardDescription>Fill out the form below and upload your CV to apply</CardDescription>
                  </div>
                  <Briefcase className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                </div>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4 pt-6">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="job">Job Position</Label>
                    {isLoadingJobs ? (
                      <div className="text-sm text-muted-foreground">Loading available positions...</div>
                    ) : jobPosts.length === 0 ? (
                      <div className="text-sm text-muted-foreground">No open positions available at this time</div>
                    ) : (
                      <div className="space-y-2">
                        <Select value={jobId} onValueChange={setJobId} required>
                          <SelectTrigger id="job" className="border-blue-200 focus:border-blue-400">
                            <SelectValue placeholder="Select a job position" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {jobPosts.map((job) => (
                              <SelectItem key={job.id} value={job.id}>
                                <div className="flex flex-col sm:flex-row sm:items-center">
                                  <span className="font-medium">{job.title}</span>
                                  <span className="text-xs text-muted-foreground sm:ml-2">({job.location})</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {selectedJob && (
                          <div className="rounded-md border border-blue-100 p-3 bg-blue-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-blue-800 text-sm sm:text-base">{selectedJob.title}</h4>
                                <p className="text-xs sm:text-sm text-blue-600">
                                  {selectedJob.location} • {selectedJob.type}
                                </p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="p-1 h-auto">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <span className="sr-only">View job details</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl text-blue-800">{selectedJob.title}</DialogTitle>
                                    <DialogDescription className="flex items-center text-blue-600">
                                      <Briefcase className="h-4 w-4 mr-1" />
                                      {selectedJob.location} • {selectedJob.type}
                                      {selectedJob.department && ` • ${selectedJob.department}`}
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4 py-4">
                                    <div>
                                      <h4 className="font-semibold text-blue-700 mb-2">Job Description</h4>
                                      <p className="text-gray-700 whitespace-pre-line text-sm">
                                        {selectedJob.description}
                                      </p>
                                    </div>

                                    {selectedJob.requirements && (
                                      <div>
                                        <h4 className="font-semibold text-blue-700 mb-2">Requirements</h4>
                                        <p className="text-gray-700 whitespace-pre-line text-sm">
                                          {selectedJob.requirements}
                                        </p>
                                      </div>
                                    )}

                                    {selectedJob.benefits && (
                                      <div>
                                        <h4 className="font-semibold text-blue-700 mb-2">Benefits</h4>
                                        <p className="text-gray-700 whitespace-pre-line text-sm">
                                          {selectedJob.benefits}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {selectedJob.department && (
                                <Badge
                                  variant="outline"
                                  className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs"
                                >
                                  {selectedJob.department}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="border-blue-200 focus:border-blue-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john.doe@example.com"
                      className="border-blue-200 focus:border-blue-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cv">CV (PDF)</Label>
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="cv"
                        className="flex flex-col items-center justify-center w-full h-28 sm:h-32 border-2 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 border-blue-200"
                      >
                        <div className="flex flex-col items-center justify-center pt-4 pb-5">
                          <Upload className="w-6 h-6 sm:w-8 sm:h-8 mb-2 text-blue-500" />
                          <p className="mb-1 text-xs sm:text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                        </div>
                        <Input
                          id="cv"
                          type="file"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                          required
                        />
                      </label>
                    </div>
                    {file && <p className="text-xs sm:text-sm text-gray-500 mt-2">Selected file: {file.name}</p>}
                  </div>
                </CardContent>
                <CardFooter className="bg-blue-50 border-t border-blue-100 flex-col sm:flex-row gap-2">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting || jobPosts.length === 0}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Submitting...
                      </div>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>

            {jobPosts.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <h3 className="font-medium text-sm sm:text-base">Available Positions</h3>
                </div>
                <ul className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {jobPosts.map((job) => (
                    <li key={job.id} className="text-xs sm:text-sm">
                      <button
                        onClick={() => setJobId(job.id)}
                        className={`text-left w-full p-2 rounded-md hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                          jobId === job.id ? "bg-blue-100 text-blue-700" : ""
                        }`}
                      >
                        <span className="font-medium">{job.title}</span> - {job.location}
                        {job.department && <span className="text-muted-foreground text-xs"> ({job.department})</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

