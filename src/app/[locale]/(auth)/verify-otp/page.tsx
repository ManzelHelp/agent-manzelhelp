"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useToast } from "@/hooks/use-toast";
import { verifyOTPAction, resendOTPAction } from "@/actions/auth";
import { useUserStore } from "@/stores/userStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";

type VerificationStatus = 'idle' | 'verifying' | 'success' | 'error';

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const { toast } = useToast();
  const setUser = useUserStore((state) => state.setUser);
  const t = useTranslations("auth");
  
  // Get params
  const email = searchParams.get("email") || "";
  const userRole = searchParams.get("userRole") || "customer";
  const locale = (params?.locale as string) || 'en';
  const isRTL = locale === 'ar';
  
  // State
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'invalid' | 'expired' | 'rate_limit' | 'other' | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Refs
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const hasRedirectedRef = useRef(false);
  const isVerifyingRef = useRef(false);

  // Redirect helper - uses window.location for reliable navigation
  const redirectToProfile = useCallback((role: string) => {
    if (hasRedirectedRef.current) return;
    hasRedirectedRef.current = true;
    
    const targetPath = role === "tasker" 
      ? `/${locale}/tasker/profile`
      : `/${locale}/customer/profile`;
    
    // Use window.location.replace for clean redirect (no back button)
    window.location.replace(targetPath);
  }, [locale]);

  // Handle OTP input change
  const handleOtpChange = useCallback((index: number, value: string) => {
    // Prevent changes during verification or after success
    if (status === 'verifying' || status === 'success') return;
    
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;
    
    setOtp(prev => {
      const newOtp = [...prev];
      newOtp[index] = value;
      return newOtp;
    });
    
    // Clear error when typing
    if (error) {
      setError(null);
      setErrorType(null);
      setShowResendButton(false);
    }
    
    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [status, error]);

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    if (status === 'verifying' || status === 'success') return;
    
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    const digits = pastedData.replace(/\D/g, "").slice(0, 6).split("");
    
    if (digits.length >= 1) {
      const newOtp = ["", "", "", "", "", ""];
      digits.forEach((digit, index) => {
        if (index < 6) {
          newOtp[index] = digit;
        }
      });
      setOtp(newOtp);
      setError(null);
      setErrorType(null);
      setShowResendButton(false);
      
      // Focus appropriate input
      const lastFilledIndex = Math.min(digits.length - 1, 5);
      inputRefs.current[lastFilledIndex]?.focus();
    }
  }, [status]);

  // Handle backspace
  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (status === 'verifying' || status === 'success') return;
    
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }, [otp, status]);

  // Verify OTP
  const handleVerify = useCallback(async (codeOverride?: string) => {
    // Prevent multiple submissions using ref (more reliable than state)
    if (isVerifyingRef.current || hasRedirectedRef.current) return;
    
    const code = codeOverride || otp.join("");
    
    // Validation
    if (code.length !== 6) {
      setError(t("pages.verifyOTP.invalidCode"));
      return;
    }

    if (!email || email.trim() === "") {
      setError(t("pages.verifyOTP.emailRequired"));
      return;
    }

    // Set verifying state
    isVerifyingRef.current = true;
    setStatus('verifying');
    setError(null);
    setErrorType(null);
    setShowResendButton(false);

    try {
      const result = await verifyOTPAction(email, code);

      if (result.success && result.user) {
        // Success!
        setStatus('success');
        
        // Store user in Zustand
        setUser(result.user);

        // Show success toast
        toast({
          variant: "success",
          title: t("pages.verifyOTP.successTitle"),
          description: t("pages.verifyOTP.successMessage"),
        });

        // Get the role and redirect
        const role = result.userRole || result.user.role || userRole;
        
        // Redirect immediately
        redirectToProfile(role);
      } else {
        // Error
        isVerifyingRef.current = false;
        setStatus('error');
        
        const errorMsg = result.errorMessage || t("pages.verifyOTP.verificationFailed");
        setError(errorMsg);
        setErrorType(result.errorType || 'other');
        
        // Show resend button for invalid/expired tokens
        if (result.errorType === 'invalid' || result.errorType === 'expired') {
          setShowResendButton(true);
        }
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      isVerifyingRef.current = false;
      setStatus('error');
      setError(t("pages.verifyOTP.unexpectedError"));
      setErrorType('other');
    }
  }, [otp, email, userRole, setUser, toast, t, redirectToProfile]);

  // Auto-verify when OTP is complete
  useEffect(() => {
    const code = otp.join("");
    if (
      code.length === 6 &&
      email &&
      email.trim() !== "" &&
      status === 'idle' &&
      !isVerifyingRef.current &&
      !hasRedirectedRef.current
    ) {
      handleVerify(code);
    }
  }, [otp, email, status, handleVerify]);

  // Resend OTP
  const handleResend = useCallback(async () => {
    if (!email || isResending || resendCooldown > 0 || status === 'success') return;

    setIsResending(true);
    setError(null);
    setErrorType(null);
    setShowResendButton(false);

    try {
      const result = await resendOTPAction(email);

      if (result.success) {
        toast({
          variant: "success",
          title: t("pages.verifyOTP.resendSuccess"),
          description: t("pages.verifyOTP.resendSuccessMessage"),
        });
        
        // Reset state
        setOtp(["", "", "", "", "", ""]);
        setStatus('idle');
        isVerifyingRef.current = false;
        inputRefs.current[0]?.focus();
        
        // Start cooldown
        setResendCooldown(60);
      } else {
        const errorMsg = result.errorMessage || t("pages.verifyOTP.resendFailed");
        setError(errorMsg);
        setErrorType(result.errorType || 'other');
        
        if (result.errorType === 'rate_limit') {
          setResendCooldown(60);
        }
      }
    } catch (err) {
      console.error("Error resending OTP:", err);
      setError(t("pages.verifyOTP.unexpectedError"));
      setErrorType('other');
    } finally {
      setIsResending(false);
    }
  }, [email, isResending, resendCooldown, status, toast, t]);

  // Cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Redirect if email is missing
  useEffect(() => {
    if (!email || email.trim() === "") {
      const timer = setTimeout(() => {
        window.location.replace(`/${locale}/sign-up`);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [email, locale]);

  // Focus first input on mount
  useEffect(() => {
    if (email && email.trim() !== "" && status === 'idle') {
      inputRefs.current[0]?.focus();
    }
  }, [email, status]);

  // Show success state
  if (status === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400">
              {t("pages.verifyOTP.successTitle")}
            </h2>
            <p className="text-muted-foreground text-center">
              {t("pages.verifyOTP.successMessage")}
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show email missing state
  if (!email || email.trim() === "") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center space-y-4 p-8">
            <Mail className="w-16 h-16 text-muted-foreground" />
            <p className="text-muted-foreground text-center">
              {t("pages.verifyOTP.emailRequired")}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("pages.verifyOTP.redirectingToSignup")}
            </p>
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const isDisabled = status === 'verifying' || hasRedirectedRef.current;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {t("pages.verifyOTP.title")}
          </CardTitle>
          <p className="text-muted-foreground">
            {t("pages.verifyOTP.description", { email })}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OTP Input Fields */}
          <div className="flex justify-center gap-2" dir="ltr">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onPaste={handlePaste}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={isDisabled}
                aria-label={`Digit ${index + 1}`}
                className={`w-12 h-14 text-center text-2xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  error
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-600"
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-center" role="alert">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Resend Button - Only shown when token is invalid/expired */}
          {showResendButton && !isDisabled && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("pages.verifyOTP.resendPrompt")}
              </p>
              <Button
                variant="outline"
                onClick={handleResend}
                disabled={isResending || resendCooldown > 0}
                className="w-full"
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("pages.verifyOTP.resending")}
                  </>
                ) : resendCooldown > 0 ? (
                  t("pages.verifyOTP.resendCooldown", { seconds: resendCooldown })
                ) : (
                  t("pages.verifyOTP.resendButton")
                )}
              </Button>
            </div>
          )}

          {/* Verify Button */}
          <Button
            onClick={() => handleVerify()}
            disabled={isDisabled || otp.join("").length !== 6}
            className="w-full"
            size="lg"
          >
            {status === 'verifying' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("pages.verifyOTP.verifying")}
              </>
            ) : (
              t("pages.verifyOTP.verifyButton")
            )}
          </Button>

          {/* Back to Sign Up */}
          {!isDisabled && (
            <div className="text-center">
              <Link
                href="/sign-up"
                className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1"
              >
                <ArrowLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                {t("pages.verifyOTP.backToSignUp")}
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="flex flex-col items-center space-y-4 p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
