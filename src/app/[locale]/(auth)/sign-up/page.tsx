import SignUpForm from "@/components/SignUpForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-[var(--color-secondary)] rounded-full opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-[var(--color-accent)] rounded-full opacity-10 translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 px-4 sm:px-6 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
            <CardHeader className="text-center pb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[var(--color-secondary)] rounded-full mb-4">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)] mb-2">
                Create Account
              </CardTitle>
              <p className="text-[var(--color-text-secondary)] text-sm sm:text-base">
                Join thousands of users and start your journey
              </p>
            </CardHeader>
            <CardContent className="px-6 sm:px-8 pb-8">
              <SignUpForm />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-4 sm:px-6 py-6 text-center">
        <p className="text-xs text-white/60">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
