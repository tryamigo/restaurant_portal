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
import { Badge } from "@/components/ui/badge"

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
          className="w-10 md:w-12 h-10 md:h-12 text-center text-base md:text-xl font-bold"
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
        />
      ))}
    </div>
  );
}

function OTPLoginContent() {
  const { data: session, status } = useSession();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackurl') || '/';
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      router.push(callbackUrl);
    }
  }, [session, status, router, callbackUrl]);

  const startResendCooldown = (duration: number) => {
    setResendCooldown(duration);

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
    if (resendCooldown === 0) {
      requestOtp(true);
    }
  };

  const requestOtp = async (isResend: boolean = false) => {
    if (mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/auth/restaurants/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile: `+91${mobile}` }),
      });

      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        if (!isResend) {
          startResendCooldown(30);
        } else {
          startResendCooldown(30);
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
        mobile: `+91${mobile}`,
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
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4"
    >
      <Card className="w-full max-w-md shadow-2xl border-none dark:bg-gray-900">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <ShieldCheck className="w-12 md:w-16 h-12 md:h-16 text-blue-600" />
            </div>
            <CardTitle className="text-xl md:text-2xl font-bold text-gray-800  dark:text-gray-200">Secure OTP Login</CardTitle>
            <CardDescription className="text-sm md:text-base text-gray-500 dark:text-gray-400">
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
              <div className="flex items-center">
                <Badge variant={"secondary"} className="p-2 text-sm outline-none">
                  +91
                </Badge>
                <Input
                  id="mobile"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={mobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) setMobile(value);
                  }}
                  className=" ml-1 flex-1 focus:ring-0 focus:outline-none px-3 dark:border-gray-300"
                />
              </div>
            </div>
            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {mobile.length < 10
                ? `${10 - mobile.length} digits remaining`
                : "Ready to send OTP"}
            </div>
          </motion.div>

          <AnimatePresence>
            {otpSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <Label>Enter 6-digit OTP</Label>
                <OTPInput value={otp} onChange={setOtp} data-testid="otpinput" />
                <div className="flex items-center justify-center">
                  <Button
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={resendCooldown > 0}
                    className="text-blue-600 hover:text-blue-800 dark:text-gray-200 hover:dark:text-gray-400 "
                  >
                    {resendCooldown > 0 ? (
                      <>Resend OTP in {resendCooldown}s</>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
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
            <Button
              onClick={() => requestOtp(false)}
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-blue-700 transition duration-200 dark:bg-gray-50 dark:hover:bg-gray-300"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Sending..." : "Send OTP"}
            </Button>
          ) : (
            <Button
              onClick={loginWithOtp}
              disabled={loading}
              className="w-full bg-gray-800 hover:bg-blue-700 transition duration-200 dark:bg-gray-50 dark:hover:bg-gray-300"
            >
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