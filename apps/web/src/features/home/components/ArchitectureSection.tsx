import { Container, Section } from "@/shared/components/layout";

import { ArchitectureCard, Heading, Text } from "@/shared/components/ui";
import { architectureNodes } from "../data/architecture";

export function ArchitectureSection() {
    return (
        <Section>
            <Container>
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <Heading>Engineered for AI-First Applications</Heading>

                    <Text className="mt-6">
                        A layered architecture keeps business rules, AI
                        orchestration, and infrastructure concerns independent,
                        making the platform easier to evolve over time.
                    </Text>
                </div>

                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {architectureNodes.map((node) => (
                        <ArchitectureCard
                            key={node.title}
                            title={node.title}
                            description={node.description}
                        />
                    ))}
                </div>
            </Container>
        </Section>
    );
}
