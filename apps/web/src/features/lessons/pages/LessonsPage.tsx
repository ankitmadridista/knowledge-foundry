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
    SearchFilterBar,
} from "@/shared/components/ui";
import { LessonCard } from "@/features/lessons/components";
import { useAppConfig } from "@/app/providers/AppConfigProvider";
import toast from "react-hot-toast";

const STATUSES = [
    { id: 0, name: "Drafting" },
    { id: 1, name: "Critiquing" },
    { id: 2, name: "Refining" },
    { id: 3, name: "Completed" },
    { id: 4, name: "Failed" },
];

export function LessonsPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { config } = useAppConfig();

    // --- 1. URL IS THE SOURCE OF TRUTH ---
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("limit") || "6", 10);
    const searchParam = searchParams.get("search") || "";
    const statusParam = searchParams.get("status");

    // Local state for search input to prevent lag while typing
    const [searchInput, setSearchInput] = useState(searchParam);
    const [pagedData, setPagedData] =
        useState<PagedResponse<LessonSummaryDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- 2. DEBOUNCED SEARCH ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchParams(
                (prev) => {
                    if (searchInput) prev.set("search", searchInput);
                    else prev.delete("search");

                    if (searchInput !== searchParam) {
                        prev.set("page", "1");
                    }
                    return prev;
                },
                { replace: true },
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput, setSearchParams, searchParam]);

    // --- 3. FETCH DATA ---
    useEffect(() => {
        const fetchLessons = async () => {
            setIsLoading(true);
            try {
                const parsedStatus = statusParam
                    ? parseInt(statusParam, 10)
                    : undefined;

                const data = await getLessons(
                    currentPage,
                    pageSize,
                    searchParam,
                    parsedStatus,
                );

                setPagedData(data);

                // If page doesn't exist, reset state to page 1 via URL
                if (data.items.length === 0 && currentPage > 1) {
                    setSearchParams(
                        (prev) => {
                            prev.set("page", "1");
                            return prev;
                        },
                        { replace: true },
                    );
                }
            } catch (err) {
                console.error("Failed to fetch lessons:", err);
                setError("Failed to load lessons. Is the backend running?");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLessons();
    }, [currentPage, pageSize, searchParam, statusParam, setSearchParams]);

    // --- 4. HANDLERS ---
    const handlePageChange = (newPage: number) => {
        setSearchParams((prev) => {
            prev.set("page", newPage.toString());
            return prev;
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePageSizeChange = (newSize: number) => {
        setSearchParams((prev) => {
            prev.set("page", "1");
            prev.set("limit", newSize.toString());
            return prev;
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleStatusChange = (value: string) => {
        setSearchParams((prev) => {
            if (value) prev.set("status", value);
            else prev.delete("status");
            prev.set("page", "1");
            return prev;
        });
    };

    const clearFilters = () => {
        setSearchInput("");
        setSearchParams((prev) => {
            prev.delete("search");
            prev.delete("status");
            prev.set("page", "1");
            return prev;
        });
    };

    const handleGenerateNewClick = () => {
        if (config && pagedData && pagedData.totalCount >= config.maxLessons) {
            toast.error(
                `Limit reached! You can only generate up to ${config.maxLessons} lessons.`,
                { duration: 4000 },
            );
            return;
        }
        navigate("/lessons/new");
    };

    const isFiltering = !!searchParam || !!statusParam;

    // --- SMART RENDER LOGIC ---
    const showSearchAndFilter =
        pagedData !== null && (pagedData.totalCount > 0 || isFiltering);

    return (
        <Section>
            <Container>
                {/* 1. Header */}
                <PageHeader
                    title="Lesson Library"
                    description="View and manage your AI-generated educational content."
                    action={
                        <Button onClick={handleGenerateNewClick}>
                            + Generate Lesson
                        </Button>
                    }
                />

                {/* 2. Modern Search & Filter Bar */}
                {showSearchAndFilter && (
                    <SearchFilterBar
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder="Search by title, topic, or audience..."
                        filterValue={statusParam || ""}
                        onFilterChange={handleStatusChange}
                        filterOptions={STATUSES}
                        filterPlaceholder="All Statuses"
                    />
                )}

                {/* 3. States & Data */}
                {isLoading && <LoadingState message="Loading lessons..." />}

                {error && <ErrorState message={error} />}

                {!isLoading &&
                    !error &&
                    pagedData?.totalCount === 0 &&
                    (isFiltering ? (
                        <EmptyState
                            message="No lessons match your search criteria."
                            action={
                                <Button
                                    variant="secondary"
                                    onClick={clearFilters}
                                >
                                    Clear Filters
                                </Button>
                            }
                        />
                    ) : (
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
                    ))}

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
