import { Component, type ErrorInfo, type ReactNode } from "react";
import { Container, Section } from "./index";
import { ErrorState, Button } from "@/shared/components/ui";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
    };

    // FIX: Removed the unused parameter to satisfy the strict linter!
    public static getDerivedStateFromError(): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // You can also log the error to an error reporting service like Sentry here
        console.error("Uncaught UI error:", error, errorInfo);
    }

    private handleReload = () => {
        // Hard reload the page to clear the corrupted state
        window.location.href = "/";
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Section className="min-h-screen flex items-center justify-center">
                    <Container>
                        <div className="max-w-md mx-auto">
                            <ErrorState message="Something went completely wrong in the UI. We've logged the error." />
                            <div className="mt-6 flex justify-center">
                                <Button onClick={this.handleReload}>
                                    Return to Dashboard
                                </Button>
                            </div>
                        </div>
                    </Container>
                </Section>
            );
        }

        return this.props.children;
    }
}
