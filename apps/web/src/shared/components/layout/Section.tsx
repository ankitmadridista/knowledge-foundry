import type { PropsWithChildren } from "react";

interface SectionProps extends PropsWithChildren {
  className?: string;
}

export function Section({
  children,
  className = ""
}: SectionProps) {
  return (
    <section className={`py-24 ${className}`}>
      {children}
    </section>
  );
}