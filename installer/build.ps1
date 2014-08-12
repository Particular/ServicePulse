#Requires -Version 3

param(
    [parameter(Mandatory=$True)] [string] $PackageVersion
)

pushd $PSScriptRoot

$AdvancedInstallerPath = Get-ItemProperty "HKLM:\SOFTWARE\Wow6432Node\Caphyon\Advanced Installer\"  | Select -ExpandProperty "Advanced Installer Path" 
$AdvinstCLI = Join-Path -Path $AdvancedInstallerPath -ChildPath "bin\x86\AdvancedInstaller.com"

$setupProjectFile = "ServicePulse.aip"
$packageName = "Particular.ServicePulse-$PackageVersion.exe"

# edit Advanced Installer Project   
& $AdvinstCLI /edit $setupProjectFile /SetVersion $PackageVersion
& $AdvinstCLI /edit $setupProjectFile /SetPackageName $packageName -buildname DefaultBuild
        
# Build setup with Advanced Installer 
& $AdvinstCLI /rebuild $setupProjectFile

