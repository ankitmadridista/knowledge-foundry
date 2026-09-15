import { Card, Text } from "@/shared/components/ui";
import type { PromptTemplateSummaryDto } from "@/features/prompt-templates/type";

interface PromptTemplateCardProps {
    template: PromptTemplateSummaryDto;
    onClick: () => void;
}

const PURPOSE_CONFIG: Record<number, { label: string; colorClass: string }> = {
    0: { label: "Generator", colorClass: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    1: { label: "Question Gen", colorClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    2: { label: "Evaluation", colorClass: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
    3: { label: "Summarization", colorClass: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    4: { label: "Reflection", colorClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" },
    5: { label: "Translation", colorClass: "bg-rose-500/10 text-rose-400 border-rose-500/20" },
    6: { label: "Critic", colorClass: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function PromptTemplateCard({
    template,
    onClick,
}: PromptTemplateCardProps) {
    const purpose = PURPOSE_CONFIG[template.purpose] || {
        label: "Unknown",
        colorClass: "bg-zinc-800 text-zinc-400 border-zinc-700",
    };

    return (
        <Card
            className="flex flex-col h-full p-6 transition-colors hover:border-indigo-500/30 cursor-pointer"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                    {template.identifier}
                </span>
                
                <span 
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded border ${purpose.colorClass}`}
                >
                    {purpose.label}
                </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-100 mb-2">
                {template.name}
            </h3>

            <Text className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1">
                {template.description || "No description provided."}
            </Text>

            {/* Tags Footer */}
            {template.tags && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-800">
                    {template.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md"
                        >
                            {tag}
                        </span>
                    ))}
                    {template.tags.length > 3 && (
                        <span className="text-xs text-zinc-500 px-2 py-1">
                            +{template.tags.length - 3}
                        </span>
                    )}
                </div>
            )}
        </Card>
    );
}