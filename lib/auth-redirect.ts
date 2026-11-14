import { site } from "@/data/site";

export const PASSWORD_RECOVERY_REDIRECT_TO = `${site.url}/auth/callback`;

const AUTH_ERROR_CODES = new Set([
  "otp_expired",
  "otp_disabled",
  "access_denied",
  "flow_state_expired",
  "flow_state_not_found",
  "unexpected_failure",
  "invalid_request",
  "unauthorized_client",
  "server_error",
  "validation_failed",
]);

const RECOVERY_PAGES = new Set(["/update-password", "/auth/callback", "/auth/confirm"]);

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname || "/";
}

function isAuthCode(code: string | null): boolean {
  return Boolean(code && /^[A-Za-z0-9._-]{20,}$/.test(code));
}

export function recoveryRedirectPath(input: { pathname: string; search: string; hash: string }): string | null {
  const pathname = normalizePath(input.pathname);
  const params = new URLSearchParams(input.search);
  const hash = new URLSearchParams(input.hash.replace(/^#/, ""));
  const type = params.get("type") || hash.get("type");

  if (params.get("token_hash") && type === "recovery" && pathname !== "/auth/confirm") {
    return `/auth/confirm${input.search}`;
  }

  if (RECOVERY_PAGES.has(pathname)) return null;

  const errorCode = params.get("error_code") || hash.get("error_code") || "";
  const error = params.get("error") || hash.get("error") || "";
  const accessToken = hash.get("access_token") || params.get("access_token");
  const refreshToken = hash.get("refresh_token") || params.get("refresh_token");
  const standardGrant = Boolean(accessToken && refreshToken);
  const authError = AUTH_ERROR_CODES.has(errorCode) || AUTH_ERROR_CODES.has(error);

  if (type === "recovery" || standardGrant || authError || isAuthCode(params.get("code"))) {
    return `/auth/callback${input.search}${input.hash}`;
  }

  return null;
}

export const RECOVERY_BOOT_SCRIPT = `(function(){try{var path=location.pathname.replace(/\\/$/,"")||"/";if(path==="/auth/callback"||path==="/auth/confirm"||path==="/update-password")return;var search=location.search;var hash=location.hash;var query=new URLSearchParams(search);var fragment=new URLSearchParams(hash.replace(/^#/,""));var type=query.get("type")||fragment.get("type");if(query.get("token_hash")&&type==="recovery"){location.replace("/auth/confirm"+search);return;}var code=query.get("code")||"";var hasCode=/^[A-Za-z0-9._-]{20,}$/.test(code);var hasTokens=(fragment.get("access_token")||query.get("access_token"))&&(fragment.get("refresh_token")||query.get("refresh_token"));var errorCode=query.get("error_code")||fragment.get("error_code")||"";var error=query.get("error")||fragment.get("error")||"";var authError=["otp_expired","otp_disabled","access_denied","flow_state_expired","flow_state_not_found","unexpected_failure","invalid_request","unauthorized_client","server_error","validation_failed"].indexOf(errorCode)>=0||["otp_expired","otp_disabled","access_denied","flow_state_expired","flow_state_not_found","unexpected_failure","invalid_request","unauthorized_client","server_error","validation_failed"].indexOf(error)>=0;if(type==="recovery"||hasTokens||authError||hasCode){location.replace("/auth/callback"+search+hash);}}catch(e){}})();`;
