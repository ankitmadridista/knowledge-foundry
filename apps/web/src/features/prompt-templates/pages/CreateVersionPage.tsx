import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getPromptTemplate,
    getPromptVersion,
    addPromptVersion,
} from "@/features/prompt-templates/api";
import type {
    PromptTemplateDetailsDto,
    PromptVersionFormData,
} from "@/features/prompt-templates/type";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import { LoadingState, ErrorState } from "@/shared/components/ui";
import { PromptVersionForm } from "@/features/prompt-templates/components";

export function CreateVersionPage() {
    const { identifier } = useParams<{ identifier: string }>();
    const navigate = useNavigate();

    const [template, setTemplate] = useState<PromptTemplateDetailsDto | null>(
        null,
    );
    const [initialSystemContext, setInitialSystemContext] = useState("");
    const [initialUserMessage, setInitialUserMessage] = useState("");
    const [initialCapability, setInitialCapability] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch Previous Version Data
    useEffect(() => {
        let isMounted = true;
        if (!identifier) return;

        const loadPreviousVersion = async () => {
            try {
                const templateData = await getPromptTemplate(identifier);
                if (!isMounted) return;
                setTemplate(templateData);

                if (templateData.versions.length > 0) {
                    const latestVersionNum = Math.max(
                        ...templateData.versions.map((v) => v.versionNumber),
                    );

                    const versionData = await getPromptVersion(
                        templateData.id,
                        latestVersionNum,
                    );
                    if (!isMounted) return;

                    const sysMsg = versionData.messages.find(
                        (m) => m.role === 0,
                    );
                    const usrMsg = versionData.messages.find(
                        (m) => m.role === 1,
                    );

                    if (sysMsg) setInitialSystemContext(sysMsg.content);
                    if (usrMsg) setInitialUserMessage(usrMsg.content);
                    setInitialCapability(versionData.capability ?? 0);
                }
            } catch (err) {
                if (isMounted)
                    setError(`Failed to load previous version data. ${err}`);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadPreviousVersion();
        return () => {
            isMounted = false;
        };
    }, [identifier]);

    // 2. Handle Form Submission
    const handleSubmit = async (formData: PromptVersionFormData) => {
        if (!template) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await addPromptVersion(template.id, {
                messages: [
                    { role: 0, content: formData.systemContext, order: 0 },
                    { role: 1, content: formData.userMessage, order: 1 },
                ],
                capability: formData.capability,
            });

            navigate(`/templates/${identifier}`);
        } catch (err) {
            console.error(err);
            setError(
                "Failed to create new version. Check console for details.",
            );
            setIsSubmitting(false);
        }
    };

    // --- RENDER BLOCK ---

    if (isLoading)
        return <LoadingState message="Loading previous version..." />;

    if (!template)
        return (
            <Section>
                <Container>
                    <ErrorState message="Template not found." />
                </Container>
            </Section>
        );

    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-4xl">
                    <button
                        onClick={() => navigate(`/templates/${identifier}`)}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                    >
                        &larr; Back to {template.name}
                    </button>

                    <PageHeader
                        title="Create New Version"
                        description="Editing a copy of the latest version. Saving will create a new Draft."
                    />

                    {error && (
                        <div className="mb-6">
                            <ErrorState message={error} />
                        </div>
                    )}

                    <PromptVersionForm
                        initialSystemContext={initialSystemContext}
                        initialUserMessage={initialUserMessage}
                        initialCapability={initialCapability}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate(`/templates/${identifier}`)}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </Container>
        </Section>
    );
}
