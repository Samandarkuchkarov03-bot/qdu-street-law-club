
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Email yoki parol noto‘g‘ri.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
  }

  async function handleResetPassword() {
    setError("");

    if (!email.trim()) {
      setError("Avval emailingizni kiriting.");
      return;
    }

    setResetLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: "https://qdu-street-law-club-8buc.vercel.app/auth/callback",
      }
    );

    if (error) {
      setError("Xatolik: " + error.message);
    } else {
      setError("Parolni tiklash havolasi emailingizga yuborildi.");
    }

    setResetLoading(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-8"
      >
        <h1 className="text-center text-3xl font-bold">Admin kirish</h1>

        <p className="text-center text-slate-400">
          QDU Street Law Club boshqaruv paneli
        </p>

        <div>
          <label className="mb-2 block text-sm">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white outline-none"
            placeholder="Email manzilingiz"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm">Parol</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3 text-white outline-none"
            placeholder="Parolingiz"
          />
        </div>

        <button
          type="button"
          onClick={handleResetPassword}
          disabled={resetLoading}
          className="text-sm text-amber-400 hover:text-amber-300 disabled:opacity-50"
        >
          {resetLoading ? "Yuborilmoqda..." : "Parolni unutdingizmi?"}
        </button>

        {error && <p className="text-sm text-amber-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-500 p-3 font-semibold text-slate-950 hover:bg-amber-400 disabled:opacity-50"
        >
          {loading ? "Tekshirilmoqda..." : "Kirish"}
        </button>
      </form>
    </main>
  );
}

