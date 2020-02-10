using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;

namespace ServicePulse.Host.Owin
{
    public class StaticFileMiddleware : OwinMiddleware
    {
        public StaticFileMiddleware(OwinMiddleware next) : base(next)
        {
        }
        
        public override Task Invoke(IOwinContext context)
        {
            var path = context.Request.Path.ToString();
            var fileContext = new StaticFileContext(context);
            if (fileContext.ValidateMethod() && FindFile(path, out var fileInfo))
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

            return Next.Invoke(context);
        }

        private static bool FindFile(string path, out IFileInfo fileInfo)
        {
            var filePath = "app" + path.Replace('/', '\\');

            return FileOnDiskFinder.FindFile(filePath, out fileInfo) || EmbeddedFileFinder.FindEmbeddedFile(filePath, out fileInfo);
        }

        private static string FindContentType(string path)
        {
            FileExtensionContentTypeProvider.TryGetContentType(Path.GetFileName(path), out var contentType);
            return contentType ?? ("application/octet-stream");
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
        /// <param name="builder"></param>
        /// <returns></returns>
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
