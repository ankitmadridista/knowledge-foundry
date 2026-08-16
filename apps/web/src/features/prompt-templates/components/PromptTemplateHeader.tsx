import { Heading, Text, Button } from "@/shared/components/ui";
import type { PromptTemplateDetailsDto } from "@/features/prompt-templates/api";

interface PromptTemplateHeaderProps {
    template: PromptTemplateDetailsDto;
    hasActiveVersion: boolean;
    onExecute: () => void;
}

export function PromptTemplateHeader({
    template,
    hasActiveVersion,
    onExecute,
}: PromptTemplateHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-6">
            <div>
                <Heading className="flex items-center gap-4 flex-wrap">
                    {template.name}
                    <span className="text-sm font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700">
                        {template.identifier}
                    </span>
                </Heading>
                <Text className="text-zinc-400 mt-3 max-w-2xl">
                    {template.description}
                </Text>

                {/* Tags Footer (if available) */}
                {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {template.tags.map((tag) => (
                            <span
                                key={tag}
                                className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {hasActiveVersion && (
                <Button
                    onClick={onExecute}
                    className="shrink-0 shadow-lg shadow-indigo-900/20"
                >
                    &#9654; Execute Prompt
                </Button>
            )}
        </div>
    );
}
