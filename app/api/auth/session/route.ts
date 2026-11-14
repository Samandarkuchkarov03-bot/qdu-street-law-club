import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/supabase-server";

const ACCESS = "sb-access-token";
const REFRESH = "sb-refresh-token";

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function clear(response: NextResponse) {
  response.cookies.set(ACCESS, "", cookieOptions(0));
  response.cookies.set(REFRESH, "", cookieOptions(0));
  return response;
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
  if (typeof accessToken !== "string" || typeof refreshToken !== "string") {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (accessToken.length < 20 || accessToken.length > 8192 || refreshToken.length < 20 || refreshToken.length > 4096) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const { url, key } = getSupabaseEnv();
  const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { data, error } = await supabase.auth.getUser(accessToken);
  if (error || !data.user) return NextResponse.json({ ok: false }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS, accessToken, cookieOptions(60 * 60));
  response.cookies.set(REFRESH, refreshToken, cookieOptions(60 * 60 * 24 * 14));
  return response;
}

export async function DELETE() {
  return clear(NextResponse.json({ ok: true }));
}
