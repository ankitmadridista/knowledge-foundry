import { Card, Text, Badge } from "@/shared/components/ui";
import type { LessonDto } from "@/features/lessons/types";

interface LessonHeaderProps {
    lesson: LessonDto;
}

export function LessonHeader({ lesson }: LessonHeaderProps) {
    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "Completed":
                return <Badge variant="success">Completed</Badge>;
            case "Generating":
                return <Badge variant="brand">Generating...</Badge>;
            case "Failed":
                return <Badge variant="danger">Failed</Badge>; // Fallback to neutral if you don't have 'danger'
            default:
                return <Badge variant="neutral">{status}</Badge>;
        }
    };

    return (
        <Card className="p-6 md:p-8 mb-8 border-indigo-500/20">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100 mb-2">
                        {lesson.title}
                    </h1>
                    <div className="flex items-center gap-3">
                        {renderStatusBadge(lesson.status)}
                        <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700">
                            {lesson.id.split("-")[0]}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-800">
                <div>
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                        Topic
                    </h3>
                    <Text className="text-zinc-300 text-sm">
                        {lesson.topic}
                    </Text>
                </div>
                <div>
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                        Target Audience
                    </h3>
                    <Text className="text-zinc-300 text-sm">
                        {lesson.audience}
                    </Text>
                </div>
            </div>
        </Card>
    );
}
