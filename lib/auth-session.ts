"use client";

import { supabase } from "@/lib/supabase";

export async function syncServerSession(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  const session = data.session;
  if (!session) return false;
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    }),
  });
  return response.ok;
}

export async function clearServerSession(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
}
