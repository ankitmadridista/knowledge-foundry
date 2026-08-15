import { Card, Text } from "@/shared/components/ui";

interface ErrorStateProps {
    message: string;
}

export function ErrorState({ message }: ErrorStateProps) {
    return (
        <Card className="p-6 border-red-500/20 bg-red-500/10">
            <Text className="text-red-400 text-center">{message}</Text>
        </Card>
    );
}
