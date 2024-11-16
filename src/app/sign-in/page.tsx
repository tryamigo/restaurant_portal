'use client'
import React from "react"
import { signIn, useSession } from "next-auth/react"
import { useState, useEffect, Suspense, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2, RefreshCw, ShieldCheck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { MobileIcon } from "@radix-ui/react-icons"

function OTPInput({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    if (val.length > 1) return;  
    const newValue = value.split('');
    newValue[index] = val;
    onChange(newValue.join(''));

    // Move focus to next input
    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  useEffect(() => {
    // Autofocus on the first input when OTP input becomes visible
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Prevent non-numeric input
    if (!/^\d$/.test(e.key) && 
      e.key !== 'Backspace' && 
      e.key !== 'ArrowLeft' && 
      e.key !== 'ArrowRight' && 
      e.key !== 'Tab') {
      e.preventDefault();
    }
  };

  return (
    <div className="flex justify-center space-x-2">
      {[0, 1, 2, 3, 4, 5].map((index) => (
        <Input
          key={index}
          ref={(el) => inputRefs.current[index] = el as any}
          type="text"
          maxLength={1}
          className="w-12 h-12 text-center text-xl font-bold"
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
        />
      ))}
    </div>
  );
}

function OTPLoginContent() {
  const { data: session, status } = useSession()
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter();
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackurl') || '/'; 
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  // Start cooldown timer for resend
  const startResendCooldown = (duration: number) => {
    setResendCooldown(duration); // Set cooldown to the given duration (30 seconds)
    
    resendTimerRef.current = setInterval(() => {
      setResendCooldown((prevCooldown) => {
        if (prevCooldown <= 1) {
          if (resendTimerRef.current) {
            clearInterval(resendTimerRef.current);
          }
          return 0;
        }
        return prevCooldown - 1;
      });
    }, 1000);
  };

  const handleResendOTP = () => {
    // Only allow resend if not in cooldown
    if (resendCooldown === 0) {
      requestOtp(true);
    }
  };

  const requestOtp = async (isResend: boolean = false) => {
    // Mobile number validation
    const mobileRegex = /^\+91[6-9]\d{9}$/;
    if (!mobileRegex.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/restaurants/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile}),
      });

      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        // Start cooldown only if it's the first OTP request or a resend
        if (!isResend) {
          startResendCooldown(30); // Start cooldown for 30 seconds
        } else {
          startResendCooldown(30); // Reset cooldown for resend
        }
        console.log(data.message);
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loginWithOtp = async () => {
    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        mobile,
        otp,
      });

      if (result?.error) {
        setError(result.error);
        console.error(result.error);
      } else if (result?.ok) {
        console.log("Login successful");
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100"
    >
      <Card className="w-full max-w-md shadow-2xl border-none">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="w-16 h-16 text-blue-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800">Secure OTP Login</CardTitle>
            <CardDescription className="text-gray-500">
              Verify your mobile number to access your account
            </CardDescription>
          </CardHeader>
        </motion.div>

        <CardContent className="space-y-6">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="space-y-2">
              <Label htmlFor="mobile" className="flex items-center">
                <MobileIcon className="mr-2 w-4 h-4" /> Mobile Number
              </Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+91 | Enter 10-digit mobile number"                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </motion.div>

          <AnimatePresence>
            {otpSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Label>Enter 6-digit OTP</Label>
                <OTPInput value={otp} onChange={setOtp} />
                {/* Resend OTP Section */}
                <div className="flex items-center justify-center">
 <Button 
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {resendCooldown > 0 ? (
                      <>Resend OTP in {resendCooldown}s</>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Resend OTP
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {!otpSent ? (
            <Button onClick={() => requestOtp(false)} disabled={loading} className="w-full bg-gray-800 hover:bg-blue-700 transition duration-200">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          ) : (
            <Button onClick={loginWithOtp} disabled={loading} className="w-full bg-gray-800 hover:bg-blue-700 transition duration-200">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Logging in..." : "Login"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

function OTPLogin() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
      <OTPLoginContent />
    </Suspense>
  );
}

export default OTPLogin;