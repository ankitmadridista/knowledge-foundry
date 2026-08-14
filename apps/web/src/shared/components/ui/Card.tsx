import type { HTMLAttributes } from "react";

// By extending HTMLAttributes<HTMLDivElement>, this component automatically
// supports className, onClick, and all other standard div props!
export function Card({
    className = "",
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm overflow-hidden ${className}`}
            {...props}
        />
    );
}
