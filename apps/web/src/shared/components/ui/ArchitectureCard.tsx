interface ArchitectureCardProps {
    title: string;
    description: string;
}

export function ArchitectureCard({
    title,
    description,
}: ArchitectureCardProps) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <h3 className="text-lg font-semibold text-white">
                {title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
                {description}
            </p>
        </div>
    );
}