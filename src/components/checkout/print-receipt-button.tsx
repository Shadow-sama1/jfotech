"use client";

import { Printer } from "lucide-react";

export function PrintReceiptButton() {
  return <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 border border-border px-4 text-sm font-semibold hover:bg-surface print:hidden"><Printer size={16}/>Print receipt</button>;
}
