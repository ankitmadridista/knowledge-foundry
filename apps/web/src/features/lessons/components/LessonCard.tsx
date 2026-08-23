import { Card, Text } from "@/shared/components/ui";
import type { LessonSummaryDto } from "@/features/lessons/types"

interface LessonCardProps {
    lesson: LessonSummaryDto;
    onClick: () => void;
}

export function LessonCard({ lesson, onClick }: LessonCardProps) {
    const getStatusStyles = (status: string) => {
        switch (status) {
            case "Completed":
                return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
            case "Generating":
                return "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse";
            case "Failed":
                return "bg-rose-500/10 text-rose-400 border-rose-500/20";
            default:
                return "bg-zinc-800 text-zinc-400 border-zinc-700";
        }
    };

    const formattedDate = new Date(lesson.createdAt).toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
            year: "numeric",
        },
    );

    return (
        <Card
            className="flex flex-col h-full p-6 transition-colors hover:border-indigo-500/30 cursor-pointer"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-4">
                {/* Status Badge */}
                <span
                    className={`text-xs font-semibold border px-2 py-1 rounded-md ${getStatusStyles(lesson.status)}`}
                >
                    {lesson.status}
                </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-100 mb-2">
                {lesson.title}
            </h3>

            <Text className="text-sm text-zinc-400 line-clamp-3 mb-6 flex-1">
                {lesson.topic}
            </Text>

            {/* Footer: Audience & Date */}
            <div className="flex flex-wrap items-center justify-between mt-auto pt-4 border-t border-zinc-800 gap-2">
                <span className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md">
                    {lesson.audience}
                </span>
                <span className="text-xs text-zinc-500">{formattedDate}</span>
            </div>
        </Card>
    );
}
