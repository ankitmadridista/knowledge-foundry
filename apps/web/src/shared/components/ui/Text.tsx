import type { PropsWithChildren } from "react";

interface TextProps extends PropsWithChildren {
  className?: string;
}

export function Text({
  children,
  className = "",
}: TextProps) {
  return (
    <p className={`text-lg leading-8 text-zinc-400 ${className}`}>
      {children}
    </p>
  );
}