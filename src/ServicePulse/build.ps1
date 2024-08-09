$ScriptPath = $PSCommandPath | Split-Path
$FrontendSourceFolder = $ScriptPath + "/../Frontend"

Push-Location $FrontendSourceFolder
npm install
npm run build
Pop-Location

if ( $? -eq $false ) {
    exit $LastExitCode
}