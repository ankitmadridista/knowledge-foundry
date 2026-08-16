import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getContextPack,
    getContextPackVersion,
    createContextPackVersion,
} from "@/features/context-packs/api";
import type { ContextPackDto } from "@/features/context-packs/types";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import { LoadingState, ErrorState } from "@/shared/components/ui";
import {
    ContextPackVersionForm,
    type ContextSectionData,
} from "@/features/context-packs/components";

export function CreateContextPackVersionPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [pack, setPack] = useState<ContextPackDto | null>(null);
    const [initialSections, setInitialSections] = useState<
        ContextSectionData[]
    >([]);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 1. Fetch Previous Version Data
    useEffect(() => {
        let isMounted = true;
        if (!id) return;

        const loadPreviousVersion = async () => {
            try {
                const packData = await getContextPack(id);
                if (!isMounted) return;
                setPack(packData);

                if (packData.versions && packData.versions.length > 0) {
                    const latestVersionNum = Math.max(
                        ...packData.versions.map((v) => v.versionNumber),
                    );

                    const versionData = await getContextPackVersion(
                        packData.id,
                        latestVersionNum,
                    );
                    if (!isMounted) return;

                    if (
                        versionData.sections &&
                        versionData.sections.length > 0
                    ) {
                        const sortedSections = [...versionData.sections].sort(
                            (a, b) => a.order - b.order,
                        );
                        setInitialSections(
                            sortedSections.map((s) => ({
                                title: s.title,
                                content: s.content,
                            })),
                        );
                    }
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
    }, [id]);

    // 2. Handle Form Submission
    const handleSubmit = async (sections: ContextSectionData[]) => {
        if (!pack) return;

        if (sections.length === 0) {
            setError("You must have at least one section.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const sectionsPayload = sections.map((s, index) => ({
                title: s.title,
                content: s.content,
                order: index,
            }));

            await createContextPackVersion(pack.id, {
                sections: sectionsPayload,
            });
            navigate(`/context-packs/${id}`);
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

    if (!pack)
        return (
            <Section>
                <Container>
                    <ErrorState message="Context Pack not found." />
                </Container>
            </Section>
        );

    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-4xl">
                    {/* Back Button */}
                    <button
                        onClick={() => navigate(`/context-packs/${id}`)}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                    >
                        &larr; Back to {pack.name}
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

                    {/* Form Component (Only rendered after loading is complete so initialSections is populated) */}
                    <ContextPackVersionForm
                        initialSections={initialSections}
                        onSubmit={handleSubmit}
                        onCancel={() => navigate(`/context-packs/${id}`)}
                        isSubmitting={isSubmitting}
                    />
                </div>
            </Container>
        </Section>
    );
}
