"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { clearRecoverySessionFlag, hasActiveRecoverySession, markRecoverySession, missingRecoveryMessage, readAuthCallback } from "@/lib/recovery";

type Phase = "checking" | "ready" | "error" | "done";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("token_hash") && params.get("type") === "recovery") {
      window.location.replace(`/auth/confirm${window.location.search}`);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams(window.location.search);
    if (params.get("token_hash") && params.get("type") === "recovery") return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active || event !== "PASSWORD_RECOVERY" || !session) return;
      markRecoverySession();
      setPhase("ready");
      setMessage("");
    });

    async function prepare() {
      const result = await readAuthCallback();
      if (!active) return;

      if (result.status === "ok" || (result.status === "empty" && (await hasActiveRecoverySession()))) {
        setPhase("ready");
        return;
      }

      setMessage(result.status === "error" ? result.message : missingRecoveryMessage);
      setPhase("error");
    }

    void prepare();
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("Parol kamida 6 ta belgidan iborat bo‘lsin.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Parollar bir xil emas.");
      return;
    }

    if (!(await hasActiveRecoverySession())) {
      setMessage(missingRecoveryMessage);
      setPhase("error");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    clearRecoverySessionFlag();
    setPhase("done");
    setMessage("Parol muvaffaqiyatli yangilandi!");
    window.setTimeout(() => {
      router.replace("/admin");
    }, 1500);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16 text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-8"
      >
        <h1 className="text-center text-3xl font-bold">Yangi parol</h1>

        {phase === "checking" ? <p className="text-center text-sm text-slate-400">Havola tekshirilmoqda...</p> : null}

        {phase === "error" ? (
          <div className="space-y-4">
            <p role="alert" className="text-sm leading-6 text-amber-400">{message}</p>
            <Link href="/admin/login" className="block text-center text-sm text-amber-400 hover:text-amber-300">
              Login sahifasidan yangi havola so‘rash
            </Link>
          </div>
        ) : null}

        {phase === "ready" || phase === "done" ? (
          <>
            <label className="block">
              <span className="mb-2 block text-sm">Yangi parol</span>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm">Parolni takrorlang</span>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-600 bg-slate-800 p-3"
              />
            </label>

            {message ? <p role="status" className="text-sm text-amber-400">{message}</p> : null}

            <button
              type="submit"
              disabled={loading || phase === "done"}
              className="w-full rounded-lg bg-amber-500 p-3 font-semibold text-slate-950 disabled:opacity-50"
            >
              {loading ? "Saqlanmoqda..." : "Parolni yangilash"}
            </button>
          </>
        ) : null}
      </form>
    </div>
  );
}
