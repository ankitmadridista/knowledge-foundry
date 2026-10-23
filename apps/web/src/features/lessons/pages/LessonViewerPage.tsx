import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getLessonById,
    deleteLesson,
    updateLessonContent,
} from "@/features/lessons/api";
import { getQuizzes } from "@/features/quizzes/api"; // NEW IMPORT
import type { LessonDto } from "@/features/lessons/types";
import type { QuizSummaryDto } from "@/features/quizzes/types"; // NEW IMPORT
import { Section, Container } from "@/shared/components/layout";
import {
    ErrorState,
    LoadingState,
    Modal,
    Button,
    Card,
    Badge, // ADDED BADGE
} from "@/shared/components/ui";
import { LessonHeader } from "@/features/lessons/components/LessonHeader";
import { LessonContent } from "@/features/lessons/components/LessonContent";
import { LessonEvaluationModal } from "@/features/lessons/components/LessonEvaluationModal";
import { GenerateQuizModal } from "@/features/quizzes/components/GenerateQuizModal";
import toast from "react-hot-toast";

export function LessonViewerPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState<LessonDto | null>(null);
    const [quizzes, setQuizzes] = useState<QuizSummaryDto[]>([]); // NEW STATE
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEvalModalOpen, setIsEvalModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);

    // 1. Fetch Lesson Data
    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        if (!id) return;

        const fetchLesson = async () => {
            try {
                const data = await getLessonById(id);
                if (!isMounted) return;

                setLesson(data);

                const isProcessing = [
                    "Drafting",
                    "Critiquing",
                    "Refining",
                    "Generating",
                ].includes(data.status);

                if (isProcessing) {
                    timeoutId = setTimeout(fetchLesson, 2000);
                }
            } catch (err) {
                if (isMounted)
                    setError(
                        `Failed to load the lesson. It may not exist. ${err}`,
                    );
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchLesson();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [id, refreshKey]);

    // 2. Fetch Local Quizzes for this Lesson
    useEffect(() => {
        let isMounted = true;
        if (!id) return;

        const fetchLocalQuizzes = async () => {
            try {
                // Fetch page 1, size 50, no search, no status filter, just lessonId
                const response = await getQuizzes(
                    1,
                    50,
                    undefined,
                    undefined,
                    id,
                );
                if (isMounted) setQuizzes(response.items);
            } catch (err) {
                console.error("Failed to load local quizzes:", err);
            }
        };

        fetchLocalQuizzes();
        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleUpdateContent = async (newContent: string) => {
        if (!lesson) return;
        try {
            await updateLessonContent(lesson.id, { newContent });
            setLesson({
                ...lesson,
                content: newContent,
                isManuallyEdited: true,
            });
            toast.success("Lesson updated successfully!");
        } catch (err) {
            console.error("Failed to update lesson content:", err);
            toast.error("Failed to save your edits. Please try again.");
            throw err;
        }
    };

    const handleDeleteClick = () => setIsDeleteModalOpen(true);

    const confirmDelete = async () => {
        if (!lesson) return;
        setIsDeleting(true);
        try {
            await deleteLesson(lesson.id);
            toast.success("Lesson deleted successfully!");
            navigate("/lessons");
        } catch (err) {
            console.error("Failed to delete lesson:", err);
            toast.error("Failed to delete the lesson. Please try again.");
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (isLoading) return <LoadingState message="Loading lesson details..." />;
    if (error || !lesson)
        return (
            <Section>
                <Container>
                    <ErrorState message={error || "Lesson not found"} />
                </Container>
            </Section>
        );

    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-5xl">
                    {/* Top Action Bar */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => navigate("/lessons")}
                            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            &larr; Back to Library
                        </button>

                        <div className="flex items-center gap-3">
                            {lesson.status === "Completed" && (
                                <>
                                    <Button
                                        variant="primary"
                                        onClick={() => setIsQuizModalOpen(true)}
                                        className="flex items-center gap-2 py-1.5!"
                                    >
                                        <svg
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                            />
                                        </svg>
                                        Generate Quiz
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        onClick={() => setIsEvalModalOpen(true)}
                                        className="flex items-center gap-2 py-1.5!"
                                    >
                                        <svg
                                            className="w-4 h-4 text-emerald-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                                            />
                                        </svg>
                                        Run Evaluation
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <LessonHeader
                        lesson={lesson}
                        onDelete={handleDeleteClick}
                    />

                    <LessonContent
                        lesson={lesson}
                        onRetry={() =>
                            navigate(`/lessons/new?remixId=${lesson.id}`)
                        }
                        onUpdateContent={handleUpdateContent}
                    />

                    {/* Local Bridge (Associated Quizzes) */}
                    {quizzes.length > 0 && (
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h3 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-fuchsia-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                Associated Assessments
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {quizzes.map((q) => (
                                    <Card
                                        key={q.id}
                                        className="p-5 bg-zinc-900/80 border-zinc-800 cursor-pointer hover:border-fuchsia-500/30 transition-colors group flex flex-col h-full"
                                        // CRITICAL: We pass state to tell the Quiz Viewer where we came from!
                                        onClick={() =>
                                            navigate(`/quizzes/${q.id}`, {
                                                state: { fromLesson: true },
                                            })
                                        }
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <Badge
                                                variant={
                                                    q.status === "Published"
                                                        ? "success"
                                                        : q.status === "Failed"
                                                          ? "danger"
                                                          : "neutral"
                                                }
                                            >
                                                {q.status}
                                            </Badge>
                                            <span className="text-xs text-zinc-500">
                                                {q.questionCount} Questions
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-zinc-100 group-hover:text-fuchsia-400 transition-colors mb-4">
                                            {q.title}
                                        </h4>
                                        <div className="mt-auto pt-4 border-t border-zinc-800/50 text-xs text-zinc-500 flex justify-between">
                                            <span>Generated Quiz</span>
                                            <span>
                                                {new Date(
                                                    q.createdAt,
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Existing Evaluations Section */}
                    {lesson.evaluations && lesson.evaluations.length > 0 && (
                        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <h3 className="text-xl font-bold text-zinc-100 mb-4 flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 text-emerald-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                                Evaluation Scorecards
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* ... (Your existing evaluation logic stays exactly the same) ... */}
                                {lesson.evaluations.map((evaluation) => {
                                    let parsedScorecard: Record<
                                        string,
                                        string | number
                                    >;
                                    try {
                                        parsedScorecard = JSON.parse(
                                            evaluation.scorecardJson,
                                        ) as Record<string, string | number>;
                                    } catch (err) {
                                        parsedScorecard = {
                                            Error: `Failed to parse JSON scorecard: ${err}`,
                                        };
                                    }
                                    return (
                                        <Card
                                            key={evaluation.id}
                                            className="p-5 bg-zinc-900/80 border-zinc-800"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <div className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded inline-block mb-2">
                                                        {evaluation.model}
                                                    </div>
                                                    <div className="text-xs text-zinc-500">
                                                        {new Date(
                                                            evaluation.evaluatedAt,
                                                        ).toLocaleString()}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                {Object.entries(
                                                    parsedScorecard,
                                                ).map(([key, value]) => (
                                                    <div
                                                        key={key}
                                                        className="flex flex-col"
                                                    >
                                                        <span className="text-sm font-medium text-zinc-300 capitalize mb-1">
                                                            {key
                                                                .replace(
                                                                    /([A-Z])/g,
                                                                    " $1",
                                                                )
                                                                .trim()}
                                                        </span>
                                                        {typeof value ===
                                                        "number" ? (
                                                            <div className="flex items-center gap-3">
                                                                <div className="h-2 flex-1 bg-zinc-800 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full transition-all duration-1000 ${value >= 8 ? "bg-emerald-500" : value >= 5 ? "bg-amber-500" : "bg-rose-500"}`}
                                                                        style={{
                                                                            width: `${Math.min(Math.max(value * 10, 0), 100)}%`,
                                                                        }}
                                                                    />
                                                                </div>
                                                                <span className="text-sm font-bold text-zinc-100 w-8 text-right">
                                                                    {value}/10
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-zinc-400 bg-zinc-950/50 p-3 rounded-md border border-zinc-800/50">
                                                                {String(value)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </Container>

            {/* Modals */}
            <GenerateQuizModal
                isOpen={isQuizModalOpen}
                onClose={() => setIsQuizModalOpen(false)}
                lessonId={lesson.id}
            />

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                title="Delete Lesson"
                description={`Are you sure you want to delete "${lesson?.title}"? This action cannot be undone and you will lose all generated content.`}
                primaryActionLabel="Delete Lesson"
                onPrimaryAction={confirmDelete}
                isPrimaryActionDestructive={true}
                isPrimaryActionLoading={isDeleting}
            />

            <LessonEvaluationModal
                isOpen={isEvalModalOpen}
                onClose={() => setIsEvalModalOpen(false)}
                lessonId={lesson.id}
                onEvaluationComplete={() => setRefreshKey((prev) => prev + 1)}
            />
        </Section>
    );
}
