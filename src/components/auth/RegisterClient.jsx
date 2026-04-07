"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Shield } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/api";

export default function RegisterClient({
  redirectTo = "/auth/continue",
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      await api.post("/api/auth/register", {
        ...form,
        confirmPassword: form.password,
      });
    } catch (error) {
      setIsSubmitting(false);
      setError(getApiErrorMessage(error, "Unable to create your account."));
      return;
    }

    const loginResult = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
      redirectTo,
    });

    setIsSubmitting(false);

    if (loginResult?.error) {
      setSuccess("Account created successfully. Please login with your new credentials.");
      router.replace(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
      return;
    }

    router.replace(loginResult?.url || redirectTo);
    router.refresh();
  };

  return (
    <div className="w-full max-w-[514px] rounded-[3px] border border-[#d9d9d9] bg-white px-5 py-7 sm:px-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-[58px] w-[58px] items-center justify-center rounded-full bg-black text-white">
          <Shield size={28} strokeWidth={2.3} />
        </div>
        <h1 className="mt-4 text-[24px] font-semibold leading-none text-black">Signup</h1>
        <p className="mt-4 text-[14px] text-black">
          Please provide the information below to get started.
        </p>
      </div>

      <div className="mt-10">
        {error && (
          <div className="mb-4 inline-flex w-full items-start gap-2 rounded-[4px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 inline-flex w-full items-start gap-2 rounded-[4px] border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-3 block text-[15px] font-medium text-[#1f2937]">
              Name <span className="text-black">*</span>
            </label>
            <div className="flex h-[50px] items-center rounded-[4px] border border-[#d1d5db] bg-white px-4">
              <input
                type="text"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                className="h-full w-full bg-transparent text-[15px] text-black outline-none placeholder:text-[#9ca3af]"
                placeholder="Enter full name"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-3 block text-[15px] font-medium text-[#1f2937]">
              Email or Phone No <span className="text-black">*</span>
            </label>
            <div className="flex h-[50px] items-center rounded-[4px] border border-[#d1d5db] bg-white px-4">
              <input
                type="text"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
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
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                className="h-full w-full bg-transparent text-[15px] text-black outline-none placeholder:text-[#9ca3af]"
                placeholder="Enter password"
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

          <p className="text-[13px] text-[#6b7280]">•&nbsp; Password must have 6 characters</p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 inline-flex h-[50px] w-full items-center justify-center rounded-[4px] bg-black px-4 text-[15px] font-medium text-white transition-colors hover:bg-[#111111] disabled:opacity-70"
          >
            {isSubmitting ? "Creating account..." : "Signup"}
          </button>
        </form>

        <p className="mt-4 text-center text-[14px] text-[#6b21a8]">
          Already have an account?{" "}
          <Link
            href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`}
            className="text-[#2563eb]"
          >
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
}
