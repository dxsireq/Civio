FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore (layer-cached on csproj only)
COPY Directory.Build.props ./
COPY src/Civio.Api/Civio.Api.csproj src/Civio.Api/
COPY src/Civio.Application/Civio.Application.csproj src/Civio.Application/
COPY src/Civio.Contracts/Civio.Contracts.csproj src/Civio.Contracts/
COPY src/Civio.Domain/Civio.Domain.csproj src/Civio.Domain/
COPY src/Civio.Infrastructure/Civio.Infrastructure.csproj src/Civio.Infrastructure/
RUN dotnet restore src/Civio.Api/Civio.Api.csproj

# Build + publish
COPY src/ src/
RUN dotnet publish src/Civio.Api/Civio.Api.csproj -c Release -o /app /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app ./
EXPOSE 8080
ENTRYPOINT ["dotnet", "Civio.Api.dll"]
