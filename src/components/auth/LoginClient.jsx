"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { AlertCircle, Eye, EyeOff, Shield } from "lucide-react";

const ERROR_MESSAGES = {
  CredentialsSignin: "Invalid email or password.",
  OAuthAccountNotLinked: "This email is already linked with a different sign-in method.",
  AccessDenied: "You are not allowed to sign in right now.",
};

export default function LoginClient({
  redirectTo = "/auth/continue",
  initialError = "",
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(ERROR_MESSAGES[initialError] || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleCredentialsLogin = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      redirectTo,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError(ERROR_MESSAGES[result.error] || "Unable to sign in with those credentials.");
      return;
    }

    router.replace(result?.url || redirectTo);
    router.refresh();
  };

  return (
    <div className="w-full max-w-[514px] rounded-[3px] border border-[#d9d9d9] bg-white px-5 py-7 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-black text-white">
          <Shield size={28} strokeWidth={2.3} />
        </div>
        <h1 className="mt-4 text-[24px] font-semibold leading-none text-black">Login</h1>
        <p className="mt-4 text-[14px] text-black">
          Please provide phone no or email to get started.
        </p>
      </div>

      <div className="mt-10">
        {error && (
          <div className="mb-4 inline-flex w-full items-start gap-2 rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div>
            <label className="mb-3 block text-[15px] font-medium text-[#1f2937]">
              Email or Phone No <span className="text-black">*</span>
            </label>
            <div className="flex h-[50px] items-center rounded-[4px] border border-[#d1d5db] bg-white px-4">
              <input
                type="text"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-full w-full bg-transparent text-[15px] text-black outline-none placeholder:text-[#9ca3af]"
                placeholder="Enter your phone number or email"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-[15px] font-medium text-[#1f2937]">
              Password <span className="text-black">*</span>
            </label>
            <div className="flex h-[50px] items-center rounded-[4px] border border-[#d1d5db] bg-white px-4">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-full w-full bg-transparent text-[15px] text-black outline-none placeholder:text-[#9ca3af]"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="inline-flex h-8 w-8 items-center justify-center text-[#b0b0b0]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-[13px] text-[#6b7280]">
            <p className="leading-none">•&nbsp; Password must have 6 characters</p>
            <button
              type="button"
              onClick={() => setError("Password reset is not available right now.")}
              className="text-[13px] text-[#6b7280]"
            >
              Forget password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex h-[50px] w-full items-center justify-center rounded-[4px] bg-black px-4 text-[15px] font-medium text-white transition-colors hover:bg-[#111111] disabled:opacity-70"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-4 text-center text-[14px] text-[#6b21a8]">
          Don&apos;t have an account?{" "}
          <Link
            href={`/register?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="text-[#2563eb]"
          >
            Create an account
          </Link>
        </p>

        <p className="mt-6 text-[14px] text-black">Or Continue</p>

        <button
          type="button"
          onClick={() => signIn("google", { redirectTo })}
          className="mt-4 inline-flex h-[40px] w-full items-center justify-center gap-3 rounded-[4px] border border-[#ff5a4f] bg-white px-4 text-[15px] font-semibold text-[#ff5a4f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.3 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.5 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.3 6.1 29.4 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.3c-2.1 1.6-4.7 2.6-7.3 2.6-5.3 0-9.7-3.3-11.3-8l-6.6 5.1C9.6 39.6 16.2 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.4l6.3 5.3C40 35.5 44 30.2 44 24c0-1.2-.1-2.4-.4-3.5z"/>
          </svg>
          Log in with Google
        </button>
      </div>
    </div>
  );
}
