import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createPromptTemplate,
    addPromptVersion,
    type CreatePromptTemplateRequest,
} from "@/features/prompt-templates/api/promptTemplatesApi";

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

            // Ensure your backend returns the ID of the created template!
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
            setError(
                "Failed to create and activate template. Check console for details.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <button
                onClick={() => navigate("/templates")}
                className="text-blue-600 hover:underline mb-6 flex items-center gap-2"
            >
                &larr; Back to Templates
            </button>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Create New Template
                </h1>
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
                {/* METADATA SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Name *
                        </label>
                        <input
                            required
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Identifier *
                        </label>
                        <input
                            required
                            name="identifier"
                            type="text"
                            value={formData.identifier}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white bg-gray-50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description *
                    </label>
                    <input
                        required
                        name="description"
                        type="text"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tags (comma separated)
                    </label>
                    <input
                        name="tags"
                        type="text"
                        value={formData.tags}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <hr className="border-gray-200 dark:border-gray-700" />

                {/* PROMPT CONTENT SECTION */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        System Context *
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        Instructions guiding the AI. Use {"{VariableName}"} for
                        inputs.
                    </p>
                    <textarea
                        required
                        name="systemContext"
                        value={formData.systemContext}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white font-mono text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        User Message *
                    </label>
                    <textarea
                        required
                        name="userMessage"
                        value={formData.userMessage}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white font-mono text-sm"
                    />
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="button"
                        onClick={() => navigate("/templates")}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md mr-4"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                    >
                        {isSubmitting ? "Creating & Activating..." : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
}
