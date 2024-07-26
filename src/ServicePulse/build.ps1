$ScriptPath = $PSCommandPath | Split-Path
$FrontendSourceFolder = $ScriptPath + "/../Frontend"

Push-Location $FrontendSourceFolder
npm install
npm run build
Remove-Item -Path "./dist/mockServiceWorker.js"
Pop-Location

if ( $? -eq $false ) {
    exit $LastExitCode
}