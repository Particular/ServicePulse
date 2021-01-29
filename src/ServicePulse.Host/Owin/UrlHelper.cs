namespace ServicePulse.Host.Owin
{
    using System;

    public static class UrlHelper
    {
        public static string RewriteLocalhostUrl(string url)
        {
            var newUrl = new UriBuilder(url);

            // not localhost
            if (newUrl.Host.Contains("."))
            {
                return url;
            }

            return newUrl.ToString().Replace("localhost", "+");
        }
    }
}
