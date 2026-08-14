import { Badge, Button, Heading, Text } from "@/shared/components/ui";
import { Container, Section } from "@/shared/components/layout";
import { useNavigate } from "react-router-dom"; // <-- Add this import

export function HeroSection() {
    const navigate = useNavigate(); // <-- Initialize navigation hook

    return (
        <Section>
            <Container>
                <div className="mx-auto max-w-4xl text-center">
                    <Badge variant="brand">
                        AI Engineering Project
                    </Badge>

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
                        {/* Wire up the click handler to go to templates */}
                        <Button onClick={() => navigate("/templates")}>
                            Launch Platform
                        </Button>

                        {/* Optionally make this point to your repo */}
                        <Button
                            variant="secondary"
                            onClick={() =>
                                window.open(
                                    "https://github.com/your-username/knowledge-foundry",
                                    "_blank",
                                )
                            }
                        >
                            GitHub
                        </Button>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
