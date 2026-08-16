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
    const currentPage = parseInt(searchParams.get("page") || "1", 10);
    const currentPageSize = parseInt(searchParams.get("limit") || "12", 10);
    const [pagedData, setPagedData] =
        useState<PagedResponse<PromptTemplateSummaryDto> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            setIsLoading(true);
            try {
                const data = await getPromptTemplates(
                    currentPage,
                    currentPageSize,
                );
                setPagedData(data);

                if (data.items.length === 0 && currentPage > 1) {
                    setSearchParams({
                        page: "1",
                        limit: currentPageSize.toString(),
                    });
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
