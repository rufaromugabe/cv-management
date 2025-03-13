"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Eye, Briefcase } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CVAnalysis {
  id: string
  NAME: string
  EMAIL: string
  SKILLS: string
  VOTE: string
  CITY: string
  PHONE: string
  EDUCATIONAL: string
  JOB_HISTORY: string
  CONSIDERATION: string
  SUMMARIZE: string
  DATE: string
  DATE_OF_BIRTH: string
  JOB_APPLIED: string
  JOB_TITLE?: string
}

interface JobPost {
  id: string
  title: string
}

export default function CVAnalysisPage() {
  const [cvData, setCvData] = useState<CVAnalysis[]>([])
  const [filteredData, setFilteredData] = useState<CVAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [jobPosts, setJobPosts] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchJobPosts = async () => {
      try {
        const q = query(collection(db, "job-posts"))
        const querySnapshot = await getDocs(q)

        const jobs: Record<string, string> = {}
        querySnapshot.forEach((doc) => {
          jobs[doc.id] = doc.data().title
        })

        return jobs
      } catch (error) {
        console.error("Error fetching job posts:", error)
        return {}
      }
    }

    const fetchCVData = async () => {
      try {
        const jobs = await fetchJobPosts()
        setJobPosts(jobs)

        const q = query(collection(db, "cv analysis"), orderBy("DATE", "desc"))
        const querySnapshot = await getDocs(q)

        const data: CVAnalysis[] = []
        querySnapshot.forEach((doc) => {
          const cvDoc = doc.data() as CVAnalysis
          data.push({
            id: doc.id,
            ...cvDoc,
            JOB_TITLE: cvDoc.JOB_APPLIED ? jobs[cvDoc.JOB_APPLIED] || "Unknown Position" : "Not specified",
          })
        })

        setCvData(data)
        setFilteredData(data)
      } catch (error) {
        console.error("Error fetching CV data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCVData()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = cvData.filter((cv) => {
        const searchable = `${cv.NAME} ${cv.EMAIL} ${cv.SKILLS} ${cv.CITY} ${cv.JOB_TITLE}`.toLowerCase()
        return searchable.includes(searchTerm.toLowerCase())
      })
      setFilteredData(filtered)
    } else {
      setFilteredData(cvData)
    }
  }, [searchTerm, cvData])

  const getRatingColor = (vote: string) => {
    const rating = Number.parseInt(vote)
    if (rating >= 4) return "bg-green-100 text-green-800 hover:bg-green-200"
    if (rating >= 2) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    return "bg-red-100 text-red-800 hover:bg-red-200"
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">CV Analysis</h1>
        <p className="text-muted-foreground">Review and analyze candidate CVs</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, skills, location or job position..."
            className="pl-8 border-green-200 focus:border-green-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="border-green-300 hover:bg-green-50 hover:text-green-700">
          Filter
        </Button>
      </div>

      <Card className="border-green-200 shadow-md overflow-hidden">
        <CardHeader className="bg-green-50 border-b border-green-100">
          <CardTitle>Candidate Analysis</CardTitle>
          <CardDescription>{filteredData.length} candidates found</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <p>Loading CV data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No CV data found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Job Applied For</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((cv) => (
                    <TableRow key={cv.id}>
                      <TableCell className="font-medium">{cv.NAME}</TableCell>
                      <TableCell>{cv.EMAIL}</TableCell>
                      <TableCell>{cv.CITY}</TableCell>
                      <TableCell>
                        {cv.JOB_TITLE ? (
                          <div className="flex items-center">
                            <Briefcase className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
                            <span>{cv.JOB_TITLE}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm italic">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRatingColor(cv.VOTE)}>{cv.VOTE}/5</Badge>
                      </TableCell>
                      <TableCell>{cv.DATE}</TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                              <span className="sr-only">View details</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>CV Analysis: {cv.NAME}</DialogTitle>
                              <DialogDescription>Detailed analysis of the candidate's CV</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-1">Contact Information</h3>
                                  <p>Email: {cv.EMAIL}</p>
                                  <p>Phone: {cv.PHONE}</p>
                                  <p>Location: {cv.CITY}</p>
                                  <p>Date of Birth: {cv.DATE_OF_BIRTH}</p>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-1">Application Details</h3>
                                  <p>
                                    <span className="font-medium">Position:</span> {cv.JOB_TITLE || "Not specified"}
                                  </p>
                                  <p>
                                    <span className="font-medium">Rating:</span>{" "}
                                    <Badge className={`${getRatingColor(cv.VOTE)} text-lg px-2 py-1`}>
                                      {cv.VOTE}/5
                                    </Badge>
                                  </p>
                                  <p>
                                    <span className="font-medium">Date Applied:</span> {cv.DATE}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-1">Summary</h3>
                                <p className="text-sm whitespace-pre-line">{cv.SUMMARIZE}</p>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-1">Skills</h3>
                                <p className="text-sm whitespace-pre-line">{cv.SKILLS}</p>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-1">Education</h3>
                                <p className="text-sm whitespace-pre-line">{cv.EDUCATIONAL}</p>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-1">Job History</h3>
                                <p className="text-sm whitespace-pre-line">{cv.JOB_HISTORY}</p>
                              </div>

                              <div>
                                <h3 className="font-semibold mb-1">Consideration</h3>
                                <p className="text-sm whitespace-pre-line">{cv.CONSIDERATION}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
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

