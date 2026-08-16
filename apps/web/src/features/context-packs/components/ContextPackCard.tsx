import { Card, Text } from "@/shared/components/ui";
import type { ContextPackSummaryDto } from "@/features/context-packs/api";

interface ContextPackCardProps {
    pack: ContextPackSummaryDto;
    onClick: () => void;
}

export function ContextPackCard({ pack, onClick }: ContextPackCardProps) {
    return (
        <Card
            className="flex flex-col h-full p-6 transition-colors hover:border-indigo-500/30 cursor-pointer"
            onClick={onClick}
        >
            <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                    {pack.identifier}
                </span>
            </div>

            <h3 className="text-lg font-bold text-zinc-100 mb-2">
                {pack.name}
            </h3>

            <Text className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1">
                {pack.description || "No description provided."}
            </Text>

            {/* Tags Footer */}
            {pack.tags && pack.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-zinc-800">
                    {pack.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="text-xs text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-md"
                        >
                            {tag}
                        </span>
                    ))}
                    {pack.tags.length > 3 && (
                        <span className="text-xs text-zinc-500 px-2 py-1">
                            +{pack.tags.length - 3}
                        </span>
                    )}
                </div>
            )}
        </Card>
    );
}