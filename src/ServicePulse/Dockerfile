# Frontend build image
FROM --platform=$BUILDPLATFORM node:latest AS frontend
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
ARG VERSION
ARG SHA=unknown
ARG CREATED=2000-01-01T00:00:00Z
WORKDIR /app

LABEL org.opencontainers.image.source=https://github.com/Particular/servicepulse/tree/$SHA
LABEL org.opencontainers.image.authors="Particular Software"
LABEL org.opencontainers.image.vendor="Particular Software"
LABEL org.opencontainers.image.url=https://hub.docker.com/r/particular/servicepulse
LABEL org.opencontainers.image.documentation=https://docs.particular.net/servicepulse/
LABEL org.opencontainers.image.version=$VERSION
LABEL org.opencontainers.image.revision=$SHA
LABEL org.opencontainers.image.created=$CREATED
LABEL org.opencontainers.image.title="ServicePulse"
LABEL org.opencontainers.image.description="ServicePulse provides real-time production monitoring for distributed applications. It monitors the health of a system's endpoints, detects processing errors, sends failed messages for reprocessing, and ensures the specific environment's needs are met, all in one consolidated dashboard."
LABEL org.opencontainers.image.base.name=mcr.microsoft.com/dotnet/aspnet:8.0-noble-chiseled-composite

ENV ASPNETCORE_HTTP_PORTS=9090
EXPOSE 9090
COPY --from=build /app .
USER $APP_UID
ENTRYPOINT ["./ServicePulse"]