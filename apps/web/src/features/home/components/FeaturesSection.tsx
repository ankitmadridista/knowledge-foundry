import { Container, Section } from "@/shared/components/layout";
import { FeatureCard } from "@/shared/components/ui";
import { features } from "../data/features";

export function FeaturesSection() {
  return (
    <Section>
      <Container>
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold">
            Everything Needed to Build Educational AI
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.title} title={feature.title}>
              {feature.description}
            </FeatureCard>
          ))}
        </div>
      </Container>
    </Section>
  );
}