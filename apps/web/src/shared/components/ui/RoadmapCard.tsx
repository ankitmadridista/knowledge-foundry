interface RoadmapCardProps {
    title: string;
    description: string;
    status: "completed" | "in-progress" | "planned";
}

const statusStyles = {
    completed: "bg-emerald-500/10 text-emerald-400",
    "in-progress": "bg-yellow-500/10 text-yellow-400",
    planned: "bg-zinc-800 text-zinc-400",
};

const statusText = {
    completed: "Completed",
    "in-progress": "In Progress",
    planned: "Planned",
};

export function RoadmapCard({
    title,
    description,
    status,
}: RoadmapCardProps) {
    return (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                    {title}
                </h3>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}
                >
                    {statusText[status]}
                </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-zinc-400">
                {description}
            </p>
        </div>
    );
}