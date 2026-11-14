import { NextResponse, type NextRequest } from "next/server";
import { recoveryRedirectPath } from "@/lib/auth-redirect";

export function middleware(request: NextRequest) {
  const target = recoveryRedirectPath({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    hash: "",
  });
  if (!target) return NextResponse.next();
  return NextResponse.redirect(new URL(target, request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
