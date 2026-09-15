export interface Technology {
    name: string;
    category: string;
}

export const technologies: Technology[] = [
    { name: ".NET 9", category: "Backend" },
    { name: "React 19", category: "Frontend" },
    { name: "TypeScript / C#", category: "Language" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "PostgreSQL / pgvector", category: "Database" },
    { name: "Entity Framework", category: "Data Access" },
    { name: "MediatR (CQRS)", category: "Architecture" },
    { name: "Clerk", category: "Authentication" },
    { name: "Neon / Docker", category: "Infrastructure" }, 
    { name: "Gemini / Groq / OpenRouter", category: "AI Providers" }
];