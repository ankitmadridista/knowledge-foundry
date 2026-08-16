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

    // --- STATE AS SOURCE OF TRUTH (Initialized from URL) ---
    const [currentPage, setCurrentPage] = useState(() =>
        parseInt(searchParams.get("page") || "1", 10),
    );
    const [pageSize, setPageSize] = useState(() =>
        parseInt(searchParams.get("limit") || "6", 10),
    );

    const [pagedData, setPagedData] =
        useState<PagedResponse<LessonSummaryDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 1. Sync internal state back to the URL seamlessly
    useEffect(() => {
        setSearchParams(
            (prev) => {
                prev.set("page", currentPage.toString());
                prev.set("limit", pageSize.toString());
                return prev;
            },
            { replace: true },
        );
    }, [currentPage, pageSize, setSearchParams]);

    // 2. Fetch data based on internal state
    useEffect(() => {
        const fetchLessons = async () => {
            setIsLoading(true);
            try {
                const data = await getLessons(currentPage, pageSize);
                setPagedData(data);

                // If page doesn't exist, reset state to page 1
                if (data.items.length === 0 && currentPage > 1) {
                    setCurrentPage(1);
                }
            } catch (err) {
                console.error("Failed to fetch lessons:", err);
                setError("Failed to load lessons. Is the backend running?");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessons();
    }, [currentPage, pageSize]);

    // 3. Handlers update state
    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePageSizeChange = (newSize: number) => {
        setCurrentPage(1);
        setPageSize(newSize);
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
                                totalCount={pagedData.totalCount}
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
