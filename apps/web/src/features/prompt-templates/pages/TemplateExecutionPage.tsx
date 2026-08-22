import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getActivePayload,
    executeTemplate,
    getAvailableModels,
} from "@/features/prompt-templates/api";
import type {
    PromptTemplatePayloadDto,
    ExecuteTemplateResponse,
    AiModelDto,
} from "@/features/prompt-templates/type";
import { Section, Container, PageHeader } from "@/shared/components/layout";
import { ErrorState, LoadingState } from "@/shared/components/ui";
import {
    PromptExecutionForm,
    PromptExecutionResult,
} from "@/features/prompt-templates/components";
import { extractErrorMessage } from "@/shared/utils/error";

export function TemplateExecutionPage() {
    const { identifier } = useParams<{ identifier: string }>();
    const navigate = useNavigate();

    const [payload, setPayload] = useState<PromptTemplatePayloadDto | null>(
        null,
    );
    const [variableValues, setVariableValues] = useState<
        Record<string, string>
    >({});
    const [availableModels, setAvailableModels] = useState<AiModelDto[]>([]);

    const [selectedProvider, setSelectedProvider] = useState<
        number | undefined
    >(undefined);
    const [selectedModel, setSelectedModel] = useState<string>("");

    const [isLoading, setIsLoading] = useState(true);
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<ExecuteTemplateResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        if (!identifier) return;

        const initialize = async () => {
            try {
                const [payloadData, modelsData] = await Promise.all([
                    getActivePayload(identifier),
                    getAvailableModels(),
                ]);

                if (!isMounted) return;

                setPayload(payloadData);
                setAvailableModels(modelsData);

                const initialVars: Record<string, string> = {};
                payloadData.variables.forEach((variableName) => {
                    initialVars[variableName] = "";
                });
                setVariableValues(initialVars);

                if (payloadData.provider !== undefined && payloadData.model) {
                    setSelectedProvider(payloadData.provider);
                    setSelectedModel(payloadData.model);
                } else if (modelsData.length > 0) {
                    setSelectedProvider(modelsData[0].providerId);
                    setSelectedModel(modelsData[0].modelId);
                }
            } catch (err) {
                if (isMounted) {
                    setError(
                        extractErrorMessage(
                            err,
                            "Failed to load execution environment.",
                        ),
                    );
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        initialize();
        return () => {
            isMounted = false;
        };
    }, [identifier]);

    const handleVariableChange = (name: string, value: string) => {
        setVariableValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleExecute = async () => {
        if (!identifier || selectedProvider === undefined) return;
        setIsExecuting(true);
        setError(null);
        try {
            const response = await executeTemplate(identifier, {
                variables: variableValues,
                provider: selectedProvider,
                model: selectedModel || undefined,
            });
            setResult(response);
        } catch (err) {
            setError(
                extractErrorMessage(
                    err,
                    "Execution failed. Please check your inputs and try again.",
                ),
            );
        } finally {
            setIsExecuting(false);
        }
    };

    const variableNames: string[] = payload?.variables || [];

    const currentProviderModels = availableModels.filter(
        (m) => m.providerId === selectedProvider,
    );

    if (isLoading)
        return <LoadingState message="Loading execution environment..." />;

    return (
        <Section>
            <Container>
                <button
                    onClick={() => navigate(`/templates/${identifier}`)}
                    className="text-indigo-400 hover:text-indigo-300 transition-colors mb-6 flex items-center gap-2 text-sm font-medium"
                >
                    &larr; Back to {payload?.name || "Template Details"}
                </button>

                <PageHeader
                    title={
                        <div className="flex items-center gap-3">
                            <span>{payload?.name || "Execute Prompt"}</span>
                            <span className="text-sm md:text-base font-semibold tracking-wide text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-md mt-1">
                                v{payload?.versionNumber}.0
                            </span>
                        </div>
                    }
                    description="Provide variables and select an active model to execute this prompt."
                />

                <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border border-zinc-800 bg-zinc-950/60">
                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                            AI Provider
                        </label>
                        <select
                            value={
                                selectedProvider !== undefined
                                    ? selectedProvider
                                    : ""
                            }
                            onChange={(e) => {
                                const provId = parseInt(e.target.value, 10);
                                setSelectedProvider(provId);
                                const firstModel = availableModels.find(
                                    (m) => m.providerId === provId,
                                );
                                setSelectedModel(firstModel?.modelId || "");
                            }}
                            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {Array.from(
                                new Map(
                                    availableModels.map((m) => [
                                        m.providerId,
                                        m.providerName,
                                    ]),
                                ).entries(),
                            ).map(([id, name]) => (
                                <option key={id} value={id}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-400 mb-1">
                            Model
                        </label>
                        <select
                            value={selectedModel}
                            onChange={(e) => setSelectedModel(e.target.value)}
                            className="w-full rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {currentProviderModels.map((m) => (
                                <option key={m.modelId} value={m.modelId}>
                                    {m.modelId}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

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
