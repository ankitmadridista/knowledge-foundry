import { technologies } from "../data/technologies";

import {
    Container,
    Section,
} from "@/shared/components/layout";

import {
    Heading,
    TechnologyCard,
    Text,
} from "@/shared/components/ui";

export function TechnologySection() {
    return (
        <Section>
            <Container>
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <Heading>
                        Modern Engineering Stack
                    </Heading>

                    <Text className="mt-6">
                        Knowledge Foundry is built using modern cloud-native,
                        AI-first technologies designed for scalability,
                        maintainability, and experimentation.
                    </Text>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {technologies.map((technology) => (
                        <TechnologyCard
                            key={technology.name}
                            {...technology}
                        />
                    ))}
                </div>
            </Container>
        </Section>
    );
}