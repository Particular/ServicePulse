using System;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;

namespace ServicePulse.Host.Owin
{
    public class IndexUrlRewriterMiddleware : OwinMiddleware
    {
        public IndexUrlRewriterMiddleware(OwinMiddleware next) : base(next)
        {
        }

        public override Task Invoke(IOwinContext context)
        {
            if (context.Request.Path.ToString().Equals("/"))
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
        /// <param name="builder"></param>
        /// <returns></returns>
        public static IAppBuilder UseIndexUrlRewriter(this IAppBuilder builder)
        {
            if (builder == null)
            {
                throw new ArgumentNullException(nameof(builder));
            }
            return builder.Use<IndexUrlRewriterMiddleware>();
        }
    }
}
