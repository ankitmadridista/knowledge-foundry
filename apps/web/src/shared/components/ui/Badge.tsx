import type { PropsWithChildren } from "react";

type BadgeVariant = "brand" | "success" | "neutral";

interface BadgeProps extends PropsWithChildren {
    variant?: BadgeVariant;
}

export function Badge({ children, variant = "brand" }: BadgeProps) {
    const variants = {
        brand: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
        success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
        neutral: "border-zinc-500/40 bg-zinc-500/10 text-zinc-300",
    };

    return (
        <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${variants[variant]}`}
        >
            {children}
        </span>
    );
}
