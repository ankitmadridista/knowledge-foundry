import { Card, Text, Badge, Button } from "@/shared/components/ui";
import type { LessonDto } from "@/features/lessons/types";
import { useNavigate } from "react-router-dom";

interface LessonHeaderProps {
    lesson: LessonDto;
    onDelete: () => void;
}

export function LessonHeader({ lesson, onDelete }: LessonHeaderProps) {
    const navigate = useNavigate();

    const renderStatusBadge = (status: string) => {
        switch (status) {
            case "Completed":
                return <Badge variant="success">Completed</Badge>;
            case "Generating":
                return <Badge variant="brand">Generating...</Badge>;
            case "Failed":
                return <Badge variant="danger">Failed</Badge>;
            default:
                return <Badge variant="neutral">{status}</Badge>;
        }
    };

    return (
        <Card className="p-6 md:p-8 mb-8 border-indigo-500/20">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
                {/* Left Side: Title & Badges */}
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100 mb-3">
                        {lesson.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3">
                        {renderStatusBadge(lesson.status)}
                        
                        {lesson.isManuallyEdited && (
                            <Badge variant="warning">Manually Edited</Badge>
                        )}
                        
                        <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700">
                            {lesson.id.split("-")[0]}
                        </span>
                    </div>
                </div>

                {/* Right Side: Actions (Only show if generation is complete/failed) */}
                {lesson.status !== "Generating" && (
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <Button 
                            variant="secondary" 
                            className="flex-1 sm:flex-none border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
                            onClick={onDelete}
                        >
                            Delete
                        </Button>
                        <Button 
                            variant="primary" 
                            className="flex-1 sm:flex-none bg-indigo-500 hover:bg-indigo-600"
                            // Pass the ID as a query param so the form can pre-fill
                            onClick={() => navigate(`/lessons/new?remixId=${lesson.id}`)}
                        >
                            Remix Lesson
                        </Button>
                    </div>
                )}
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