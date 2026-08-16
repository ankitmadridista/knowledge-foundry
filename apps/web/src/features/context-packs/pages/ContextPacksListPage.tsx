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
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const currentPageSize = parseInt(searchParams.get("limit") || "12", 10);
    const [pagedData, setPagedData] =
        useState<PagedResponse<ContextPackSummaryDto> | null>(null);

    useEffect(() => {
        const fetchPacks = async () => {
            setIsLoading(true); 
            try {
                const data = await getContextPacks(currentPage, currentPageSize);
                setPagedData(data);

                // If the URL asks for a page that doesn't exist, safely reset to page 1
                if (data.items.length === 0 && currentPage > 1) {
                    setSearchParams({ page: "1", limit: currentPageSize.toString() });
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
    }, [currentPage, currentPageSize, setSearchParams]);

    const handlePageChange = (newPage: number) => {
        setSearchParams({ page: newPage.toString() });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handlePageSizeChange = (newSize: number) => {
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
