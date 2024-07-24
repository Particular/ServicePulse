$AppOutputFolder = "app"
$FrontendSourceFolder = "../Frontend"

if (Test-Path $AppOutputFolder) {
    Remove-Item $AppOutputFolder -Force -Recurse 
}

New-Item -ItemType Directory -Force -Path $AppOutputFolder

Push-Location $FrontendSourceFolder
npm install
npm run build
Remove-Item -Path "./dist/mockServiceWorker.js"
Pop-Location

Copy-Item -path $FrontendSourceFolder/dist/* -Destination $AppOutputFolder -Recurse

if ( $? -eq $false ) {
    exit $LastExitCode
}