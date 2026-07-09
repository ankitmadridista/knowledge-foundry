interface TechnologyCardProps {
    name: string;
    category: string;
}

export function TechnologyCard({
    name,
    category,
}: TechnologyCardProps) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-5 text-center transition hover:border-indigo-500/40 hover:-translate-y-1">
            <p className="text-lg font-semibold text-white">
                {name}
            </p>

            <p className="mt-2 text-sm text-zinc-500">
                {category}
            </p>
        </div>
    );
}