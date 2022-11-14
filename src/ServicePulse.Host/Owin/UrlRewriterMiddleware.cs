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

            //HINT: This is needed to handle app.constants.js requests from AngularJS application
            //      and allow users to keep their backed url configurations in the same place
            if (requestPath.StartsWith("/a/js/app.constants.js"))
            {
                context.Request.Path = new PathString("/js/app.constants.js");
            }
            //HINT: This is needed to handle default route for AngularJS
            //      Can be removed when AngularJS is out
            else if (requestPath.Equals("/a/"))
            {
                context.Request.Path = new PathString("/a/index.html");
            }
            //HINT: This is needed to handle assets for AngularJS
            //      Can be removed when AngularJS is out
            else if (requestPath.StartsWith("/a/"))
            {
                //NOP
            }
            //HINT: All urls that do not map to files on the disk should be mapped to /index.html for Vue.js
            else if (!requestPath.StartsWith("/assets/") && !requestPath.Equals("favicon.ico"))
            {
                context.Request.Path = new PathString("/index.html");
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
