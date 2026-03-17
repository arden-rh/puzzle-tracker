# Stage 1: Build React frontend with Vite
FROM node:20-alpine AS frontend
WORKDIR /app/client
COPY puzzletracker.client/package*.json ./
RUN npm install
COPY puzzletracker.client/ ./
# Use Docker-specific vite config to avoid SSL certificate generation
RUN npx vite build --config vite.config.docker.ts
# Verify the build output
RUN ls -la dist/ && ls -la dist/assets/ || echo "No assets folder found"

# Stage 2: Build .NET backend
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src
COPY ["PuzzleTracker.Server/PuzzleTracker.Server.csproj", "PuzzleTracker.Server/"]
RUN dotnet restore "PuzzleTracker.Server/PuzzleTracker.Server.csproj"
COPY PuzzleTracker.Server/ ./PuzzleTracker.Server/
WORKDIR "/src/PuzzleTracker.Server"
RUN dotnet build "PuzzleTracker.Server.csproj" -c Release -o /app/build

# Stage 3: Publish .NET backend and copy frontend
FROM backend-build AS publish
RUN dotnet publish "PuzzleTracker.Server.csproj" -c Release -o /app/publish /p:UseAppHost=false
COPY --from=frontend /app/client/dist /app/publish/wwwroot

# Stage 4: Final runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PuzzleTracker.Server.dll"]
