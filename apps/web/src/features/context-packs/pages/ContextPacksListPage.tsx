import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getContextPacks } from "@/features/context-packs/api";
import type { ContextPackSummaryDto } from "@/features/context-packs/types";
import { ContextPackCard } from "@/features/context-packs/components";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import {
    Button,
    EmptyState,
    ErrorState,
    LoadingState,
    Pagination,
} from "@/shared/components/ui";
import type { PagedResponse } from "@/shared/types/pagination";

export function ContextPacksListPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
        useState<PagedResponse<ContextPackSummaryDto> | null>(null);

    // 1. Sync internal state back to the URL seamlessly
    useEffect(() => {
        setSearchParams(
            (prev) => {
                prev.set("page", currentPage.toString());
                prev.set("limit", pageSize.toString());
                return prev;
            },
            { replace: true }, // Prevents filling up browser history
        );
    }, [currentPage, pageSize, setSearchParams]);

    // 2. Fetch data based on internal state
    useEffect(() => {
        const fetchPacks = async () => {
            setIsLoading(true);
            try {
                const data = await getContextPacks(currentPage, pageSize);
                setPagedData(data);

                // If page doesn't exist, reset state to page 1
                if (data.items.length === 0 && currentPage > 1) {
                    setCurrentPage(1);
                }
            } catch (err) {
                console.error("Failed to fetch context packs:", err);
                setError(
                    "Failed to load context packs. Is the backend running?",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchPacks();
    }, [currentPage, pageSize]); // Depend on state, not URL directly

    // 3. Handlers update state (which triggers both useEffects)
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
                    title="Context Packs"
                    description="Manage dynamic knowledge payloads to inject into your prompt templates."
                    action={
                        <Button onClick={() => navigate("/context-packs/new")}>
                            + New Context Pack
                        </Button>
                    }
                />

                {/* 2. Various States */}
                {isLoading && (
                    <LoadingState message="Loading context packs..." />
                )}

                {error && <ErrorState message={error} />}

                {!isLoading && !error && pagedData?.totalCount === 0 && (
                    <EmptyState
                        message="No context packs found."
                        action={
                            <Button
                                variant="secondary"
                                onClick={() => navigate("/context-packs/new")}
                            >
                                Create your first context pack
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
                                {pagedData?.items.map((pack) => (
                                    <ContextPackCard
                                        key={pack.id}
                                        pack={pack}
                                        onClick={() =>
                                            navigate(
                                                `/context-packs/${pack.id}`,
                                            )
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
