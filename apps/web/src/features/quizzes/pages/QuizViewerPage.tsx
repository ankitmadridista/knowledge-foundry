import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getQuizById,
    publishQuiz,
    updateQuiz,
    deleteQuiz,
} from "@/features/quizzes/api";
import type { QuizDto, UpdateQuizQuestionDto } from "@/features/quizzes/types";
import { Section, Container } from "@/shared/components/layout";
import {
    ErrorState,
    LoadingState,
    Modal,
    Button,
    Card,
    Badge,
    Label,
    Textarea,
} from "@/shared/components/ui";
import toast from "react-hot-toast";

export function QuizViewerPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<QuizDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Editable state forms
    const [editedTitle, setEditedTitle] = useState("");
    const [editedQuestions, setEditedQuestions] = useState<
        UpdateQuizQuestionDto[]
    >([]);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        if (!id) return;

        const fetchQuiz = async () => {
            try {
                const data = await getQuizById(id);
                if (!isMounted) return;

                setQuiz(data);
                setEditedTitle(data.title);
                setEditedQuestions(
                    data.questions.map((q) => ({
                        text: q.text,
                        type: q.type,
                        explanation: q.explanation,
                        options: q.options.map((o) => ({
                            text: o.text,
                            isCorrect: o.isCorrect,
                        })),
                    })),
                );

                // If still drafting, poll every 2 seconds
                if (data.status === "Draft") {
                    timeoutId = setTimeout(fetchQuiz, 2000);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        `Failed to load the quiz. It may still be generating or does not exist. ${err}`,
                    );
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchQuiz();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [id]);

    const handleSaveEdits = async () => {
        if (!quiz) return;
        setIsSaving(true);
        try {
            await updateQuiz(quiz.id, {
                title: editedTitle,
                questions: editedQuestions,
            });
            toast.success("Quiz updated successfully!");
            setIsEditing(false);
            // Refresh quiz data
            const updated = await getQuizById(quiz.id);
            setQuiz(updated);
        } catch (err) {
            console.error("Failed to update quiz:", err);
            toast.error("Failed to save changes.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePublish = async () => {
        if (!quiz) return;
        setIsPublishing(true);
        try {
            await publishQuiz(quiz.id);
            toast.success("Quiz published successfully!");
            const updated = await getQuizById(quiz.id);
            setQuiz(updated);
        } catch (err) {
            console.error("Failed to publish quiz:", err);
            toast.error("Failed to publish quiz.");
        } finally {
            setIsPublishing(false);
        }
    };

    const handleDelete = async () => {
        if (!quiz) return;
        setIsDeleting(true);
        try {
            await deleteQuiz(quiz.id);
            toast.success("Quiz deleted successfully!");
            navigate(`/lessons/${quiz.lessonId}`);
        } catch (err) {
            console.error("Failed to delete quiz:", err);
            toast.error("Failed to delete quiz.");
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    if (isLoading) return <LoadingState message="Loading assessment..." />;

    if (error || !quiz) {
        return (
            <Section>
                <Container>
                    <ErrorState message={error || "Quiz not found"} />
                </Container>
            </Section>
        );
    }

    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-4xl">
                    {/* Top Bar */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() =>
                                navigate(`/lessons/${quiz.lessonId}`)
                            }
                            className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                            &larr; Back to Lesson
                        </button>

                        <div className="flex items-center gap-3">
                            {quiz.status === "Review" && !isEditing && (
                                <>
                                    <Button
                                        variant="secondary"
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit Quiz
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handlePublish}
                                        disabled={isPublishing}
                                    >
                                        {isPublishing
                                            ? "Publishing..."
                                            : "Publish Quiz"}
                                    </Button>
                                </>
                            )}
                            {quiz.status === "Published" && (
                                <Badge variant="success">
                                    Published & Active
                                </Badge>
                            )}
                            <Button
                                variant="secondary"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10"
                            >
                                Delete
                            </Button>
                        </div>
                    </div>

                    {/* Status: Drafting (Polling) */}
                    {quiz.status === "Draft" && (
                        <Card className="p-12 text-center">
                            <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6" />
                            <h2 className="text-xl font-bold text-zinc-100 mb-2">
                                Generating Assessment...
                            </h2>
                            <p className="text-zinc-400 text-sm">
                                The AI is reading the lesson and drafting
                                structured questions.
                            </p>
                        </Card>
                    )}

                    {/* Status: Failed */}
                    {quiz.status === "Failed" && (
                        <Card className="p-12 text-center border-rose-500/30 bg-rose-950/10">
                            <h2 className="text-xl font-bold text-rose-400 mb-2">
                                Quiz Generation Failed
                            </h2>
                            <p className="text-zinc-400 text-sm mb-6">
                                {quiz.errorMessage ||
                                    "An unexpected error occurred."}
                            </p>
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    navigate(`/lessons/${quiz.lessonId}`)
                                }
                            >
                                Return to Lesson
                            </Button>
                        </Card>
                    )}

                    {/* Status: Review or Published */}
                    {(quiz.status === "Review" ||
                        quiz.status === "Published") && (
                        <Card className="p-6 md:p-8 space-y-6">
                            <div className="border-b border-zinc-800 pb-6">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <Label>Quiz Title *</Label>
                                        <Textarea
                                            rows={2}
                                            value={editedTitle}
                                            onChange={(e) =>
                                                setEditedTitle(e.target.value)
                                            }
                                        />
                                    </div>
                                ) : (
                                    <div>
                                        <h1 className="text-2xl font-bold text-zinc-100 mb-2">
                                            {quiz.title}
                                        </h1>
                                        <p className="text-xs text-zinc-500">
                                            Created on{" "}
                                            {new Date(
                                                quiz.createdAt,
                                            ).toLocaleString()}{" "}
                                            {quiz.isManuallyEdited &&
                                                "• Manually Edited"}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Questions List */}
                            <div className="space-y-6">
                                {quiz.questions.map((q, qIndex) => (
                                    <div
                                        key={q.id || qIndex}
                                        className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50 space-y-3"
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                                                Question {qIndex + 1} • {q.type}
                                            </span>
                                        </div>

                                        <p className="text-zinc-100 font-medium">
                                            {q.text}
                                        </p>

                                        {q.explanation && (
                                            <p className="text-xs text-zinc-400 bg-zinc-950/60 p-2.5 rounded border border-zinc-800/80">
                                                <strong className="text-zinc-300">
                                                    Explanation:
                                                </strong>{" "}
                                                {q.explanation}
                                            </p>
                                        )}

                                        <div className="space-y-2 pt-2">
                                            {q.options.map((opt, oIndex) => (
                                                <div
                                                    key={opt.id || oIndex}
                                                    className={`flex items-center gap-3 p-2.5 rounded text-sm border ${
                                                        opt.isCorrect
                                                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
                                                            : "bg-zinc-950 border-zinc-800/60 text-zinc-300"
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                                                            opt.isCorrect
                                                                ? "bg-emerald-500 text-zinc-950"
                                                                : "bg-zinc-800 text-zinc-400"
                                                        }`}
                                                    >
                                                        {String.fromCharCode(
                                                            65 + oIndex,
                                                        )}
                                                    </span>
                                                    <span className="flex-1">
                                                        {opt.text}
                                                    </span>
                                                    {opt.isCorrect && (
                                                        <span className="text-xs font-semibold text-emerald-400">
                                                            Correct Answer
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {isEditing && (
                                <div className="flex justify-end gap-3 pt-6 border-t border-zinc-800">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setIsEditing(false)}
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSaveEdits}
                                        disabled={isSaving}
                                    >
                                        {isSaving
                                            ? "Saving..."
                                            : "Save Changes"}
                                    </Button>
                                </div>
                            )}
                        </Card>
                    )}
                </div>
            </Container>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                title="Delete Assessment"
                description="Are you sure you want to delete this quiz? This action cannot be undone."
                primaryActionLabel="Delete Quiz"
                onPrimaryAction={handleDelete}
                isPrimaryActionDestructive={true}
                isPrimaryActionLoading={isDeleting}
            />
        </Section>
    );
}
