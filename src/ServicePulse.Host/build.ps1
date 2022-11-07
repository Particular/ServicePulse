Get-ChildItem -Path dist -Include *.* -File -Recurse | foreach { $_.Delete()}
New-Item -ItemType Directory -Force -Path dist

cd vue
npm run build

cd ..\angular
npm run load
Copy-Item -Path "app" -Destination "..\dist\angular" -recurse -Force
