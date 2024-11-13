# Frontend build image
FROM --platform=$BUILDPLATFORM node:latest AS frontend
WORKDIR /
COPY . .
WORKDIR /src/Frontend
RUN npm install
RUN npm run build

# Host build image
FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG TARGETARCH
WORKDIR /
ENV CI=true
COPY --from=frontend . .
RUN dotnet publish src/ServicePulse/ServicePulse.csproj -a $TARGETARCH -o /app

# Host runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0-noble-chiseled-composite
ARG VERSION
WORKDIR /app

LABEL org.opencontainers.image.source="https://github.com/particular/servicepulse" \
      org.opencontainers.image.authors="Particular Software" \
      org.opencontainers.image.url=https://docs.particular.net/servicepulse/ \
      org.opencontainers.image.documentation="https://docs.particular.net/servicepulse/" \
      org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.title="ServicePulse" \
      org.opencontainers.image.description="ServicePulse provides real-time production monitoring for distributed applications. It monitors the health of a system's endpoints, detects processing errors, sends failed messages for reprocessing, and ensures the specific environment's needs are met, all in one consolidated dashboard."

ENV ASPNETCORE_HTTP_PORTS=9090
EXPOSE 9090
COPY --from=build /app .
USER $APP_UID
ENTRYPOINT ["./ServicePulse"]