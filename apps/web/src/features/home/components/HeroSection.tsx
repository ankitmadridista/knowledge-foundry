import { Badge, Button, Heading, Text } from "@/shared/components/ui";
import { Container, Section } from "@/shared/components/layout";

export function HeroSection() {
    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-4xl text-center">
                    <Badge>AI Engineering Portfolio Project</Badge>

                    <Heading className="mt-8">
                        Forge Better Learning with AI
                    </Heading>

                    <Text className="mt-8">
                        Knowledge Foundry is an AI-powered platform that
                        generates, evaluates, and continuously improves
                        educational content using modern AI engineering
                        practices.
                    </Text>

                    <div className="mt-10 flex justify-center gap-4">
                        <Button>Get Started</Button>

                        <Button variant="secondary">GitHub</Button>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
