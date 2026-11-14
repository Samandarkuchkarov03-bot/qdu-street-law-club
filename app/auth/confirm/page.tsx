"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { EmailOtpType } from "@supabase/supabase-js";
import { verifyRecoveryToken } from "@/lib/recovery";

export default function AuthConfirmPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function continueRecovery() {
    setMessage("");
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = params.get("type");

    if (!tokenHash || type !== "recovery") {
      setMessage("Tiklash havolasida token topilmadi. Login sahifasidan yangi havola so‘rang.");
      return;
    }

    setLoading(true);
    const result = await verifyRecoveryToken(tokenHash, type as EmailOtpType);
    if (result.status === "error") {
      setMessage(result.message);
      setLoading(false);
      return;
    }

    router.replace("/update-password");
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16 text-white">
      <div className="w-full max-w-md space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-8">
        <h1 className="text-center text-3xl font-bold">Parolni tiklash</h1>
        <p className="text-center text-sm leading-6 text-slate-400">
          Havola hali ishlatilmadi. Davom etishni bosganingizdan keyin yangi parol sahifasi ochiladi.
        </p>
        {message ? <p role="alert" className="text-sm text-amber-400">{message}</p> : null}
        <button
          type="button"
          onClick={() => void continueRecovery()}
          disabled={loading}
          className="w-full rounded-lg bg-amber-500 p-3 font-semibold text-slate-950 disabled:opacity-50"
        >
          {loading ? "Tekshirilmoqda..." : "Davom etish"}
        </button>
      </div>
    </div>
  );
}
