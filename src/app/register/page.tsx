"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Scale, ShieldCheck } from "lucide-react";
import { registerUser } from "@/lib/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "advocate">("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!name || !email || !phone || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      await registerUser(name, email, password, phone, role);
      window.location.href = "/login";
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6 sm:px-6 sm:py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.9),_transparent_40%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden bg-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-white">
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>

              <div className="mt-16 max-w-md">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-900/30">
                  <Scale className="h-7 w-7" />
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
                  LegalConnect
                </p>

                <h2 className="mt-4 text-4xl font-bold leading-tight xl:text-5xl">
                  Your legal journey starts here.
                </h2>

                <p className="mt-5 text-base leading-7 text-slate-300">
                  Create your account to connect with advocates and manage your legal matters with confidence.
                </p>

                <div className="mt-8 space-y-4">
                  {[
                    "Simple advocate discovery",
                    "Easy online consultations",
                    "Organized case management",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-400" />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4" />
              Your account is protected
            </div>
          </section>

          <section className="p-6 sm:p-10 lg:p-12 xl:p-14">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to home
              </Link>
            </div>

            <div className="mx-auto max-w-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                <Scale className="h-6 w-6" />
              </div>

              <h1 className="mt-6 text-3xl font-bold tracking-tight text-slate-950">
                Create your account
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Join LegalConnect and get started in minutes.
              </p>

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="name" className="text-sm font-semibold text-slate-700">
                    Full name
                  </label>
                  <input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="text-sm font-semibold text-slate-700">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="text-sm font-semibold text-slate-700">
                    Phone number
                  </label>
                  <input
                    id="phone"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="03XXXXXXXXX"
                    autoComplete="tel"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="text-sm font-semibold text-slate-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Minimum 8 characters"
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    I want to join as
                  </p>

                  <div className="mt-2 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole("client")}
                      className={`rounded-2xl border px-4 py-3.5 text-sm font-semibold transition ${
                        role === "client"
                          ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/10"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      Client
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("advocate")}
                      className={`rounded-2xl border px-4 py-3.5 text-sm font-semibold transition ${
                        role === "advocate"
                          ? "border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/10"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      Advocate
                    </button>
                  </div>

                  {role === "advocate" && (
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Advocate accounts may require verification before appearing publicly.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 transition hover:bg-blue-700 hover:shadow-blue-700/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p className="mt-7 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
