import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createContextPack,
    createContextPackVersion,
} from "@/features/context-packs/api/contextPacksApi";

import { Section, Container, PageHeader } from "@/shared/components/layout";
import { ErrorState } from "@/shared/components/ui";
import {
    CreateContextPackForm,
    type CreateContextPackFormData,
} from "@/features/context-packs/components/CreateContextPackForm";

export function CreateContextPackPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (formData: CreateContextPackFormData) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const tagsArray = formData.tags
                .split(",")
                .map((tag) => tag.trim())
                .filter((tag) => tag.length > 0);

            // STEP 1: Create the Context Pack Shell
            const packId = await createContextPack({
                identifier: formData.identifier,
                name: formData.name,
                description: formData.description,
                tags: tagsArray,
            });

            // STEP 2: Add Version 1 with the initial Markdown section
            await createContextPackVersion(packId, {
                sections: [
                    {
                        title: formData.sectionTitle,
                        content: formData.sectionContent,
                        order: 0,
                    },
                ],
            });

            // Success! Go back to the dashboard.
            navigate("/context-packs");
        } catch (err) {
            console.error(err);
            const httpError = err as { response?: { status?: number } };

            if (httpError.response?.status === 409) {
                setError(
                    "That identifier is already in use. Please choose a unique identifier.",
                );
            } else {
                setError(
                    "Failed to create context pack. Check console for details.",
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
                    {/* Back Button */}
                    <button
                        onClick={() => navigate("/context-packs")}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                    >
                        &larr; Back to Context Packs
                    </button>

                    <PageHeader
                        title="Create New Context Pack"
                        description="Define the metadata and create the first draft version of this knowledge base."
                    />

                    {/* Show generic Error State if an error occurs */}
                    {error && (
                        <div className="mb-6">
                            <ErrorState message={error} />
                        </div>
                    )}

                    {/* The Form Component */}
                    <CreateContextPackForm
                        onSubmit={handleSubmit}
                        onCancel={() => navigate("/context-packs")}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </Container>
        </Section>
    );
}
