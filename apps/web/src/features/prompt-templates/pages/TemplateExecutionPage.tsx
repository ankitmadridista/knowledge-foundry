import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getActivePayload,
    executeTemplate,
} from "@/features/prompt-templates/api";
import type { PromptTemplatePayloadDto, ExecuteTemplateResponse } from "@/features/prompt-templates/type";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import { Badge, ErrorState, LoadingState } from "@/shared/components/ui";
import { PromptExecutionForm, PromptExecutionResult } from "@/features/prompt-templates/components";

export function TemplateExecutionPage() {
    const { identifier } = useParams<{ identifier: string }>();
    const navigate = useNavigate();

    const [payload, setPayload] = useState<PromptTemplatePayloadDto | null>(
        null,
    );
    const [variableValues, setVariableValues] = useState<
        Record<string, string>
    >({});

    const [isLoading, setIsLoading] = useState(true);
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<ExecuteTemplateResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        if (!identifier) return;

        const fetchPayload = async () => {
            try {
                const data = await getActivePayload(identifier);
                if (!isMounted) return;
                setPayload(data);

                const initialVars: Record<string, string> = {};
                data.variables.forEach((v) => {
                    initialVars[v.name] = v.defaultValue || "";
                });
                setVariableValues(initialVars);
            } catch (err) {
                if (isMounted)
                    setError(
                        `Failed to load template payload. It may not exist or has no active versions. ${err}`,
                    );
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchPayload();
        return () => {
            isMounted = false;
        };
    }, [identifier]);

    const handleVariableChange = (name: string, value: string) => {
        setVariableValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleExecute = async () => {
        if (!identifier) return;
        setIsExecuting(true);
        setError(null);
        try {
            const response = await executeTemplate(identifier, {
                variables: variableValues,
            });
            setResult(response);
        } catch (err) {
            setError(
                `Execution failed. Please check your inputs and try again. ${err}`,
            );
        } finally {
            setIsExecuting(false);
        }
    };

    // Extract cleanly typed variable names for the form component
    const variableNames =
        payload?.variables
            .map((v) => (typeof v === "string" ? v : v.name || v.defaultValue))
            .filter(
                (varName): varName is string =>
                    typeof varName === "string" && varName.length > 0,
            ) || [];

    if (isLoading)
        return <LoadingState message="Loading execution environment..." />;

    return (
        <Section>
            <Container>
                {/* Back Button */}
                <button
                    onClick={() => navigate("/templates")}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                >
                    &larr; Back to Templates
                </button>

                <PageHeader
                    title={
                        (
                            <span className="flex items-center gap-4">
                                {identifier}
                                <Badge variant="brand">
                                    v{payload?.versionNumber}
                                </Badge>
                            </span>
                        ) as unknown as string // Bypassing string typing for flexible node rendering
                    }
                    description="Provide the necessary variables to execute this prompt."
                />

                {error && (
                    <div className="mb-6">
                        <ErrorState message={error} />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
                    <PromptExecutionForm
                        variableNames={variableNames}
                        variableValues={variableValues}
                        onVariableChange={handleVariableChange}
                        onExecute={handleExecute}
                        isExecuting={isExecuting}
                    />

                    <PromptExecutionResult result={result} />
                </div>
            </Container>
        </Section>
    );
}
