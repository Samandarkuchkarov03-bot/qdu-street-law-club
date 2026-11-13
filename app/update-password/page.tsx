
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("Parol kamida 6 ta belgidan iborat bo‘lsin.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Parollar bir xil emas.");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage("Xatolik: " + error.message);
      setLoading(false);
      return;
    }

    setMessage("Parol muvaffaqiyatli yangilandi!");

    setTimeout(() => {
      router.replace("/admin");
    }, 1500);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-8"
      >
        <h1 className="text-center text-3xl font-bold">
          Yangi parol
        </h1>

        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Yangi parol"
          className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
        />

        <input
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Parolni takrorlang"
          className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
        />

        {message && (
          <p className="text-sm text-amber-400">{message}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-amber-500 p-3 font-semibold text-slate-950 disabled:opacity-50"
        >
          {loading ? "Saqlanmoqda..." : "Parolni yangilash"}
        </button>
      </form>
    </main>
  );
}

