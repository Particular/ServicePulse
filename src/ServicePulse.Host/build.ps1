Get-ChildItem -Path dist -Include *.* -File -Recurse | foreach { $_.Delete()}
New-Item -ItemType Directory -Force -Path dist

cd vue
npm install
npm run build

cd ..\angular
npm run load
Get-Location
New-Item -ItemType Directory -Force -Path "..\dist\angular"
Copy-Item -Path ".\app\*" -Destination "..\dist\angular" -Recurse -Force
