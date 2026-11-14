import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase-server";
import { ACCESS_COOKIE, REFRESH_COOKIE, clearAuthCookies, writeTokenCookie } from "@/lib/session-cookie";

function validToken(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length >= 8 && value.length <= max;
}

export async function POST(request: Request) {
  let body: { access_token?: unknown; refresh_token?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const accessToken = body.access_token;
  const refreshToken = body.refresh_token;
  if (!validToken(accessToken, 20000) || !validToken(refreshToken, 12000)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { url, key } = getSupabaseEnv();
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return NextResponse.json({ ok: false }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  writeTokenCookie(response, ACCESS_COOKIE, accessToken, 60 * 60);
  writeTokenCookie(response, REFRESH_COOKIE, refreshToken, 60 * 60 * 24 * 14);
  return response;
}

export async function DELETE() {
  return clearAuthCookies(NextResponse.json({ ok: true }));
}
