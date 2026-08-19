import { useState } from "react";
import {
    Button,
    Card,
    Input,
    Label,
    Textarea,
    Text,
} from "@/shared/components/ui";
import type { PromptTemplateSummaryDto } from "@/features/prompt-templates/type";
import type { ContextPackSummaryDto } from "@/features/context-packs/types";
import type { LessonDto } from "@/features/lessons/types";
import type { AiModelDto } from "@/features/prompt-templates/type";

export interface GenerateLessonFormData {
    title: string;
    topic: string;
    audience: string;
    promptTemplateId: string;
    contextPackId: string;
    provider?: number;
    model?: string;
}

interface GenerateLessonFormProps {
    templates: PromptTemplateSummaryDto[];
    contextPacks: ContextPackSummaryDto[];
    availableModels: AiModelDto[];
    initialData?: LessonDto | null;
    onSubmit: (data: GenerateLessonFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export function GenerateLessonForm({
    templates,
    contextPacks,
    availableModels,
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
}: GenerateLessonFormProps) {
    // --- UPDATED: Initial state pulls provider and model from the remix data! ---
    const [formData, setFormData] = useState<GenerateLessonFormData>({
        title: initialData?.title ? `${initialData.title} (Remix)` : "",
        topic: initialData?.topic || "",
        audience: initialData?.audience || "8th Grade Students",
        promptTemplateId: initialData?.promptTemplateId || "",
        contextPackId: initialData?.contextPackId || "",
        provider: initialData?.provider ?? undefined, // <-- NEW
        model: initialData?.model ?? undefined, // <-- NEW
    });

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        const { name, value } = e.target;

        if (name === "provider") {
            if (value === "") {
                setFormData((prev) => ({
                    ...prev,
                    provider: undefined,
                    model: undefined,
                }));
            } else {
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
            }
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const providers = Array.from(
        new Map(
            availableModels.map((m) => [m.providerId, m.providerName]),
        ).entries(),
    ).map(([id, name]) => ({ id, name }));

    const modelsForCurrentProvider = availableModels.filter(
        (m) => m.providerId === formData.provider,
    );

    const selectClasses =
        "flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <Card className="p-6 md:p-8 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>Lesson Title *</Label>
                        <Input
                            required
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., Introduction to Mars Rovers"
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <Label>Target Audience *</Label>
                        <Input
                            required
                            name="audience"
                            value={formData.audience}
                            onChange={handleChange}
                            placeholder="e.g., 8th Grade Science Students"
                            disabled={isSubmitting}
                        />
                    </div>
                </div>

                <div>
                    <Label>Lesson Topic *</Label>
                    <Text className="text-xs text-zinc-500 mb-3">
                        Describe exactly what the AI should teach in this
                        lesson.
                    </Text>
                    <Textarea
                        required
                        name="topic"
                        value={formData.topic}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Explain how the Curiosity rover searches for ancient water..."
                        disabled={isSubmitting}
                    />
                </div>

                <hr className="border-zinc-800 my-8" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <Label>AI Persona (Prompt Template) *</Label>
                        <select
                            required
                            name="promptTemplateId"
                            value={formData.promptTemplateId}
                            onChange={handleChange}
                            className={selectClasses}
                            disabled={isSubmitting || templates.length === 0}
                        >
                            <option value="" disabled>
                                Select a Template...
                            </option>
                            {templates.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <Label>Knowledge Base (Context Pack)</Label>
                        <select
                            name="contextPackId"
                            value={formData.contextPackId || ""}
                            onChange={handleChange}
                            className={selectClasses}
                            disabled={isSubmitting || contextPacks.length === 0}
                        >
                            <option value="">
                                None (Rely on AI's general knowledge)
                            </option>
                            {contextPacks.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="mt-4 p-4 rounded-lg border border-zinc-800 bg-zinc-950/40 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                            AI Provider Override (Optional)
                        </label>
                        <select
                            name="provider"
                            value={
                                formData.provider !== undefined
                                    ? formData.provider
                                    : ""
                            }
                            onChange={handleChange}
                            className={selectClasses}
                        >
                            <option value="">(Use Template Default)</option>
                            {providers.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                            Model Override
                        </label>
                        <select
                            name="model"
                            value={formData.model || ""}
                            onChange={handleChange}
                            disabled={formData.provider === undefined}
                            className={selectClasses}
                        >
                            <option value="">(Use Template Default)</option>
                            {modelsForCurrentProvider.map((m) => (
                                <option key={m.modelId} value={m.modelId}>
                                    {m.modelId}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-zinc-800">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting || !formData.promptTemplateId}
                        className={
                            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                        }
                    >
                        {isSubmitting
                            ? "Generating Lesson (This takes ~20s)..."
                            : initialData
                              ? "Generate Remix"
                              : "Generate Lesson"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
