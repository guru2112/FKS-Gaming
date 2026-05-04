"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const data = await registerUser({ name, email, password });
      localStorage.setItem("auth_token", data.token);
      localStorage.setItem("auth_role", data.role);
      setMessage("Welcome to JKS Arena! Your membership is active.");
      router.push("/dashboard");
    } catch (error) {
      const err = error as Error;
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden px-4 py-10 sm:px-6 md:px-16">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute -top-32 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-orange-500/30 blur-[120px]" />
          <div className="absolute left-[-120px] top-32 h-[320px] w-[320px] rounded-full bg-cyan-400/20 blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-5xl gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-orange-300">New member</p>
            <h1 className="font-display text-4xl leading-[0.95] text-white sm:text-5xl md:text-6xl">
              Join the arena.
            </h1>
            <p className="text-base text-slate-300 sm:text-lg">
              Create your squad profile and unlock prime time booking slots.
            </p>
            <a
              href="/login"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-orange-200"
            >
              Already registered? Login
            </a>
          </div>

          <div className="gradient-border rounded-[32px]">
            <form
              onSubmit={handleSubmit}
              className="surface-panel rounded-[32px] p-5 sm:p-6 md:p-8"
            >
              <div className="space-y-5">
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
                    placeholder="Squad leader name"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
                    placeholder="you@jksarena.gg"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                    className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-orange-400"
                    placeholder="Create a password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="glow-ring w-full rounded-full bg-orange-500 px-6 py-3 text-sm uppercase tracking-[0.2em] text-slate-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </button>
                {message ? (
                  <p className="text-sm text-slate-300">{message}</p>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
