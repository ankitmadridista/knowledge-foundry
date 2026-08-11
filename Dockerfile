# 1. Use the official .NET 9 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# 2. Copy the entire backend directory. 
# This ensures all Directory.Build.props, global.json, and project files are present!
COPY apps/api/ apps/api/

# 3. Set the working directory to your main API project
WORKDIR /src/apps/api/src/KnowledgeFoundry.Api

# 4. Restore, Build, and Publish in one clean sweep
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# 5. Final runtime image (much smaller than the SDK image)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# 6. Render assigns a dynamic PORT via environment variables.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "KnowledgeFoundry.Api.dll"]
