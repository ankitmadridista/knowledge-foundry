import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getContextPack,
    getContextPackVersion,
    createContextPackVersion,
    type ContextPackDto,
} from "@/features/context-packs/api/contextPacksApi";

// Import your custom Design System components
import { Section, Container } from "@/shared/components/layout";
import {
    Heading,
    Text,
    Button,
    Card,
    Label,
    Input,
    Textarea,
} from "@/shared/components/ui";

export function CreateContextPackVersionPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [pack, setPack] = useState<ContextPackDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State: Array of dynamic sections
    const [sections, setSections] = useState<
        { title: string; content: string }[]
    >([{ title: "", content: "" }]);

    useEffect(() => {
        let isMounted = true;
        if (!id) return;

        const loadPreviousVersion = async () => {
            try {
                // 1. Get the pack to find the latest version number
                const packData = await getContextPack(id);
                if (!isMounted) return;
                setPack(packData);

                if (packData.versions && packData.versions.length > 0) {
                    // Find the highest version number to duplicate
                    const latestVersionNum = Math.max(
                        ...packData.versions.map((v) => v.versionNumber),
                    );

                    // 2. Fetch the actual markdown sections for that version
                    const versionData = await getContextPackVersion(
                        packData.id,
                        latestVersionNum,
                    );

                    if (!isMounted) return;

                    // 3. Pre-fill the dynamic sections
                    if (
                        versionData.sections &&
                        versionData.sections.length > 0
                    ) {
                        // Sort by order just in case, then map to our state format
                        const sortedSections = [...versionData.sections].sort(
                            (a, b) => a.order - b.order,
                        );
                        setSections(
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

    const handleAddSection = () => {
        setSections([...sections, { title: "", content: "" }]);
    };

    const handleRemoveSection = (indexToRemove: number) => {
        setSections(sections.filter((_, index) => index !== indexToRemove));
    };

    const handleSectionChange = (
        index: number,
        field: "title" | "content",
        value: string,
    ) => {
        const newSections = [...sections];
        newSections[index][field] = value;
        setSections(newSections);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pack) return;

        if (sections.length === 0) {
            setError("You must have at least one section.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            // Map our state to the DTO expected by the API (injecting the order)
            const sectionsPayload = sections.map((s, index) => ({
                title: s.title,
                content: s.content,
                order: index,
            }));

            // Create the new Draft version
            await createContextPackVersion(pack.id, {
                sections: sectionsPayload,
            });

            // Navigate back to the Pack details to see the new Draft!
            navigate(`/context-packs/${id}`);
        } catch (err) {
            console.error(err);
            setError(
                "Failed to create new version. Check console for details.",
            );
            setIsSubmitting(false);
        }
    };

    if (isLoading)
        return (
            <Section>
                <Container>
                    <div className="text-center py-20">
                        <Text className="text-zinc-500 animate-pulse">
                            Loading previous version...
                        </Text>
                    </div>
                </Container>
            </Section>
        );

    if (!pack)
        return (
            <Section>
                <Container>
                    <div className="text-center py-20">
                        <Text className="text-red-500">
                            Context Pack not found.
                        </Text>
                    </div>
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

                    {/* Header */}
                    <div className="mb-8">
                        <Heading>Create New Version</Heading>
                        <Text className="mt-2 text-zinc-400">
                            Editing a copy of the latest version. Saving will
                            create a new{" "}
                            <strong className="text-zinc-200">Draft</strong>.
                        </Text>
                    </div>

                    {/* Error State */}
                    {error && (
                        <Card className="p-4 mb-6 border-red-500/20 bg-red-500/10">
                            <Text className="text-red-400">{error}</Text>
                        </Card>
                    )}

                    {/* The Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {sections.map((section, index) => (
                            <Card key={index} className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <Heading className="text-lg">
                                        Section {index + 1}
                                    </Heading>
                                    {sections.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                handleRemoveSection(index)
                                            }
                                            className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Remove Section
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label>Title *</Label>
                                        <Input
                                            required
                                            value={section.title}
                                            onChange={(e) =>
                                                handleSectionChange(
                                                    index,
                                                    "title",
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., Core Principles"
                                        />
                                    </div>
                                    <div>
                                        <Label>Content (Markdown) *</Label>
                                        <Textarea
                                            required
                                            value={section.content}
                                            onChange={(e) =>
                                                handleSectionChange(
                                                    index,
                                                    "content",
                                                    e.target.value,
                                                )
                                            }
                                            rows={6}
                                            className="font-mono text-sm"
                                            placeholder="Enter markdown content here..."
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={handleAddSection}
                            className="w-full border-dashed border-zinc-700 hover:border-zinc-500"
                        >
                            + Add Another Section
                        </Button>

                        {/* Actions */}
                        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-zinc-800">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => navigate(`/context-packs/${id}`)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className={
                                    isSubmitting
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }
                            >
                                {isSubmitting
                                    ? "Saving..."
                                    : "Save New Version"}
                            </Button>
                        </div>
                    </form>
                </div>
            </Container>
        </Section>
    );
}
