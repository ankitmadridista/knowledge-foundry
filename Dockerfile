# 1. Use the official .NET 9 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# 2. Copy the solution and project files first (optimizes Docker caching)
COPY ["apps/api/src/KnowledgeFoundry.Api/KnowledgeFoundry.Api.csproj", "apps/api/src/KnowledgeFoundry.Api/"]
COPY ["apps/api/src/KnowledgeFoundry.Application/KnowledgeFoundry.Application.csproj", "apps/api/src/KnowledgeFoundry.Application/"]
COPY ["apps/api/src/KnowledgeFoundry.Domain/KnowledgeFoundry.Domain.csproj", "apps/api/src/KnowledgeFoundry.Domain/"]
COPY ["apps/api/src/KnowledgeFoundry.Infrastructure/KnowledgeFoundry.Infrastructure.csproj", "apps/api/src/KnowledgeFoundry.Infrastructure/"]

# 3. Restore NuGet packages
RUN dotnet restore "apps/api/src/KnowledgeFoundry.Api/KnowledgeFoundry.Api.csproj"

# 4. Copy the rest of the code and build
COPY apps/api/src/ apps/api/src/
WORKDIR "/src/apps/api/src/KnowledgeFoundry.Api"
RUN dotnet build "KnowledgeFoundry.Api.csproj" -c Release -o /app/build

# 5. Publish the application
FROM build AS publish
RUN dotnet publish "KnowledgeFoundry.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# 6. Final runtime image (much smaller than the SDK image)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# 7. Render assigns a dynamic PORT via environment variables. We tell .NET to listen on it.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "KnowledgeFoundry.Api.dll"]