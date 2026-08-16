import { Badge, Button, Heading, Text } from "@/shared/components/ui";
import { Container, Section } from "@/shared/components/layout";
import { useNavigate } from "react-router-dom";
import { PLATFORM_FEATURES } from "../data/platform-features";
import { FeatureCard } from "./FeatureCard";

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
                        Knowledge Foundry is an AI-powered platform that generates, evaluates, 
                        and continuously improves educational content using modern AI engineering practices.
                    </Text>

                    <div className="mt-10 flex justify-center">
                        <Button
                            variant="secondary"
                            onClick={() => window.open("https://github.com/ankitmadridista/knowledge-foundry", "_blank")}
                        >
                            View Source on GitHub
                        </Button>
                    </div>

                    {/* Platform Entry Portal mapped dynamically */}
                    <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-left">
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