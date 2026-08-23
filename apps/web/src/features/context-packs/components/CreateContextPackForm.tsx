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
import type { CreateContextPackFormData } from "../types";

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
        sections: [{ title: "Overview", content: "" }], // Initialize with one section
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

    // --- Dynamic Section Handlers ---
    const handleAddSection = () => {
        setFormData((prev) => ({
            ...prev,
            sections: [...prev.sections, { title: "", content: "" }],
        }));
    };

    const handleRemoveSection = (indexToRemove: number) => {
        setFormData((prev) => ({
            ...prev,
            sections: prev.sections.filter(
                (_, index) => index !== indexToRemove,
            ),
        }));
    };

    const handleSectionChange = (
        index: number,
        field: "title" | "content",
        value: string,
    ) => {
        setFormData((prev) => {
            const newSections = [...prev.sections];
            newSections[index][field] = value;
            return { ...prev, sections: newSections };
        });
    };
    // --------------------------------

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* METADATA CARD */}
            <Card className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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

                <div className="mb-6">
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
            </Card>

            {/* SECTIONS HEADER */}
            <div className="mt-8 mb-4 px-2">
                <Heading className="text-xl">Initial Knowledge Content</Heading>
                <Text className="text-sm text-zinc-400 mt-1">
                    Add the core sections for Version 1 of this Context Pack.
                    Formatting supports Markdown.
                </Text>
            </div>

            {/* DYNAMIC SECTIONS CARDS */}
            {formData.sections.map((section, index) => (
                <Card key={index} className="p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                        <Heading className="text-lg">
                            Section {index + 1}
                        </Heading>
                        {formData.sections.length > 1 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveSection(index)}
                                className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors"
                            >
                                Remove
                            </button>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <Label>Section Title *</Label>
                            <Input
                                required
                                value={section.title}
                                onChange={(e) =>
                                    handleSectionChange(
                                        index,
                                        "title",
                                        e.target.value,
                                    )
                                }
                                placeholder="e.g., Core Principles"
                            />
                        </div>
                        <div>
                            <Label>Content (Markdown) *</Label>
                            <Textarea
                                required
                                value={section.content}
                                onChange={(e) =>
                                    handleSectionChange(
                                        index,
                                        "content",
                                        e.target.value,
                                    )
                                }
                                rows={8}
                                className="font-mono text-sm"
                                placeholder="Enter markdown content here..."
                            />
                        </div>
                    </div>
                </Card>
            ))}

            {/* ADD SECTION BUTTON */}
            <Button
                type="button"
                variant="secondary"
                onClick={handleAddSection}
                className="w-full border-dashed border-zinc-700 hover:border-zinc-500 py-6 text-zinc-400 hover:text-zinc-200"
            >
                + Add Another Section
            </Button>

            {/* ACTIONS */}
            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-zinc-800">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || formData.sections.length === 0}
                    className={
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }
                >
                    {isSubmitting ? "Saving..." : "Save Context Pack"}
                </Button>
            </div>
        </form>
    );
}
