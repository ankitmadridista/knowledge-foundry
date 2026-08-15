import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getContextPack,
    publishContextPackVersion,
    activateContextPackVersion,
    type ContextPackDto,
} from "@/features/context-packs/api/contextPacksApi";

// Import your custom Design System components
import { Section, Container } from "@/shared/components/layout";
import { Heading, Text, Button, Card, Badge } from "@/shared/components/ui";

export function ContextPackDetailsPage() {
    // Note: Assuming your route is defined as /context-packs/:id
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [pack, setPack] = useState<ContextPackDto | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // 1. Initial Load
    useEffect(() => {
        let isMounted = true;
        if (!id) return;

        const loadInitialData = async () => {
            try {
                const data = await getContextPack(id);
                if (isMounted) {
                    // Sort versions descending so newest is at the top
                    data.versions.sort((a, b) => b.versionNumber - a.versionNumber);
                    setPack(data);
                }
            } catch (err) {
                if (isMounted) setError(`Failed to load context pack details. ${err}`);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadInitialData();

        return () => {
            isMounted = false;
        };
    }, [id]);

    // 2. Background Refresh (Used by action buttons)
    const refreshPack = async () => {
        if (!id) return;
        try {
            const data = await getContextPack(id);
            data.versions.sort((a, b) => b.versionNumber - a.versionNumber);
            setPack(data);
        } catch (err) {
            console.error("Silent refresh failed", err);
        }
    };

    const handlePublish = async (versionNumber: number) => {
        if (!pack) return;
        try {
            setActionLoading(`publish-${versionNumber}`);
            await publishContextPackVersion(pack.id, versionNumber);
            await refreshPack();
        } catch (err) {
            alert("Failed to publish version. Check console for details.");
            console.error("Error: ", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleActivate = async (versionNumber: number) => {
        if (!pack) return;
        try {
            setActionLoading(`activate-${versionNumber}`);
            await activateContextPackVersion(pack.id, versionNumber);
            await refreshPack();
        } catch (err) {
            alert("Failed to activate version. Make sure it is Published first!");
            console.error("Error: ", err);
        } finally {
            setActionLoading(null);
        }
    };

    // Helper to render the correct badge for status
    const renderStatusBadge = (status: string | number) => {
        // Handle both string and potential enum number representations
        const statusStr = String(status);
        if (statusStr === "Active" || statusStr === "2") {
            return <Badge variant="success">Active</Badge>;
        }
        if (statusStr === "Published" || statusStr === "1") {
            return <Badge variant="brand">Published</Badge>;
        }
        return <Badge variant="neutral">{statusStr}</Badge>;
    };

    if (isLoading)
        return (
            <Section>
                <Container>
                    <div className="text-center py-20">
                        <Text className="text-zinc-500 animate-pulse">Loading context pack details...</Text>
                    </div>
                </Container>
            </Section>
        );

    if (error || !pack)
        return (
            <Section>
                <Container>
                    <div className="text-center py-20">
                        <Text className="text-red-400">{error || "Context Pack not found"}</Text>
                    </div>
                </Container>
            </Section>
        );

    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-5xl">
                    
                    {/* Back Button */}
                    <button
                        onClick={() => navigate("/context-packs")}
                        className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                    >
                        &larr; Back to Library
                    </button>

                    {/* Page Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-6">
                        <div>
                            <Heading className="flex items-center gap-4 flex-wrap">
                                {pack.name}
                                <span className="text-sm font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700">
                                    {pack.identifier}
                                </span>
                            </Heading>
                            <Text className="text-zinc-400 mt-3 max-w-2xl">
                                {pack.description}
                            </Text>
                            
                            {/* Tags Footer */}
                            {pack.tags && pack.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {pack.tags.map((tag) => (
                                        <span key={tag} className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Version History Table Container */}
                    <Card className="overflow-hidden mt-8">
                        {/* Table Header */}
                        <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                            <h2 className="text-lg font-bold text-zinc-100">
                                Version History
                            </h2>
                            <Button 
                                variant="secondary" 
                                onClick={() => navigate(`/context-packs/${pack.id}/versions/new`)}
                                className="py-2 px-4 text-sm"
                            >
                                + New Version
                            </Button>
                        </div>

                        {/* The Table */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-zinc-800">
                                <thead className="bg-zinc-950/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                            Version
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                            Created At
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800 bg-zinc-900">
                                    {pack.versions.map((version) => (
                                        <tr
                                            key={version.versionNumber}
                                            className="hover:bg-zinc-800/30 transition-colors"
                                        >
                                            <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-zinc-100">
                                                v{version.versionNumber}.0
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap">
                                                {renderStatusBadge(version.status)}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-sm text-zinc-400">
                                                {new Date(version.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                                {String(version.status) === "Draft" || String(version.status) === "0" ? (
                                                    <button
                                                        onClick={() => handlePublish(version.versionNumber)}
                                                        disabled={actionLoading !== null}
                                                        className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors font-semibold"
                                                    >
                                                        {actionLoading === `publish-${version.versionNumber}`
                                                            ? "Publishing..."
                                                            : "Publish"}
                                                    </button>
                                                ) : null}
                                                
                                                {String(version.status) === "Published" || String(version.status) === "1" ? (
                                                    <button
                                                        onClick={() => handleActivate(version.versionNumber)}
                                                        disabled={actionLoading !== null}
                                                        className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors font-semibold"
                                                    >
                                                        {actionLoading === `activate-${version.versionNumber}`
                                                            ? "Activating..."
                                                            : "Activate"}
                                                    </button>
                                                ) : null}
                                            </td>
                                        </tr>
                                    ))}

                                    {pack.versions.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-12 text-center text-zinc-500 italic"
                                            >
                                                No versions created yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </Container>
        </Section>
    );
}