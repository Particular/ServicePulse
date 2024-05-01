$AppOutputFolder = "app"
$FrontendSourceFolder = "../Frontend"

if (Test-Path $AppOutputFolder)
{
	Get-ChildItem -Path $AppOutputFolder -Include *.* -File -Recurse | foreach { $_.Delete()}
}

New-Item -ItemType Directory -Force -Path $AppOutputFolder

cd $FrontendSourceFolder
npm install
npm run msw:cleanup
npm run build
if ( $? -eq $false ) {
    exit $LastExitCode
}