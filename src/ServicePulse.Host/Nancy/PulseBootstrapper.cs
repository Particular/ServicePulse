namespace ServicePulse.Host.Nancy
{
#if DEBUG
    using System;
#endif
    using System.IO;
    using global::Nancy;
    using global::Nancy.Bootstrapper;
    using global::Nancy.Conventions;
    using global::Nancy.Diagnostics;
    using global::Nancy.Responses;
    using global::Nancy.TinyIoc;

    public class PulseBootstrapper : DefaultNancyBootstrapper
    {
        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            DiagnosticsHook.Disable(pipelines);
        }

        protected override void ConfigureConventions(NancyConventions conventions)
        {
            base.ConfigureConventions(conventions);
            conventions.StaticContentsConventions.Clear();
            conventions.StaticContentsConventions.Add((ctx, root) =>
            {
                var reqPath = ctx.Request.Path;

                if (reqPath.Equals("/"))
                {
                    reqPath = "/index.html";
                }

                reqPath = "app" + reqPath.Replace('/', '\\');

                var fileName = Path.GetFullPath(Path.Combine(root, reqPath));
                if (File.Exists(fileName))
                {
                    return new GenericFileResponse(fileName, ctx);
                }

                return new SpecialEmbeddedFileResponse(
                    GetType().Assembly,
                    reqPath);
            });
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