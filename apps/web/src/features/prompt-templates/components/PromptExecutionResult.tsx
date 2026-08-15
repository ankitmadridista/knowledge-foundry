import { Card, Text, Badge, MarkdownRenderer } from "@/shared/components/ui";
import type { ExecuteTemplateResponse } from "@/features/prompt-templates/api/promptTemplatesApi";

interface PromptExecutionResultProps {
    result: ExecuteTemplateResponse | null;
}

export function PromptExecutionResult({ result }: PromptExecutionResultProps) {
    return (
        <Card className="p-6 md:p-8 min-h-125 flex flex-col h-full">
            <h2 className="text-xl font-bold text-zinc-100 mb-6 border-b border-zinc-800 pb-4">
                AI Output
            </h2>

            {result ? (
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Markdown Container */}
                    <div className="flex-1 bg-zinc-950/50 rounded-xl border border-zinc-800 p-6 overflow-y-auto">
                        <MarkdownRenderer content={result.response} />
                    </div>

                    {/* Telemetry Footer */}
                    <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-zinc-800 shrink-0">
                        <Badge variant="neutral">
                            Model:{" "}
                            <span className="text-zinc-100 ml-1">
                                {result.model}
                            </span>
                        </Badge>
                        <Badge variant="neutral">
                            Tokens:{" "}
                            <span className="text-zinc-100 ml-1">
                                {result.tokensUsed}
                            </span>
                        </Badge>
                        <Badge variant="neutral">
                            Time:{" "}
                            <span className="text-zinc-100 ml-1">
                                {result.executionTimeMs}ms
                            </span>
                        </Badge>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
                    <Text className="text-zinc-500">
                        Waiting for execution...
                    </Text>
                </div>
            )}
        </Card>
    );
}
