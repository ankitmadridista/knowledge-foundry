import type { HTMLAttributes } from "react";

// By extending HTMLAttributes<HTMLDivElement>, this component automatically
// supports className, onClick, and all other standard div props!
export function Card({
    className = "",
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            // FIXED: Removed "overflow-hidden" so absolutely positioned dropdowns can escape the card box
            className={`rounded-2xl border border-zinc-800 bg-zinc-900 shadow-sm ${className}`}
            {...props}
        />
    );
}
