import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // <-- Added useSearchParams
import { Section, Container, PageHeader } from "@/shared/components/layout";
import { ErrorState } from "@/shared/components/ui";
import { generateLesson, getLessonById } from "@/features/lessons/api"; // <-- Added getLessonById
import { getPromptTemplates } from "@/features/prompt-templates/api";
import type { PromptTemplateSummaryDto } from "@/features/prompt-templates/type";
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
    const [remixSource, setRemixSource] = useState<LessonDto | null>(null);

    // Fetch Templates, Context Packs, and (optionally) the Remix Lesson on load
    useEffect(() => {
        let isMounted = true;

        const fetchDependencies = async () => {
            try {
                // Fetch basic dropdowns
                const [templatesData, packsData] = await Promise.all([
                    getPromptTemplates(),
                    getContextPacks(),
                ]);

                if (!isMounted) return;
                setTemplates(templatesData);
                setContextPacks(packsData);

                // If this is a remix, fetch the source lesson to pre-fill the form
                if (remixId) {
                    try {
                        const lessonData = await getLessonById(remixId);
                        if (isMounted) setRemixSource(lessonData);
                    } catch (remixErr) {
                        console.warn(
                            "Could not load remix source lesson:",
                            remixErr,
                        );
                        // We don't fail the whole page if remix fetch fails, they just get a blank form
                    }
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Failed to load dependencies", err);
                    setError(
                        "Failed to load Prompt Templates or Context Packs. Please try refreshing.",
                    );
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
            const request = {
                title: formData.title,
                topic: formData.topic,
                audience: formData.audience,
                promptTemplateId: formData.promptTemplateId,
                contextPackId: formData.contextPackId || null,
            };

            const newLessonId = await generateLesson(request);
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
                            initialData={remixSource} // <-- Pass the pre-fill data!
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
