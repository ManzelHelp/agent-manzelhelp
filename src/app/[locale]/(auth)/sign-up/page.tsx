import SignUpForm from "@/components/SignUpForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, ArrowLeft } from "lucide-react";
import Link from "next/link";

function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--color-primary)] via-[var(--color-primary-light)] to-[var(--color-primary-dark)] flex flex-col">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white text-[var(--color-primary)] px-4 py-2 rounded-md font-medium z-50"
      >
        Skip to main content
      </a>
      {/* Background Pattern - Reduced opacity and size for mobile */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-[var(--color-secondary)] rounded-full opacity-5 sm:opacity-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 sm:w-96 sm:h-96 bg-[var(--color-accent)] rounded-full opacity-5 sm:opacity-10 translate-x-1/2 translate-y-1/2"></div>
      </div>

      {/* Compact Header */}
      <div className="relative z-10 px-4 sm:px-6 py-3 sm:py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 text-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </div>

      {/* Main Content - Adjusted to reduce gap to footer */}
      <main
        id="main-content"
        className="relative z-10 flex-1 flex flex-col justify-start sm:justify-center px-4 sm:px-6 pt-4 sm:pt-8 pb-4"
      >
        <div className="w-full max-w-md mx-auto">
          {/* Card - More compact on mobile */}
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl sm:shadow-2xl">
            <CardHeader className="text-center pb-4 sm:pb-6 pt-6 sm:pt-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-[var(--color-secondary)] rounded-full mb-3 sm:mb-4">
                <UserPlus className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text-primary)] mb-1 sm:mb-2">
                Create Account
              </CardTitle>
              <p className="text-[var(--color-text-secondary)] text-sm sm:text-base">
                Join thousands of users and start your journey
              </p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
              <SignUpForm />
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Compact Footer - Reduced spacing */}
      <div className="relative z-10 px-4 sm:px-6 py-2 sm:py-4 text-center">
        <p className="text-xs text-white/60">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </p>
      </div>
    </div>
  );
}

export default SignUpPage;
