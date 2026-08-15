import { Badge, Button, Heading, Text, Card } from "@/shared/components/ui";
import { Container, Section } from "@/shared/components/layout";
import { useNavigate } from "react-router-dom";

export function HeroSection() {
    const navigate = useNavigate();

    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-5xl text-center">
                    <Badge variant="brand">AI Engineering Project</Badge>

                    <Heading className="mt-8 text-4xl sm:text-5xl lg:text-6xl">
                        Forge Better Learning with AI
                    </Heading>

                    <Text className="mt-8 max-w-2xl mx-auto text-lg">
                        Knowledge Foundry is an AI-powered platform that
                        generates, evaluates, and continuously improves
                        educational content using modern AI engineering
                        practices.
                    </Text>

                    {/* GitHub Button */}
                    <div className="mt-10 flex justify-center">
                        <Button
                            variant="secondary"
                            onClick={() =>
                                window.open(
                                    "https://github.com/ankitmadridista/knowledge-foundry",
                                    "_blank",
                                )
                            }
                        >
                            View Source on GitHub
                        </Button>
                    </div>

                    {/* --- NEW: Platform Entry Portal --- */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                        {/* Entry 1: Prompt Library */}
                        <Card
                            className="p-8 hover:border-indigo-500/50 cursor-pointer transition-all hover:-translate-y-1 bg-zinc-900/50"
                            onClick={() => navigate("/templates")}
                        >
                            <div className="h-12 w-12 bg-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center mb-6 text-2xl">
                                ⚡
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-3">
                                Prompt Library
                            </h3>
                            <Text className="text-zinc-400 mb-6">
                                Design, version, and test highly constrained
                                system prompts. Map variables and execute
                                directly against LLMs.
                            </Text>
                            <span className="text-indigo-400 font-medium text-sm group-hover:text-indigo-300">
                                Launch Prompt Library &rarr;
                            </span>
                        </Card>

                        {/* Entry 2: Context Packs (Knowledge Base) */}
                        <Card
                            className="p-8 hover:border-emerald-500/50 cursor-pointer transition-all hover:-translate-y-1 bg-zinc-900/50"
                            onClick={() => navigate("/context-packs")}
                        >
                            <div className="h-12 w-12 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center mb-6 text-2xl">
                                📚
                            </div>
                            <h3 className="text-xl font-bold text-zinc-100 mb-3">
                                Context Packs
                            </h3>
                            <Text className="text-zinc-400 mb-6">
                                Manage dynamic knowledge bases and curriculums.
                                Inject robust Markdown payloads directly into
                                your Prompts.
                            </Text>
                            <span className="text-emerald-400 font-medium text-sm group-hover:text-emerald-300">
                                Launch Context Packs &rarr;
                            </span>
                        </Card>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
