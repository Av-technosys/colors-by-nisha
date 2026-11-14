"use client";

import { Form } from "@/components/ui/Form";


import { friendlyError, UserFacingError } from "@/helpers/errors";

import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import { consumeReturnPath, rememberReturnPath } from "@/helpers/auth/return-path";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  IoAlertCircleOutline,
  IoArrowBackOutline,
  IoCallOutline,
  IoCheckmarkCircle,
  IoCloseOutline,
  IoEyeOffOutline,
  IoEyeOutline,
  IoInformationCircleOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";

interface AuthPageProps {
  mode: "signup" | "login" | "forgot" | "verify-otp";
}

export default function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const clerk = useClerk();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const isLogin = mode === "login";
  const isForgot = mode === "forgot";
  const isOtp = mode === "verify-otp";
  const isOtpView = isOtp;
  const isSocialCompletion = !isLogin && searchParams.get("sso") === "complete";
  const otpFlow = searchParams.get("flow") || "signup";
  const isResetPassword = isForgot && searchParams.get("step") === "password";

  const requestedReturn = searchParams.get("redirect_url");
  useEffect(() => { rememberReturnPath(requestedReturn); }, [requestedReturn]);

  // Form Fields (all blank by default)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(emailParam);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  // Forgot password email
  const [forgotEmail, setForgotEmail] = useState("");

  // OTP State (6 digits)
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(45);
  const [resendNotice, setResendNotice] = useState("");
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Status & Feedback
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Floating Toast Notification
  const [toast, setToast] = useState<{
    id: number;
    type: "success" | "error" | "info";
    title: string;
    message?: string;
  } | null>(null);

  const triggerToast = (type: "success" | "error" | "info", title: string, message?: string) => {
    setToast({ id: Date.now(), type, title, message });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Real-time password requirement flags
  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password);
  const isPasswordValid = hasMinLen && hasUpper && hasLower && hasNumber && hasSpecial;

  // Timer countdown for OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isOtpView && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOtpView, otpTimer]);

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError("");

    // Auto move to next input if filled
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP Keydown
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste 6 digits
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    otpInputRefs.current[nextIndex]?.focus();
  };

  function showError(error: unknown) {
    setError(friendlyError(error, "We couldn’t complete sign-in. Please check your details and try again."));
  }

  async function check(request: Promise<{ error: unknown }>) {
    const result = await request;
    if (result.error) throw result.error;
  }

  async function finish(resource: typeof signIn | typeof signUp) {
    if (resource.status !== "complete") throw new UserFacingError("Please complete the required account verification.");
    await check(resource.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.currentTask) {
          await clerk.redirectToTasks({ redirectUrl: "/dashboard" });
          return;
        }
        const destination = decorateUrl(consumeReturnPath(requestedReturn));
        if (destination.startsWith("http")) window.location.assign(destination);
        else router.replace(destination);
      },
    }));
  }

  async function sendSignInCode() {
    const factors = signIn.supportedSecondFactors;
    if (factors.some(factor => factor.strategy === "email_code")) {
      await check(signIn.mfa.sendEmailCode());
      return "signin";
    }
    if (factors.some(factor => factor.strategy === "phone_code")) {
      await check(signIn.mfa.sendPhoneCode());
      return "phone";
    }
    if (factors.some(factor => factor.strategy === "totp")) return "totp";
    throw new UserFacingError("We couldn’t complete verification. Please try another sign-in method or contact us.");
  }

  const handleResendOtp = async () => {
    if (isSubmitting || otpTimer > 0 || otpFlow === "totp") return;
    setError("");
    setIsSubmitting(true);
    try {
      if (otpFlow === "reset") await check(signIn.resetPasswordEmailCode.sendCode());
      else if (otpFlow === "signin") await check(signIn.mfa.sendEmailCode());
      else if (otpFlow === "phone") await check(signIn.mfa.sendPhoneCode());
      else await check(signUp.verifications.sendEmailCode());
      setOtpTimer(45);
      setOtp(["", "", "", "", "", ""]);
      setResendNotice("A fresh 6-digit verification code has been sent.");
      triggerToast("success", "Verification code sent");
      otpInputRefs.current[0]?.focus();
    } catch (error) { showError(error); }
    finally { setIsSubmitting(false); }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    const code = otp.join("");
    if (code.length !== 6) { setError("Please enter the complete 6-digit code."); return; }
    setIsSubmitting(true);
    try {
      if (otpFlow === "reset") {
        await check(signIn.resetPasswordEmailCode.verifyCode({ code }));
        router.replace("/forgot-password?step=password");
      } else if (otpFlow === "signup") {
        await check(signUp.verifications.verifyEmailCode({ code }));
        await finish(signUp);
      } else {
        if (otpFlow === "phone") await check(signIn.mfa.verifyPhoneCode({ code }));
        else if (otpFlow === "totp") await check(signIn.mfa.verifyTOTP({ code }));
        else await check(signIn.mfa.verifyEmailCode({ code }));
        await finish(signIn);
      }
    } catch (error) { showError(error); }
    finally { setIsSubmitting(false); }
  };

  const handleGoogleSignIn = async () => {
    if (isSubmitting || !clerk.loaded) return;
    setError("");
    setIsSubmitting(true);
    try {
      await check(signIn.sso({ strategy: "oauth_google", redirectUrl: "/dashboard", redirectCallbackUrl: "/sso-callback" }));
    } catch (error) { showError(error); }
    finally { setIsSubmitting(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    if (isSocialCompletion) {
      if (!fullName.trim() || !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) { setError("Please enter your name and a valid 10-digit mobile number."); return; }
      if (!agreedTerms) { setError("Please accept the Terms & Conditions."); return; }
      setIsSubmitting(true);
      try {
        const [firstName, ...lastName] = fullName.trim().split(/\s+/);
        await check(signUp.update({
          legalAccepted: true,
          unsafeMetadata: { ...signUp.unsafeMetadata, fullName: fullName.trim(), mobile: `+91${phone.replace(/\s/g, "")}` },
          ...(signUp.missingFields.includes("first_name") ? { firstName } : {}),
          ...(signUp.missingFields.includes("last_name") ? { lastName: lastName.join(" ") } : {}),
          ...(signUp.missingFields.includes("email_address") ? { emailAddress: email.trim() } : {}),
        }));
        if (signUp.status === "complete") await finish(signUp);
        else if (signUp.unverifiedFields.includes("email_address")) {
          await check(signUp.verifications.sendEmailCode());
          router.push(`/verify-otp?flow=signup&email=${encodeURIComponent(signUp.emailAddress || email.trim())}`);
        } else throw new UserFacingError("Please complete the required account details before continuing.");
      } catch (error) { showError(error); }
      finally { setIsSubmitting(false); }
      return;
    }
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!password) { setError("Please enter your password."); return; }
    if (!isLogin) {
      if (!fullName.trim()) { setError("Please enter your full name."); return; }
      if (!/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) { setError("Enter a valid 10-digit Indian mobile number."); return; }
      if (!isPasswordValid) { setError("Use at least 8 characters, including uppercase, lowercase, a number, and a special character."); return; }
      if (password !== confirmPassword) { setError("Passwords do not match."); return; }
      if (!agreedTerms) { setError("Please accept the Terms & Conditions."); return; }
    }
    setIsSubmitting(true);
    try {
      if (isLogin) {
        await check(signIn.password({ identifier: email.trim(), password }));
        if (signIn.status === "complete") await finish(signIn);
        else if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
          const flow = await sendSignInCode();
          router.push(`/verify-otp?flow=${flow}&email=${encodeURIComponent(email.trim())}`);
        } else if (signIn.status === "needs_new_password") router.replace("/forgot-password?step=password");
        else throw new UserFacingError("Additional account verification is required. Please try again or contact support.");
      } else {
        await check(signUp.password({
          emailAddress: email.trim(), password, legalAccepted: agreedTerms,
          unsafeMetadata: { fullName: fullName.trim(), mobile: `+91${phone.replace(/\s/g, "")}` },
        }));
        if (signUp.missingFields.includes("first_name") || signUp.missingFields.includes("last_name")) {
          const [firstName, ...lastName] = fullName.trim().split(/\s+/);
          if (signUp.missingFields.includes("last_name") && !lastName.length) throw new UserFacingError("Please enter your first and last name.");
          await check(signUp.update({ firstName, lastName: lastName.join(" ") }));
        }
        await check(signUp.verifications.sendEmailCode());
        setPassword("");
        setConfirmPassword("");
        router.push(`/verify-otp?flow=signup&email=${encodeURIComponent(email.trim())}`);
      }
    } catch (error) { showError(error); }
    finally { setIsSubmitting(false); }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError("");
    if (isResetPassword && (!isPasswordValid || password !== confirmPassword)) {
      setError("Enter matching passwords with at least 8 characters, uppercase, lowercase, a number, and a special character.");
      return;
    }
    if (!isResetPassword && !forgotEmail.trim()) { setError("Please enter your email address."); return; }
    setIsSubmitting(true);
    try {
      if (isResetPassword) {
        await check(signIn.resetPasswordEmailCode.submitPassword({ password, signOutOfOtherSessions: true }));
        if (signIn.status === "complete") await finish(signIn);
        else {
          const flow = await sendSignInCode();
          router.push(`/verify-otp?flow=${flow}`);
        }
      } else {
        await check(signIn.create({ identifier: forgotEmail.trim() }));
        await check(signIn.resetPasswordEmailCode.sendCode());
        router.push(`/verify-otp?flow=reset&email=${encodeURIComponent(forgotEmail.trim())}`);
      }
    } catch (error) { showError(error); }
    finally { setIsSubmitting(false); }
  };

  return (
    <main className="min-h-dvh lg:h-dvh w-full flex flex-col lg:flex-row bg-white overflow-x-hidden lg:overflow-hidden select-none relative">
      {/* FLOATING TOAST / ACTION NOTIFICATION*/}
      {toast && (
        <aside
          aria-label="Notification"
          className="fixed top-4 right-4 left-4 sm:left-auto sm:right-6 sm:top-6 z-50 flex items-start gap-3 rounded-md bg-[#2d254d] text-white px-4 py-3.5 shadow-2xl border border-[#d4af37]/40 sm:max-w-md animate-in slide-in-from-top-3 fade-in duration-300"
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === "success" && (
              <div className="size-8 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                <IoCheckmarkCircle className="size-5" />
              </div>
            )}
            {toast.type === "error" && (
              <div className="size-8 rounded-md bg-red-500/20 text-red-400 flex items-center justify-center border border-red-400/30">
                <IoAlertCircleOutline className="size-5" />
              </div>
            )}
            {toast.type === "info" && (
              <div className="size-8 rounded-md bg-[#d4af37]/20 text-[#FCF1D8] flex items-center justify-center border border-[#d4af37]/40">
                <IoInformationCircleOutline className="size-5" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 pr-1">
            <h4 className="font-display text-sm font-semibold text-white tracking-wide">
              {toast.title}
            </h4>
            {toast.message && (
              <p className="font-sans text-xs text-neutral-300 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="shrink-0 text-neutral-400 hover:text-white transition p-1 cursor-pointer"
            aria-label="Close notification"
          >
            <IoCloseOutline className="size-4" />
          </button>
        </aside>
      )}
      <div className="relative hidden lg:block lg:w-1/2 h-full bg-neutral-900 shrink-0 overflow-hidden">
        <Image
          src="/Home/images/022_enchanted_vrindavan__IMG_0090.jpg"
          alt="Enchanted Vrindavan Pichwai Lehenga"
          fill
          priority
          sizes="50vw"
          className="object-cover object-top"
        />
        {/* Cinematic Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15" />
        <div className="absolute inset-0 bg-[#2d254d]/20 mix-blend-multiply" />

        {/* Bottom Content on Dress Showcase */}
        <div className="absolute bottom-5 inset-x-5 sm:bottom-8 sm:inset-x-8 z-20 text-white">
          <span className="inline-block font-sans text-[10px] sm:text-[11px] uppercase tracking-[2px] text-[#FCF1D8]/90 mb-0.5">
            Masterpieces Couture
          </span>
          <h2 className="font-display text-lg sm:text-xl lg:text-2xl font-medium leading-tight text-white drop-shadow-sm mb-0.5">
            Enchanted Vrindavan Pichwai
          </h2>
          <p className="font-sans text-[11px] sm:text-xs text-neutral-200 line-clamp-2 max-w-md drop-shadow-sm">
            Devotional handpainted Pichwai motifs with royal zari embroidery
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 min-h-dvh lg:h-full flex flex-col justify-center items-center px-5 sm:px-8 lg:px-10 xl:px-14 py-6 sm:py-8 lg:py-4 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-white">
        <div className="w-full max-w-[430px] flex flex-col justify-center my-auto animate-in fade-in duration-300">
          {/* Brand Logo & Header */}
          <div className="text-center mb-3 sm:mb-4 flex flex-col items-center">
            <Link
              href="/"
              className="mb-1.5 inline-flex flex-col items-center justify-center cursor-pointer"
              aria-label="Colors by Nisha Vijay Home"
            >
              <div className="relative h-[80px] w-[68px] sm:h-[88px] sm:w-[75px]">
                <Image
                  src="/Home/images/001_colorsbynishavijay__IMG_4986.png"
                  alt="Colors by Nisha Vijay Logo"
                  fill
                  priority
                  className="object-contain"
                />
              </div>
            </Link>
            <h1 className="font-display text-3xl font-normal leading-tight tracking-normal md:text-4xl text-[#111111]">
              Colors by Nisha Vijay
            </h1>
            <p className="mt-1 font-sans text-xs text-neutral-500 max-w-xs line-clamp-1">
              {isOtpView
                ? "Enter the 6-digit code sent to verify your email."
                : isForgot
                ? "Enter your email to receive a password reset code."
                : isLogin
                ? "Welcome back. Access your saved heirlooms and orders."
                : "Step into our world of handcrafted couture and exclusive edits."}
            </p>
          </div>

          {/* OTP VERIFICATION VIEW */}
          {isOtpView ? (
            <div className="space-y-3">
              <Form onSubmit={handleOtpSubmit} className="space-y-3.5">
                  {/* Target Email Notification */}
                  <div className="rounded-md bg-neutral-50 border border-neutral-200/90 p-3 text-center space-y-1">
                    <div className="inline-flex items-center gap-1.5 text-[#2d254d] text-xs font-medium">
                      <IoShieldCheckmarkOutline className="size-4" />
                      <span>Verification Code Sent</span>
                    </div>
                    <p className="font-sans text-[11px] text-neutral-600">
                      {otpFlow === "totp" ? "Enter the code from your authenticator for " : otpFlow === "phone" ? "Enter the code sent to your phone for " : "We sent an OTP to "}
                      <span className="font-semibold text-ink">
                        {email || "your email"}
                      </span>
                    </p>
                  </div>

                  {resendNotice && (
                    <div role="status" className="rounded-md bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 text-xs text-emerald-700 font-sans text-center">
                      {resendNotice}
                    </div>
                  )}

                  {error && (
                    <div role="alert" className="rounded-md bg-red-50 border border-red-200 px-3.5 py-1.5 text-xs text-red-600 font-sans text-center">
                      {error}
                    </div>
                  )}

                  {/* 6 Digit OTP Inputs */}
                  <div className="space-y-1.5">
                    <label className="block font-sans text-xs font-medium text-neutral-700 text-center">
                      Enter 6-Digit OTP <span className="text-red-500">*</span>
                    </label>
                    <div
                      className="flex items-center justify-center gap-2 sm:gap-2.5"
                      onPaste={handleOtpPaste}
                    >
                      {otp.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="h-11 min-w-0 w-[calc((100%-2.5rem)/6)] max-w-10 sm:h-12 sm:w-11 sm:max-w-none rounded-md border border-neutral-300 bg-white text-center font-display text-lg font-bold text-ink outline-none focus:border-[#2d254d] focus:ring-2 focus:ring-[#2d254d]/20 transition shadow-2xs"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend Countdown */}
                  {otpFlow !== "totp" && <div className="text-center font-sans text-xs">
                    {otpTimer > 0 ? (
                      <p className="text-neutral-500">
                        Resend code in{" "}
                        <span className="font-semibold text-[#2d254d]">
                          00:{otpTimer < 10 ? `0${otpTimer}` : otpTimer}
                        </span>
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="font-semibold text-[#2d254d] hover:underline cursor-pointer"
                      >
                        Didn&apos;t receive code? Resend OTP
                      </button>
                    )}
                  </div>}

                  {/* Verify Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !clerk.loaded}
                    className="w-full rounded-md bg-[#2d254d] hover:bg-[#d4af37] text-[#FCF1D8] hover:text-[#2d254d] py-3 px-4 font-display text-xs sm:text-sm font-semibold uppercase tracking-[1.5px] transition-all duration-300 cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-70"
                  >
                    {isSubmitting ? "VERIFYING..." : "VERIFY & PROCEED"}
                  </button>

                  {/* Back to Edit Signup */}
                  <div className="text-center pt-0.5">
                    <Link
                      href={otpFlow === "signup" ? "/signup" : "/login"}
                      className="inline-flex items-center gap-1.5 font-sans text-xs text-[#2d254d] hover:underline cursor-pointer"
                    >
                      <IoArrowBackOutline className="size-3.5" />
                      <span>{otpFlow === "signup" ? "Back to Sign Up" : "Back to Sign In"}</span>
                    </Link>
                  </div>
                </Form>
            </div>
          ) : isForgot ? (
            /*  FORGOT PASSWORD VIEW  */
            <div className="space-y-3">
              <Form onSubmit={handleForgotSubmit} className="space-y-3">
                {error && (
                  <div role="alert" className="rounded-md bg-red-50 border border-red-200 px-3.5 py-2 text-xs text-red-600 font-sans">
                    {error}
                  </div>
                )}

                {isResetPassword ? (
                <div className="space-y-3">
                  {[{ label: "New password", value: password, change: setPassword }, { label: "Confirm password", value: confirmPassword, change: setConfirmPassword }].map(field => (
                    <label key={field.label} className="block space-y-1 font-sans text-xs font-medium text-neutral-700">
                      <span>{field.label}</span>
                      <input type="password" autoComplete="new-password" required minLength={8} value={field.value} onChange={event => field.change(event.target.value)} className="w-full rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-ink outline-none focus:border-[#2d254d] focus:ring-2 focus:ring-[#2d254d]/15" />
                    </label>
                  ))}
                  <p className="text-xs text-neutral-500">Use 8+ characters, uppercase, lowercase, a number, and a special character.</p>
                </div>
                ) : (
                <div className="space-y-1">
                  <label className="block font-sans text-xs font-medium text-neutral-700">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative flex items-center rounded-md border border-neutral-300 bg-white px-3.5 py-2.5 shadow-2xs focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/15 transition">
                    <IoMailOutline className="text-neutral-400 mr-2.5 size-4 shrink-0" />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-transparent font-sans text-xs sm:text-sm text-ink outline-none placeholder:text-neutral-400"
                    />
                  </div>
                </div>

                )}
                <button
                  type="submit"
                  disabled={isSubmitting || !clerk.loaded}
                  className="w-full rounded-md bg-[#2d254d] hover:bg-[#d4af37] text-[#FCF1D8] hover:text-[#2d254d] py-3 px-4 font-display text-xs sm:text-sm font-semibold uppercase tracking-[1.5px] transition-all duration-300 cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-70 mt-1"
                >
                  {isSubmitting ? "SENDING..." : isResetPassword ? "RESET PASSWORD" : "SEND RESET CODE"}
                </button>

                <div className="text-center pt-1">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 font-sans text-xs text-[#2d254d] hover:underline cursor-pointer"
                  >
                    <IoArrowBackOutline className="size-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>
              </Form>
            </div>
          ) : (
            /*  REGULAR AUTH VIEW (SIGNUP / LOGIN) */
            <>
              {/* Route Switcher Tabs: /signup vs /login */}
              <div className="relative p-1 bg-neutral-100 rounded-md flex items-center mb-3 sm:mb-3.5 select-none w-full border border-neutral-200/80">
                <Link
                  href="/signup"
                  scroll={false}
                  className={`w-1/2 py-1.5 sm:py-2 text-center font-display text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 ${
                    !isLogin
                      ? "bg-white text-[#111111] shadow-xs"
                      : "text-neutral-500 hover:text-[#111111]"
                  }`}
                >
                  Create Account
                </Link>
                <Link
                  href="/login"
                  scroll={false}
                  className={`w-1/2 py-1.5 sm:py-2 text-center font-display text-xs sm:text-sm font-semibold rounded-md transition-all duration-200 ${
                    isLogin
                      ? "bg-white text-[#111111] shadow-xs"
                      : "text-neutral-500 hover:text-[#111111]"
                  }`}
                >
                  Sign In
                </Link>
              </div>

              {!isSocialCompletion && <div className="space-y-3 pb-3">
                <button type="button" onClick={handleGoogleSignIn} disabled={isSubmitting || !clerk.loaded} className="flex min-h-11 w-full items-center justify-center gap-3 rounded-md border border-neutral-300 bg-white px-4 py-2.5 font-sans text-sm font-medium text-ink shadow-2xs transition-colors hover:bg-neutral-50 disabled:cursor-wait disabled:opacity-60">
                  <FcGoogle size={20} aria-hidden="true" />
                  Continue with Google
                </button>
                <div className="flex items-center gap-3 text-[11px] text-neutral-400"><span className="h-px flex-1 bg-neutral-200" /><span>or continue with email</span><span className="h-px flex-1 bg-neutral-200" /></div>
              </div>}

              {isLogin ? (
                /* LOGIN FORM ONLY */
                <Form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
                  {error && (
                    <div role="alert" className="rounded-md bg-red-50 border border-red-200 px-3.5 py-1.5 text-xs text-red-600 font-sans">
                      {error}
                    </div>
                  )}

                  {/* Email Address */}
                  <div className="space-y-1">
                    <label className="block font-sans text-xs font-medium text-neutral-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center rounded-md border border-neutral-300 bg-white px-3.5 py-2 sm:py-2.5 shadow-2xs focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/15 transition">
                      <IoMailOutline className="text-neutral-400 mr-2.5 size-4 shrink-0" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-transparent font-sans text-xs sm:text-sm text-ink outline-none placeholder:text-neutral-400"
                      />
                    </div>
                  </div>

                  {/* Password with Route-changing Forgot Password Link */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block font-sans text-xs font-medium text-neutral-700">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <Link
                        href="/forgot-password"
                        className="font-sans text-[11px] text-[#2d254d] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative flex items-center rounded-md border border-neutral-300 bg-white px-3.5 py-2 sm:py-2.5 shadow-2xs focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/15 transition">
                      <IoLockClosedOutline className="text-neutral-400 mr-2.5 size-4 shrink-0" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-transparent font-sans text-xs sm:text-sm text-ink outline-none placeholder:text-neutral-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-neutral-400 hover:text-ink cursor-pointer p-0.5"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <IoEyeOffOutline size={16} />
                        ) : (
                          <IoEyeOutline size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !clerk.loaded}
                    className="w-full rounded-md bg-[#2d254d] hover:bg-[#d4af37] text-[#FCF1D8] hover:text-[#2d254d] py-3 px-4 font-display text-xs sm:text-sm font-semibold uppercase tracking-[1.5px] transition-all duration-300 cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-70 mt-1"
                  >
                    {isSubmitting ? "SIGNING IN..." : "SIGN IN"}
                  </button>
                </Form>
              ) : (
                /* ================= SIGNUP FORM ONLY ================= */
                <Form onSubmit={handleSubmit} className="space-y-2.5">
                  <div id="clerk-captcha" />
                  {error && (
                    <div role="alert" className="rounded-md bg-red-50 border border-red-200 px-3 py-1 text-xs text-red-600 font-sans">
                      {error}
                    </div>
                  )}

                  {/* Row 1: Full Name & Mobile Number side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="block font-sans text-xs font-medium text-neutral-700">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 shadow-2xs focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/15 transition">
                        <IoPersonOutline className="text-neutral-400 mr-2 size-4 shrink-0" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Radhika"
                          className="w-full bg-transparent font-sans text-xs sm:text-sm text-ink outline-none placeholder:text-neutral-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block font-sans text-xs font-medium text-neutral-700">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 shadow-2xs focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/15 transition">
                        <IoCallOutline className="text-neutral-400 mr-1.5 size-4 shrink-0" />
                        <span className="font-sans text-xs font-medium text-neutral-500 mr-1.5 border-r border-neutral-200 pr-1.5">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Mobile number"
                          className="w-full bg-transparent font-sans text-xs sm:text-sm text-ink outline-none placeholder:text-neutral-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Email Address */}
                  <div className="space-y-1">
                    <label className="block font-sans text-xs font-medium text-neutral-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 shadow-2xs focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/15 transition">
                      <IoMailOutline className="text-neutral-400 mr-2 size-4 shrink-0" />
                      <input
                        type="email"
                        value={isSocialCompletion ? signUp.emailAddress || email : email}
                        readOnly={isSocialCompletion && Boolean(signUp.emailAddress)}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full bg-transparent font-sans text-xs sm:text-sm text-ink outline-none placeholder:text-neutral-400"
                      />
                    </div>
                  </div>

                  {!isSocialCompletion && <>
                    {/* Row 3: Password & Confirm Password side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div className="space-y-1">
                        <label className="block font-sans text-xs font-medium text-neutral-700">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center rounded-md border border-neutral-300 bg-white px-2.5 py-2 shadow-2xs focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/15 transition">
                          <IoLockClosedOutline className="text-neutral-400 mr-1.5 size-4 shrink-0" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-transparent font-sans text-xs sm:text-sm text-ink outline-none placeholder:text-neutral-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-neutral-400 hover:text-ink cursor-pointer p-0.5"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? <IoEyeOffOutline size={15} /> : <IoEyeOutline size={15} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-sans text-xs font-medium text-neutral-700">
                          Confirm Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative flex items-center rounded-md border border-neutral-300 bg-white px-2.5 py-2 shadow-2xs focus-within:border-[#2d254d] focus-within:ring-2 focus-within:ring-[#2d254d]/15 transition">
                          <IoLockClosedOutline className="text-neutral-400 mr-1.5 size-4 shrink-0" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-transparent font-sans text-xs sm:text-sm text-ink outline-none placeholder:text-neutral-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="text-neutral-400 hover:text-ink cursor-pointer p-0.5"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                          >
                            {showConfirmPassword ? <IoEyeOffOutline size={15} /> : <IoEyeOutline size={15} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Live Password Requirements checklist */}
                    {password.length > 0 && (
                      <div className="p-2 sm:p-2.5 rounded-md bg-neutral-50 border border-neutral-200/90 text-[11px] font-sans space-y-1 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                          <span>Password Requirements</span>
                          <span className={isPasswordValid ? "text-emerald-600 font-bold" : "text-neutral-400"}>
                            {isPasswordValid ? "Strong Password ✓" : "Incomplete"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[10.5px]">
                          <div className={`flex items-center gap-1 ${hasMinLen ? "text-emerald-600 font-medium" : "text-neutral-500"}`}>
                            <span>{hasMinLen ? "✓" : "○"}</span> At least 8 characters
                          </div>
                          <div className={`flex items-center gap-1 ${hasUpper ? "text-emerald-600 font-medium" : "text-neutral-500"}`}>
                            <span>{hasUpper ? "✓" : "○"}</span> 1 uppercase (A-Z)
                          </div>
                          <div className={`flex items-center gap-1 ${hasLower ? "text-emerald-600 font-medium" : "text-neutral-500"}`}>
                            <span>{hasLower ? "✓" : "○"}</span> 1 lowercase (a-z)
                          </div>
                          <div className={`flex items-center gap-1 ${hasNumber ? "text-emerald-600 font-medium" : "text-neutral-500"}`}>
                            <span>{hasNumber ? "✓" : "○"}</span> 1 number (0-9)
                          </div>
                          <div className={`flex items-center gap-1 col-span-2 ${hasSpecial ? "text-emerald-600 font-medium" : "text-neutral-500"}`}>
                            <span>{hasSpecial ? "✓" : "○"}</span> 1 special character (!@#$%&*...)
                          </div>
                        </div>
                      </div>
                    )}

                  </>}

                  {/* Terms and Conditions Checkbox */}
                  <div className="flex items-start gap-2 pt-0.5">
                    <input
                      type="checkbox"
                      id="signup-terms"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="size-3.5 mt-0.5 rounded-md border-neutral-300 accent-[#2d254d] cursor-pointer"
                    />
                    <label
                      htmlFor="signup-terms"
                      className="font-sans text-[11px] text-neutral-600 leading-tight cursor-pointer select-none"
                    >
                      I agree to the{" "}
                      <Link
                        href="/terms-and-conditions"
                        target="_blank"
                        className="font-semibold text-[#2d254d] hover:underline"
                      >
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy-policy"
                        target="_blank"
                        className="font-semibold text-[#2d254d] hover:underline"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !clerk.loaded}
                    className="w-full rounded-md bg-[#2d254d] hover:bg-[#d4af37] text-[#FCF1D8] hover:text-[#2d254d] py-3 px-4 font-display text-xs sm:text-sm font-semibold uppercase tracking-[1.5px] transition-all duration-300 cursor-pointer shadow-sm active:scale-[0.99] disabled:opacity-70 mt-1"
                  >
                    {isSubmitting ? "PROCESSING..." : "CREATE ACCOUNT"}
                  </button>
                </Form>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
