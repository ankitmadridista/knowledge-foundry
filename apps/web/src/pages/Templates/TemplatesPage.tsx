import { useEffect, useState } from "react";
import { getPromptTemplates, type PromptTemplateSummary } from "@/features/prompt-templates/api/promptTemplatesApi";

export function TemplatesPage() {
  const [templates, setTemplates] = useState<PromptTemplateSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await getPromptTemplates();
        setTemplates(data);
      } catch (err) {
        console.error("Failed to fetch templates:", err);
        setError("Failed to load prompt templates. Is the backend running?");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Prompt Library</h1>
          <p className="text-gray-500 mt-2">Manage and execute your AI prompt templates.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
          + New Template
        </button>
      </div>

      {isLoading && <div className="text-center py-10">Loading templates...</div>}
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div key={template.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                  {template.identifier}
                </span>
              </div>
              <h3 className="text-lg font-semibold mb-2 dark:text-white">{template.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                {template.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mt-auto">
                {template.tags.map(tag => (
                  <span key={tag} className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
          
          {templates.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              No prompt templates found. Create your first one!
            </div>
          )}
        </div>
      )}
    </div>
  );
}