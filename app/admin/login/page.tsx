"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { clearServerSession, syncServerSession } from "@/lib/auth-session";
import { site } from "@/data/site";

function loginError(error: AuthError | null): string {
  const code = error?.code ?? "";
  const message = (error?.message ?? "").toLowerCase();
  if (code === "invalid_credentials" || message.includes("invalid login")) return "Email yoki parol noto'g'ri.";
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Email tasdiqlanmagan. Pochtangizdagi havolani oching yoki parolni tiklang.";
  }
  return "Kirish amalga oshmadi. Qayta urinib ko'ring.";
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    let active = true;
    async function resume() {
      if (busy.current) return;
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const userId = session?.user?.id;
      if (!active || busy.current || !session || !userId) return;
      const { data: role } = await supabase.from("user_roles").select("role").eq("id", userId).maybeSingle();
      if (!active || busy.current || role?.role !== "admin") return;
      const synced = await syncServerSession(session);
      if (synced && active && !busy.current) router.replace("/admin");
    }
    void resume();
    return () => {
      active = false;
    };
  }, [router]);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    busy.current = true;
    setError("");
    setNotice("");
    setLoading(true);

    const { data: signIn, error: signError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signError || !signIn.session || !signIn.user) {
      setError(loginError(signError));
      setLoading(false);
      busy.current = false;
      return;
    }

    const { data: role } = await supabase.from("user_roles").select("role").eq("id", signIn.user.id).maybeSingle();
    if (role?.role !== "admin") {
      await supabase.auth.signOut();
      await clearServerSession();
      setError("Bu hisobda admin huquqi yo'q.");
      setLoading(false);
      busy.current = false;
      return;
    }

    const synced = await syncServerSession(signIn.session);
    if (!synced) {
      setError("Sessiya saqlanmadi. Qayta urinib ko'ring.");
      setLoading(false);
      busy.current = false;
      return;
    }

    router.replace("/admin");
  }

  async function handleResetPassword() {
    setError("");
    setNotice("");
    if (!email.trim()) {
      setError("Avval emailingizni kiriting.");
      return;
    }
    setResetLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${site.url}/auth/callback`,
    });
    if (resetError) {
      const known = loginError(resetError);
      setError(known === "Kirish amalga oshmadi. Qayta urinib ko'ring." ? "Tiklash xati yuborilmadi. Emailni tekshirib, qayta urinib ko'ring." : known);
    }
    else setNotice("Parolni tiklash havolasi emailingizga yuborildi.");
    setResetLoading(false);
  }

  return (
    <div className="container-x flex min-h-[70vh] items-center py-16">
      <form onSubmit={handleLogin} className="card mx-auto w-full max-w-md space-y-5 p-8">
        <h1 className="text-center text-3xl">Admin kirish</h1>
        <p className="text-center text-sm text-slate-400">QDU Street Law Club boshqaruv paneli</p>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" className="input" placeholder="Email manzilingiz" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-white">Parol</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" className="input" placeholder="Parolingiz" />
        </label>
        <button type="button" onClick={() => void handleResetPassword()} disabled={resetLoading} className="text-sm font-semibold text-gold-400 hover:text-gold-300 disabled:opacity-50">
          {resetLoading ? "Yuborilmoqda..." : "Parolni unutdingizmi?"}
        </button>
        {error ? <p role="alert" className="text-sm text-red-300">{error}</p> : null}
        {notice ? <p role="status" className="text-sm text-emerald-300">{notice}</p> : null}
        <button type="submit" disabled={loading} className="btn-gold w-full disabled:cursor-not-allowed disabled:opacity-60">
          {loading ? "Tekshirilmoqda..." : "Kirish"}
        </button>
      </form>
    </div>
  );
}
