FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["PuzzleTracker.Server/PuzzleTracker.Server.csproj", "PuzzleTracker.Server/"]
COPY ["PuzzleTracker.Client/PuzzleTracker.Client.csproj", "PuzzleTracker.Client/"]
RUN dotnet restore "PuzzleTracker.Server/PuzzleTracker.Server.csproj"
COPY . .
WORKDIR "/src/PuzzleTracker.Server"
RUN dotnet build "PuzzleTracker.Server.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "PuzzleTracker.Server.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PuzzleTracker.Server.dll"]
