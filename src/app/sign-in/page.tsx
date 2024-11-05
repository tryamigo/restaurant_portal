'use client'

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"

function OTPLoginContent() {
  const { data: session, status } = useSession()
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter();
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackurl') || '/'; 

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  const requestOtp = async () => {
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/restaurants/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      })

      const data = await res.json()
      if (res.ok) {
        setOtpSent(true)
        console.log(data.message)
      } else {
        setError(data.error || "Failed to send OTP")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loginWithOtp = async () => {
    setLoading(true)
    setError("")
  
    try {
      const result = await signIn("credentials", {
        redirect: false,
        mobile,
        otp,
      })
  
      if (result?.error) {
        setError(result.error)
        console.error(result.error)
      } else if (result?.ok) {
        console.log("Login successful")
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md min-h-[340px] my-[30px] mx-auto">
      <CardHeader>
        <CardTitle>OTP Login</CardTitle>
        <CardDescription>Enter your mobile number to receive an OTP.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            id="mobile"
            type="tel"
            placeholder="Enter your mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
          />
        </div>
        {otpSent && (
          <div className="space-y-2">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
          </div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {!otpSent ? (
          <Button onClick={requestOtp} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Sending..." : "Send OTP"}
          </Button>
        ) : (
          <Button onClick={loginWithOtp} disabled={loading} className="w-full">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Logging in..." : "Login"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

function OTPLogin() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <OTPLoginContent />
    </Suspense>
  )
}

export default OTPLogin;