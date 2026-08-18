"use client";

import { useState } from "react";

export function CopyInvite({
  code,
  bootstrap,
  label,
  copiedLabel,
}: {
  code: string;
  bootstrap?: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    const origin = window.location.origin;
    const params = new URLSearchParams({ code });
    if (bootstrap) params.set("bootstrap", bootstrap);
    const link = `${origin}/join?${params.toString()}`;
    await navigator.clipboard.writeText(`${code}\n${link}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-line bg-white text-sm font-semibold text-ink"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
