import type { PropsWithChildren } from "react";

interface HeadingProps extends PropsWithChildren {
  className?: string;
}

export function Heading({
  children,
  className = "",
}: HeadingProps) {
  return (
    <h1
      className={`text-5xl font-bold tracking-tight text-zinc-50 md:text-6xl ${className}`}
    >
      {children}
    </h1>
  );
}