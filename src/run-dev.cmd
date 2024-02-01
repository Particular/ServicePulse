@echo off
pushd .\ServicePulse.Host
start "Proxy" docker run -it --rm -p 1331:1331 -v %cd%/nginx.conf:/etc/nginx/nginx.conf:ro --name service-pulse-dev nginx
pushd .\vue
start "Vue" npm run dev
popd
pushd .\angular
set NODE_OPTIONS=--openssl-legacy-provider
start "Angular" npm run dev