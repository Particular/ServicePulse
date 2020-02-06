// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Owin;
using Owin;

namespace ServicePulse.Host.Owin
{
    using AppFunc = Func<IDictionary<string, object>, Task>;

    public class StaticFileMiddleware : OwinMiddleware
    {
        public StaticFileMiddleware(OwinMiddleware next) : base(next)
        {
        }
        
        public override Task Invoke(IOwinContext context)
        {
            var fileContext = new StaticFileContext(context);
            if (fileContext.ValidateMethod()
                && fileContext.LookupContentType()
                && fileContext.LookupFileInfo())
            {
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
