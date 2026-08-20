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
    SearchFilterBar,
} from "@/shared/components/ui";
import type { PagedResponse } from "@/shared/types/pagination";

export function ContextPacksListPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // --- 1. URL IS THE SOURCE OF TRUTH ---
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("limit") || "6", 10);
    const searchParam = searchParams.get("search") || "";

    // Local state for the search input to prevent lag while typing
    const [searchInput, setSearchInput] = useState(searchParam);
    const [pagedData, setPagedData] =
        useState<PagedResponse<ContextPackSummaryDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- 2. DEBOUNCED SEARCH ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchParams(
                (prev) => {
                    if (searchInput) prev.set("search", searchInput);
                    else prev.delete("search");

                    // If search changes, always reset to page 1
                    if (searchInput !== searchParam) {
                        prev.set("page", "1");
                    }
                    return prev;
                },
                { replace: true }, // Prevents filling up browser history
            );
        }, 300);

        return () => clearTimeout(timer);
    }, [searchInput, setSearchParams, searchParam]);

    // --- 3. FETCH DATA ---
    useEffect(() => {
        const fetchPacks = async () => {
            setIsLoading(true);
            try {
                const data = await getContextPacks(
                    currentPage,
                    pageSize,
                    searchParam,
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
                console.error("Failed to fetch context packs:", err);
                setError(
                    "Failed to load context packs. Is the backend running?",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchPacks();
    }, [currentPage, pageSize, searchParam, setSearchParams]);

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

    const clearFilters = () => {
        setSearchInput("");
        setSearchParams((prev) => {
            prev.delete("search");
            prev.set("page", "1");
            return prev;
        });
    };

    const isFiltering = !!searchParam;

    // --- SMART RENDER LOGIC ---
    // Only show the search bar if there is data in the DB, OR if the user is actively filtering.
    const showSearch =
        pagedData !== null && (pagedData.totalCount > 0 || isFiltering);

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

                {/* 2. Modern Full-Width Search Bar */}
                {showSearch && (
                    <SearchFilterBar
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder="Search by name, description, or tags..."
                    />
                )}

                {/* 3. Various States */}
                {isLoading && (
                    <LoadingState message="Loading context packs..." />
                )}

                {error && <ErrorState message={error} />}

                {/* 4. Empty States */}
                {!isLoading &&
                    !error &&
                    pagedData?.totalCount === 0 &&
                    (isFiltering ? (
                        <EmptyState
                            message="No context packs match your search criteria."
                            action={
                                <Button
                                    variant="secondary"
                                    onClick={clearFilters}
                                >
                                    Clear Search
                                </Button>
                            }
                        />
                    ) : (
                        <EmptyState
                            message="No context packs found."
                            action={
                                <Button
                                    variant="secondary"
                                    onClick={() =>
                                        navigate("/context-packs/new")
                                    }
                                >
                                    Create your first context pack
                                </Button>
                            }
                        />
                    ))}

                {/* 5. The Data Grid */}
                {!isLoading &&
                    !error &&
                    pagedData &&
                    pagedData.items.length > 0 && (
                        <>
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {pagedData.items.map((pack) => (
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
