import type { ReactNode } from "react";
import { Heading, Text } from "@/shared/components/ui";

interface PageHeaderProps {
    title: string;
    description?: string;
    action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
            <div>
                <Heading>{title}</Heading>
                {description && (
                    <Text className="mt-2 text-zinc-400">{description}</Text>
                )}
            </div>
            {action && <div>{action}</div>}
        </div>
    );
}
