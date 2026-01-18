import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { UserType } from "@/types/user";
import { ArrowLeft, Code, Eye, EyeOff, Layers, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { VerifyOtpModal } from "./VerifyOtpModal";

export function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    login,
    signup,
    isAuthenticated,
    isLoading,
    verifyOtp,
    requestOtp,
    completeSignupAfterVerification,
  } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">(
    (searchParams.get("mode") as "login" | "signup") || "login"
  );
  const [userType, setUserType] = useState<UserType>(
    (searchParams.get("type") as UserType) || "collaborator"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [pendingSignupData, setPendingSignupData] = useState<{
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    userType: UserType;
  } | null>(null);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [signupEmail, setSignupEmail] = useState<string>("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const modeParam = searchParams.get("mode") as "login" | "signup";
    const typeParam = searchParams.get("type") as UserType;
    if (modeParam) setMode(modeParam);
    if (typeParam) setUserType(typeParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
      }
      // else {
      //   if (!name.trim()) {
      //     setError("Please enter your name");
      //     setSubmitting(false);
      //     return;
      //   }
      //   await signup(email, password, name, userType);
      // }
      navigate("/dashboard");
    } catch (err) {
      setError(
        formError ||
          err.message ||
          err ||
          "Authentication failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // local form error
    setSubmitting(true);

    if (!name.trim()) {
      setError("Please enter your name");
      setSubmitting(false);
      return;
    }

    try {
      await signup(email, password, confirmPassword, name, userType);
      setSignupEmail(email); // save for OTP modal
      setShowOtpModal(true);
    } catch (err) {
      setError(formError || err.message || err || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (otpCode: string) => {
    try {
      await verifyOtp(signupEmail, otpCode);
      setShowOtpModal(false);
      // user will be set in context → redirect via useEffect
    } catch (err) {
      setOtpError(formError || err.message || err || "Verification failed");
    }
  };
  const handleResendOtp = async () => {
    if (!pendingSignupData) return;
    setOtpError(null);
    await requestOtp(pendingSignupData.email);
  };

  const handleCloseOtp = () => {
    setShowOtpModal(false);
    setPendingSignupData(null); // ← Clean up
    setOtpError(null);
  };

  return (
    <>
      <div className="min-h-screen bg-[#0f1419] relative overflow-hidden flex">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.15),transparent_40%)] pointer-events-none" />

        {/* Left Panel - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative z-10 flex-col justify-between p-12">
          <Link
            to="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-sans"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div>
            <h1 className="text-5xl font-display font-extrabold text-gradient mb-6">
              BuildMate
            </h1>
            <p className="text-xl text-gray-400 font-sans leading-relaxed max-w-md">
              {mode === "login"
                ? "Welcome back! Sign in to continue finding your perfect project matches."
                : "Join thousands of builders finding their perfect team matches with AI-powered recommendations."}
            </p>

            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <span className="text-gray-300 font-sans">
                  AI-powered matching algorithm
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Code className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-gray-300 font-sans">
                  10,000+ active builders
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-gray-300 font-sans">
                  2,500+ successful projects
                </span>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500 font-sans">
            © 2024 BuildMate. All rights reserved.
          </p>
        </div>

        {/* Right Panel - Auth Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Back Link */}
            <Link
              to="/"
              className="lg:hidden flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-sans mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>

            <div className="glass-panel rounded-2xl p-8 gradient-border">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-display font-bold text-white mb-2">
                  {mode === "login" ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-gray-400 font-sans text-sm">
                  {mode === "login"
                    ? "Enter your credentials to access your account"
                    : "Fill in your details to get started"}
                </p>
              </div>

              {/* User Type Selection (Signup only) */}
              {mode === "signup" && (
                <div className="mb-6">
                  <Label className="text-gray-300 font-sans text-sm mb-3 block">
                    I am a...
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setUserType("collaborator")}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        userType === "collaborator"
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <Code
                        className={`w-6 h-6 mx-auto mb-2 ${
                          userType === "collaborator"
                            ? "text-cyan-400"
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-sans font-medium ${
                          userType === "collaborator"
                            ? "text-cyan-400"
                            : "text-gray-400"
                        }`}
                      >
                        Collaborator
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Looking for projects
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserType("project_owner")}
                      className={`p-4 rounded-xl border transition-all duration-200 ${
                        userType === "project_owner"
                          ? "border-purple-500 bg-purple-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <Layers
                        className={`w-6 h-6 mx-auto mb-2 ${
                          userType === "project_owner"
                            ? "text-purple-400"
                            : "text-gray-400"
                        }`}
                      />
                      <span
                        className={`text-sm font-sans font-medium ${
                          userType === "project_owner"
                            ? "text-purple-400"
                            : "text-gray-400"
                        }`}
                      >
                        Project Owner
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        Looking for talent
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* <form onSubmit={handleSubmit} className="space-y-4"> */}
              <form
                onSubmit={mode === "login" ? handleSubmit : handleSignupSubmit}
                className="space-y-4"
              >
                {mode === "signup" && (
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-gray-300 font-sans text-sm"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
                      required
                    />
                  </div>
                )}

                <div>
                  <Label
                    htmlFor="email"
                    className="text-gray-300 font-sans text-sm"
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="mt-1.5 bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans"
                    required
                  />
                </div>

                {mode === "signup" && (
                  <div>
                    <Label
                      htmlFor="confirmPassword"
                      className="text-gray-300 font-sans text-sm"
                    >
                      Confirm Password
                    </Label>
                    <div className="relative mt-1.5">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <Label
                    htmlFor="password"
                    className="text-gray-300 font-sans text-sm"
                  >
                    Password
                  </Label>
                  <div className="relative mt-1.5">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 font-sans pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-400 font-sans">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 font-sans font-semibold"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {mode === "login"
                        ? "Signing in..."
                        : "Creating account..."}
                    </span>
                  ) : mode === "login" ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-400 font-sans">
                  {mode === "login"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <button
                    onClick={() =>
                      setMode(mode === "login" ? "signup" : "login")
                    }
                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    {mode === "login" ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>

              {/* Demo Credentials */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-gray-500 font-sans text-center mb-3">
                  Demo Credentials
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("owner@buildmate.com");
                      setPassword("demo123");
                      setMode("login");
                    }}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors font-mono"
                  >
                    Project Owner
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("dev@buildmate.com");
                      setPassword("demo123");
                      setMode("login");
                    }}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-colors font-mono"
                  >
                    Collaborator
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <VerifyOtpModal
        isOpen={showOtpModal}
        onClose={handleCloseOtp}
        onVerify={handleVerifyOtp}
        email={pendingSignupData?.email || email || ""}
        isLoading={isLoading}
        error={otpError}
        onResend={handleResendOtp}
      />
    </>
  );
}
