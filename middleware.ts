import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { recoveryRedirectPath } from "@/lib/auth-redirect";
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

async function guardAdmin(request: NextRequest) {
  const loginUrl = new URL("/admin/login", request.url);
  let access = request.cookies.get(ACCESS)?.value;
  const refresh = request.cookies.get(REFRESH)?.value;
  if (!access && !refresh) return NextResponse.redirect(loginUrl);

  let env: { url: string; key: string };
  try {
    env = getSupabaseEnv();
  } catch {
    return NextResponse.redirect(loginUrl);
  }

  const supabase = createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });

  const response = NextResponse.next();
  let userId = "";

  if (access) {
    const { data } = await supabase.auth.getUser(access);
    userId = data.user?.id ?? "";
  }

  if (!userId && refresh) {
    const { data } = await supabase.auth.refreshSession({ refresh_token: refresh });
    if (data.session?.access_token && data.user) {
      access = data.session.access_token;
      userId = data.user.id;
      response.cookies.set(ACCESS, data.session.access_token, cookieOptions(60 * 60));
      response.cookies.set(REFRESH, data.session.refresh_token, cookieOptions(60 * 60 * 24 * 14));
    }
  }

  if (!userId || !access) return NextResponse.redirect(loginUrl);

  const authed = createClient(env.url, env.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${access}` } },
  });
  const { data: role } = await authed.from("user_roles").select("role").eq("id", userId).maybeSingle();
  if (role?.role !== "admin") return NextResponse.redirect(new URL("/", request.url));
  return response;
}

export async function middleware(request: NextRequest) {
  const target = recoveryRedirectPath({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    hash: "",
  });
  if (target) return NextResponse.redirect(new URL(target, request.url));

  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin") || pathname.startsWith("/admin/login")) return NextResponse.next();
  return guardAdmin(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
