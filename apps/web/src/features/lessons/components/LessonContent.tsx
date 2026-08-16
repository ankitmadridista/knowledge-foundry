import { Card, Text, MarkdownRenderer } from "@/shared/components/ui";
import type { LessonDto } from "@/features/lessons/types";

interface LessonContentProps {
    lesson: LessonDto;
    onRetry: () => void;
}

export function LessonContent({ lesson, onRetry }: LessonContentProps) {
    return (
        <Card className="p-6 md:p-10 min-h-125">
            {lesson.status === "Generating" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
                    <h2 className="text-xl font-bold text-zinc-100 mb-2">
                        AI is writing your lesson...
                    </h2>
                    <Text className="text-zinc-400 max-w-md">
                        This usually takes 10-30 seconds depending on the
                        complexity of the topic and the length of the context
                        pack.
                    </Text>
                </div>
            )}

            {lesson.status === "Failed" && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="text-rose-500 mb-4">
                        <svg
                            className="w-12 h-12 mx-auto"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-rose-400 mb-2">
                        Generation Failed
                    </h2>
                    <Text className="text-zinc-400 max-w-md mb-6">
                        {lesson.errorMessage ||
                            "The AI encountered an error while generating this lesson."}
                    </Text>
                    <button
                        onClick={onRetry}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 px-4 py-2 rounded-md transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {lesson.status === "Completed" && lesson.content && (
                <div className="prose prose-invert max-w-none">
                    <MarkdownRenderer content={lesson.content} />
                </div>
            )}
        </Card>
    );
}
