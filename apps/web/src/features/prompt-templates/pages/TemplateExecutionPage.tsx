import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getActivePayload,
    executeTemplate,
    type PromptTemplatePayloadDto,
    type ExecuteTemplateResponse,
} from "@/features/prompt-templates/api/promptTemplatesApi";
import ReactMarkdown, { type Components } from "react-markdown";

// Import your custom Design System components
import { Section, Container } from "@/shared/components/layout";
import { Heading, Text, Button, Card, Label, Textarea, Badge } from "@/shared/components/ui";

// 1. Fully type-safe helper: No 'any', no unused variables!
const cleanProps = <T extends object>(props: T) => {
    const rest = { ...props } as Record<string, unknown>;
    delete rest.node;
    delete rest.inline;
    return rest as Omit<T, "node" | "inline">;
};

// 2. Premium Markdown styling using your Zinc/Indigo theme
const markdownComponents: Components = {
    h1: (props) => (
        <h1 className="text-2xl font-bold mb-4 text-zinc-100" {...cleanProps(props)} />
    ),
    h2: (props) => (
        <h2 className="text-xl font-bold mb-3 mt-6 text-zinc-100 border-b border-zinc-800 pb-2" {...cleanProps(props)} />
    ),
    h3: (props) => (
        <h3 className="text-lg font-bold mb-2 mt-4 text-zinc-100" {...cleanProps(props)} />
    ),
    p: (props) => <p className="mb-4 leading-relaxed text-zinc-300" {...cleanProps(props)} />,
    ul: (props) => (
        <ul className="list-disc pl-6 mb-4 space-y-1 text-zinc-300" {...cleanProps(props)} />
    ),
    ol: (props) => (
        <ol className="list-decimal pl-6 mb-4 space-y-1 text-zinc-300" {...cleanProps(props)} />
    ),
    li: (props) => <li className="pl-1" {...cleanProps(props)} />,
    strong: (props) => (
        <strong className="font-semibold text-zinc-100" {...cleanProps(props)} />
    ),
    blockquote: (props) => (
        <blockquote
            className="border-l-4 border-indigo-500 pl-4 py-2 mb-4 bg-indigo-500/10 italic text-zinc-300 rounded-r-lg"
            {...cleanProps(props)}
        />
    ),
    code: (props) => {
        const rest = cleanProps(props);
        const isInline = !props.className && !String(props.children).includes("\n");

        return isInline ? (
            <code
                className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm font-mono text-indigo-300"
                {...rest}
            >
                {props.children}
            </code>
        ) : (
            <pre className="bg-zinc-950 border border-zinc-800 text-zinc-300 p-4 rounded-xl overflow-x-auto mb-4 text-sm font-mono shadow-inner">
                <code className={props.className} {...rest}>
                    {props.children}
                </code>
            </pre>
        );
    },
};

export function TemplateExecutionPage() {
    const { identifier } = useParams<{ identifier: string }>();
    const navigate = useNavigate();

    const [payload, setPayload] = useState<PromptTemplatePayloadDto | null>(null);
    const [variableValues, setVariableValues] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isExecuting, setIsExecuting] = useState(false);
    const [result, setResult] = useState<ExecuteTemplateResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!identifier) return;

        const fetchPayload = async () => {
            try {
                const data = await getActivePayload(identifier);
                setPayload(data);

                const initialVars: Record<string, string> = {};
                data.variables.forEach((v) => {
                    initialVars[v.name] = v.defaultValue || "";
                });
                setVariableValues(initialVars);
            } catch (err) {
                setError(`Failed to load template payload. It may not exist or has no active versions. ${err}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayload();
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
            setError(`Execution failed. Please check your inputs and try again. ${err}`);
        } finally {
            setIsExecuting(false);
        }
    };

    if (isLoading)
        return (
            <div className="text-center py-20">
                <Text className="text-zinc-500 animate-pulse">Loading execution environment...</Text>
            </div>
        );

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

                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <Heading className="flex items-center gap-4">
                            {identifier}
                            <Badge variant="brand">v{payload?.versionNumber}</Badge>
                        </Heading>
                        <Text className="mt-2 text-zinc-400">
                            Provide the necessary variables to execute this prompt.
                        </Text>
                    </div>
                </div>

                {error && (
                    <Card className="p-4 mb-6 border-red-500/20 bg-red-500/10">
                        <Text className="text-red-400">{error}</Text>
                    </Card>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Side: Inputs */}
                    <Card className="p-6 md:p-8 flex flex-col">
                        <h2 className="text-xl font-bold text-zinc-100 mb-6 border-b border-zinc-800 pb-4">
                            Variables
                        </h2>

                        {payload?.variables.length === 0 ? (
                            <Text className="text-zinc-500 italic mb-6">
                                This template does not require any variables.
                            </Text>
                        ) : (
                            <div className="space-y-6 mb-8 flex-1">
                                {payload?.variables
                                    .map((v) => (typeof v === "string" ? v : v.name || v.defaultValue))
                                    .filter((varName): varName is string => typeof varName === "string" && varName.length > 0)
                                    .map((varName) => (
                                        <div key={varName}>
                                            <Label>{varName}</Label>
                                            <Textarea
                                                rows={5}
                                                className="font-mono text-sm"
                                                placeholder={`Enter ${varName}...`}
                                                value={variableValues[varName] || ""}
                                                onChange={(e) => handleVariableChange(varName, e.target.value)}
                                            />
                                        </div>
                                    ))}
                            </div>
                        )}

                        <Button
                            onClick={handleExecute}
                            disabled={isExecuting}
                            className={`w-full justify-center ${isExecuting ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                            {isExecuting ? "Generating..." : "Execute Prompt"}
                        </Button>
                    </Card>

                    {/* Right Side: Result */}
                    <Card className="p-6 md:p-8 min-h-125 flex flex-col">
                        <h2 className="text-xl font-bold text-zinc-100 mb-6 border-b border-zinc-800 pb-4">
                            AI Output
                        </h2>

                        {result ? (
                            <div className="flex-1 flex flex-col">
                                {/* Markdown Container */}
                                <div className="flex-1 bg-zinc-950/50 rounded-xl border border-zinc-800 p-6 overflow-y-auto max-h-150">
                                    <ReactMarkdown components={markdownComponents}>
                                        {result.response}
                                    </ReactMarkdown>
                                </div>

                                {/* Telemetry Footer */}
                                <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-zinc-800">
                                    <Badge variant="neutral">
                                        Model: <span className="text-zinc-100 ml-1">{result.model}</span>
                                    </Badge>
                                    <Badge variant="neutral">
                                        Tokens: <span className="text-zinc-100 ml-1">{result.tokensUsed}</span>
                                    </Badge>
                                    <Badge variant="neutral">
                                        Time: <span className="text-zinc-100 ml-1">{result.executionTimeMs}ms</span>
                                    </Badge>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50">
                                <Text className="text-zinc-500">Waiting for execution...</Text>
                            </div>
                        )}
                    </Card>
                </div>
            </Container>
        </Section>
    );
}