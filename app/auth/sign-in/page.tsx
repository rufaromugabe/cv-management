"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { auth } from "@/lib/firebase"
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"
import Link from "next/link"

export default function SignInPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      router.push("/dashboard")
    } catch (err) {
      console.error("Error signing in with Google:", err)
      setError("Failed to sign in with Google. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-blue-100 via-indigo-50 to-white bg-[url('/placeholder.svg?height=600&width=600')] bg-fixed bg-center bg-no-repeat bg-blend-overlay">
      <div className="absolute inset-0 bg-grid-blue-900/[0.03] bg-[size:20px_20px] pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/80 via-indigo-50/80 to-white/80 pointer-events-none" />

      <div className="w-full max-w-sm sm:max-w-md relative z-10">
        <div className="mb-6 self-start">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span className="text-sm">Back to Home</span>
          </Link>
        </div>

        <div className="absolute inset-0 bg-white/40 backdrop-blur-xl rounded-2xl -m-6"></div>
        <Card className="border-blue-200 shadow-xl bg-white/80 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
          <CardHeader className="space-y-1 pb-6">
            <div className="flex justify-center mb-2">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 sm:h-6 sm:w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>
            <CardTitle className="text-xl sm:text-2xl font-bold text-center text-gray-800">Admin Login</CardTitle>
            <CardDescription className="text-center text-gray-600 text-sm">
              Sign in to access the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <svg
                    className="mr-2 h-4 w-4"
                    aria-hidden="true"
                    focusable="false"
                    data-prefix="fab"
                    data-icon="google"
                    role="img"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 488 512"
                  >
                    <path
                      fill="currentColor"
                      d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                    ></path>
                  </svg>
                )}
                Sign in with Google
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col pt-0">
            <p className="mt-2 text-xs text-center text-gray-500">
              Only authorized administrators can access the dashboard
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

