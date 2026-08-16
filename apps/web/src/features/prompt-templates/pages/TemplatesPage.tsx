import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPromptTemplates } from "@/features/prompt-templates/api";
import type { PromptTemplateSummaryDto } from "@/features/prompt-templates/type";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import {
    Button,
    LoadingState,
    ErrorState,
    EmptyState,
} from "@/shared/components/ui";
import { PromptTemplateCard } from "@/features/prompt-templates/components";

export function TemplatesPage() {
    const [templates, setTemplates] = useState<PromptTemplateSummaryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await getPromptTemplates();
                setTemplates(data);
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
    }, []);

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

                {!isLoading && !error && templates.length === 0 && (
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
                {!isLoading && !error && templates.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map((template) => (
                            <PromptTemplateCard
                                key={template.id}
                                template={template}
                                onClick={() =>
                                    navigate(`/templates/${template.id}`)
                                }
                            />
                        ))}
                    </div>
                )}
            </Container>
        </Section>
    );
}
