import type { ReactNode } from "react";
import { Card, Text } from "@/shared/components/ui";

interface EmptyStateProps {
    message: string;
    action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
    return (
        <Card className="py-20 text-center border-dashed border-zinc-700 bg-transparent">
            <Text className="text-zinc-500 mb-6">{message}</Text>
            {action && <div>{action}</div>}
        </Card>
    );
}
