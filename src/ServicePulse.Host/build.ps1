$ScriptPath = $PSCommandPath | Split-Path
$AppOutputFolder = $ScriptPath + "/app"
$FrontendSourceFolder = $ScriptPath + "/../Frontend"

if (Test-Path $AppOutputFolder) {
    Remove-Item $AppOutputFolder -Force -Recurse
}

New-Item -ItemType Directory -Force -Path $AppOutputFolder

Push-Location $FrontendSourceFolder
npm audit --audit-level=low

if ( $? -eq $false ) {
    exit $LastExitCode
}

npm install
npm run build
Remove-Item -Path "./dist/mockServiceWorker.js"
Pop-Location

Copy-Item -path $FrontendSourceFolder/dist/* -Destination $AppOutputFolder -Recurse

if ( $? -eq $false ) {
    exit $LastExitCode
}
