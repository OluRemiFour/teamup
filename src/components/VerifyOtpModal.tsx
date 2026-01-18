import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface VerifyOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (otp: string) => void;
  email?: string; // optional - to show which email we're verifying
  isLoading?: boolean;
  error?: string | null;
  onResend: () => void;
}

export function VerifyOtpModal({
  isOpen,
  onClose,
  onVerify,
  email = "your email",
  isLoading = false,
  error = null,
  onResend,
}: VerifyOtpModalProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [focusedIndex, setFocusedIndex] = useState<number>(0);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      setFocusedIndex(index + 1);
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      setFocusedIndex(index - 1);
      document.getElementById(`otp-${index - 1}`)?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      setFocusedIndex(index - 1);
      document.getElementById(`otp-${index - 1}`)?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      setFocusedIndex(index + 1);
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split("");
    setOtp(digits);
    setFocusedIndex(5);
    document.getElementById(`otp-5`)?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length === 6) {
      onVerify(otpCode);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="glass-panel w-full max-w-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 border-b border-white/10">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <h2 className="text-2xl font-display font-bold text-white text-center">
              Verify Your Email
            </h2>
            <p className="text-gray-400 text-center mt-2 font-sans">
              We sent a 6-digit code to <br />
              <span className="text-cyan-400 font-medium">{email}</span>
            </p>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* OTP Inputs */}
            <div className="flex justify-center gap-3 sm:gap-4">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={(e) => handlePaste(e, index)}
                  autoFocus={index === 0}
                  className={`text-center text-2xl font-bold h-14 w-12 sm:w-14 bg-white/5 border-white/20 text-white caret-cyan-400 transition-all duration-200
                    ${
                      focusedIndex === index
                        ? "border-cyan-500 shadow-cyan-500/20"
                        : ""
                    }
                    hover:border-cyan-500/50 focus:border-cyan-500 focus:ring-0 focus:shadow-[0_0_0_3px_rgba(34,211,238,0.15)]`}
                />
              ))}
            </div>

            {/* Error message */}
            {error && (
              <div className="text-center text-sm text-red-400 bg-red-950/30 border border-red-500/20 rounded-lg py-2 px-4">
                {error}
              </div>
            )}

            {/* Resend link */}
            <div className="text-center text-sm text-gray-400">
              Didn't receive the code?{" "}
              <button
                type="button"
                className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                disabled={isLoading}
                onClick={onResend}
              >
                Resend
              </button>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={otp.join("").length !== 6 || isLoading}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-sans font-semibold h-12 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLoading ? "Verifying..." : "Verify & Continue"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
