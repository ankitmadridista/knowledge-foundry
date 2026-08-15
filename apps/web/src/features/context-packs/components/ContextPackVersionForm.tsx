import { useState } from "react";
import {
    Button,
    Card,
    Label,
    Input,
    Textarea,
    Heading,
} from "@/shared/components/ui";

export interface ContextSectionData {
    title: string;
    content: string;
}

interface ContextPackVersionFormProps {
    initialSections?: ContextSectionData[];
    onSubmit: (sections: ContextSectionData[]) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export function ContextPackVersionForm({
    initialSections = [{ title: "", content: "" }],
    onSubmit,
    onCancel,
    isSubmitting,
}: ContextPackVersionFormProps) {
    // Initialize state with the fetched previous version data (or blank if none)
    const [sections, setSections] = useState<ContextSectionData[]>(
        initialSections.length > 0
            ? initialSections
            : [{ title: "", content: "" }],
    );

    const handleAddSection = () => {
        setSections([...sections, { title: "", content: "" }]);
    };

    const handleRemoveSection = (indexToRemove: number) => {
        setSections(sections.filter((_, index) => index !== indexToRemove));
    };

    const handleSectionChange = (
        index: number,
        field: "title" | "content",
        value: string,
    ) => {
        const newSections = [...sections];
        newSections[index][field] = value;
        setSections(newSections);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(sections);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {sections.map((section, index) => (
                <Card key={index} className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <Heading className="text-lg">
                            Section {index + 1}
                        </Heading>
                        {sections.length > 1 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveSection(index)}
                                className="text-xs text-red-400 hover:text-red-300 transition-colors"
                            >
                                Remove Section
                            </button>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label>Title *</Label>
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
                                rows={6}
                                className="font-mono text-sm"
                                placeholder="Enter markdown content here..."
                            />
                        </div>
                    </div>
                </Card>
            ))}

            <Button
                type="button"
                variant="secondary"
                onClick={handleAddSection}
                className="w-full border-dashed border-zinc-700 hover:border-zinc-500"
            >
                + Add Another Section
            </Button>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-zinc-800">
                <Button type="button" variant="secondary" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting || sections.length === 0}
                    className={
                        isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }
                >
                    {isSubmitting ? "Saving..." : "Save New Version"}
                </Button>
            </div>
        </form>
    );
}
