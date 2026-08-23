import { useCallback, useState } from "react";
import {
    Button,
    Card,
    Input,
    Label,
    Textarea,
    Text,
    type AsyncSelectItem,
    AsyncSelect,
} from "@/shared/components/ui";
import type {
    GenerateLessonFormData,
    LessonDto,
} from "@/features/lessons/types";
import type { AiModelDto } from "@/features/prompt-templates/type";
import { getPromptTemplates } from "@/features/prompt-templates/api";
import { getContextPacks } from "@/features/context-packs/api";

interface GenerateLessonFormProps {
    availableModels: AiModelDto[];
    initialData?: LessonDto | null;
    onSubmit: (data: GenerateLessonFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

function generateRemixTitle(originalTitle?: string): string {
    if (!originalTitle) return "";

    // Clean up any old legacy naming conventions
    const cleanTitle = originalTitle.replace(/\s*\(Remix\)\s*/g, "");

    // Look for " v" followed by a number at the end of the string
    const match = cleanTitle.match(/ v(\d+)$/);

    if (match) {
        const currentVersion = parseInt(match[1], 10);
        return cleanTitle.replace(/ v\d+$/, ` v${currentVersion + 1}`);
    } else {
        return `${cleanTitle} v2`;
    }
}

export function GenerateLessonForm({
    availableModels,
    initialData,
    onSubmit,
    onCancel,
    isSubmitting,
}: GenerateLessonFormProps) {
    const [formData, setFormData] = useState<GenerateLessonFormData>({
        title: initialData?.title ? generateRemixTitle(initialData.title) : "",
        topic: initialData?.topic || "",
        audience: initialData?.audience || "8th Grade Students",
        promptTemplateId: initialData?.promptTemplateId || "",
        contextPackId: initialData?.contextPackId || "",
        provider: initialData?.provider ?? undefined,
        model: initialData?.model ?? undefined,
        criticPromptTemplateId: initialData?.criticPromptTemplateId || "",
        criticProvider: undefined,
        criticModel: undefined,
    });

    const handleSelectChange = useCallback((name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

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
        } else if (name === "criticProvider") {
            if (value === "") {
                setFormData((prev) => ({
                    ...prev,
                    criticProvider: undefined,
                    criticModel: undefined,
                }));
            } else {
                const newProviderInt = parseInt(value, 10);
                const newProviderModels = availableModels.filter(
                    (m) => m.providerId === newProviderInt,
                );
                setFormData((prev) => ({
                    ...prev,
                    criticProvider: newProviderInt,
                    criticModel:
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

    const fetchTemplates = useCallback(
        async (search: string): Promise<AsyncSelectItem[]> => {
            const response = await getPromptTemplates(1, 10, search);
            return response.items.map((item) => ({
                value: item.id,
                label: item.name,
            }));
        },
        [],
    );

    const fetchContextPacks = useCallback(
        async (search: string): Promise<AsyncSelectItem[]> => {
            const response = await getContextPacks(1, 10, search);
            return response.items.map((item) => ({
                value: item.id,
                label: item.name,
            }));
        },
        [],
    );

    const providers = Array.from(
        new Map(
            (availableModels || []).map((m) => [m.providerId, m.providerName]),
        ).entries(),
    ).map(([id, name]) => ({ id, name }));

    const modelsForCurrentProvider = (availableModels || []).filter(
        (m) => m.providerId === formData.provider,
    );

    const modelsForCriticProvider = (availableModels || []).filter(
        (m) => m.providerId === formData.criticProvider,
    );

    const selectClasses =
        "flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm ring-offset-zinc-950 placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50";

    return (
        <Card className="p-6 md:p-8 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* --- TITLE & AUDIENCE --- */}
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

                {/* --- TOPIC --- */}
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

                {/* --- ACTOR TEMPLATE & CONTEXT PACK --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AsyncSelect
                        name="promptTemplateId"
                        label="AI Persona (Prompt Template)"
                        value={formData.promptTemplateId}
                        onChange={handleSelectChange}
                        fetchData={fetchTemplates}
                        placeholder="Search templates..."
                        required
                        disabled={isSubmitting}
                        initialLabel={
                            initialData ? "Original Template Selected" : ""
                        }
                    />

                    <AsyncSelect
                        name="contextPackId"
                        label="Knowledge Base (Context Pack)"
                        value={formData.contextPackId || ""}
                        onChange={handleSelectChange}
                        fetchData={fetchContextPacks}
                        placeholder="Search context packs... (Optional)"
                        disabled={isSubmitting}
                        initialLabel={
                            initialData?.contextPackId
                                ? "Original Pack Selected"
                                : ""
                        }
                    />
                </div>

                {/* --- ACTOR MODEL OVERRIDES --- */}
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
                            {formData.provider === undefined ? (
                                <option value="">(Use Template Default)</option>
                            ) : (
                                modelsForCurrentProvider.map((m) => (
                                    <option key={m.modelId} value={m.modelId}>
                                        {m.modelId}
                                    </option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                <hr className="border-zinc-800 my-8" />

                {/* --- NEW: CRITIC SELECTION --- */}
                <div>
                    <AsyncSelect
                        name="criticPromptTemplateId"
                        label="Iterative Reflection (Optional)"
                        description="Select a Critic Persona to review the initial draft and enforce rules. The Actor will rewrite the lesson based on the Critic's feedback."
                        value={formData.criticPromptTemplateId || ""}
                        onChange={handleSelectChange}
                        fetchData={fetchTemplates}
                        placeholder="Search for a Critic..."
                        disabled={isSubmitting}
                        initialLabel={
                            initialData?.criticPromptTemplateId
                                ? "Original Critic Selected"
                                : ""
                        }
                    />

                    {formData.criticPromptTemplateId && (
                        <div className="mt-4 p-4 rounded-lg border border-zinc-800/80 bg-indigo-950/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* ... (Keep the critic provider/model <select> blocks exactly as they were) ... */}
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Critic AI Provider
                                </label>
                                <select
                                    name="criticProvider"
                                    value={
                                        formData.criticProvider !== undefined
                                            ? formData.criticProvider
                                            : ""
                                    }
                                    onChange={handleChange}
                                    className={selectClasses}
                                >
                                    <option value="">
                                        (Use Template Default)
                                    </option>
                                    {providers.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-zinc-400 mb-1">
                                    Critic Model
                                </label>
                                <select
                                    name="criticModel"
                                    value={formData.criticModel || ""}
                                    onChange={handleChange}
                                    disabled={
                                        formData.criticProvider === undefined
                                    }
                                    className={selectClasses}
                                >
                                    {formData.criticProvider === undefined ? (
                                        <option value="">
                                            (Use Template Default)
                                        </option>
                                    ) : (
                                        modelsForCriticProvider.map((m) => (
                                            <option
                                                key={m.modelId}
                                                value={m.modelId}
                                            >
                                                {m.modelId}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                        </div>
                    )}
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
                            ? "Starting Engine..."
                            : initialData
                              ? "Generate Remix"
                              : "Generate Lesson"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
