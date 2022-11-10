namespace ServicePulse.Host.Owin
{
    using System;
    using System.IO;
    using System.Threading.Tasks;
    using global::Microsoft.Owin;
    using global::Owin;
    using ServicePulse.Host.Owin.Microsoft;

    public class StaticFileMiddleware : OwinMiddleware
    {
        public StaticFileMiddleware(OwinMiddleware next) : base(next)
        {
        }

        public override Task Invoke(IOwinContext context)
        {
            var path = context.Request.Path.ToString();
            var fileContext = new StaticFileContext(context);
            if (fileContext.ValidateMethod())
            {
                var fileInfo = FindFile(path);
                if (fileInfo != null)
                {
                    var contentType = FindContentType(path);
                    fileContext.SetPayload(fileInfo, contentType);
                    fileContext.ComprehendRequestHeaders();

                    switch (fileContext.GetPreconditionState())
                    {
                        case StaticFileContext.PreconditionState.Unspecified:
                        case StaticFileContext.PreconditionState.ShouldProcess:
                            if (fileContext.IsHeadMethod)
                            {
                                return fileContext.SendStatusAsync(Constants.Status200Ok);
                            }

                            return fileContext.SendAsync();

                        case StaticFileContext.PreconditionState.NotModified:
                            return fileContext.SendStatusAsync(Constants.Status304NotModified);

                        case StaticFileContext.PreconditionState.PreconditionFailed:
                            return fileContext.SendStatusAsync(Constants.Status412PreconditionFailed);

                        default:
                            throw new NotImplementedException(fileContext.GetPreconditionState().ToString());
                    }
                }
            }

            return Next.Invoke(context);
        }

        static IFileInfo FindFile(string path)
        {
            var filePath = "app" + path.Replace('/', '\\');

            var fileOnDisk = FileOnDiskFinder.FindFile(filePath);
            if (fileOnDisk != null)
            {
                return fileOnDisk;
            }

            var fileEmbedded = EmbeddedFileFinder.FindEmbeddedFile(filePath);
            if (fileEmbedded != null)
            {
                return fileEmbedded;
            }

            return null;
        }

        static string FindContentType(string path)
        {
            FileExtensionContentTypeProvider.TryGetContentType(Path.GetFileName(path), out var contentType);
            return contentType ?? "application/octet-stream";
        }
    }

    /// <summary>
    /// Extension methods for the StaticFileMiddleware
    /// </summary>
    public static class StaticFileExtensions
    {
        /// <summary>
        /// Enables static file serving for the current request path from the current directory
        /// </summary>
        public static IAppBuilder UseStaticFiles(this IAppBuilder builder)
        {
            if (builder == null)
            {
                throw new ArgumentNullException(nameof(builder));
            }
            return builder.Use<StaticFileMiddleware>();
        }
    }
}
