import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getLessonById,
    deleteLesson,
    updateLessonContent,
} from "@/features/lessons/api";
import type { LessonDto } from "@/features/lessons/types";
import { Section, Container } from "@/shared/components/layout";
import { ErrorState, LoadingState, Modal } from "@/shared/components/ui";
import { LessonHeader } from "@/features/lessons/components/LessonHeader";
import { LessonContent } from "@/features/lessons/components/LessonContent";
import toast from "react-hot-toast";

export function LessonViewerPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState<LessonDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let timeoutId: ReturnType<typeof setTimeout>;

        if (!id) return;

        const fetchLesson = async () => {
            try {
                const data = await getLessonById(id);
                if (!isMounted) return;

                setLesson(data);

                // --- NEW: The Polling Engine ---
                // If the backend is still working, wait 2 seconds and fetch again!
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
                // Only clear the initial loading state once we have the first payload
                if (isMounted) setIsLoading(false);
            }
        };

        fetchLesson();

        // Cleanup: Stop polling immediately if the user navigates away from the page
        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
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

    const handleDeleteClick = () => {
        setIsDeleteModalOpen(true);
    };

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

    if (error || !lesson) {
        return (
            <Section>
                <Container>
                    <ErrorState message={error || "Lesson not found"} />
                </Container>
            </Section>
        );
    }

    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-5xl">
                    <button
                        onClick={() => navigate("/lessons")}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                    >
                        &larr; Back to Library
                    </button>

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
                </div>
            </Container>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => !isDeleting && setIsDeleteModalOpen(false)}
                title="Delete Lesson"
                description={`Are you sure you want to delete "${lesson.title}"? This action cannot be undone and you will lose all generated content.`}
                primaryActionLabel="Delete Lesson"
                onPrimaryAction={confirmDelete}
                isPrimaryActionDestructive={true}
                isPrimaryActionLoading={isDeleting}
            />
        </Section>
    );
}
