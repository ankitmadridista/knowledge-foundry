import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getPromptTemplate,
    publishPromptVersion,
    activatePromptVersion,
} from "@/features/prompt-templates/api";
import type { PromptTemplateDetailsDto } from "@/features/prompt-templates/type";
import { Section, Container } from "@/shared/components/layout";
import { LoadingState, ErrorState } from "@/shared/components/ui";

// Import our new Feature Components
import {
    PromptTemplateHeader,
    PromptVersionTable,
} from "@/features/prompt-templates/components";
import toast from "react-hot-toast";
export function TemplateDetailsPage() {
    const { identifier } = useParams<{ identifier: string }>();
    const navigate = useNavigate();

    const [template, setTemplate] = useState<PromptTemplateDetailsDto | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // 1. Initial Load
    useEffect(() => {
        let isMounted = true;
        if (!identifier) return;

        const loadInitialData = async () => {
            try {
                const data = await getPromptTemplate(identifier);
                if (isMounted) {
                    data.versions.sort(
                        (a, b) => b.versionNumber - a.versionNumber,
                    );
                    setTemplate(data);
                }
            } catch (err) {
                if (isMounted)
                    setError(`Failed to load template details. ${err}`);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, [identifier]);

    // 2. Background Refresh (Used by action buttons)
    const refreshTemplate = async () => {
        if (!identifier) return;
        try {
            const data = await getPromptTemplate(identifier);
            data.versions.sort((a, b) => b.versionNumber - a.versionNumber);
            setTemplate(data);
        } catch (err) {
            console.error("Silent refresh failed", err);
        }
    };

    const handlePublish = async (versionNumber: number) => {
        if (!template) return;
        try {
            setActionLoading(`publish-${versionNumber}`);
            await publishPromptVersion(template.id, versionNumber);
            await refreshTemplate();
            toast.success(`Version ${versionNumber} published successfully!`);
        } catch (err) {
            toast.error(
                "Failed to publish version. Check console for details.",
            );
            console.error("Error: ", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleActivate = async (versionNumber: number) => {
        if (!template) return;
        try {
            setActionLoading(`activate-${versionNumber}`);
            await activatePromptVersion(template.id, versionNumber);
            await refreshTemplate();
            toast.success(`Version ${versionNumber} is now active!`);
        } catch (err) {
            toast.error(
                "Failed to activate version. Make sure it is Published first!",
            );
            console.error("Error: ", err);
        } finally {
            setActionLoading(null);
        }
    };

    // --- RENDER BLOCK ---

    if (isLoading)
        return <LoadingState message="Loading template details..." />;

    if (error || !template)
        return (
            <Section>
                <Container>
                    <ErrorState message={error || "Template not found"} />
                </Container>
            </Section>
        );

    const hasActiveVersion = template.versions.some(
        (v) => v.status === "Active",
    );

    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-5xl">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate("/templates")}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                    >
                        &larr; Back to Library
                    </button>

                    <PromptTemplateHeader
                        template={template}
                        hasActiveVersion={hasActiveVersion}
                        onExecute={() =>
                            navigate(
                                `/templates/${template.identifier}/execute`,
                            )
                        }
                    />

                    <PromptVersionTable
                        templateId={template.id}
                        versions={template.versions}
                        onPublish={handlePublish}
                        onActivate={handleActivate}
                        actionLoading={actionLoading}
                    />
                </div>
            </Container>
        </Section>
    );
}
