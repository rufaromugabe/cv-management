"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Briefcase, CheckCircle, MapPin, Clock } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, getDocs, query, where } from "firebase/firestore"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface JobPost {
  id: string
  title: string
  location: string
  department: string
  type: string
  description: string
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
      <header className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container flex h-20 items-center px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Briefcase className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              CV Portal
            </h1>
          </div>
          <nav className="ml-auto flex gap-4 sm:gap-6">
            <Link href="/apply" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Apply Now
            </Link>
            <Link href="/auth/sign-in" className="text-sm font-medium hover:text-blue-600 transition-colors">
              Admin Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-600">
                  <span className="font-medium">Career Opportunities</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  Find Your Next Career Opportunity
                </h2>
                <p className="text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[600px]">
                  Submit your CV and let our team find the perfect match for your skills and experience. We connect
                  talented professionals with leading companies.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/apply">
                    <Button className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 hover:bg-blue-700 px-8 shadow-lg transition-all hover:shadow-blue-200/50">
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 opacity-30 blur"></div>
                  <img
                    src="https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?height=400&width=400"
                    alt="Career opportunities"
                    className="relative rounded-lg object-cover bg-white"
                    width={400}
                    height={400}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2 max-w-[800px]">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-700">
                  How It Works
                </h2>
                <p className="text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our simple process helps you find your next opportunity
                </p>
              </div>
              <div className="grid w-full grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 mt-8">
                <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                    <span className="text-xl font-bold">1</span>
                  </div>
                  <h3 className="text-xl font-bold text-blue-800">Submit Your CV</h3>
                  <p className="text-gray-600 text-center">
                    Fill out our simple form and upload your CV to get started
                  </p>
                </div>
                <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                    <span className="text-xl font-bold">2</span>
                  </div>
                  <h3 className="text-xl font-bold text-blue-800">Automated Analysis</h3>
                  <p className="text-gray-600 text-center">Our system analyzes your CV for the best job matches</p>
                </div>
                <div className="flex flex-col items-center space-y-4 rounded-lg border border-blue-100 bg-blue-50 p-6 shadow-sm transition-all hover:shadow-md">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white">
                    <span className="text-xl font-bold">3</span>
                  </div>
                  <h3 className="text-xl font-bold text-blue-800">Get Matched</h3>
                  <p className="text-gray-600 text-center">
                    We'll contact you if your profile matches our opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-blue-50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm text-blue-600">
                  <span className="font-medium">Open Positions</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-blue-700">
                  Current Job Openings
                </h2>
                <p className="text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed max-w-[800px] mx-auto">
                  Browse our latest opportunities and find the perfect role for your skills and experience
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse flex flex-col items-center">
                  <div className="h-8 w-8 bg-blue-200 rounded-full mb-4"></div>
                  <div className="h-4 w-32 bg-blue-100 rounded mb-2"></div>
                  <div className="h-3 w-24 bg-blue-50 rounded"></div>
                </div>
              </div>
            ) : activeJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Briefcase className="h-16 w-16 text-blue-200 mb-4" />
                <h3 className="text-xl font-medium text-gray-600 mb-2">No open positions at the moment</h3>
                <p className="text-gray-500">Please check back later for new opportunities</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {activeJobs.map((job) => (
                  <Card key={job.id} className="overflow-hidden border-blue-100 transition-all hover:shadow-md">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 pb-4">
                      <CardTitle className="text-blue-800">{job.title}</CardTitle>
                      <CardDescription>
                        <div className="flex items-center text-blue-600 mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <Clock className="h-3 w-3 mr-1" />
                          {job.type}
                        </Badge>
                        {job.department && (
                          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                            {job.department}
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 line-clamp-3 text-sm">{job.description}</p>
                    </CardContent>
                    <CardFooter className="border-t border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <Link href={`/apply?job=${job.id}`} className="w-full">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Apply Now
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-10">
              <Link href="/apply">
                <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
                  View All Positions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <div className="flex items-center">
            <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} <span className="font-semibold text-blue-700">CV Portal</span>. All rights
              reserved.
            </p>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Terms
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

