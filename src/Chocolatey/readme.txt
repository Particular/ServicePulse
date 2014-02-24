For testing

cinst ServicePulse.install  -source "C:\Code\ServicePulse\nugets;http://chocolatey.org/api/v2" -force -pre
cinst ServicePulse.install  -source "C:\Code\ServicePulse\nugets" -force -pre

cuninst ServicePulse.install 

Here is an actual release https://github.com/Particular/ServicePulse/releases/download/1.0.0-Beta3/Particular.ServicePulse-1.0.0-Beta3.exe