import type { EmailOtpType } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const RECOVERY_FLAG = "slc-password-recovery";

const NO_SESSION_MESSAGE =
  "Tiklash sessiyasi topilmadi. Havola yaroqsiz, muddati o‘tgan yoki allaqachon ishlatilgan. Login sahifasidan yangi havola so‘rang va uni shu brauzerda oching.";

const OTP_EXPIRED_MESSAGE =
  "Tiklash havolasi eskirgan yoki allaqachon ishlatilgan. Pochta dasturi havolani oldindan ochib yuborgan bo‘lishi mumkin. Login sahifasidan yangi havola so‘rang va uni darhol bosing.";

const PKCE_MESSAGE =
  "Bu tiklash kodi shu brauzerda saqlangan tekshiruv kaliti bilan mos kelmadi. Havolani parol so‘ralgan brauzerda oching yoki yangi havola so‘rang.";

export type RecoveryRead =
  | { status: "empty" }
  | { status: "ok" }
  | { status: "error"; message: string; code?: string };

export function markRecoverySession() {
  sessionStorage.setItem(RECOVERY_FLAG, "1");
}

function clearRecovery() {
  sessionStorage.removeItem(RECOVERY_FLAG);
}

function cleanAddressBar() {
  window.history.replaceState(window.history.state, "", window.location.pathname);
}

function recoveryErrorMessage(code: string | null, description: string | null): string {
  const normalized = (code ?? "").toLowerCase();
  if (normalized === "otp_expired" || normalized === "flow_state_expired" || normalized === "flow_state_not_found") {
    return OTP_EXPIRED_MESSAGE;
  }
  if (description && !/error with unspecified/i.test(description)) return description;
  return NO_SESSION_MESSAGE;
}

function isVerifierError(code: string | undefined, message: string | undefined): boolean {
  const normalized = `${code ?? ""} ${message ?? ""}`.toLowerCase();
  return normalized.includes("verifier") || normalized.includes("code challenge") || normalized.includes("pkce");
}

export async function verifyRecoveryToken(tokenHash: string, type: EmailOtpType): Promise<RecoveryRead> {
  if (type !== "recovery") {
    return { status: "error", message: "Bu havola parolni tiklash uchun emas." };
  }

  const { data, error } = await supabase.auth.verifyOtp({ type: "recovery", token_hash: tokenHash });
  if (error || !data.session) {
    return {
      status: "error",
      code: error?.code,
      message: recoveryErrorMessage(error?.code ?? null, error?.message ?? null),
    };
  }

  markRecoverySession();
  return { status: "ok" };
}

let callbackRead: Promise<RecoveryRead> | null = null;

export function readAuthCallback(): Promise<RecoveryRead> {
  if (!callbackRead) {
    callbackRead = consumeAuthCallback().finally(() => {
      window.setTimeout(() => {
        callbackRead = null;
      }, 0);
    });
  }
  return callbackRead;
}

async function consumeAuthCallback(): Promise<RecoveryRead> {
  const params = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const errorCode = params.get("error_code") || hash.get("error_code");
  const error = params.get("error") || hash.get("error");
  const description = params.get("error_description") || hash.get("error_description");
  const code = params.get("code");
  const accessToken = hash.get("access_token") || params.get("access_token");
  const refreshToken = hash.get("refresh_token") || params.get("refresh_token");
  const type = params.get("type") || hash.get("type");
  const token = params.get("token");
  const hasCallback = Boolean(
    error || errorCode || code || (accessToken && refreshToken) || (token && type === "recovery"),
  );
  if (!hasCallback) return { status: "empty" };

  if (error || errorCode) {
    clearRecovery();
    cleanAddressBar();
    return {
      status: "error",
      code: errorCode ?? error ?? undefined,
      message: recoveryErrorMessage(errorCode ?? error, description),
    };
  }

  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) {
      clearRecovery();
      cleanAddressBar();
      return {
        status: "error",
        code: sessionError.code,
        message: recoveryErrorMessage(sessionError.code ?? null, sessionError.message),
      };
    }
    markRecoverySession();
    cleanAddressBar();
    return { status: "ok" };
  }

  if (code) {
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError || !data.session) {
      clearRecovery();
      cleanAddressBar();
      const message = isVerifierError(exchangeError?.code, exchangeError?.message)
        ? PKCE_MESSAGE
        : recoveryErrorMessage(exchangeError?.code ?? null, exchangeError?.message ?? null);
      return { status: "error", code: exchangeError?.code, message };
    }
    markRecoverySession();
    cleanAddressBar();
    return { status: "ok" };
  }

  if (token && type === "recovery") {
    const { data, error: otpError } = await supabase.auth.verifyOtp({
      type: "recovery",
      token_hash: token,
    });
    if (otpError || !data.session) {
      clearRecovery();
      cleanAddressBar();
      return {
        status: "error",
        code: otpError?.code,
        message: recoveryErrorMessage(otpError?.code ?? null, otpError?.message ?? null),
      };
    }
    markRecoverySession();
    cleanAddressBar();
    return { status: "ok" };
  }

  return { status: "empty" };
}

export async function hasActiveRecoverySession(): Promise<boolean> {
  if (sessionStorage.getItem(RECOVERY_FLAG) !== "1") return false;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    clearRecovery();
    return false;
  }
  return true;
}

export function clearRecoverySessionFlag() {
  clearRecovery();
}

export const missingRecoveryMessage = NO_SESSION_MESSAGE;
