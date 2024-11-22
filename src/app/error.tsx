// app/error.tsx
'use client'
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8 text-center">
            <div className="flex justify-center mb-4">
              <AlertCircle className="h-16 w-16 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Oops! Something Went Wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but an unexpected error occurred. 
              Don't worry, our team has been notified.
            </p>
            
            {/* Error Details (optional, can be hidden in production) */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 p-4 rounded-md mb-6 text-left">
                <p className="font-semibold text-red-700">Error Details:</p>
                <pre className="text-xs text-red-600 overflow-x-auto">
                  {error.message}
                </pre>
              </div>
            )}

            <div className="flex flex-col space-y-4">
              <Button 
                onClick={() => reset()}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                Try Again
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="w-full"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}