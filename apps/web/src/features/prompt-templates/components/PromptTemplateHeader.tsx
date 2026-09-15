import { Heading, Text, Button } from "@/shared/components/ui";
import type { PromptTemplateDetailsDto } from "@/features/prompt-templates/type";

const PURPOSE_CONFIG: Record<number, { label: string; colorClass: string }> = {
    0: { label: "Generator", colorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    1: { label: "Question Gen", colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    2: { label: "Evaluation", colorClass: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    3: { label: "Summarization", colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    4: { label: "Reflection", colorClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    5: { label: "Translation", colorClass: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    6: { label: "Critic", colorClass: "bg-red-500/10 text-red-400 border-red-500/20" },
};

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
    // 2. Resolve the purpose based on the integer
    const purpose = PURPOSE_CONFIG[template.purpose] || {
        label: "Unknown",
        colorClass: "bg-zinc-800 text-zinc-400 border-zinc-700",
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-6">
            <div>
                <Heading className="flex items-center gap-4 flex-wrap">
                    {template.name}
                    {/* Identifier Badge */}
                    <span className="text-sm font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700">
                        {template.identifier}
                    </span>
                    {/* NEW: Purpose Badge (slightly larger text-[12px] than the card to fit the header size) */}
                    <span 
                        className={`text-[12px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${purpose.colorClass}`}
                    >
                        {purpose.label}
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