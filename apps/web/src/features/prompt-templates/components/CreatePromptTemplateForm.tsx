import { useState } from "react";
import {
    Button,
    Card,
    Input,
    Label,
    Textarea,
    Text,
} from "@/shared/components/ui";
import type {
    AiModelDto,
    CreatePromptTemplateFormData,
} from "@/features/prompt-templates/type";

interface CreatePromptTemplateFormProps {
    availableModels: AiModelDto[];
    onSubmit: (data: CreatePromptTemplateFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export function CreatePromptTemplateForm({
    availableModels,
    onSubmit,
    onCancel,
    isSubmitting,
}: CreatePromptTemplateFormProps) {
    // Extract unique providers for the first dropdown
    const providers = Array.from(
        new Map(
            availableModels.map((m) => [m.providerId, m.providerName]),
        ).entries(),
    ).map(([id, name]) => ({ id, name }));

    const defaultProvider = providers.length > 0 ? providers[0].id : 0;
    const defaultModels = availableModels.filter(
        (m) => m.providerId === defaultProvider,
    );
    const defaultModelId =
        defaultModels.length > 0 ? defaultModels[0].modelId : "";

    const [formData, setFormData] = useState<CreatePromptTemplateFormData>({
        name: "",
        identifier: "",
        description: "",
        tags: "",
        provider: defaultProvider,
        model: defaultModelId,
        systemContext: "You are a helpful AI assistant.",
        userMessage: "",
    });

    // Derive the list of models to show based on the CURRENTLY selected provider
    const modelsForCurrentProvider = availableModels.filter(
        (m) => m.providerId === formData.provider,
    );

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
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
        } else if (name === "provider") {
            // When provider changes, automatically select the first model of that new provider
            const newProviderInt = parseInt(value, 10);
            const newProviderModels = availableModels.filter(
                (m) => m.providerId === newProviderInt,
            );

            setFormData((prev) => ({
                ...prev,
                provider: newProviderInt,
                model:
                    newProviderModels.length > 0
                        ? newProviderModels[0].modelId
                        : "",
            }));
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Card className="p-6 md:p-8 border-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.03)]">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>Name *</Label>
                        <Input
                            required
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Sentiment Analyzer"
                        />
                    </div>
                    <div>
                        <Label>Identifier *</Label>
                        <Input
                            required
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            placeholder="SENTIMENT-ANALYZER"
                        />
                    </div>
                </div>

                <div>
                    <Label>Description *</Label>
                    <Input
                        required
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="What does this prompt do?"
                    />
                </div>

                {/* --- DYNAMIC DROPDOWNS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>AI Provider *</Label>
                        <select
                            name="provider"
                            value={formData.provider}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            {providers.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label>Target Model *</Label>
                        <select
                            name="model"
                            value={formData.model}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            {modelsForCurrentProvider.map((m) => (
                                <option key={m.modelId} value={m.modelId}>
                                    {m.modelId}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <Label>Tags (comma separated)</Label>
                    <Input
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="e.g., actor, critic, extraction, ai"
                    />
                </div>

                <hr className="border-zinc-800 my-8" />

                <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-lg p-4 mb-6">
                    <h4 className="text-sm font-semibold text-indigo-300 mb-2 flex items-center gap-2">
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        System Variables Guide
                    </h4>
                    <p className="text-xs text-zinc-300 mb-3">
                        The Generation Engine automatically injects data into
                        these exact placeholders. Use them in your prompts below
                        to connect this template to the rest of the application:
                    </p>
                    <ul className="text-xs text-zinc-400 space-y-1.5 list-disc list-inside ml-2">
                        <li>
                            <code className="text-indigo-200 bg-indigo-950/50 px-1.5 py-0.5 rounded font-mono">{`{Topic}`}</code>{" "}
                            - The specific subject matter requested by the user.
                        </li>
                        <li>
                            <code className="text-indigo-200 bg-indigo-950/50 px-1.5 py-0.5 rounded font-mono">{`{Audience}`}</code>{" "}
                            - The target demographic for the output.
                        </li>
                        <li>
                            <code className="text-indigo-200 bg-indigo-950/50 px-1.5 py-0.5 rounded font-mono">{`{Context}`}</code>{" "}
                            - The text content of the selected Knowledge Base.
                        </li>
                        <li>
                            <code className="text-indigo-200 bg-indigo-950/50 px-1.5 py-0.5 rounded font-mono">{`{Draft}`}</code>{" "}
                            - <i>(Critics Only)</i> The initial draft generated
                            by the Actor model.
                        </li>
                    </ul>
                </div>

                <div>
                    <Label>System Context *</Label>
                    <Text className="text-xs text-zinc-500 mb-3">
                        Core instructions guiding the AI's behavior and
                        constraints.
                    </Text>
                    <Textarea
                        required
                        name="systemContext"
                        value={formData.systemContext}
                        onChange={handleChange}
                        rows={4}
                        className="font-mono text-sm leading-relaxed"
                    />
                </div>

                <div>
                    <Label>User Message *</Label>
                    <Text className="text-xs text-zinc-500 mb-3">
                        The prompt template containing your System Variables.
                    </Text>
                    <Textarea
                        required
                        name="userMessage"
                        value={formData.userMessage}
                        onChange={handleChange}
                        rows={6}
                        className="font-mono text-sm leading-relaxed"
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-zinc-800">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Saving..." : "Save Template"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
