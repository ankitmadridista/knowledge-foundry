import { Heading, Text } from "@/shared/components/ui";
import type { ContextPackDto } from "@/features/context-packs/types";

interface ContextPackHeaderProps {
    pack: ContextPackDto;
}

export function ContextPackHeader({ pack }: ContextPackHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start mb-10 gap-6">
            <div>
                <Heading className="flex items-center gap-4 flex-wrap">
                    {pack.name}
                    <span className="text-sm font-mono bg-zinc-800 text-zinc-400 px-2 py-1 rounded-md border border-zinc-700">
                        {pack.identifier}
                    </span>
                </Heading>
                <Text className="text-zinc-400 mt-3 max-w-2xl">
                    {pack.description}
                </Text>

                {/* Tags Footer */}
                {pack.tags && pack.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {pack.tags.map((tag) => (
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
        </div>
    );
}
