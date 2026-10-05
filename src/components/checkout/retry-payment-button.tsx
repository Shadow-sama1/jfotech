"use client";

import { useState } from "react";

export function RetryPaymentButton({ orderId }: { orderId: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function retry() {
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/payments/retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId }) });
      const result = await response.json() as { authorizationUrl?: string; error?: string };
      if (!response.ok || !result.authorizationUrl) { setError(result.error ?? "Payment could not be started."); return; }
      window.location.assign(result.authorizationUrl);
    } catch {
      setError("Could not reach payment service. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return <div><button type="button" onClick={retry} disabled={pending} className="inline-flex h-11 items-center bg-primary px-5 text-sm font-bold text-white hover:bg-primary-hover disabled:opacity-60">{pending ? "Preparing payment…" : "Retry payment"}</button>{error && <p role="alert" className="mt-2 text-xs text-primary">{error}</p>}</div>;
}
