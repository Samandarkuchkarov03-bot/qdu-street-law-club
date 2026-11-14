"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";
import { recoveryRedirectPath } from "@/lib/auth-redirect";

export default function AuthRecoveryRedirect() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const target = recoveryRedirectPath({
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    });
    if (!target || target === `${window.location.pathname}${window.location.search}${window.location.hash}`) return;
    window.location.replace(target);
  }, [pathname]);

  return null;
}
