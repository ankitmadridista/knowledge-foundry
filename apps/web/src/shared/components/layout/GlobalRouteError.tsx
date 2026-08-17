import { useRouteError } from "react-router-dom";
import { Container, Section } from "./index";
import { ErrorState, Button } from "@/shared/components/ui";

export function GlobalRouteError() {
    // This hook grabs the error that React Router caught
    const error = useRouteError();
    console.error("Caught by React Router ErrorBoundary:", error);

    const handleReload = () => {
        window.location.href = "/"; // Send them back to safety
    };

    return (
        <Section className="min-h-screen flex items-center justify-center">
            <Container>
                <div className="max-w-md mx-auto">
                    <ErrorState message="Something went completely wrong in the UI. We've logged the error." />
                    <div className="mt-6 flex justify-center">
                        <Button onClick={handleReload}>
                            Return to Dashboard
                        </Button>
                    </div>
                </div>
            </Container>
        </Section>
    );
}
