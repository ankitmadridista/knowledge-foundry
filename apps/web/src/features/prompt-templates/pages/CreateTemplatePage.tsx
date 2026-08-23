import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    createPromptTemplate,
    addPromptVersion,
    getAvailableModels,
} from "@/features/prompt-templates/api";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import { ErrorState } from "@/shared/components/ui";
import { CreatePromptTemplateForm } from "@/features/prompt-templates/components";
import type {
    CreatePromptTemplateRequest,
    AiModelDto,
    CreatePromptTemplateFormData,
} from "@/features/prompt-templates/type";
import { isAxiosError } from "axios";

export function CreateTemplatePage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingModels, setIsLoadingModels] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [aiModels, setAiModels] = useState<AiModelDto[]>([]);

    // --- NEW: Fetch live models on load ---
    useEffect(() => {
        let isMounted = true;
        const fetchModels = async () => {
            try {
                const models = await getAvailableModels();
                if (isMounted) setAiModels(models);
            } catch (err) {
                console.error("Failed to fetch AI models:", err);
                if (isMounted)
                    setError(
                        "Failed to load AI models. Please check your connection.",
                    );
            } finally {
                if (isMounted) setIsLoadingModels(false);
            }
        };

        fetchModels();
        return () => {
            isMounted = false;
        };
    }, []);

    const handleSubmit = async (formData: CreatePromptTemplateFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const tagsArray = formData.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

            const request: CreatePromptTemplateRequest = {
                identifier: formData.identifier,
                name: formData.name,
                description: formData.description,
                purpose: 0,
                provider: formData.provider,
                model: formData.model,
                tags: tagsArray,
            };

            const templateId = await createPromptTemplate(request);

            await addPromptVersion(templateId, {
                messages: [
                    { role: 0, content: formData.systemContext, order: 0 },
                    { role: 1, content: formData.userMessage, order: 1 },
                ],
                capability: 0,
            });

            navigate("/templates");
        } catch (err) {
            console.error(err);

            if (isAxiosError(err) && err.response?.status === 409) {
                setError(
                    "That identifier is already in use. Please choose a unique identifier.",
                );
            } else if (isAxiosError(err) && err.response?.data) {
                const data = err.response.data as {
                    message?: string;
                    detail?: string;
                };
                setError(
                    data.message ||
                        data.detail ||
                        "Failed to create and activate template.",
                );
            } else {
                setError(
                    "Failed to create and activate template. Check console for details.",
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-4xl">
                    <button
                        onClick={() => navigate("/templates")}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                    >
                        &larr; Back to Templates
                    </button>

                    <PageHeader
                        title="Create New Template"
                        description="Define the metadata and initial version of your prompt."
                    />

                    {error && (
                        <div className="mb-6">
                            <ErrorState message={error} />
                        </div>
                    )}

                    {/* --- NEW: Show loading spinner while fetching models --- */}
                    {isLoadingModels ? (
                        <div className="text-center py-12 text-zinc-400 animate-pulse">
                            Discovering available AI models...
                        </div>
                    ) : (
                        <CreatePromptTemplateForm
                            availableModels={aiModels}
                            onSubmit={handleSubmit}
                            onCancel={() => navigate("/templates")}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            </Container>
        </Section>
    );
}
