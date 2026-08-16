import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createPromptTemplate,
    addPromptVersion,
} from "@/features/prompt-templates/api";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import { ErrorState } from "@/shared/components/ui";
import {
    CreatePromptTemplateForm,
    type CreatePromptTemplateFormData,
} from "@/features/prompt-templates/components";
import type { CreatePromptTemplateRequest } from "@/features/prompt-templates/type";

export function CreateTemplatePage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: CreatePromptTemplateFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const tagsArray = formData.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

            // STEP 1: Create the Template Shell
            const request: CreatePromptTemplateRequest = {
                identifier: formData.identifier,
                name: formData.name,
                description: formData.description,
                purpose: 0,
                tags: tagsArray,
            };

            const templateId = await createPromptTemplate(request);

            // STEP 2: Add Version 1 with the Messages
            await addPromptVersion(templateId, {
                messages: [
                    { role: 0, content: formData.systemContext, order: 0 },
                    { role: 1, content: formData.userMessage, order: 1 },
                ],
                capability: 0,
            });

            // Success! Go back to the dashboard.
            navigate("/templates");
        } catch (err) {
            console.error(err);

            // Safety check for 409 Conflict if identifier is taken
            const httpError = err as { response?: { status?: number } };
            if (httpError.response?.status === 409) {
                setError(
                    "That identifier is already in use. Please choose a unique identifier.",
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
                {/* Constrain the width for readability */}
                <div className="mx-auto max-w-4xl">
                    {/* Back Button */}
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

                    {/* Show generic Error State if an error occurs */}
                    {error && (
                        <div className="mb-6">
                            <ErrorState message={error} />
                        </div>
                    )}

                    {/* The Form Component */}
                    <CreatePromptTemplateForm
                        onSubmit={handleSubmit}
                        onCancel={() => navigate("/templates")}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </Container>
        </Section>
    );
}
