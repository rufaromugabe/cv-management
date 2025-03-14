"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, CheckCircle, MapPin, Clock, Info, Menu } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

interface JobPost {
  id: string
  title: string
  location: string
  department: string
  type: string
  description: string
  requirements?: string
  benefits?: string
}

export default function Home() {
  const [activeJobs, setActiveJobs] = useState<JobPost[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    const fetchActiveJobs = async () => {
      try {
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
            description: doc.data().description,
            requirements: doc.data().requirements,
            benefits: doc.data().benefits,
          })
        })

        setActiveJobs(jobs)
      } catch (error) {
        console.error("Error fetching active jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveJobs()
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-gradient-to-r from-blue-100 to-indigo-100 relative sticky top-0 z-40">
        <div className="absolute inset-0 bg-grid-blue-900/[0.03] bg-[size:20px_20px]"></div>
        <div className="container flex h-16 sm:h-20 items-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center">
            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mr-2 sm:mr-3 shadow-md">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent [color-scheme:only_light] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
              CV Portal
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="ml-auto hidden sm:flex gap-4 sm:gap-6">
            <Link href="/apply" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Apply Now
            </Link>
            <Link href="/auth/sign-in" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Admin Login
            </Link>
          </nav>

          {/* Mobile Navigation */}
          <div className="ml-auto sm:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px] bg-gradient-to-b from-blue-50 to-indigo-50">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link
                    href="/apply"
                    className="flex items-center px-2 py-3 text-base font-medium hover:text-blue-600 transition-colors border-b border-blue-100"
                  >
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Apply Now
                  </Link>
                  <Link
                    href="/auth/sign-in"
                    className="flex items-center px-2 py-3 text-base font-medium hover:text-blue-600 transition-colors"
                  >
                    <Briefcase className="mr-2 h-5 w-5" />
                    Admin Login
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-8 sm:py-12 md:py-20 lg:py-28 bg-gradient-to-b from-blue-100 via-indigo-50 to-white relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-blue-900/[0.02] bg-[size:30px_30px]"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-600 shadow-sm">
                  <span className="font-medium">Career Opportunities</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent [color-scheme:only_light] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                  Find Your Next Career Opportunity
                </h2>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-base/relaxed xl:text-xl/relaxed max-w-[600px]">
                  Submit your CV and let our team find the perfect match for your skills and experience. We connect
                  talented professionals with leading companies.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Link href="/apply">
                    <Button className="w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 sm:px-8 shadow-lg transition-all hover:shadow-blue-200/50">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center mt-6 lg:mt-0">
                <div className="relative max-w-[300px] sm:max-w-[350px] md:max-w-[400px]">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 opacity-30 blur"></div>
                  <img
                    src="/pic.jpg?height=600&width=600"
                    alt="Career opportunities"
                    className="relative rounded-lg object-cover bg-white w-full"
                    width={400}
                    height={400}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-8 sm:py-12 md:py-20 lg:py-28 bg-white relative">
          <div className="absolute inset-0 bg-grid-blue-900/[0.01] bg-[size:20px_20px]"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 max-w-[800px]">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-blue-700">
                  How It Works
                </h2>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg">
                  Our simple process helps you find your next opportunity
                </p>
              </div>
              <div className="grid w-full grid-cols-1 gap-6 sm:gap-8 md:grid-cols-3 lg:gap-12 mt-6 sm:mt-8">
                <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4 sm:p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                    <span className="text-lg sm:text-xl font-bold">1</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-800">Submit Your CV</h3>
                  <p className="text-gray-600 text-center text-sm sm:text-base">
                    Fill out our simple form and upload your CV to get started
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4 sm:p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                    <span className="text-lg sm:text-xl font-bold">2</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-800">Automated Analysis</h3>
                  <p className="text-gray-600 text-center text-sm sm:text-base">
                    Our system analyzes your CV for the best job matches
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 bg-blue-50/50 p-4 sm:p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md">
                    <span className="text-lg sm:text-xl font-bold">3</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-blue-800">Get Matched</h3>
                  <p className="text-gray-600 text-center text-sm sm:text-base">
                    We ll contact you if your profile matches our opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-8 sm:py-12 md:py-20 lg:py-28 bg-gradient-to-b from-white to-blue-50 relative">
          <div className="absolute inset-0 bg-grid-blue-900/[0.02] bg-[size:20px_20px]"></div>
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-6 sm:mb-10">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-600 shadow-sm">
                  <span className="font-medium">Open Positions</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tighter text-blue-700">
                  Current Job Openings
                </h2>
                <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-[800px] mx-auto">
                  Browse our latest opportunities and find the perfect role for your skills and experience
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-8 sm:py-12">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 bg-blue-200 rounded-full mb-4"></div>
                  <div className="h-4 w-32 bg-blue-100 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-blue-50 rounded"></div>
                </div>
              </div>
            ) : activeJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                <Briefcase className="h-12 w-12 sm:h-16 sm:w-16 text-blue-200 mb-4" />
                <h3 className="text-lg sm:text-xl font-medium text-gray-600 mb-2">No open positions at the moment</h3>
                <p className="text-gray-500 text-sm sm:text-base">Please check back later for new opportunities</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeJobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden border-blue-100 transition-all hover:shadow-md group">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-3 sm:pb-4">
                      <CardTitle className="text-blue-800 text-lg sm:text-xl">{job.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center text-blue-600 mt-1">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {job.location}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-3 sm:pt-4">
                      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {job.type}
                        </Badge>
                        {job.department && (
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                            {job.department}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 line-clamp-3 text-xs sm:text-sm">{job.description}</p>
                    </CardContent>
                    <CardFooter className="border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 flex flex-col sm:flex-row gap-2 sm:justify-between">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50 w-full sm:w-auto text-xs sm:text-sm"
                          >
                            <Info className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Read More
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="text-xl text-blue-800">{job.title}</DialogTitle>
                            <DialogDescription className="flex items-center text-blue-600">
                              <MapPin className="h-4 w-4 mr-1" />
                              {job.location} • {job.type}
                              {job.department && ` • ${job.department}`}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <h4 className="font-semibold text-blue-700 mb-2">Job Description</h4>
                              <p className="text-gray-700 whitespace-pre-line">{job.description}</p>
                            </div>

                            {job.requirements && (
                              <div>
                                <h4 className="font-semibold text-blue-700 mb-2">Requirements</h4>
                                <p className="text-gray-700 whitespace-pre-line">{job.requirements}</p>
                              </div>
                            )}

                            {job.benefits && (
                              <div>
                                <h4 className="font-semibold text-blue-700 mb-2">Benefits</h4>
                                <p className="text-gray-700 whitespace-pre-line">{job.benefits}</p>
                              </div>
                            )}
                          </div>
                          <DialogFooter>
                            <Link href={`/apply?job=${job.id}`} className="w-full sm:w-auto">
                              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Apply for this Position
                              </Button>
                            </Link>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Link href={`/apply?job=${job.id}`} className="w-full sm:w-auto">
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 w-full text-xs sm:text-sm"
                        >
                          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          Apply
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-6 sm:mt-10">
              <Link href="/apply">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 text-sm">
                  View All Positions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 sm:py-8 bg-gradient-to-r from-blue-50 to-indigo-50 relative">
        <div className="absolute inset-0 bg-grid-blue-900/[0.02] bg-[size:20px_20px]"></div>
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6 relative z-10">
          <div className="flex items-center">
            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mr-2 shadow-sm">
              <Briefcase className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              © {new Date().getFullYear()} <span className="font-semibold text-blue-700">CV Portal</span>. All rights
              reserved.
            </p>
          </div>
          <nav className="flex gap-3 sm:gap-4">
            <Link
              href="#"
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="#"
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="#"
              className="text-xs sm:text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

