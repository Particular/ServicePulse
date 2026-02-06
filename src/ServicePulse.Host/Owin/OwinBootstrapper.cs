namespace ServicePulse.Host.Owin
{
    using global::Owin;

    public class OwinBootstrapper
    {
        public static ForwardedHeadersOptions ForwardedHeadersOptions { get; set; } = new ForwardedHeadersOptions();
        public static HttpsOptions HttpsOptions { get; set; } = new HttpsOptions();
        public static bool EnableDebugEndpoint { get; set; }

        public void Configuration(IAppBuilder app)
        {
            // Forwarded headers must be first in the pipeline
            app.UseForwardedHeaders(ForwardedHeadersOptions);

            // HTTPS middleware (HSTS and HTTP-to-HTTPS redirect)
            app.UseHttpsMiddleware(HttpsOptions);

            // Debug endpoint for testing forwarded headers (only in debug builds)
#if DEBUG
            if (EnableDebugEndpoint)
            {
                app.UseDebugRequestInfo(ForwardedHeadersOptions);
            }
#endif

            app.UseIndexUrlRewriter();
            app.UseStaticFiles();
        }
    }
}
