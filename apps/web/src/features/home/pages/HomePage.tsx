import {
    HeroSection,
    TechnologySection,
    FeaturesSection,
    WorkflowSection,
    ArchitectureSection,
    RoadmapSection,
} from "@/features/home/components";
import { pingBackend } from "@/shared/api/httpClient";
import { useEffect } from "react";

export function HomePage() {

    useEffect(() => {
        pingBackend();
    }, []);
    return (
        <>
            <HeroSection />

            <TechnologySection />

            <FeaturesSection />

            <WorkflowSection/>

            <ArchitectureSection />

            <RoadmapSection />
        </>
    );
}