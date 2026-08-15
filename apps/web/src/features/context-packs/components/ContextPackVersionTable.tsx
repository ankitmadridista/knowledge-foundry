import { useNavigate } from "react-router-dom";
import { Button, Card, Badge } from "@/shared/components/ui";
import type { ContextPackDto } from "@/features/context-packs/api/contextPacksApi";

interface ContextPackVersionTableProps {
    packId: string;
    versions: ContextPackDto["versions"];
    onPublish: (versionNumber: number) => void;
    onActivate: (versionNumber: number) => void;
    actionLoading: string | null;
}

export function ContextPackVersionTable({
    packId,
    versions,
    onPublish,
    onActivate,
    actionLoading,
}: ContextPackVersionTableProps) {
    const navigate = useNavigate();

    // Helper to render the correct badge for status
    const renderStatusBadge = (status: string | number) => {
        const statusStr = String(status);
        if (statusStr === "Active" || statusStr === "2") {
            return <Badge variant="success">Active</Badge>;
        }
        if (statusStr === "Published" || statusStr === "1") {
            return <Badge variant="brand">Published</Badge>;
        }
        return <Badge variant="neutral">{statusStr}</Badge>;
    };

    return (
        <Card className="overflow-hidden mt-8">
            {/* Table Header */}
            <div className="px-6 py-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
                <h2 className="text-lg font-bold text-zinc-100">
                    Version History
                </h2>
                <Button
                    variant="secondary"
                    onClick={() =>
                        navigate(`/context-packs/${packId}/versions/new`)
                    }
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
                        {versions.map((version) => (
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
                                    {new Date(
                                        version.createdAt,
                                    ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    {String(version.status) === "Draft" ||
                                    String(version.status) === "0" ? (
                                        <button
                                            onClick={() =>
                                                onPublish(version.versionNumber)
                                            }
                                            disabled={actionLoading !== null}
                                            className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50 transition-colors font-semibold"
                                        >
                                            {actionLoading ===
                                            `publish-${version.versionNumber}`
                                                ? "Publishing..."
                                                : "Publish"}
                                        </button>
                                    ) : null}

                                    {String(version.status) === "Published" ||
                                    String(version.status) === "1" ? (
                                        <button
                                            onClick={() =>
                                                onActivate(
                                                    version.versionNumber,
                                                )
                                            }
                                            disabled={actionLoading !== null}
                                            className="text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors font-semibold"
                                        >
                                            {actionLoading ===
                                            `activate-${version.versionNumber}`
                                                ? "Activating..."
                                                : "Activate"}
                                        </button>
                                    ) : null}
                                </td>
                            </tr>
                        ))}

                        {versions.length === 0 && (
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
    );
}
