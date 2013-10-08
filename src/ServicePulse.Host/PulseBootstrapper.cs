namespace Pulse.Host
{
#if DEBUG
    using System;
#endif
    using System.IO;
    using Nancy;
    using Nancy.Conventions;
    using Nancy.Diagnostics;
    using Nancy.Responses;

    public class PulseBootstrapper : DefaultNancyBootstrapper
    {
        protected override void ConfigureConventions(NancyConventions conventions)
        {
            base.ConfigureConventions(conventions);
           
            conventions.StaticContentsConventions.Clear();
#if DEBUG
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/lib", "/app/lib"));
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/js", "/app/js"));
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/css", "/app/css"));
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/img", "/app/img"));
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/font", "/app/font"));
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/partials", "/app/partials"));
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddFile("/NoIE.html", "/app/NoIE.html"));
            conventions.StaticContentsConventions.Add((ctx, root) =>
            {
                var reqPath = ctx.Request.Path;

                if (!reqPath.Equals("/"))
                {
                    return null;
                }

                var fileName = Path.GetFullPath(Path.Combine(root, "app/index.html"));

                 return new GenericFileResponse(fileName, ctx);
                });
                
#else
            conventions.StaticContentsConventions.Add((ctx, root) =>
            {
                var reqPath = ctx.Request.Path.Replace('/', '.');

                if (reqPath.Equals("."))
                {
                    reqPath = "index.html";
                }

                if (reqPath.StartsWith("."))
                {
                    reqPath = reqPath.Substring(1);
                }

                return new EmbeddedFileResponse(
                    GetType().Assembly,
                    "ServicePulse.Host.app",
                    Path.GetFileName(reqPath));
            });
#endif
        }

        protected override DiagnosticsConfiguration DiagnosticsConfiguration
        {
            get { return new DiagnosticsConfiguration {Password = @"Welcome1"}; }
        }
#if DEBUG
        protected override IRootPathProvider RootPathProvider
        {
            get { return new CustomRootPathProvider(); }
        }

        class CustomRootPathProvider : IRootPathProvider
        {
            public string GetRootPath()
            {

                return Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..\\..\\"));
            }
        }
#endif
    }
}