export interface Technology {
    name: string;
    category: string;
}

export const technologies: Technology[] = [
    { name: ".NET 9", category: "Backend" },
    { name: "React 19", category: "Frontend" },
    { name: "TypeScript", category: "Language" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "GraphQL", category: "API" },
    { name: "PostgreSQL", category: "Database" },
    { name: "Gemini", category: "AI" },
    { name: "Docker", category: "Infrastructure" }
];