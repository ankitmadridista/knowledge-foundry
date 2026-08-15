import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createContextPack,
    createContextPackVersion,
} from "@/features/context-packs/api/contextPacksApi";

import { Section, Container } from "@/shared/components/layout";
import {
    Heading,
    Text,
    Button,
    Card,
    Input,
    Label,
    Textarea,
} from "@/shared/components/ui";

export function CreateContextPackPage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        identifier: "",
        description: "",
        tags: "",
        // Initial Version Data
        sectionTitle: "Overview",
        sectionContent: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;

        if (name === "name") {
            // Auto-generate a clean identifier (e.g. "Math Rules" -> "MATH-RULES")
            const autoIdentifier = value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, "-")
                .replace(/-+/g, "-")
                .replace(/^-|-$/g, "");

            setFormData((prev) => ({
                ...prev,
                name: value,
                identifier: autoIdentifier,
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            
            // Safely cast the unknown error to check for an HTTP response status
            const httpError = err as { response?: { status?: number } };

            // Handle specific 409 Conflict for identifiers
            if (httpError.response?.status === 409) {
                setError("That identifier is already in use. Please choose a unique identifier.");
            } else {
                setError("Failed to create context pack. Check console for details.");
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

                    {/* Header */}
                    <div className="mb-8">
                        <Heading>Create New Context Pack</Heading>
                        <Text className="mt-2 text-zinc-400">
                            Define the metadata and create the first draft
                            version of this knowledge base.
                        </Text>
                    </div>

                    {/* Error State */}
                    {error && (
                        <Card className="p-4 mb-6 border-red-500/20 bg-red-500/10">
                            <Text className="text-red-400">{error}</Text>
                        </Card>
                    )}

                    <Card className="p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* METADATA SECTION */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label>Name *</Label>
                                    <Input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g., Grade 10 Math Guidelines"
                                    />
                                </div>
                                <div>
                                    <Label>Identifier *</Label>
                                    <Input
                                        required
                                        name="identifier"
                                        value={formData.identifier}
                                        onChange={handleChange}
                                        placeholder="GRADE-10-MATH"
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Description *</Label>
                                <Input
                                    required
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="What knowledge does this pack contain?"
                                />
                            </div>

                            <div>
                                <Label>Tags (comma separated)</Label>
                                <Input
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="e.g., curriculum, math, standard"
                                />
                            </div>

                            <hr className="border-zinc-800 my-8" />

                            {/* VERSION 1 KNOWLEDGE SECTION */}
                            <div className="mb-4">
                                <Heading className="text-xl">
                                    Initial Knowledge Content
                                </Heading>
                                <Text className="text-sm text-zinc-400 mt-1">
                                    You can add more sections to this version
                                    later. Formatting supports Markdown.
                                </Text>
                            </div>

                            <div>
                                <Label>Section Title *</Label>
                                <Input
                                    required
                                    name="sectionTitle"
                                    value={formData.sectionTitle}
                                    onChange={handleChange}
                                    placeholder="e.g., Algebraic Equations"
                                />
                            </div>

                            <div>
                                <Label>Section Content (Markdown) *</Label>
                                <Textarea
                                    required
                                    name="sectionContent"
                                    value={formData.sectionContent}
                                    onChange={handleChange}
                                    rows={8}
                                    className="font-mono text-sm"
                                    placeholder="Enter your structured knowledge here..."
                                />
                            </div>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-zinc-800">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => navigate("/context-packs")}
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
                                        : "Save Context Pack"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </Container>
        </Section>
    );
}
