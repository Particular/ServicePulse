namespace Pulse.Host
{
    using System;
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
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/lib", "/app/lib"));
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/js", "/app/js"));
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/css", "/app/css"));
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/img", "/app/img"));
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/fonts", "/app/fonts"));
            conventions.StaticContentsConventions.Add(StaticContentConventionBuilder.AddDirectory("/font", "/app/fonts"));
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
        }

        protected override IRootPathProvider RootPathProvider
        {
            get { return new CustomRootPathProvider(); }
        }

        protected override DiagnosticsConfiguration DiagnosticsConfiguration
        {
            get { return new DiagnosticsConfiguration {Password = @"Welcome1"}; }
        }

        class CustomRootPathProvider : IRootPathProvider
        {
            public string GetRootPath()
            {
#if DEBUG
                return Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..\\..\\"));
#endif
                return AppDomain.CurrentDomain.BaseDirectory;
            }
        }
    }
}