$ScriptPath = $PSCommandPath | Split-Path
$AppOutputFolder = $ScriptPath + "/app"
$FrontendSourceFolder = $ScriptPath + "/../Frontend"

if (Test-Path $AppOutputFolder) {
    Remove-Item $AppOutputFolder -Force -Recurse
}

New-Item -ItemType Directory -Force -Path $AppOutputFolder
Push-Location $FrontendSourceFolder

npm audit --audit-level=low --omit=dev
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run lint
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Remove-Item -Path "./dist/mockServiceWorker.js" -ErrorAction SilentlyContinue
Pop-Location

Copy-Item -path $FrontendSourceFolder/dist/* -Destination $AppOutputFolder -Recurse
