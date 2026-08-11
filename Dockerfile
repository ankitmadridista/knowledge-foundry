# 1. Use the official .NET 9 SDK image to build the app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# 2. Copy the ENTIRE repository into the build container.
COPY . .

# 3. Set the working directory to the API project
WORKDIR /src/apps/api/src/KnowledgeFoundry.Api

# 4. Restore and Publish
RUN dotnet restore
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# 5. Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# 6. Render assigns a dynamic PORT via environment variables.
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "KnowledgeFoundry.Api.dll"]
