"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  value,
  className = "",
}: {
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1.5 text-xs font-medium text-gold-2 transition hover:bg-gold/20 ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5" /> Tersalin
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" /> Salin
        </>
      )}
    </button>
  );
}
