import { Badge, Button, Heading, Text } from "@/shared/components/ui";
import { Container, Section } from "@/shared/components/layout";
import { useNavigate } from "react-router-dom";
import { PLATFORM_FEATURES } from "../data/platform-features";
import { FeatureCard } from "./FeatureCard";

export function HeroSection() {
    const navigate = useNavigate();

    return (
        <Section className="pt-20 pb-16 md:pt-32 md:pb-24">
            <Container>
                <div className="mx-auto max-w-5xl text-center flex flex-col items-center">
                    {/* Wrapped Badge in a div to handle margin since Badge doesn't take className */}
                    <div className="mb-8">
                        <Badge variant="brand">AI Engineering Platform</Badge>
                    </div>

                    <Heading className="text-5xl sm:text-6xl lg:text-7xl tracking-tight font-extrabold text-zinc-100">
                        Forge Better Learning <br className="hidden sm:block" />
                        <span className="text-indigo-400">with AI.</span>
                    </Heading>

                    <Text className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-zinc-400">
                        Knowledge Foundry is an enterprise-grade platform that
                        generates, evaluates, and continuously improves
                        educational content using modern AI orchestration.
                    </Text>

                    {/* --- Primary and Secondary Actions (Removed the unsupported 'size' prop) --- */}
                    <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                        <Button
                            className="w-full sm:w-auto px-8"
                            onClick={() => navigate("/lessons")}
                        >
                            Enter the Foundry
                        </Button>
                        <Button
                            variant="secondary"
                            className="w-full sm:w-auto px-8 flex items-center justify-center"
                            onClick={() =>
                                window.open(
                                    "https://github.com/ankitmadridista/knowledge-foundry",
                                    "_blank",
                                )
                            }
                        >
                            <svg
                                className="w-5 h-5 mr-2"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            View Source
                        </Button>
                    </div>

                    {/* Platform Entry Portal mapped dynamically */}
                    <div className="mt-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left w-full">
                        {PLATFORM_FEATURES.map((feature) => (
                            <FeatureCard
                                key={feature.title}
                                feature={feature}
                                onClick={() => navigate(feature.route)}
                            />
                        ))}
                    </div>
                </div>
            </Container>
        </Section>
    );
}
