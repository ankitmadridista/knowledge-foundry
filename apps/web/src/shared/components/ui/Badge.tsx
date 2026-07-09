import type { PropsWithChildren } from "react";

export function Badge({
  children
}: PropsWithChildren) {
  return (
    <span className="rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
      {children}
    </span>
  );
}