import { Label, Textarea, Button, Card, Text } from "@/shared/components/ui";

interface PromptExecutionFormProps {
    variableNames: string[];
    variableValues: Record<string, string>;
    onVariableChange: (name: string, value: string) => void;
    onExecute: () => void;
    isExecuting: boolean;
}

export function PromptExecutionForm({
    variableNames,
    variableValues,
    onVariableChange,
    onExecute,
    isExecuting,
}: PromptExecutionFormProps) {
    return (
        <Card className="p-6 md:p-8 flex flex-col h-full">
            <h2 className="text-xl font-bold text-zinc-100 mb-6 border-b border-zinc-800 pb-4">
                Variables
            </h2>

            {variableNames.length === 0 ? (
                <Text className="text-zinc-500 italic mb-6 flex-1">
                    This template does not require any variables.
                </Text>
            ) : (
                <div className="space-y-6 mb-8 flex-1">
                    {variableNames.map((varName) => (
                        <div key={varName}>
                            <Label>{varName}</Label>
                            <Textarea
                                rows={5}
                                className="font-mono text-sm"
                                placeholder={`Enter ${varName}...`}
                                value={variableValues[varName] || ""}
                                onChange={(e) =>
                                    onVariableChange(varName, e.target.value)
                                }
                            />
                        </div>
                    ))}
                </div>
            )}

            <Button
                onClick={onExecute}
                disabled={isExecuting}
                className={`w-full justify-center mt-auto ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                {isExecuting ? "Generating..." : "Execute Prompt"}
            </Button>
        </Card>
    );
}
