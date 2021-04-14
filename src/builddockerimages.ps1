cd ServicePulse.Host
npm install
node ./node_modules/webpack/bin/webpack.js --config app/modules/modules.webpackconfig.builder.js

cd ..

docker pull  mcr.microsoft.com/windows/servercore/iis
docker build -f .\dockerfile.iis -t particular/servicepulse.iis .

docker pull ubuntu:latest
docker build -f .\dockerfile.nginx -t particular/servicepulse.nginx .
