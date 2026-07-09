import type { PropsWithChildren } from "react";

interface FeatureCardProps extends PropsWithChildren {
  title: string;
}

export function FeatureCard({
  title,
  children,
}: FeatureCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-indigo-500/40">
      <h3 className="mb-3 text-lg font-semibold text-zinc-100">
        {title}
      </h3>

      <p className="text-sm leading-7 text-zinc-400">
        {children}
      </p>
    </div>
  );
}