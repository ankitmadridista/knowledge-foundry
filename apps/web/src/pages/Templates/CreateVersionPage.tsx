import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getPromptTemplate,
    getPromptVersion,
    addPromptVersion,
    type PromptTemplateDetailsDto,
} from "@/features/prompt-templates/api/promptTemplatesApi";

// Import your custom Design System components
import { Section, Container } from "@/shared/components/layout";
import { Heading, Text, Button, Card, Label, Textarea } from "@/shared/components/ui";

export function CreateVersionPage() {
    const { identifier } = useParams<{ identifier: string }>();
    const navigate = useNavigate();

    const [template, setTemplate] = useState<PromptTemplateDetailsDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [systemContext, setSystemContext] = useState("");
    const [userMessage, setUserMessage] = useState("");

    useEffect(() => {
        let isMounted = true;
        if (!identifier) return;

        const loadPreviousVersion = async () => {
            try {
                // 1. Get the template to find the ID and latest version number
                const templateData = await getPromptTemplate(identifier);
                if (!isMounted) return;
                setTemplate(templateData);

                if (templateData.versions.length > 0) {
                    // Find the highest version number to duplicate
                    const latestVersionNum = Math.max(
                        ...templateData.versions.map((v) => v.versionNumber),
                    );

                    // 2. Fetch the actual text for that version
                    const versionData = await getPromptVersion(
                        templateData.id,
                        latestVersionNum,
                    );

                    if (!isMounted) return;

                    // 3. Pre-fill the text boxes
                    const sysMsg = versionData.messages.find(
                        (m) => m.role === 0,
                    );
                    const usrMsg = versionData.messages.find(
                        (m) => m.role === 1,
                    );

                    if (sysMsg) setSystemContext(sysMsg.content);
                    if (usrMsg) setUserMessage(usrMsg.content);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!template) return;

        setIsSubmitting(true);
        setError(null);

        try {
            // Create the new Draft version
            await addPromptVersion(template.id, {
                messages: [
                    { role: 0, content: systemContext, order: 0 },
                    { role: 1, content: userMessage, order: 1 },
                ],
                capability: 0,
            });

            // Navigate back to the Template Manager to see the new Draft!
            navigate(`/templates/${identifier}`);
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
                        <Text className="text-zinc-500 animate-pulse">Loading previous version...</Text>
                    </div>
                </Container>
            </Section>
        );

    if (!template)
        return (
            <Section>
                <Container>
                    <div className="text-center py-20">
                        <Text className="text-red-500">Template not found.</Text>
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
                        onClick={() => navigate(`/templates/${identifier}`)}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                    >
                        &larr; Back to {template.name}
                    </button>

                    {/* Header */}
                    <div className="mb-8">
                        <Heading>Create New Version</Heading>
                        <Text className="mt-2 text-zinc-400">
                            Editing a copy of the latest version. Saving will create a new <strong className="text-zinc-200">Draft</strong>.
                        </Text>
                    </div>

                    {/* Error State */}
                    {error && (
                        <Card className="p-4 mb-6 border-red-500/20 bg-red-500/10">
                            <Text className="text-red-400">{error}</Text>
                        </Card>
                    )}

                    {/* The Form */}
                    <Card className="p-6 md:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            <div>
                                <Label>System Context *</Label>
                                <Text className="text-xs text-zinc-500 mb-3">
                                    Instructions guiding the AI. Use {"{VariableName}"} for inputs.
                                </Text>
                                <Textarea
                                    required
                                    value={systemContext}
                                    onChange={(e) => setSystemContext(e.target.value)}
                                    rows={4}
                                    className="font-mono text-sm"
                                />
                            </div>

                            <div>
                                <Label>User Message *</Label>
                                <Text className="text-xs text-zinc-500 mb-3">
                                    The actual prompt payload.
                                </Text>
                                <Textarea
                                    required
                                    value={userMessage}
                                    onChange={(e) => setUserMessage(e.target.value)}
                                    rows={8}
                                    className="font-mono text-sm"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-zinc-800">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => navigate(`/templates/${identifier}`)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
                                >
                                    {isSubmitting ? "Saving..." : "Save New Version"}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </Container>
        </Section>
    );
}