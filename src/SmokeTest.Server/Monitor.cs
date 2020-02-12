using System;
using System.Net.Http;
using System.Threading.Tasks;
using NServiceBus.CustomChecks;
using NServiceBus.Logging;

abstract class Monitor : CustomCheck
{
    Uri uri;
    static ILog logger = LogManager.GetLogger<Monitor>();

    protected Monitor(Uri uri, TimeSpan interval)
        : base($"Monitor {uri}", "Monitor 3rd Party ", interval)
    {
        this.uri = uri;
    }

    public override async Task<CheckResult> PerformCheck()
    {
        try
        {
            using (HttpClient client = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(3),
            })
            using (var response = await client.GetAsync(uri))
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