import type { ReactNode } from "react";
import { Card, Text } from "@/shared/components/ui";

interface EmptyStateProps {
    title?: string;
    message: string;
    action?: ReactNode;
    icon?: ReactNode;
}

export function EmptyState({
    title = "Nothing here yet",
    message,
    action,
    icon,
}: EmptyStateProps) {
    return (
        <Card className="flex flex-col items-center justify-center text-center p-12 sm:p-20 border-dashed border-2 border-zinc-800 bg-zinc-950/50 relative overflow-hidden group">
            {/* Subtle background glow effect */}
            <div className="absolute inset-0 bg-linear-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Icon Container */}
            <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 shadow-sm">
                {icon ? (
                    icon
                ) : (
                    // Default Icon: A sleek empty folder/inbox
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776"
                        />
                    </svg>
                )}
            </div>

            {/* Typography */}
            <h3 className="text-xl font-semibold text-zinc-200 mb-2">
                {title}
            </h3>
            <Text className="text-zinc-500 max-w-sm mx-auto mb-8 leading-relaxed">
                {message}
            </Text>

            {/* Action Area */}
            {action && <div className="relative z-10">{action}</div>}
        </Card>
    );
}
