import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    getActivePayload,
    executeTemplate,
    type PromptTemplatePayloadDto,
    type ExecuteTemplateResponse,
} from "@/features/prompt-templates/api/promptTemplatesApi";
import ReactMarkdown, { type Components } from "react-markdown";

const cleanProps = <T extends object>(props: T) => {
    const rest = { ...props } as Record<string, unknown>;
    delete rest.node;
    delete rest.inline;
    return rest as Omit<T, "node" | "inline">;
};

const markdownComponents: Components = {
    h1: (props) => (
        <h1
            className="text-2xl font-bold mb-4 text-gray-900 dark:text-white"
            {...cleanProps(props)}
        />
    ),
    h2: (props) => (
        <h2
            className="text-xl font-bold mb-3 mt-6 text-gray-900 dark:text-white"
            {...cleanProps(props)}
        />
    ),
    h3: (props) => (
        <h3
            className="text-lg font-bold mb-2 mt-4 text-gray-900 dark:text-white"
            {...cleanProps(props)}
        />
    ),
    p: (props) => <p className="mb-4 leading-relaxed" {...cleanProps(props)} />,
    ul: (props) => (
        <ul className="list-disc pl-6 mb-4 space-y-1" {...cleanProps(props)} />
    ),
    ol: (props) => (
        <ol
            className="list-decimal pl-6 mb-4 space-y-1"
            {...cleanProps(props)}
        />
    ),
    li: (props) => <li className="pl-1" {...cleanProps(props)} />,
    strong: (props) => (
        <strong
            className="font-semibold text-gray-900 dark:text-white"
            {...cleanProps(props)}
        />
    ),
    blockquote: (props) => (
        <blockquote
            className="border-l-4 border-blue-500 pl-4 py-1 mb-4 bg-blue-50 dark:bg-gray-800 italic"
            {...cleanProps(props)}
        />
    ),
    code: (props) => {
        const rest = cleanProps(props);

        // Check if code is inline (no language class and no line breaks)
        const isInline =
            !props.className && !String(props.children).includes("\n");

        return isInline ? (
            <code
                className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-pink-600 dark:text-pink-400"
                {...rest}
            >
                {props.children}
            </code>
        ) : (
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-md overflow-x-auto mb-4 text-sm font-mono shadow-inner">
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
        if (!identifier) return;

        const fetchPayload = async () => {
            try {
                const data = await getActivePayload(identifier);
                setPayload(data);

                // Initialize state with default values if they exist
                const initialVars: Record<string, string> = {};
                data.variables.forEach((v) => {
                    initialVars[v.name] = v.defaultValue || "";
                });
                setVariableValues(initialVars);
            } catch (err) {
                setError(
                    `Failed to load template payload. It may not exist or has no published versions. ${err}`,
                );
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
            setError(
                `Execution failed. Please check your inputs and try again. ${err}`,
            );
        } finally {
            setIsExecuting(false);
        }
    };

    if (isLoading)
        return (
            <div className="text-center py-12">
                Loading template configuration...
            </div>
        );

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <button
                onClick={() => navigate("/templates")}
                className="text-blue-600 hover:underline mb-6 flex items-center gap-2"
            >
                &larr; Back to Templates
            </button>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Execute: {identifier}
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Version {payload?.versionNumber}
                    </p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side: Inputs */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">
                        Variables
                    </h2>

                    {payload?.variables.length === 0 ? (
                        <p className="text-gray-500 italic mb-6">
                            This template does not require any variables.
                        </p>
                    ) : (
                        <div className="space-y-4 mb-6">
                            {payload?.variables
                                // 1. Safely extract the string name regardless of backend JSON structure
                                .map((v) =>
                                    typeof v === "string"
                                        ? v
                                        : v.name || v.defaultValue,
                                )
                                // 2. Deduplicate
                                .filter(
                                    (varName): varName is string =>
                                        typeof varName === "string" &&
                                        varName.length > 0,
                                )
                                // 3. Render
                                .map((varName) => (
                                    <div key={varName}>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            {varName}
                                        </label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                                            placeholder={`Enter ${varName}...`}
                                            value={
                                                variableValues[varName] || ""
                                            }
                                            onChange={(e) =>
                                                handleVariableChange(
                                                    varName,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                ))}
                        </div>
                    )}

                    <button
                        onClick={handleExecute}
                        disabled={isExecuting}
                        className={`w-full py-3 rounded-md font-medium text-white transition-colors ${
                            isExecuting
                                ? "bg-blue-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                        {isExecuting ? "Generating..." : "Execute Prompt"}
                    </button>
                </div>

                {/* Right Side: Result */}
                <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 min-h-100 flex flex-col">
                    <h2 className="text-xl font-semibold mb-4 dark:text-white">
                        AI Output
                    </h2>

                    {result ? (
                        <div className="flex-1 flex flex-col">
                            <div className="flex-1 p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 shadow-inner overflow-y-auto">
                                <div className="text-gray-800 dark:text-gray-300">
                                    <ReactMarkdown
                                        components={markdownComponents}
                                    >
                                        {result.response}
                                    </ReactMarkdown>
                                </div>
                            </div>
                            <div className="mt-4 flex gap-4 text-xs text-gray-500">
                                <span>
                                    Model:{" "}
                                    <span className="font-medium">
                                        {result.model}
                                    </span>
                                </span>
                                <span>
                                    Tokens:{" "}
                                    <span className="font-medium">
                                        {result.tokensUsed}
                                    </span>
                                </span>
                                <span>
                                    Time:{" "}
                                    <span className="font-medium">
                                        {result.executionTimeMs}ms
                                    </span>
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md">
                            Waiting for execution...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
