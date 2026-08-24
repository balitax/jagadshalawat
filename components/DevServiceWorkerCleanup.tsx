"use client";

import { useEffect } from "react";

export function DevServiceWorkerCleanup() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (sessionStorage.getItem("dev-sw-cleanup")) return;
    sessionStorage.setItem("dev-sw-cleanup", "1");

    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => {
        if (regs.length === 0) return;
        Promise.all(regs.map((r) => r.unregister())).finally(() => {
          location.reload();
        });
      })
      .catch(() => {});
  }, []);

  return null;
}
