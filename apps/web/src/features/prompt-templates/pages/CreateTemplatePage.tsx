import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createPromptTemplate,
    addPromptVersion,
    type CreatePromptTemplateRequest,
} from "@/features/prompt-templates/api/promptTemplatesApi";

// Import your custom Design System components
import { Section, Container } from "@/shared/components/layout";
import { Heading, Text, Button, Card, Input, Label, Textarea } from "@/shared/components/ui";

export function CreateTemplatePage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        identifier: "",
        description: "",
        tags: "",
        systemContext: "You are a helpful AI assistant.",
        userMessage: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;

        if (name === "name") {
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
            setError("Failed to create and activate template. Check console for details.");
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

                    {/* Header */}
                    <div className="mb-8">
                        <Heading>Create New Template</Heading>
                        <Text className="mt-2 text-zinc-400">
                            Define the metadata and initial version of your prompt.
                        </Text>
                    </div>

                    {/* Error State */}
                    {error && (
                        <Card className="p-4 mb-6 border-red-500/20 bg-red-500/10">
                            <Text className="text-red-400">{error}</Text>
                        </Card>
                    )}

                    {/* The Form (Wrapped in our Card component) */}
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
                                        placeholder="e.g., Sentiment Analyzer"
                                    />
                                </div>
                                <div>
                                    <Label>Identifier *</Label>
                                    <Input
                                        required
                                        name="identifier"
                                        value={formData.identifier}
                                        onChange={handleChange}
                                        placeholder="SENTIMENT-ANALYZER"
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
                                    placeholder="What does this prompt do?"
                                />
                            </div>

                            <div>
                                <Label>Tags (comma separated)</Label>
                                <Input
                                    name="tags"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="e.g., classification, extraction, ai"
                                />
                            </div>

                            <hr className="border-zinc-800 my-8" />

                            {/* PROMPT CONTENT SECTION */}
                            <div>
                                <Label>System Context *</Label>
                                <Text className="text-xs text-zinc-500 mb-3">
                                    Instructions guiding the AI. Use {"{VariableName}"} for inputs.
                                </Text>
                                {/* We append font-mono here because prompt engineering looks better in a monospace font */}
                                <Textarea
                                    required
                                    name="systemContext"
                                    value={formData.systemContext}
                                    onChange={handleChange}
                                    rows={3}
                                    className="font-mono text-sm"
                                />
                            </div>

                            <div>
                                <Label>User Message *</Label>
                                <Textarea
                                    required
                                    name="userMessage"
                                    value={formData.userMessage}
                                    onChange={handleChange}
                                    rows={5}
                                    className="font-mono text-sm"
                                />
                            </div>

                            {/* ACTIONS */}
                            <div className="flex justify-end gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => navigate("/templates")}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    {isSubmitting ? "Saving..." : "Save Template"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </Container>
        </Section>
    );
}