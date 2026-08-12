import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    getPromptTemplate,
    publishPromptVersion,
    activatePromptVersion,
    type PromptTemplateDetailsDto,
} from "@/features/prompt-templates/api/promptTemplatesApi";

export function TemplateDetailsPage() {
    const { identifier } = useParams<{ identifier: string }>();
    const navigate = useNavigate();

    const [template, setTemplate] = useState<PromptTemplateDetailsDto | null>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // 1. Initial Load (Linter-friendly)
    useEffect(() => {
        let isMounted = true;
        if (!identifier) return;

        const loadInitialData = async () => {
            try {
                const data = await getPromptTemplate(identifier);
                if (isMounted) {
                    data.versions.sort(
                        (a, b) => b.versionNumber - a.versionNumber,
                    );
                    setTemplate(data);
                }
            } catch (err) {
                if (isMounted)
                    setError(`Failed to load template details. ${err}`);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadInitialData();

        // Cleanup function to prevent state updates if component unmounts
        return () => {
            isMounted = false;
        };
    }, [identifier]);

    // 2. Background Refresh (Used by action buttons)
    const refreshTemplate = async () => {
        if (!identifier) return;
        try {
            const data = await getPromptTemplate(identifier);
            setTemplate(data);
        } catch (err) {
            console.error("Silent refresh failed", err);
        }
    };

    const handlePublish = async (versionNumber: number) => {
        if (!template) return;
        try {
            setActionLoading(`publish-${versionNumber}`);
            await publishPromptVersion(template.id, versionNumber);
            await refreshTemplate(); // Call our new silent refresh function
        } catch (err) {
            alert("Failed to publish version. Check console for details.");
            console.error("Error: ", err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleActivate = async (versionNumber: number) => {
        if (!template) return;
        try {
            setActionLoading(`activate-${versionNumber}`);
            await activatePromptVersion(template.id, versionNumber);
            await refreshTemplate(); // Call our new silent refresh function
        } catch (err) {
            alert(
                "Failed to activate version. Make sure it is Published first!",
            );
            console.error("Error: ", err);
        } finally {
            setActionLoading(null);
        }
    };

    if (isLoading)
        return (
            <div className="text-center py-12">Loading template details...</div>
        );
    if (error || !template)
        return <div className="text-center py-12 text-red-500">{error}</div>;

    const hasActiveVersion = template.versions.some(
        (v) => v.status === "Active",
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <button
                        onClick={() => navigate("/templates")}
                        className="text-blue-600 hover:underline mb-4 flex items-center gap-2"
                    >
                        &larr; Back to Library
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        {template.name}
                        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                            {template.identifier}
                        </span>
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        {template.description}
                    </p>
                </div>

                {hasActiveVersion && (
                    <Link
                        to={`/templates/${template.identifier}/execute`}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md font-medium transition-colors shadow-sm"
                    >
                        &#9654; Execute Prompt
                    </Link>
                )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-8">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Version History
                    </h2>
                    <button className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100 transition-colors">
                        + New Version
                    </button>
                </div>

                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Version
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created At
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {template.versions.map((version) => (
                            <tr
                                key={version.versionNumber}
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                    v{version.versionNumber}.0
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${version.status === "Active" ? "bg-green-100 text-green-800" : ""}
                    ${version.status === "Published" ? "bg-blue-100 text-blue-800" : ""}
                    ${version.status === "Draft" ? "bg-gray-100 text-gray-800" : ""}
                    ${version.status === "Archived" ? "bg-red-100 text-red-800" : ""}
                  `}
                                    >
                                        {version.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(
                                        version.createdAt,
                                    ).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                    {version.status === "Draft" && (
                                        <button
                                            onClick={() =>
                                                handlePublish(
                                                    version.versionNumber,
                                                )
                                            }
                                            disabled={actionLoading !== null}
                                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                                        >
                                            {actionLoading ===
                                            `publish-${version.versionNumber}`
                                                ? "Publishing..."
                                                : "Publish"}
                                        </button>
                                    )}
                                    {version.status === "Published" && (
                                        <button
                                            onClick={() =>
                                                handleActivate(
                                                    version.versionNumber,
                                                )
                                            }
                                            disabled={actionLoading !== null}
                                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                                        >
                                            {actionLoading ===
                                            `activate-${version.versionNumber}`
                                                ? "Activating..."
                                                : "Activate"}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}

                        {template.versions.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="px-6 py-8 text-center text-gray-500"
                                >
                                    No versions created yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
