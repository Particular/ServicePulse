using System;

class ThirdPartyMonitor : Monitor
{
    public ThirdPartyMonitor()
        : base(new Uri("http://localhost:57789"), TimeSpan.FromSeconds(10))
    {
    }
}