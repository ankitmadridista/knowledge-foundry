export const PLATFORM_FEATURES = [
    {
        title: "Prompt Library",
        icon: "⚡",
        description: "Design, version, and test highly constrained system prompts. Map variables and execute directly against LLMs.",
        actionText: "Launch Prompt Library \u2192", // \u2192 is the right arrow (→)
        route: "/templates",
        styles: {
            hoverBorder: "hover:border-indigo-500/50",
            iconBg: "bg-indigo-500/20 text-indigo-400",
            actionText: "text-indigo-400 group-hover:text-indigo-300",
        },
    },
    {
        title: "Context Packs",
        icon: "📚",
        description: "Manage dynamic knowledge bases and curriculums. Inject robust Markdown payloads directly into your Prompts.",
        actionText: "Launch Context Packs \u2192",
        route: "/context-packs",
        styles: {
            hoverBorder: "hover:border-emerald-500/50",
            iconBg: "bg-emerald-500/20 text-emerald-400",
            actionText: "text-emerald-400 group-hover:text-emerald-300",
        },
    },
    {
        title: "Lesson Library",
        icon: "🎓",
        description: "Orchestrate AI generation. Combine your Prompts and Context Packs to forge high-quality educational content.",
        actionText: "Launch Lesson Library \u2192",
        route: "/lessons",
        styles: {
            hoverBorder: "hover:border-sky-500/50",
            iconBg: "bg-sky-500/20 text-sky-400",
            actionText: "text-sky-400 group-hover:text-sky-300",
        },
    },
];