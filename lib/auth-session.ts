"use client";

import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export async function syncServerSession(session?: Session | null): Promise<boolean> {
  const current = session ?? (await supabase.auth.getSession()).data.session;
  const accessToken = current?.access_token;
  const refreshToken = current?.refresh_token;
  if (!accessToken || !refreshToken) return false;
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken,
    }),
  });
  return response.ok;
}

export async function clearServerSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
}
