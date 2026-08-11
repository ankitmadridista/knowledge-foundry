import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getActivePayload, 
  executeTemplate, 
  type PromptTemplatePayloadDto, 
  type ExecuteTemplateResponse 
} from "@/features/prompt-templates/api/promptTemplatesApi";

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
        
        // Initialize state with default values if they exist
        const initialVars: Record<string, string> = {};
        data.variables.forEach(v => {
          initialVars[v.name] = v.defaultValue || "";
        });
        setVariableValues(initialVars);
      } catch (err) {
        setError(`Failed to load template payload. It may not exist or has no published versions. ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayload();
  }, [identifier]);

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues(prev => ({ ...prev, [name]: value }));
  };

  const handleExecute = async () => {
    if (!identifier) return;
    setIsExecuting(true);
    setError(null);
    try {
      const response = await executeTemplate(identifier, { variables: variableValues });
      setResult(response);
    } catch (err) {
      setError(`Execution failed. Please check your inputs and try again. ${err}`);
    } finally {
      setIsExecuting(false);
    }
  };

  if (isLoading) return <div className="text-center py-12">Loading template configuration...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button 
        onClick={() => navigate('/templates')}
        className="text-blue-600 hover:underline mb-6 flex items-center gap-2"
      >
        &larr; Back to Templates
      </button>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Execute: {identifier}</h1>
          <p className="text-gray-500 mt-2">Version {payload?.versionNumber}</p>
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
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Variables</h2>
          
          {payload?.variables.length === 0 ? (
            <p className="text-gray-500 italic mb-6">This template does not require any variables.</p>
          ) : (
            <div className="space-y-4 mb-6">
              {payload?.variables
                // Deduplicate so we only render one textbox per variable name
                .filter((v, index, self) => index === self.findIndex((t) => t.name === v.name))
                .map(variable => (
                <div key={variable.name}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {variable.name}
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder={`Enter ${variable.name}...`}
                    value={variableValues[variable.name] || ""}
                    onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          <button 
            onClick={handleExecute}
            disabled={isExecuting}
            className={`w-full py-3 rounded-md font-medium text-white transition-colors ${
              isExecuting ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isExecuting ? "Generating..." : "Execute Prompt"}
          </button>
        </div>

        {/* Right Side: Result */}
        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 min-h-100 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">AI Output</h2>
          
          {result ? (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 whitespace-pre-wrap text-gray-800 dark:text-gray-200 shadow-inner overflow-y-auto">
                {result.response}
              </div>
              <div className="mt-4 flex gap-4 text-xs text-gray-500">
                <span>Model: <span className="font-medium">{result.model}</span></span>
                <span>Tokens: <span className="font-medium">{result.tokensUsed}</span></span>
                <span>Time: <span className="font-medium">{result.executionTimeMs}ms</span></span>
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