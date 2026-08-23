import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import { ErrorState } from "@/shared/components/ui";
import { generateLesson, getLessonById } from "@/features/lessons/api";
import { getAvailableModels } from "@/features/prompt-templates/api";
import type { AiModelDto } from "@/features/prompt-templates/type";
import { GenerateLessonForm } from "@/features/lessons/components";
import type {
    GenerateLessonFormData,
    LessonDto,
} from "@/features/lessons/types";
import { extractErrorMessage } from "@/shared/utils/error";

export function GenerateLessonPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const remixId = searchParams.get("remixId");

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingDependencies, setIsLoadingDependencies] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [availableModels, setAvailableModels] = useState<AiModelDto[]>([]);
    const [remixSource, setRemixSource] = useState<LessonDto | null>(null);

    // Fetch Templates, Context Packs, Models, and (optionally) the Remix Lesson on load
    useEffect(() => {
        let isMounted = true;

        const fetchDependencies = async () => {
            try {
                const modelsData = await getAvailableModels();

                if (!isMounted) return;
                setAvailableModels(modelsData);

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
                        "Failed to load AI Models. Please try refreshing.",
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
                provider: formData.provider,
                model: formData.model,
                criticPromptTemplateId: formData.criticPromptTemplateId || null,
                criticProvider: formData.criticProvider,
                criticModel: formData.criticModel,
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
                        onClick={() =>
                            navigate(
                                remixId ? `/lessons/${remixId}` : "/lessons",
                            )
                        }
                        className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                    >
                        &larr;{" "}
                        {!remixId
                            ? "Back to Lessons"
                            : `Back to ${remixSource?.title || "Lesson"}`}
                    </button>

                    <PageHeader
                        title={
                            !remixId
                                ? "Generate a New Lesson"
                                : remixSource?.status === "Failed"
                                  ? "Retry Lesson Generation"
                                  : "Remix Lesson"
                        }
                        description={
                            !remixId
                                ? "Combine an AI Persona with your Context Packs to generate high-quality educational content."
                                : remixSource?.status === "Failed"
                                  ? "Your previous attempt failed. Tweak your settings or try a different AI provider below." // <-- Smart Description!
                                  : "Tweak the inputs below to generate a new variation of this lesson."
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
