"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, FileText, Eye, Briefcase, Filter } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

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

export default function CVAnalysisPage() {
  const [cvData, setCvData] = useState<CVAnalysis[]>([])
  const [filteredData, setFilteredData] = useState<CVAnalysis[]>([])
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
    const fetchCVData = async () => {
      try {
        const q = query(collection(db, "cv analysis"), orderBy("DATE", "desc"))
        const querySnapshot = await getDocs(q)

        const data: CVAnalysis[] = []
        querySnapshot.forEach((doc) => {
          const cvDoc = doc.data() as CVAnalysis

          const { ...restCV } = cvDoc
          data.push({
            ...restCV,
            VOTE: cvDoc.VOTE,
            JOB_TITLE: cvDoc.JOB_APPLIED,
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
    if (rating >= 8) return "bg-green-100 text-green-800 hover:bg-green-200"
    if (rating >= 5) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
    return "bg-red-100 text-red-800 hover:bg-red-200"
  }

  const getRatingDescription = (vote: string) => {
    const rating = Number.parseInt(vote)
    if (rating >= 8) return "Excellent"
    if (rating >= 6) return "Good"
    if (rating >= 4) return "Average"
    return "Below Average"
  }

  // Mobile card view for each CV
  const MobileCVCard = ({ cv }: { cv: CVAnalysis }) => (
    <Card key={cv.id} className="mb-4 border-gray-200 overflow-hidden">
      <CardHeader className="p-4 pb-2 bg-gray-50 border-b">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{cv.NAME}</CardTitle>
            <CardDescription className="text-xs">{cv.EMAIL}</CardDescription>
          </div>
          <Badge className={getRatingColor(cv.VOTE)}>{cv.VOTE}/10</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-2 text-sm">
        <div className="flex items-center">
          <span className="font-medium w-24">Location:</span>
          <span>{cv.CITY}</span>
        </div>
        <div className="flex items-center">
          <span className="font-medium w-24">Applied For:</span>
          {cv.JOB_TITLE ? (
            <div className="flex items-center">
              <Briefcase className="h-3 w-3 text-blue-600 mr-1" />
              <span className="text-xs">{cv.JOB_TITLE}</span>
            </div>
          ) : (
            <span className="text-gray-400 text-xs italic">Not specified</span>
          )}
        </div>
        <div className="flex items-center">
          <span className="font-medium w-24">Date:</span>
          <span className="text-xs">{cv.DATE}</span>
        </div>
        <div className="flex justify-end mt-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Eye className="h-3 w-3 mr-1" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-full sm:max-w-3xl max-h-[90vh] overflow-hidden p-0">
              <DialogHeader className="px-4 py-3 border-b">
                <DialogTitle>CV Analysis: {cv.NAME}</DialogTitle>
                <DialogDescription className="text-xs">Detailed analysis of the candidate CV</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[calc(90vh-120px)]">
                <div className="grid gap-4 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold mb-1 text-sm">Contact Information</h3>
                      <div className="space-y-1 text-xs">
                        <div>Email: {cv.EMAIL}</div>
                        <div>Phone: {cv.PHONE}</div>
                        <div>Location: {cv.CITY}</div>
                        <div>Date of Birth: {cv.DATE_OF_BIRTH}</div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold mb-1 text-sm">Application Details</h3>
                      <div className="space-y-1 text-xs">
                        <div>
                          <span className="font-medium">Position:</span> {cv.JOB_TITLE || "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium">Rating:</span>{" "}
                          <Badge className={`${getRatingColor(cv.VOTE)} text-xs px-2 py-0.5`}>
                            {cv.VOTE}/10 - {getRatingDescription(cv.VOTE)}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Date Applied:</span> {cv.DATE}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Summary</h3>
                    <p className="text-xs whitespace-pre-line">{cv.SUMMARIZE}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Skills</h3>
                    <p className="text-xs whitespace-pre-line">{cv.SKILLS}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Education</h3>
                    <p className="text-xs whitespace-pre-line">{cv.EDUCATIONAL}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Job History</h3>
                    <p className="text-xs whitespace-pre-line">{cv.JOB_HISTORY}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-1 text-sm">Consideration</h3>
                    <p className="text-xs whitespace-pre-line">{cv.CONSIDERATION}</p>
                  </div>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">CV Analysis</h1>
        <p className="text-muted-foreground text-sm">Review and analyze candidate CVs</p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by name, email, skills..."
            className="pl-8 border-green-200 focus:border-green-400 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-green-300 hover:bg-green-50 hover:text-green-700 sm:w-auto w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card className="border-green-200 shadow-md overflow-hidden">
        <CardHeader className="bg-green-50 border-b border-green-100 p-4">
          <CardTitle className="text-lg sm:text-xl">Candidate Analysis</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{filteredData.length} candidates found</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-sm">Loading CV data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No CV data found</p>
            </div>
          ) : isMobile ? (
            <div className="p-4">
              {filteredData.map((cv) => (
                <MobileCVCard key={cv.id} cv={cv} />
              ))}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
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
                      <TableCell className="text-sm">{cv.EMAIL}</TableCell>
                      <TableCell className="text-sm">{cv.CITY}</TableCell>
                      <TableCell>
                        {cv.JOB_TITLE ? (
                          <div className="flex items-center">
                            <Briefcase className="h-3.5 w-3.5 text-blue-600 mr-1.5" />
                            <span className="text-sm">{cv.JOB_TITLE}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Not specified</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getRatingColor(cv.VOTE)}>{cv.VOTE}/10</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{cv.DATE}</TableCell>
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
                              <DialogDescription>Detailed analysis of the candidate CV</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h3 className="font-semibold mb-1">Contact Information</h3>
                                  <div className="space-y-1">
                                    <div>Email: {cv.EMAIL}</div>
                                    <div>Phone: {cv.PHONE}</div>
                                    <div>Location: {cv.CITY}</div>
                                    <div>Date of Birth: {cv.DATE_OF_BIRTH}</div>
                                  </div>
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-1">Application Details</h3>
                                  <div className="space-y-1">
                                    <div>
                                      <span className="font-medium">Position:</span> {cv.JOB_TITLE || "Not specified"}
                                    </div>
                                    <div>
                                      <span className="font-medium">Rating:</span>{" "}
                                      <Badge className={`${getRatingColor(cv.VOTE)} text-lg px-2 py-1`}>
                                        {cv.VOTE}/10 - {getRatingDescription(cv.VOTE)}
                                      </Badge>
                                    </div>
                                    <div>
                                      <span className="font-medium">Date Applied:</span> {cv.DATE}
                                    </div>
                                  </div>
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

