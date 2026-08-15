import { useState } from "react";
import { Button, Card, Label, Textarea, Text } from "@/shared/components/ui";

export interface PromptVersionFormData {
    systemContext: string;
    userMessage: string;
}

interface PromptVersionFormProps {
    initialSystemContext?: string;
    initialUserMessage?: string;
    onSubmit: (data: PromptVersionFormData) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export function PromptVersionForm({
    initialSystemContext = "",
    initialUserMessage = "",
    onSubmit,
    onCancel,
    isSubmitting,
}: PromptVersionFormProps) {
    const [systemContext, setSystemContext] = useState(initialSystemContext);
    const [userMessage, setUserMessage] = useState(initialUserMessage);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ systemContext, userMessage });
    };

    return (
        <Card className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label>System Context *</Label>
                    <Text className="text-xs text-zinc-500 mb-3">
                        Instructions guiding the AI. Use {"{VariableName}"} for
                        inputs.
                    </Text>
                    <Textarea
                        required
                        value={systemContext}
                        onChange={(e) => setSystemContext(e.target.value)}
                        rows={4}
                        className="font-mono text-sm"
                    />
                </div>

                <div>
                    <Label>User Message *</Label>
                    <Text className="text-xs text-zinc-500 mb-3">
                        The actual prompt payload.
                    </Text>
                    <Textarea
                        required
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        rows={8}
                        className="font-mono text-sm"
                    />
                </div>

                {/* Actions */}
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
                        {isSubmitting ? "Saving..." : "Save New Version"}
                    </Button>
                </div>
            </form>
        </Card>
    );
}
