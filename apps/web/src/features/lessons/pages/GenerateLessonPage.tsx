import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { Section, Container, PageHeader } from "@/shared/components/layout";
import { ErrorState } from "@/shared/components/ui";

import { generateLesson } from "@/features/lessons/api";
import {
    getPromptTemplates,
    type PromptTemplateSummaryDto,
} from "@/features/prompt-templates/api/promptTemplatesApi";
import {
    getContextPacks,
    type ContextPackSummaryDto,
} from "@/features/context-packs/api/contextPacksApi";

import {
    GenerateLessonForm,
    type GenerateLessonFormData,
} from "@/features/lessons/components/GenerateLessonForm";

export function GenerateLessonPage() {
    const navigate = useNavigate();

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDependencies, setIsLoadingDependencies] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Dropdown Data
    const [templates, setTemplates] = useState<PromptTemplateSummaryDto[]>([]);
    const [contextPacks, setContextPacks] = useState<ContextPackSummaryDto[]>(
        [],
    );

    // Fetch Templates and Context Packs on load
    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                // Fetch both in parallel for speed!
                const [templatesData, packsData] = await Promise.all([
                    getPromptTemplates(),
                    getContextPacks(),
                ]);
                setTemplates(templatesData);
                setContextPacks(packsData);
            } catch (err) {
                console.error("Failed to load dependencies", err);
                setError(
                    "Failed to load Prompt Templates or Context Packs. Please try refreshing.",
                );
            } finally {
                setIsLoadingDependencies(false);
            }
        };

        fetchDependencies();
    }, []);

    const handleSubmit = async (formData: GenerateLessonFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const request = {
                title: formData.title,
                topic: formData.topic,
                audience: formData.audience,
                promptTemplateId: formData.promptTemplateId,
                // Only send contextPackId if it's not empty
                contextPackId: formData.contextPackId || null,
            };

            const newLessonId = await generateLesson(request);

            // Success! Navigate directly to the new lesson viewer
            navigate(`/lessons/${newLessonId}`);
        } catch (err) {
            console.error(err);
            setError(
                "Failed to generate the lesson. The AI provider might have timed out. Please try again.",
            );
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
                        title="Generate a New Lesson"
                        description="Combine an AI Persona with your Context Packs to generate high-quality educational content."
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
