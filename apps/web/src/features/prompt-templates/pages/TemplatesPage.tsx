import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getPromptTemplates } from "@/features/prompt-templates/api";
import type { PromptTemplateSummaryDto } from "@/features/prompt-templates/type";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import {
    Button,
    LoadingState,
    ErrorState,
    EmptyState,
    Pagination,
    Input,
} from "@/shared/components/ui";
import { PromptTemplateCard } from "@/features/prompt-templates/components";
import type { PagedResponse } from "@/shared/types/pagination";

const PROVIDERS = [
    { id: 0, name: "Groq" },
    { id: 1, name: "OpenRouter" },
    { id: 2, name: "Gemini" },
];

export function TemplatesPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // --- 1. URL IS THE SOURCE OF TRUTH ---
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("limit") || "6", 10);
    const searchParam = searchParams.get("search") || "";
    const providerParam = searchParams.get("provider");

    const [searchInput, setSearchInput] = useState(searchParam);
    const [pagedData, setPagedData] =
        useState<PagedResponse<PromptTemplateSummaryDto> | null>(null);
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
        const fetchTemplates = async () => {
            setIsLoading(true);
            try {
                const parsedProvider = providerParam
                    ? parseInt(providerParam, 10)
                    : undefined;

                const data = await getPromptTemplates(
                    currentPage,
                    pageSize,
                    searchParam,
                    parsedProvider,
                );

                setPagedData(data);

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
                console.error("Failed to fetch templates:", err);
                setError(
                    "Failed to load prompt templates. Is the backend running?",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, [currentPage, pageSize, searchParam, providerParam, setSearchParams]);

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

    const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSearchParams((prev) => {
            if (value) prev.set("provider", value);
            else prev.delete("provider");
            prev.set("page", "1");
            return prev;
        });
    };

    const clearFilters = () => {
        setSearchInput("");
        setSearchParams((prev) => {
            prev.delete("search");
            prev.delete("provider");
            prev.set("page", "1");
            return prev;
        });
    };

    const isFiltering = !!searchParam || !!providerParam;

    // --- SMART RENDER LOGIC ---
    // Only show the search bar if there is data in the DB, OR if the user is actively filtering.
    // We do NOT hide it during `isLoading`, otherwise the input vanishes while typing!
    const showSearchAndFilter =
        pagedData !== null && (pagedData.totalCount > 0 || isFiltering);

    return (
        <Section>
            <Container>
                {/* 1. Header */}
                <PageHeader
                    title="Prompt Library"
                    description="Manage and execute your AI prompt templates."
                    action={
                        <Button onClick={() => navigate("/templates/new")}>
                            + New Template
                        </Button>
                    }
                />

                {/* 2. Modern Search & Filter Bar */}
                {showSearchAndFilter && (
                    <div className="flex flex-col sm:flex-row gap-3 mb-8 items-center">
                        {/* Search Input */}
                        <div className="relative flex-1 w-full group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                            </div>
                            <Input
                                type="text"
                                placeholder="Search by title, description, or tags..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-10 pr-10 w-full bg-zinc-900/50 border-zinc-800 focus:bg-zinc-950 transition-all rounded-lg"
                            />
                            {/* Clear Input Button (Only shows when there is text) */}
                            {searchInput && (
                                <button
                                    onClick={() => setSearchInput("")}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 transition-colors"
                                >
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Dropdown Filter */}
                        <div className="relative w-full sm:w-48 shrink-0">
                            <select
                                value={providerParam || ""}
                                onChange={handleProviderChange}
                                className="appearance-none w-full h-10 px-3 pr-10 rounded-lg border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-zinc-950 transition-all cursor-pointer"
                            >
                                <option value="">All Providers</option>
                                {PROVIDERS.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                            {/* Custom Dropdown Chevron */}
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-500">
                                <svg
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. States & Data */}
                {isLoading && <LoadingState message="Loading templates..." />}

                {error && <ErrorState message={error} />}

                {!isLoading &&
                    !error &&
                    pagedData?.totalCount === 0 &&
                    (isFiltering ? (
                        <EmptyState
                            message="No templates match your search criteria."
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
                            message="No prompt templates found."
                            action={
                                <Button
                                    variant="secondary"
                                    onClick={() => navigate("/templates/new")}
                                >
                                    Create your first template
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
                                {pagedData.items.map((template) => (
                                    <PromptTemplateCard
                                        key={template.id}
                                        template={template}
                                        onClick={() =>
                                            navigate(
                                                `/templates/${template.id}`,
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
