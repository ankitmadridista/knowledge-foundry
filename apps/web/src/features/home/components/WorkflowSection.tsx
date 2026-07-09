import { workflowSteps } from "../data/workflow";

import {
    Container,
    Section,
} from "@/shared/components/layout";

import {
    Heading,
    Text,
    WorkflowStep,
} from "@/shared/components/ui";

export function WorkflowSection() {
    return (
        <Section>
            <Container>
                <div className="mx-auto mb-12 max-w-3xl text-center">
                    <Heading>
                        AI Generation Workflow
                    </Heading>

                    <Text className="mt-6">
                        Every lesson follows a structured AI pipeline designed
                        for quality, consistency, and continuous improvement.
                    </Text>
                </div>

                <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
                    {workflowSteps.map((step, index) => (
                        <WorkflowStep
                            key={step.title}
                            step={index + 1}
                            title={step.title}
                            description={step.description}
                        />
                    ))}
                </div>
            </Container>
        </Section>
    );
}