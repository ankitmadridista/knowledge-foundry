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
} from "@/shared/components/ui";
import { PromptTemplateCard } from "@/features/prompt-templates/components";
import type { PagedResponse } from "@/shared/types/pagination";

export function TemplatesPage() {
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
        useState<PagedResponse<PromptTemplateSummaryDto> | null>(null);
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
        const fetchTemplates = async () => {
            setIsLoading(true);
            try {
                const data = await getPromptTemplates(currentPage, pageSize);
                setPagedData(data);

                // If page doesn't exist, reset state to page 1
                if (data.items.length === 0 && currentPage > 1) {
                    setCurrentPage(1);
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
                    title="Prompt Library"
                    description="Manage and execute your AI prompt templates."
                    action={
                        <Button onClick={() => navigate("/templates/new")}>
                            + New Template
                        </Button>
                    }
                />

                {/* 2. Various States */}
                {isLoading && <LoadingState message="Loading templates..." />}

                {error && <ErrorState message={error} />}

                {!isLoading && !error && pagedData?.totalCount === 0 && (
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
                )}

                {/* 3. The Data Grid */}
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
