import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getPromptTemplates,
    type PromptTemplateSummary,
} from "@/features/prompt-templates/api/promptTemplatesApi";

// 1. Import your brand new Design System!
import { Section, Container } from "@/shared/components/layout";
import { Heading, Text, Button, Card } from "@/shared/components/ui";

export function TemplatesPage() {
    const [templates, setTemplates] = useState<PromptTemplateSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTemplates = async () => {
            try {
                const data = await getPromptTemplates();
                setTemplates(data);
            } catch (err) {
                console.error("Failed to fetch templates:", err);
                setError(
                    "Failed to load prompt templates. Is the backend running?"
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    return (
        <Section>
            <Container>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
                    <div>
                        <Heading>Prompt Library</Heading>
                        <Text className="mt-2 text-zinc-400">
                            Manage and execute your AI prompt templates.
                        </Text>
                    </div>
                    <Button onClick={() => navigate("/templates/new")}>
                        + New Template
                    </Button>
                </div>

                {/* State: Loading */}
                {isLoading && (
                    <div className="py-20 text-center">
                        <Text className="text-zinc-500 animate-pulse">Loading templates...</Text>
                    </div>
                )}

                {/* State: Error */}
                {error && (
                    <Card className="p-6 border-red-500/20 bg-red-500/10">
                        <Text className="text-red-400 text-center">{error}</Text>
                    </Card>
                )}

                {/* State: Empty */}
                {!isLoading && !error && templates.length === 0 && (
                    <Card className="py-20 text-center border-dashed border-zinc-700 bg-transparent">
                        <Text className="text-zinc-500 mb-6">No prompt templates found.</Text>
                        <Button variant="secondary" onClick={() => navigate("/templates/new")}>
                            Create your first template
                        </Button>
                    </Card>
                )}

                {/* State: Data Grid */}
                {!isLoading && !error && templates.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {templates.map((template) => (
                            <Card 
                                key={template.id} 
                                className="flex flex-col h-full p-6 transition-colors hover:border-indigo-500/30 cursor-pointer"
                                onClick={() => navigate(`/templates/${template.id}`)}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                                        {template.identifier}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-bold text-zinc-100 mb-2">
                                    {template.name}
                                </h3>

                                <Text className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1">
                                    {template.description || "No description provided."}
                                </Text>

                                {/* Tags Footer */}
                                {template.tags && template.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-800">
                                        {template.tags.slice(0, 3).map((tag) => (
                                            <span key={tag} className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md">
                                                {tag}
                                            </span>
                                        ))}
                                        {template.tags.length > 3 && (
                                            <span className="text-xs text-zinc-500 px-2 py-1">
                                                +{template.tags.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                )}
            </Container>
        </Section>
    );
}