import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getLessons } from "@/features/lessons/api";
import type { PagedResponse } from "@/shared/types/pagination";
import type { LessonSummaryDto } from "@/features/lessons/types";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import {
    Button,
    LoadingState,
    ErrorState,
    EmptyState,
    Pagination,
} from "@/shared/components/ui";
import { LessonCard } from "@/features/lessons/components";

export function LessonsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const currentPageSize = parseInt(searchParams.get("limit") || "12", 10);
    const [pagedData, setPagedData] =
        useState<PagedResponse<LessonSummaryDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLessons = async () => {
            setIsLoading(true); 
            try {
                // --- UPDATED: Pass both dynamic values to the API ---
                const data = await getLessons(currentPage, currentPageSize);
                setPagedData(data);

                // If the URL asks for a page that doesn't exist, safely reset to page 1
                if (data.items.length === 0 && currentPage > 1) {
                    setSearchParams({ page: "1", limit: currentPageSize.toString() });
                }
            } catch (err) {
                console.error("Failed to fetch lessons:", err);
                setError("Failed to load lessons. Is the backend running?");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessons();
    }, [currentPage, currentPageSize, setSearchParams]);

    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: newPage.toString() });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePageSizeChange = (newSize: number) => {
        // When changing page size, ALWAYS reset to Page 1 to avoid showing empty pages
        setSearchParams({
            page: "1",
            limit: newSize.toString(),
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

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

                {!isLoading && !error && pagedData?.totalCount === 0 && (
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
                {!isLoading &&
                    !error &&
                    pagedData &&
                    pagedData.items.length > 0 && (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {pagedData.items.map((lesson) => (
                                    <LessonCard
                                        key={lesson.id}
                                        lesson={lesson}
                                        onClick={() =>
                                            navigate(`/lessons/${lesson.id}`)
                                        }
                                    />
                                ))}
                            </div>
                            <Pagination
                                currentPage={pagedData.pageNumber}
                                totalPages={pagedData.totalPages}
                                pageSize={pagedData.pageSize} 
                                hasNextPage={pagedData.hasNextPage}
                                hasPreviousPage={pagedData.hasPreviousPage}
                                onPageChange={handlePageChange}
                                onPageSizeChange={handlePageSizeChange}
                            />
                        </>
                    )}
            </Container>
        </Section>
    );
}
