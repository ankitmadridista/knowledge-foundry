import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getLessonById,
    deleteLesson,
    updateLessonContent,
} from "@/features/lessons/api";
import type { LessonDto } from "@/features/lessons/types";
import { Section, Container } from "@/shared/components/layout";
import { ErrorState, LoadingState } from "@/shared/components/ui";
import { LessonHeader } from "@/features/lessons/components/LessonHeader";
import { LessonContent } from "@/features/lessons/components/LessonContent";

export function LessonViewerPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [lesson, setLesson] = useState<LessonDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let isMounted = true;
        if (!id) return;

        const fetchLesson = async () => {
            try {
                const data = await getLessonById(id);
                if (!isMounted) return;
                setLesson(data);
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
        };
    }, [id]);

    const handleUpdateContent = async (newContent: string) => {
        if (!lesson) return;

        try {
            await updateLessonContent(lesson.id, { newContent });
            // Optimistically update the UI so we don't have to reload from the server!
            setLesson({
                ...lesson,
                content: newContent,
                isManuallyEdited: true, // Flip the flag locally!
            });
        } catch (err) {
            console.error("Failed to update lesson content:", err);
            alert("Failed to save your edits. Please try again.");
            throw err; // Re-throw so the child component knows the save failed
        }
    };

    const handleDelete = async () => {
        if (!lesson) return;

        // Simple confirmation before permanent deletion
        if (
            !window.confirm(
                "Are you sure you want to delete this lesson? This action cannot be undone.",
            )
        ) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteLesson(lesson.id);
            navigate("/lessons"); // Go back to library on success
        } catch (err) {
            console.error("Failed to delete lesson:", err);
            alert("Failed to delete the lesson. Please try again.");
            setIsDeleting(false);
        }
    };

    if (isLoading || isDeleting)
        return (
            <LoadingState
                message={
                    isDeleting
                        ? "Deleting lesson..."
                        : "Loading lesson details..."
                }
            />
        );

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

                    <LessonHeader lesson={lesson} onDelete={handleDelete} />

                    <LessonContent
                        lesson={lesson}
                        onRetry={() => navigate("/lessons/new")}
                        onUpdateContent={handleUpdateContent}
                    />
                </div>
            </Container>
        </Section>
    );
}
