ARG NGINX_TAGORDIGEST=":stable-alpine"
FROM nginx$NGINX_TAGORDIGEST

ARG VERSION
ARG GITHUB_SHA
ARG GITHUB_REF_NAME
ARG GITHUB_WORKFLOW_SHA

LABEL org.opencontainers.image.title="ServicePulse" \
      org.opencontainers.image.description="ServicePulse provides real-time production monitoring for distributed applications. It monitors the health of a system's endpoints, detects processing errors, sends failed messages for reprocessing, and ensures the specific environment's needs are met, all in one consolidated dashboard." \
      org.opencontainers.image.authors="Particular Software" \
      org.opencontainers.image.vendor="Particular Software" \
      org.opencontainers.image.source="https://github.com/particular/servicepulse" \
      org.opencontainers.image.documentation="https://github.com/Particular/ServicePulse/blob/master/src/Container/README.md" \
      org.opencontainers.image.licenses="Commercial OR RPL-1.5" \
      org.opencontainers.image.version=$VERSION \
      org.opencontainers.image.revision=$GITHUB_SHA \
      org.opencontainers.image.base.digest=$NGINX_DIGEST \
      org.opencontainers.image.base.name="nginx:stable-alpine" \
      com.particular.github.ref.name=$GITHUB_REF_NAME \
      com.particular.support.url="https://particular.net/support"

ENV SERVICECONTROL_URL="http://localhost:33333/api/"
ENV MONITORING_URLS="['http://localhost:33633/']"
ENV BASE_URL="/"

COPY ServicePulse.Host/app /usr/share/nginx/html

RUN mv /usr/share/nginx/html/js/app.constants.js /usr/share/nginx/html/js/app.constants.template &&\
    sed -i \
    -e "s,http://localhost:33333/api/,\$SERVICECONTROL_URL,g" \
    -e "s,\['http://localhost:33633/'\],\$MONITORING_URLS,g" \
    -e "s,'/','\$BASE_URL',g" \
    /usr/share/nginx/html/js/app.constants.template

ADD nginx.conf /etc/nginx/
ADD --chown=root:root --chmod=755 Container/updateconstants.sh /docker-entrypoint.d/40-update-servicepulse-constants.sh

EXPOSE 90