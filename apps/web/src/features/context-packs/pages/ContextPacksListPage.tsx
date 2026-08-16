import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getContextPacks } from "@/features/context-packs/api";
import type { ContextPackSummaryDto } from "@/features/context-packs/types";
import { ContextPackCard } from "@/features/context-packs/components";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import {
    Button,
    EmptyState,
    ErrorState,
    LoadingState,
} from "@/shared/components/ui";

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
                {/* 1. Header */}
                <PageHeader
                    title="Context Packs"
                    description="Manage dynamic knowledge payloads to inject into your prompt templates."
                    action={
                        <Button onClick={() => navigate("/context-packs/new")}>
                            + New Context Pack
                        </Button>
                    }
                />

                {/* 2. Various States */}
                {isLoading && (
                    <LoadingState message="Loading context packs..." />
                )}

                {error && <ErrorState message={error} />}

                {!isLoading && !error && packs.length === 0 && (
                    <EmptyState
                        message="No context packs found."
                        action={
                            <Button
                                variant="secondary"
                                onClick={() => navigate("/context-packs/new")}
                            >
                                Create your first context pack
                            </Button>
                        }
                    />
                )}

                {/* 3. The Data Grid */}
                {!isLoading && !error && packs.length > 0 && (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {packs.map((pack) => (
                            <ContextPackCard
                                key={pack.id}
                                pack={pack}
                                onClick={() =>
                                    navigate(`/context-packs/${pack.id}`)
                                }
                            />
                        ))}
                    </div>
                )}
            </Container>
        </Section>
    );
}
