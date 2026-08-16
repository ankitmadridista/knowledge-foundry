import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getContextPack,
    publishContextPackVersion,
    activateContextPackVersion,
} from "@/features/context-packs/api";
import type { ContextPackDto } from "@/features/context-packs/types";
import { Section, Container } from "@/shared/components/layout";
import { LoadingState, ErrorState } from "@/shared/components/ui";
import {
    ContextPackHeader,
    ContextPackVersionTable,
} from "@/features/context-packs/components";
import toast from "react-hot-toast";

export function ContextPackDetailsPage() {
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
                    data.versions.sort(
                        (a, b) => b.versionNumber - a.versionNumber,
                    );
                    setPack(data);
                }
            } catch (err) {
                if (isMounted)
                    setError(`Failed to load context pack details. ${err}`);
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
            toast.success(`Version ${versionNumber} published successfully!`);
        } catch (err) {
            toast.error("Failed to publish version. Check console for details.");
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
        return <LoadingState message="Loading context pack details..." />;

    if (error || !pack)
        return (
            <Section>
                <Container>
                    <ErrorState message={error || "Context Pack not found"} />
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

                    <ContextPackHeader pack={pack} />

                    <ContextPackVersionTable
                        packId={pack.id}
                        versions={pack.versions}
                        onPublish={handlePublish}
                        onActivate={handleActivate}
                        actionLoading={actionLoading}
                    />
                </div>
            </Container>
        </Section>
    );
}
