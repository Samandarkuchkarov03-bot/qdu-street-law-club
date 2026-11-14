import { NextResponse } from "next/server";

export const ACCESS_COOKIE = "sb-access-token";
export const REFRESH_COOKIE = "sb-refresh-token";

const CHUNK = 3000;
const MAX_CHUNKS = 6;

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

function chunksOf(token: string): string[] {
  const chunks: string[] = [];
  for (let index = 0; index < token.length; index += CHUNK) chunks.push(token.slice(index, index + CHUNK));
  return chunks.length ? chunks : [token];
}

export function writeTokenCookie(response: NextResponse, name: string, token: string | null, maxAge: number) {
  const write = cookieOptions(maxAge);
  const clear = cookieOptions(0);
  response.cookies.set(name, "", clear);
  const chunks = token ? chunksOf(token) : [];
  for (let index = 0; index < MAX_CHUNKS; index += 1) {
    if (token && index < chunks.length) response.cookies.set(`${name}.${index}`, chunks[index], write);
    else response.cookies.set(`${name}.${index}`, "", clear);
  }
}

export function readTokenCookie(cookies: { getAll(): { name: string; value: string }[] }, name: string): string {
  const all = cookies.getAll();
  const chunks: string[] = [];
  for (let index = 0; index < MAX_CHUNKS; index += 1) {
    const found = all.find((cookie) => cookie.name === `${name}.${index}`);
    if (!found?.value) break;
    chunks.push(found.value);
  }
  if (chunks.length) return chunks.join("");
  return all.find((cookie) => cookie.name === name)?.value ?? "";
}

export function clearAuthCookies(response: NextResponse) {
  writeTokenCookie(response, ACCESS_COOKIE, null, 0);
  writeTokenCookie(response, REFRESH_COOKIE, null, 0);
  return response;
}
