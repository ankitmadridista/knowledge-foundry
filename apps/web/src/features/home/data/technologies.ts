export interface Technology {
    name: string;
    category: string;
}

export const technologies: Technology[] = [
    { name: ".NET 9", category: "Backend" },
    { name: "React 19", category: "Frontend" },
    { name: "TypeScript", category: "Language" },
    { name: "Tailwind CSS", category: "Styling" },
    { name: "PostgreSQL", category: "Database" },
    { name: "Entity Framework", category: "Data Access" },
    { name: "Docker", category: "Infrastructure" },    
    { name: "Gemini / Groq", category: "AI Providers" }
];