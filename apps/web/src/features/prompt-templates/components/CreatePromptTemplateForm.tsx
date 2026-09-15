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
import { PURPOSE_CONFIG } from "@/features/prompt-templates/utils/purpose";
import { CAPABILITY_CONFIG } from "@/features/prompt-templates/utils/capability";

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
        purpose: 0,
        provider: defaultProvider,
        model: defaultModelId,
        systemContext: "You are a helpful AI assistant.",
        userMessage: "",
        capability: 0,
    });

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
        } else if (name === "purpose" || name === "capability") {
            setFormData((prev) => ({
                ...prev,
                [name]: parseInt(value, 10),
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>Template Purpose *</Label>
                        <select
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            {Object.entries(PURPOSE_CONFIG).map(
                                ([value, config]) => (
                                    <option key={value} value={Number(value)}>
                                        {config.label}
                                    </option>
                                ),
                            )}
                        </select>
                    </div>

                    <div>
                        <Label>Execution Capability *</Label>
                        <select
                            name="capability"
                            value={formData.capability}
                            onChange={handleChange}
                            className="flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            {/* DYNAMICALLY RENDER CAPABILITY OPTIONS */}
                            {Object.entries(CAPABILITY_CONFIG).map(
                                ([value, config]) => (
                                    <option key={value} value={Number(value)}>
                                        {config.label}
                                    </option>
                                ),
                            )}
                        </select>
                        <Text className="text-xs text-zinc-500 mt-1">
                            {
                                CAPABILITY_CONFIG[formData.capability]
                                    ?.description
                            }
                        </Text>
                    </div>
                </div>

                {/* Rest of the form stays identical */}
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

                <div>
                    <Label>System Context *</Label>
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
