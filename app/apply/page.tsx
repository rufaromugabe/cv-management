"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Upload, Briefcase } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"

interface JobPost {
  id: string
  title: string
  location: string
  department: string
  status: string
}

export default function ApplyPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [jobId, setJobId] = useState("")
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
            status: doc.data().status,
          })
        })

        setJobPosts(jobs)

        // Check if there's a job ID in the URL
        const params = new URLSearchParams(window.location.search)
        const jobIdFromUrl = params.get("job")
        if (jobIdFromUrl) {
          setJobId(jobIdFromUrl)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!name || !email || !file || !jobId) {
      setError("Please fill in all fields, select a job position, and upload your CV")
      setIsSubmitting(false)
      return
    }

    try {
      // Find the selected job details to include in the form
      const selectedJob = jobPosts.find((job) => job.id === jobId)

      const formData = new FormData()
      formData.append("Name", name)
      formData.append("Email", email)
      formData.append("CV", file)
      formData.append("JobId", jobId)
      formData.append("JobTitle", selectedJob?.title || "")
      formData.append("JobLocation", selectedJob?.location || "")
      formData.append("JobDepartment", selectedJob?.department || "")
      formData.append("submittedAt", new Date().toISOString())
      formData.append("formMode", "production")

      const response = await fetch("https://n8n.afrainity.com/form/2a87705d-8ba1-41f1-80ef-85f364ce253e", {
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

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push("/")
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto">
        <Card className="border-blue-200 shadow-md">
          <CardHeader className="bg-blue-50 border-b border-blue-100">
            <CardTitle>Submit Your Application</CardTitle>
            <CardDescription>Fill out the form below and upload your CV to apply</CardDescription>
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

              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    Your application has been submitted successfully. We'll be in touch soon!
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="job">Job Position</Label>
                {isLoadingJobs ? (
                  <div className="text-sm text-muted-foreground">Loading available positions...</div>
                ) : jobPosts.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No open positions available at this time</div>
                ) : (
                  <Select value={jobId} onValueChange={setJobId} required>
                    <SelectTrigger id="job" className="border-blue-200 focus:border-blue-400">
                      <SelectValue placeholder="Select a job position" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobPosts.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          <div className="flex items-center">
                            <span>{job.title}</span>
                            <span className="ml-2 text-xs text-muted-foreground">({job.location})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 border-blue-200"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-blue-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF (MAX. 10MB)</p>
                    </div>
                    <Input id="cv" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" required />
                  </label>
                </div>
                {file && <p className="text-sm text-gray-500 mt-2">Selected file: {file.name}</p>}
              </div>
            </CardContent>
            <CardFooter className="bg-blue-50 border-t border-blue-100">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting || success || jobPosts.length === 0}
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {jobPosts.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium">Available Positions</h3>
            </div>
            <ul className="space-y-2">
              {jobPosts.map((job) => (
                <li key={job.id} className="text-sm">
                  <span className="font-medium">{job.title}</span> - {job.location}
                  {job.department && <span className="text-muted-foreground"> ({job.department})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

