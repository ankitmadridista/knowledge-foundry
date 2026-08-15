import { useState } from "react";
import {
    Button,
    Card,
    Input,
    Label,
    Textarea,
    Heading,
    Text,
} from "@/shared/components/ui";

export interface CreateContextPackFormData {
    name: string;
    identifier: string;
    description: string;
    tags: string;
    sectionTitle: string;
    sectionContent: string;
}

interface CreateContextPackFormProps {
    onSubmit: (data: CreateContextPackFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export function CreateContextPackForm({
    onSubmit,
    onCancel,
    isSubmitting,
}: CreateContextPackFormProps) {
    const [formData, setFormData] = useState<CreateContextPackFormData>({
        name: "",
        identifier: "",
        description: "",
        tags: "",
        sectionTitle: "Overview",
        sectionContent: "",
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
                            placeholder="e.g., Grade 10 Math Guidelines"
                        />
                    </div>
                    <div>
                        <Label>Identifier *</Label>
                        <Input
                            required
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            placeholder="GRADE-10-MATH"
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
                        placeholder="What knowledge does this pack contain?"
                    />
                </div>

                <div>
                    <Label>Tags (comma separated)</Label>
                    <Input
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="e.g., curriculum, math, standard"
                    />
                </div>

                <hr className="border-zinc-800 my-8" />

                {/* VERSION 1 KNOWLEDGE SECTION */}
                <div className="mb-4">
                    <Heading className="text-xl">
                        Initial Knowledge Content
                    </Heading>
                    <Text className="text-sm text-zinc-400 mt-1">
                        You can add more sections to this version later.
                        Formatting supports Markdown.
                    </Text>
                </div>

                <div>
                    <Label>Section Title *</Label>
                    <Input
                        required
                        name="sectionTitle"
                        value={formData.sectionTitle}
                        onChange={handleChange}
                        placeholder="e.g., Algebraic Equations"
                    />
                </div>

                <div>
                    <Label>Section Content (Markdown) *</Label>
                    <Textarea
                        required
                        name="sectionContent"
                        value={formData.sectionContent}
                        onChange={handleChange}
                        rows={8}
                        className="font-mono text-sm"
                        placeholder="Enter your structured knowledge here..."
                    />
                </div>

                {/* ACTIONS */}
                <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-zinc-800">
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
                        {isSubmitting ? "Saving..." : "Save Context Pack"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
