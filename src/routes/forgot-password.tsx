import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Mail,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";
import { toast } from "react-toastify";

import logo1 from "@/assets/logo1.jpg";
import {
  forgotPassword,
  verifyResetOtp,
  resetPassword,
} from "@/api/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [{ title: "Forgot Password | WebApps EMS" }],
  }),
  component: ForgotPassword,
});

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  /* ============================================================
   * STEP 1 - SEND OTP
   * ============================================================ */

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);

    try {
      const response = await forgotPassword(trimmedEmail);

      if (response.success) {
        toast.success(response.message || "OTP sent successfully");

        setEmail(trimmedEmail);
        setStep(2);
      } else {
        toast.error(response.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("Forgot Password Error:", error);

      const message =
        error?.response?.data?.message ||
        "Failed to send OTP. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
   * STEP 2 - VERIFY OTP
   * ============================================================ */

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    const trimmedOtp = otp.trim();

    if (!trimmedOtp) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await verifyResetOtp(email, trimmedOtp);

      if (response.success) {
        toast.success(
          response.message || "OTP verified successfully."
        );

        setOtp(trimmedOtp);
        setStep(3);
      } else {
        toast.error(response.message || "Invalid OTP");
      }
    } catch (error: any) {
      console.error("Verify OTP Error:", error);

      const message =
        error?.response?.data?.message ||
        "Invalid or expired OTP. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
   * STEP 3 - RESET PASSWORD
   * ============================================================ */

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();

    if (loading) return;

    if (!newPassword) {
      toast.error("Please enter your new password");
      return;
    }

    if (!confirmPassword) {
      toast.error("Please confirm your new password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(
        email,
        otp,
        newPassword
      );

      if (response.success) {
        toast.success(
          response.message || "Password reset successfully."
        );

        setTimeout(() => {
          navigate({
            to: "/login",
            replace: true,
          });
        }, 800);
      } else {
        toast.error(
          response.message || "Failed to reset password"
        );
      }
    } catch (error: any) {
      console.error("Reset Password Error:", error);

      const message =
        error?.response?.data?.message ||
        "Failed to reset password. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
   * BACK
   * ============================================================ */

  function handleBack() {
    if (loading) return;

    if (step === 3) {
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(1);
      return;
    }

    navigate({
      to: "/login",
    });
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* ======================================================
         * BRAND
         * ====================================================== */}

        <div className="login-brand">
          <img src={logo1} alt="WebApps" />

          <h1>Webapps EMS</h1>

          <p>Employee Management System</p>
        </div>

        {/* ======================================================
         * STEP INDICATOR
         * ====================================================== */}

        <div className="mb-6 flex items-center justify-center gap-2">
          <StepIndicator
            number={1}
            active={step === 1}
            completed={step > 1}
          />

          <div
            className={`h-px w-[35px] ${
              step > 1 ? "bg-blue-600" : "bg-gray-300"
            }`}
          />

          <StepIndicator
            number={2}
            active={step === 2}
            completed={step > 2}
          />

          <div
            className={`h-px w-[35px] ${
              step > 2 ? "bg-blue-600" : "bg-gray-300"
            }`}
          />

          <StepIndicator
            number={3}
            active={step === 3}
            completed={false}
          />
        </div>

        {/* ======================================================
         * STEP 1
         * ====================================================== */}

        {step === 1 && (
          <form onSubmit={handleSendOtp}>
            <div className="mb-6 text-center">
              <div className="mb-3 flex justify-center">
                <Mail size={30} />
              </div>

              <h2 className="m-0 text-xl font-semibold">
                Forgot Password?
              </h2>

              <p className="mb-0 mt-1.5 text-sm opacity-70">
                Enter your registered email address and we'll
                send you an OTP.
              </p>
            </div>

            <div className="field">
              <label>Email</label>

              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                autoComplete="email"
              />
            </div>

            <button
              className="btn w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </button>

            <div className="mt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 no-underline"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* ======================================================
         * STEP 2
         * ====================================================== */}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-6 text-center">
              <div className="mb-3 flex justify-center">
                <ShieldCheck size={30} />
              </div>

              <h2 className="m-0 text-xl font-semibold">
                Verify OTP
              </h2>

              <p className="mb-0 mt-1.5 text-sm opacity-70">
                Enter the OTP sent to
              </p>

              <p className="mt-1 text-sm font-semibold">
                {email}
              </p>
            </div>

            <div className="field">
              <label>OTP</label>

              <input
                className="input uppercase"
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.toUpperCase())
                }
                placeholder="Enter OTP"
                required
                disabled={loading}
                autoComplete="one-time-code"
                maxLength={20}
                style={{
                  letterSpacing: "0.2rem",
                }}
              />
            </div>

            <button
              className="btn w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </button>

            <div className="mt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-medium text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeft size={16} />
                Change Email
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                }}
                disabled={loading}
                className="border-0 bg-transparent p-0 text-sm font-medium text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}

        {/* ======================================================
         * STEP 3
         * ====================================================== */}

        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-6 text-center">
              <div className="mb-3 flex justify-center">
                <LockKeyhole size={30} />
              </div>

              <h2 className="m-0 text-xl font-semibold">
                Reset Password
              </h2>

              <p className="mb-0 mt-1.5 text-sm opacity-70">
                Create a new password for your account.
              </p>
            </div>

            <div className="field">
              <label>New Password</label>

              <div className="relative">
                <input
                  className="input pr-11"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) =>
                    setNewPassword(e.target.value)
                  }
                  placeholder="Enter new password"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowNewPassword((prev) => !prev)
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={
                    showNewPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showNewPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="field">
              <label>Confirm Password</label>

              <div className="relative">
                <input
                  className="input pr-11"
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm new password"
                  required
                  disabled={loading}
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-60"
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <button
              className="btn w-full flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="inline-flex items-center gap-1.5 border-0 bg-transparent p-0 text-sm font-medium text-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ArrowLeft size={16} />
                Back to OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * STEP INDICATOR
 * ============================================================ */

function StepIndicator({
  number,
  active,
  completed,
}: {
  number: number;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div
      className={`flex h-[30px] w-[30px] items-center justify-center rounded-full border text-[0.8rem] font-semibold ${
        active || completed
          ? "border-blue-600 bg-blue-600 text-white"
          : "border-gray-300 bg-transparent text-gray-500"
      }`}
    >
      {number}
    </div>
  );
}