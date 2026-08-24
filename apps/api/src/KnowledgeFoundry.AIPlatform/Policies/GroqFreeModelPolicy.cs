using KnowledgeFoundry.AIPlatform.Models;
using KnowledgeFoundry.Domain.PromptTemplates.Enums;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Headers;
using System.Text.Json;

namespace KnowledgeFoundry.AIPlatform.Policies;

internal sealed class GroqFreeModelPolicy : IFreeModelPolicy
{
    private readonly HttpClient _httpClient;
    private readonly string? _apiKey;
    private readonly HashSet<string> _authorizedFreeModels;

    public AiProvider Provider => AiProvider.Groq;

    public GroqFreeModelPolicy(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Groq:ApiKey"];

        var modelsFromConfig = configuration.GetSection("Groq:AuthorizedFreeModels").Get<string[]>() ?? Array.Empty<string>();
        _authorizedFreeModels = new HashSet<string>(modelsFromConfig, StringComparer.OrdinalIgnoreCase);
    }

    public async Task<FreeModelResult> EvaluateAsync(string modelId, CancellationToken cancellationToken = default)
    {
        // Fail-closed if the config is missing or empty
        if (_authorizedFreeModels.Count == 0) return FreeModelResult.Unknown;

        if (!_authorizedFreeModels.Contains(modelId)) return FreeModelResult.NotFree;

        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, "https://api.groq.com/openai/v1/models");
            if (!string.IsNullOrWhiteSpace(_apiKey))
            {
                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
            }

            var response = await _httpClient.SendAsync(request, cancellationToken);
            if (!response.IsSuccessStatusCode) return FreeModelResult.Unknown;

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            using var document = JsonDocument.Parse(json);

            if (!document.RootElement.TryGetProperty("data", out var dataArray))
                return FreeModelResult.Unknown;

            foreach (var element in dataArray.EnumerateArray())
            {
                if (element.GetProperty("id").GetString() == modelId)
                {
                    return FreeModelResult.Free;
                }
            }

            return FreeModelResult.Unknown;
        }
        catch
        {
            return FreeModelResult.Unknown;
        }
    }
}
