cd angular
npm run load
cd ..

cd vue
npm run build
cd ..

New-Item -ItemType Directory -Force -Path dist
Copy-Item -Path angular\app -Destination dist\angular -recurse -Force
Copy-Item -Path vue\dist\* -Destination dist -recurse -Force


