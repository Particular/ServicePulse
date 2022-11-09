namespace ServicePulse.Host.Owin
{
    using System;
    using System.Threading.Tasks;
    using global::Microsoft.Owin;
    using global::Owin;

    public class UrlRewriterMiddleware : OwinMiddleware
    {
        public UrlRewriterMiddleware(OwinMiddleware next) : base(next)
        {
        }

        public override Task Invoke(IOwinContext context)
        {
            var requestPath = context.Request.Path.ToString();

            if (requestPath.Equals("/"))
            {
                context.Request.Path = new PathString("/index.html");
            }

            if (requestPath.Equals("/angular/"))
            {
                context.Request.Path = new PathString("/angular/index.html");
            }

            if (requestPath.StartsWith("/angular/js/app.constants.js"))
            {
                context.Request.Path = new PathString("/app/js/app.constants.js");
            }

            return Next.Invoke(context);
        }
    }

    /// <summary>
    /// Extension methods for the StaticFileMiddleware
    /// </summary>
    public static class IndexUrlRewriterExtensions
    {
        /// <summary>
        /// Enables static file serving for the current request path from the current directory
        /// </summary>
        public static IAppBuilder UseIndexUrlRewriter(this IAppBuilder builder)
        {
            if (builder == null)
            {
                throw new ArgumentNullException(nameof(builder));
            }
            return builder.Use<UrlRewriterMiddleware>();
        }
    }
}
