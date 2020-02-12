using System;

namespace ServicePulse.Host.Owin
{
    public static class UrlHelper
    {
        public static string RewriteLocalhostUrl(string url)
        {
            var newUrl = new UriBuilder(url);

            if (newUrl.Host.Contains(".")) //not localhost
            {
                return url;
            }

            return newUrl.ToString().Replace("localhost", "+");
        }
    }
}
