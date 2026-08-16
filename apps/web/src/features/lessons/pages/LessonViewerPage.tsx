import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLessonById } from "@/features/lessons/api";
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
                    {/* Back Button */}
                    <button
                        onClick={() => navigate("/lessons")}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                    >
                        &larr; Back to Library
                    </button>

                    <LessonHeader lesson={lesson} />

                    <LessonContent
                        lesson={lesson}
                        onRetry={() => navigate("/lessons/new")}
                    />
                </div>
            </Container>
        </Section>
    );
}
