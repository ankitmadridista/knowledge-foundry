import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getPromptTemplate,
    getPromptVersion,
    addPromptVersion,
    type PromptTemplateDetailsDto,
} from "@/features/prompt-templates/api/promptTemplatesApi";

export function CreateVersionPage() {
    const { identifier } = useParams<{ identifier: string }>();
    const navigate = useNavigate();

    const [template, setTemplate] = useState<PromptTemplateDetailsDto | null>(
        null,
    );
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

                    // 2. Fetch the actual text for that version using your new endpoint!
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
            <div className="text-center py-12">Loading previous version...</div>
        );
    if (!template)
        return (
            <div className="text-center py-12 text-red-500">
                Template not found.
            </div>
        );

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <button
                onClick={() => navigate(`/templates/${identifier}`)}
                className="text-blue-600 hover:underline mb-6 flex items-center gap-2"
            >
                &larr; Back to {template.name}
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Create New Version
                </h1>
                <p className="text-gray-500 mt-2">
                    Editing a copy of the latest version. Saving will create a
                    new <strong>Draft</strong>.
                </p>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
                    {error}
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 space-y-6"
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        System Context <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        Instructions guiding the AI. Use {"{VariableName}"} for
                        inputs.
                    </p>
                    <textarea
                        required
                        value={systemContext}
                        onChange={(e) => setSystemContext(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        User Message <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        The actual prompt payload.
                    </p>
                    <textarea
                        required
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        rows={8}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                    />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => navigate(`/templates/${identifier}`)}
                        className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md mr-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-2 rounded-md font-medium text-white transition-colors ${
                            isSubmitting
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {isSubmitting ? "Saving..." : "Save New Version"}
                    </button>
                </div>
            </form>
        </div>
    );
}
