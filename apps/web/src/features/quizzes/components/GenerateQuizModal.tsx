import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    Modal,
    Label,
    AsyncSelect,
    Select,
    NumberStepper,
} from "@/shared/components/ui";
import type { AsyncSelectItem } from "@/shared/components/ui";
import { generateQuiz } from "@/features/quizzes/api";
import { getPromptTemplates } from "@/features/prompt-templates/api";
import toast from "react-hot-toast";

interface GenerateQuizModalProps {
    isOpen: boolean;
    onClose: () => void;
    lessonId: string;
}

export function GenerateQuizModal({
    isOpen,
    onClose,
    lessonId,
}: GenerateQuizModalProps) {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

    const [formData, setFormData] = useState({
        promptTemplateId: "",
        questionCount: 5,
        quizFormat: "Multiple Choice",
    });

    const handleSelectChange = useCallback((name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (name === "promptTemplateId" && value) {
            setHasAttemptedSubmit(false); // Clear error state once they select something
        }
    }, []);

    const fetchQuizTemplates = useCallback(
        async (search: string): Promise<AsyncSelectItem[]> => {
            const response = await getPromptTemplates(
                1,
                10,
                search,
                undefined,
                3,
            );
            return response.items.map((item) => ({
                value: item.id,
                label: item.name,
            }));
        },
        [],
    );

    const handleSubmit = async () => {
        setHasAttemptedSubmit(true); // Mark that they clicked Generate

        // 1. Client-Side Validation
        if (!formData.promptTemplateId) {
            toast.error("Please select a Quiz Persona to continue.");
            return;
        }

        // 2. Submission
        setIsSubmitting(true);
        try {
            const quizId = await generateQuiz({
                lessonId,
                promptTemplateId: formData.promptTemplateId,
                questionCount: formData.questionCount,
                quizFormat: formData.quizFormat,
            });

            toast.success("Quiz generation started!");
            onClose();
            navigate(`/quizzes/${quizId}`, { state: { fromLesson: true } });
        } catch (err) {
            console.error("Failed to generate quiz:", err);
            toast.error("Failed to start quiz generation. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatOptions = [
        { value: "Multiple Choice", label: "Multiple Choice" },
        { value: "True/False", label: "True / False" },
        { value: "Descriptive (Short Answer)", label: "Descriptive" },
        { value: "Mixed Formats", label: "Mixed Formats" },
    ];

    return (
        <Modal
            isOpen={isOpen}
            onClose={() => !isSubmitting && onClose()}
            title="Generate Assessment"
            description="Create a custom quiz based strictly on this lesson's content."
            primaryActionLabel={
                isSubmitting ? "Starting Engine..." : "Generate Quiz"
            }
            onPrimaryAction={handleSubmit}
            isPrimaryActionLoading={isSubmitting}
            secondaryActionLabel="Cancel"
        >
            <div className="space-y-6 py-2">
                <div
                    className={`transition-colors p-2 -mx-2 rounded-lg ${hasAttemptedSubmit && !formData.promptTemplateId ? "bg-rose-500/10 border border-rose-500/30" : "border border-transparent"}`}
                >
                    <AsyncSelect
                        name="promptTemplateId"
                        label="Quiz Persona (Template)"
                        value={formData.promptTemplateId}
                        onChange={handleSelectChange}
                        fetchData={fetchQuizTemplates}
                        placeholder="Search quiz templates..."
                        required
                        disabled={isSubmitting}
                    />
                    {hasAttemptedSubmit && !formData.promptTemplateId && (
                        <p className="text-xs text-rose-400 mt-2 ml-1 animate-in slide-in-from-top-1">
                            ↑ A Quiz Persona is required.
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <Label className="block mb-1 text-xs font-medium text-zinc-400">
                            Question Count *
                        </Label>
                        <NumberStepper
                            value={formData.questionCount}
                            onChange={(val) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    questionCount: val,
                                }))
                            }
                            min={1}
                            max={20}
                            disabled={isSubmitting}
                        />
                    </div>
                    <div>
                        <Select
                            name="quizFormat"
                            label="Format / Style *"
                            value={formData.quizFormat}
                            onChange={handleSelectChange}
                            options={formatOptions}
                            disabled={isSubmitting}
                        />
                    </div>
                </div>
            </div>
        </Modal>
    );
}
