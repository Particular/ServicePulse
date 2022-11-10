Get-ChildItem -Path "app" -Include *.* -File -Recurse | foreach { $_.Delete()}
New-Item -ItemType Directory -Force -Path "app"

cd vue
npm install
npm run build

cd ..\angular
npm run load
Get-Location
New-Item -ItemType Directory -Force -Path "..\app\angular"
Copy-Item -Path ".\app\*" -Destination "..\app\angular" -Recurse -Force
