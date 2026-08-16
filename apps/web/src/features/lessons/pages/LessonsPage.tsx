import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getLessons } from "@/features/lessons/api";
import type { LessonSummaryDto } from "@/features/lessons/types";

import { Section, Container, PageHeader } from "@/shared/components/layout";
import {
    Button,
    LoadingState,
    ErrorState,
    EmptyState,
} from "@/shared/components/ui";
import { LessonCard } from "@/features/lessons/components/LessonCard";

export function LessonsPage() {
    const [lessons, setLessons] = useState<LessonSummaryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const data = await getLessons();
                setLessons(data);
            } catch (err) {
                console.error("Failed to fetch lessons:", err);
                setError("Failed to load lessons. Is the backend running?");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessons();
    }, []);

    return (
        <Section>
            <Container>
                {/* 1. Header */}
                <PageHeader
                    title="Lesson Library"
                    description="View and manage your AI-generated educational content."
                    action={
                        <Button onClick={() => navigate("/lessons/new")}>
                            + Generate Lesson
                        </Button>
                    }
                />

                {/* 2. Various States */}
                {isLoading && <LoadingState message="Loading lessons..." />}

                {error && <ErrorState message={error} />}

                {!isLoading && !error && lessons.length === 0 && (
                    <EmptyState
                        message="No lessons generated yet."
                        action={
                            <Button
                                variant="secondary"
                                onClick={() => navigate("/lessons/new")}
                            >
                                Generate your first lesson
                            </Button>
                        }
                    />
                )}

                {/* 3. The Data Grid */}
                {!isLoading && !error && lessons.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {lessons.map((lesson) => (
                            <LessonCard
                                key={lesson.id}
                                lesson={lesson}
                                onClick={() =>
                                    navigate(`/lessons/${lesson.id}`)
                                }
                            />
                        ))}
                    </div>
                )}
            </Container>
        </Section>
    );
}
