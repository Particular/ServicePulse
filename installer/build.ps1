#Requires -Version 3

param(
    [parameter(Mandatory=$True)] [string] $PackageVersion
)

pushd $PSScriptRoot

#Copy CustomActions
New-Item -Name "CustomActions" -ItemType Directory -Force | Out-Null
Get-ChildItem CustomActions |  Remove-Item -Force
Copy-Item ..\src\ServicePulse.Install.CustomActions\bin\Debug\ServicePulse.Install.CustomActions.CA.dll -Destination .\CustomActions -ErrorAction Stop
 
#Copy Binaries 
New-Item -Name "Binaries" -ItemType Directory -Force | Out-Null
Get-ChildItem Binaries | Remove-Item -Force
Copy-Item -Container ..\src\ServicePulse.Host\bin\Debug\*.* -Destination .\Binaries -ErrorAction Stop


$AdvancedInstallerPath = Get-ItemProperty "HKLM:\SOFTWARE\Wow6432Node\Caphyon\Advanced Installer\"  | Select -ExpandProperty "Advanced Installer Path" 
$AdvinstCLI = Join-Path -Path $AdvancedInstallerPath -ChildPath "bin\x86\AdvancedInstaller.com"

$setupProjectFile = "ServicePulse.aip"
$packageName = "Particular.ServicePulse-$PackageVersion.exe"

# MSI version must be in classic x.x.x.x format
if ($PackageVersion -match "-") {
    $PackageVersion = "$PackageVersion".Split('-')[0]
}

# edit Advanced Installer Project   
& $AdvinstCLI /edit $setupProjectFile /SetVersion $PackageVersion
& $AdvinstCLI /edit $setupProjectFile /SetPackageName $packageName -buildname DefaultBuild
        
# Build setup with Advanced Installer 
& $AdvinstCLI /rebuild $setupProjectFile

