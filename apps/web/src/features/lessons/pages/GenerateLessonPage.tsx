import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import { ErrorState } from "@/shared/components/ui";
import { generateLesson, getLessonById } from "@/features/lessons/api";
import {
    getPromptTemplates,
    getAvailableModels,
} from "@/features/prompt-templates/api"; // <-- Added getAvailableModels
import type {
    PromptTemplateSummaryDto,
    AiModelDto,
} from "@/features/prompt-templates/type"; // <-- Added AiModelDto
import { getContextPacks } from "@/features/context-packs/api";
import {
    GenerateLessonForm,
    type GenerateLessonFormData,
} from "@/features/lessons/components";
import type { ContextPackSummaryDto } from "@/features/context-packs/types";
import type { LessonDto } from "@/features/lessons/types";

export function GenerateLessonPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const remixId = searchParams.get("remixId");

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDependencies, setIsLoadingDependencies] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dropdown & Pre-fill Data
    const [templates, setTemplates] = useState<PromptTemplateSummaryDto[]>([]);
    const [contextPacks, setContextPacks] = useState<ContextPackSummaryDto[]>(
        [],
    );
    const [availableModels, setAvailableModels] = useState<AiModelDto[]>([]); // <-- NEW State
    const [remixSource, setRemixSource] = useState<LessonDto | null>(null);

    // Helper to extract clean error messages from our .NET backend
    const extractErrorMessage = (
        err: unknown,
        fallbackMessage: string,
    ): string => {
        if (isAxiosError(err) && err.response?.data) {
            const data = err.response.data;
            return (
                data.message ||
                data.detail ||
                data.title ||
                JSON.stringify(data)
            );
        }
        if (err instanceof Error) {
            return err.message;
        }
        return fallbackMessage;
    };

    // Fetch Templates, Context Packs, Models, and (optionally) the Remix Lesson on load
    useEffect(() => {
        let isMounted = true;

        const fetchDependencies = async () => {
            try {
                // Fetch basic dropdowns + live AI Models concurrently
                const [templatesData, packsData, modelsData] =
                    await Promise.all([
                        getPromptTemplates(),
                        getContextPacks(),
                        getAvailableModels(), // <-- NEW API Call
                    ]);

                if (!isMounted) return;
                setTemplates(templatesData.items);
                setContextPacks(packsData.items);
                setAvailableModels(modelsData); // <-- Store Models

                if (remixId) {
                    try {
                        const lessonData = await getLessonById(remixId);
                        if (isMounted) setRemixSource(lessonData);
                    } catch (remixErr) {
                        console.warn(
                            "Could not load remix source lesson:",
                            remixErr,
                        );
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Failed to load dependencies", err);
                    const msg = extractErrorMessage(
                        err,
                        "Failed to load Prompt Templates, Context Packs, or AI Models. Please try refreshing.",
                    );
                    setError(msg);
                }
            } finally {
                if (isMounted) setIsLoadingDependencies(false);
            }
        };

        fetchDependencies();

        return () => {
            isMounted = false;
        };
    }, [remixId]);

    const handleSubmit = async (formData: GenerateLessonFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            // Map the form data, including the new provider and model overrides
            const request = {
                title: formData.title,
                topic: formData.topic,
                audience: formData.audience,
                promptTemplateId: formData.promptTemplateId,
                contextPackId: formData.contextPackId || null,
                provider: formData.provider, // <-- NEW Map Override
                model: formData.model, // <-- NEW Map Override
            };

            const newLessonId = await generateLesson(request);
            navigate(`/lessons/${newLessonId}`);
        } catch (err) {
            console.error(err);
            const msg = extractErrorMessage(
                err,
                "Failed to generate the lesson. The AI provider might have timed out. Please try again.",
            );
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-4xl">
                    <button
                        onClick={() => navigate("/lessons")}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                    >
                        &larr; Back to Lessons
                    </button>

                    <PageHeader
                        title={
                            remixId ? "Remix Lesson" : "Generate a New Lesson"
                        }
                        description={
                            remixId
                                ? "Tweak the inputs below to generate a new variation of this lesson."
                                : "Combine an AI Persona with your Context Packs to generate high-quality educational content."
                        }
                    />

                    {error && (
                        <div className="mb-6">
                            <ErrorState message={error} />
                        </div>
                    )}

                    {isLoadingDependencies ? (
                        <div className="text-center py-12 text-zinc-400 animate-pulse">
                            Loading AI configurations...
                        </div>
                    ) : (
                        <GenerateLessonForm
                            templates={templates}
                            contextPacks={contextPacks}
                            availableModels={availableModels}
                            initialData={remixSource}
                            onSubmit={handleSubmit}
                            onCancel={() => navigate("/lessons")}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            </Container>
        </Section>
    );
}
