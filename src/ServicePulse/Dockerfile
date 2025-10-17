# Frontend build image
FROM --platform=$BUILDPLATFORM node:22 AS frontend
WORKDIR /
COPY . .
WORKDIR /src/Frontend
RUN npm install
RUN npm run build

# Host build image
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
WORKDIR /
ENV CI=true
COPY --from=frontend . .
RUN dotnet publish src/ServicePulse/ServicePulse.csproj -a $TARGETARCH -o /app

# Host runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0-noble-chiseled-composite
WORKDIR /app

ENV ASPNETCORE_HTTP_PORTS=9090
EXPOSE 9090
COPY --from=build /app .
USER $APP_UID
ENTRYPOINT ["./ServicePulse"]