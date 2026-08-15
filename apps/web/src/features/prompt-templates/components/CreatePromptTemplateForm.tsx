import { useState } from "react";
import {
    Button,
    Card,
    Input,
    Label,
    Textarea,
    Text,
} from "@/shared/components/ui";

export interface CreatePromptTemplateFormData {
    name: string;
    identifier: string;
    description: string;
    tags: string;
    systemContext: string;
    userMessage: string;
}

interface CreatePromptTemplateFormProps {
    onSubmit: (data: CreatePromptTemplateFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export function CreatePromptTemplateForm({
    onSubmit,
    onCancel,
    isSubmitting,
}: CreatePromptTemplateFormProps) {
    const [formData, setFormData] = useState<CreatePromptTemplateFormData>({
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
            // Auto-generate a clean identifier
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* METADATA SECTION */}
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

                {/* PROMPT CONTENT SECTION */}
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

                {/* ACTIONS */}
                <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-zinc-800">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={
                            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                        }
                    >
                        {isSubmitting ? "Saving..." : "Save Template"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
