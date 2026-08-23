import { useState } from "react";
import {
    Button,
    Card,
    Input,
    Label,
    Textarea,
    Text,
} from "@/shared/components/ui";
import type { AiModelDto, CreatePromptTemplateFormData } from "@/features/prompt-templates/type";

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
        <Card className="p-6 md:p-8">
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
                        placeholder="e.g., classification, extraction, ai"
                    />
                </div>

                <hr className="border-zinc-800 my-8" />

                <div>
                    <Label>System Context *</Label>
                    <Text className="text-xs text-zinc-500 mb-3">
                        Instructions guiding the AI. Use {"{VariableName}"} for
                        inputs.
                    </Text>
                    <Textarea
                        required
                        name="systemContext"
                        value={formData.systemContext}
                        onChange={handleChange}
                        rows={3}
                        className="font-mono text-sm"
                    />
                </div>

                <div>
                    <Label>User Message *</Label>
                    <Textarea
                        required
                        name="userMessage"
                        value={formData.userMessage}
                        onChange={handleChange}
                        rows={5}
                        className="font-mono text-sm"
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-zinc-800">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
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
