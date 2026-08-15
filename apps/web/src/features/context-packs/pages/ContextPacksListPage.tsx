import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    getContextPacks,
    type ContextPackSummaryDto,
} from "@/features/context-packs/api/contextPacksApi";

import { Section, Container } from "@/shared/components/layout";
import { Heading, Text, Button, Card } from "@/shared/components/ui";

export function ContextPacksListPage() {
    const [packs, setPacks] = useState<ContextPackSummaryDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPacks = async () => {
            try {
                const data = await getContextPacks();
                setPacks(data);
            } catch (err) {
                console.error("Failed to fetch context packs:", err);
                setError(
                    "Failed to load context packs. Is the backend running?",
                );
            } finally {
                setIsLoading(false);
            }
        };

        fetchPacks();
    }, []);

    return (
        <Section>
            <Container>
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 gap-4">
                    <div>
                        <Heading>Context Packs</Heading>
                        <Text className="mt-2 text-zinc-400">
                            Manage dynamic knowledge payloads to inject into
                            your prompt templates.
                        </Text>
                    </div>
                    <Button onClick={() => navigate("/context-packs/new")}>
                        + New Context Pack
                    </Button>
                </div>

                {/* State: Loading */}
                {isLoading && (
                    <div className="py-20 text-center">
                        <Text className="text-zinc-500 animate-pulse">
                            Loading context packs...
                        </Text>
                    </div>
                )}

                {/* State: Error */}
                {error && (
                    <Card className="p-6 border-red-500/20 bg-red-500/10">
                        <Text className="text-red-400 text-center">
                            {error}
                        </Text>
                    </Card>
                )}

                {/* State: Empty */}
                {!isLoading && !error && packs.length === 0 && (
                    <Card className="py-20 text-center border-dashed border-zinc-700 bg-transparent">
                        <Text className="text-zinc-500 mb-6">
                            No context packs found.
                        </Text>
                        <Button
                            variant="secondary"
                            onClick={() => navigate("/context-packs/new")}
                        >
                            Create your first context pack
                        </Button>
                    </Card>
                )}

                {/* State: Data Grid */}
                {!isLoading && !error && packs.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {packs.map((pack) => (
                            <Card
                                key={pack.id}
                                className="flex flex-col h-full p-6 transition-colors hover:border-indigo-500/30 cursor-pointer"
                                onClick={() =>
                                    navigate(`/context-packs/${pack.id}`)
                                }
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                                        {pack.identifier}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-zinc-100 mb-2">
                                    {pack.name}
                                </h3>

                                <Text className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1">
                                    {pack.description ||
                                        "No description provided."}
                                </Text>

                                {/* Tags Footer */}
                                {pack.tags && pack.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-800">
                                        {pack.tags.slice(0, 3).map((tag) => (
                                            <span
                                                key={tag}
                                                className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                        {pack.tags.length > 3 && (
                                            <span className="text-xs text-zinc-500 px-2 py-1">
                                                +{pack.tags.length - 3}
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
