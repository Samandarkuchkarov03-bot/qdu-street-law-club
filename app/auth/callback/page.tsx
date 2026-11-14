"use client";

import { useEffect, useLayoutEffect } from "react";
import { readAuthCallback } from "@/lib/recovery";

export default function AuthCallbackPage() {
  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("token_hash") && params.get("type") === "recovery") {
      window.location.replace(`/auth/confirm${window.location.search}`);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function finish() {
      const params = new URLSearchParams(window.location.search);
      if (params.get("token_hash") && params.get("type") === "recovery") return;

      const result = await readAuthCallback();
      if (!active) return;

      if (result.status === "error") {
        const query = new URLSearchParams();
        query.set("error", "access_denied");
        if (result.code) query.set("error_code", result.code);
        query.set("error_description", result.message);
        window.location.replace(`/update-password?${query.toString()}`);
        return;
      }

      window.location.replace("/update-password");
    }

    void finish();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 text-white">
      <p className="text-slate-300">Tiklash havolasi tekshirilmoqda...</p>
    </div>
  );
}
