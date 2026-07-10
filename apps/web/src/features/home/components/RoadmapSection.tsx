import { Container, Section } from "@/shared/components/layout";

import { Heading, RoadmapCard, Text } from "@/shared/components/ui";
import { roadmap } from "../data/roadmap";

export function RoadmapSection() {
    return (
        <Section>
            <Container>
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <Heading>Product Roadmap</Heading>

                    <Text className="mt-6">
                        Knowledge Foundry is being developed incrementally. Each
                        milestone builds upon a stable architectural foundation
                        while expanding the platform's AI capabilities.
                    </Text>
                </div>

                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {roadmap.map((item) => (
                        <RoadmapCard
                            key={item.title}
                            title={item.title}
                            description={item.description}
                            status={item.status}
                        />
                    ))}
                </div>
            </Container>
        </Section>
    );
}
