import { Text } from "@/shared/components/ui";

interface LoadingStateProps {
    message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
    return (
        <div className="py-20 text-center">
            <Text className="text-zinc-500 animate-pulse">{message}</Text>
        </div>
    );
}
