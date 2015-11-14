using System;
using System.Net.Http;
using NServiceBus.Logging;
using ServiceControl.Plugin.CustomChecks;

abstract class Monitor : PeriodicCheck
{
    Uri uri;
    static ILog logger = LogManager.GetLogger<Monitor>();

    protected Monitor(Uri uri, TimeSpan interval)
        : base($"Monitor {uri}", "Monitor 3rd Party ", interval)
    {
        this.uri = uri;
    }

    public override CheckResult PerformCheck()
    {
        try
        {
            using (HttpClient client = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(3),
            })
            using (HttpResponseMessage response = client.GetAsync(uri).Result)
            {
                if (response.IsSuccessStatusCode)
                {
                    logger.InfoFormat("Succeeded in contacting {0}", uri);
                    return CheckResult.Pass;
                }
                string error = $"Failed to contact '{uri}'. HttpStatusCode: {response.StatusCode}";
                logger.Info(error);
                return CheckResult.Failed(error);
            }
        }
        catch (Exception exception)
        {
            string error = $"Failed to contact '{uri}'. Error: {exception.Message}";
            logger.Info(error);
            return CheckResult.Failed(error);
        }
    }
}