interface WorkflowStepProps {
    step: number;
    title: string;
    description: string;
}

export function WorkflowStep({
    step,
    title,
    description,
}: WorkflowStepProps) {
    return (
        <div className="relative rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="absolute -top-4 left-6 flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {step}
            </div>

            <h3 className="mt-4 text-lg font-semibold text-white">
                {title}
            </h3>

            <p className="mt-3 text-sm leading-6 text-zinc-400">
                {description}
            </p>
        </div>
    );
}