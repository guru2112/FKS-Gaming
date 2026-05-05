"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const data = await loginUser({ email, password });
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_role", data.role);
      setMessage("Login successful. Welcome back to JKS Arena.");
      router.push(data.role === "admin" ? "/admin" : "/dashboard");
    } catch (error) {
      const err = error as Error;
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-slate-900">
      <div className="relative overflow-hidden px-4 py-10 sm:px-6 md:px-16">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-orange-300/60 blur-[140px]" />
          <div className="absolute right-[-120px] top-24 h-[320px] w-[320px] rounded-full bg-cyan-300/45 blur-[150px]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-orange-600">Member access</p>
            <h1 className="font-display text-4xl leading-[0.95] text-slate-900 sm:text-5xl md:text-6xl">
              Login to your squad hub.
            </h1>
            <p className="text-base text-slate-600 sm:text-lg">
              Save your seat, track tournaments, and unlock member-only cafe perks.
            </p>
            <a
              href="/signup"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-orange-600"
            >
              Need an account? Sign up
            </a>
          </div>

          <div className="gradient-border rounded-[32px]">
            <form
              onSubmit={handleSubmit}
              className="surface-panel rounded-[32px] p-5 sm:p-6 md:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400"
                    placeholder="you@jksarena.gg"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-500">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400"
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="glow-ring w-full rounded-full bg-orange-500 px-6 py-3 text-sm uppercase tracking-[0.2em] text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Logging in..." : "Login"}
                </button>
                {message ? (
                  <p className="text-sm text-slate-600">{message}</p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
