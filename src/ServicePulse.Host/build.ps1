$AppOutputFolder = "app"
$AngularSourceFolder = "angular"
$AngularOutputFolder = "app\a"
$VueSourceFolder = "vue"

if (Test-Path $AppOutputFolder)
{
	Get-ChildItem -Path $AppOutputFolder -Include *.* -File -Recurse | foreach { $_.Delete()}
}

New-Item -ItemType Directory -Force -Path $AppOutputFolder

cd $VueSourceFolder
npm install
npm run build
if ( $? -eq $false ) {
    exit $LastExitCode
}

cd ..

cd $AngularSourceFolder
npm run load

cd.. 

New-Item -ItemType Directory -Force -Path $AngularOutputFolder
Copy-Item -Path "$($AngularSourceFolder)\app\*" -Destination $AngularOutputFolder -Recurse -Force