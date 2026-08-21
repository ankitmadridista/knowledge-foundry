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
    SearchFilterBar,
} from "@/shared/components/ui";
import { PromptTemplateCard } from "@/features/prompt-templates/components";
import type { PagedResponse } from "@/shared/types/pagination";
import { useAppConfig } from "@/app/providers/AppConfigProvider";
import toast from "react-hot-toast";

const PROVIDERS = [
    { id: 0, name: "Groq" },
    { id: 1, name: "OpenRouter" },
    { id: 2, name: "Gemini" },
];

export function TemplatesPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { config } = useAppConfig();

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

    const handleProviderChange = (value: string) => {
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

    const handleCreateNewClick = () => {
        if (
            config &&
            pagedData &&
            pagedData.totalCount >= config.maxPromptTemplates
        ) {
            toast.error(
                `Limit reached! You can only create up to ${config.maxPromptTemplates} prompt templates.`,
                { duration: 4000 },
            );
            return;
        }
        navigate("/templates/new");
    };

    const isFiltering = !!searchParam || !!providerParam;

    // --- SMART RENDER LOGIC ---
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
                        <Button onClick={handleCreateNewClick}>
                            + New Template
                        </Button>
                    }
                />

                {/* 2. Modern Search & Filter Bar */}
                {showSearchAndFilter && (
                    <SearchFilterBar
                        searchValue={searchInput}
                        onSearchChange={setSearchInput}
                        searchPlaceholder="Search by title, description, or tags..."
                        filterValue={providerParam || ""}
                        onFilterChange={handleProviderChange}
                        filterOptions={PROVIDERS}
                        filterPlaceholder="All Providers"
                    />
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
                                    onClick={handleCreateNewClick}
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
