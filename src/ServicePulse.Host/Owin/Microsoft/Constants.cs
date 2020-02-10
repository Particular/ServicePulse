// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

using System.Threading.Tasks;

namespace ServicePulse.Host.Owin.Microsoft
{
    internal static class Constants
    {
        internal static readonly Task CompletedTask = CreateCompletedTask();
        internal const string SendFileAsyncKey = "sendfile.SendAsync";
        internal const string Location = "Location";
        internal const string IfMatch = "If-Match";
        internal const string IfNoneMatch = "If-None-Match";
        internal const string IfModifiedSince = "If-Modified-Since";
        internal const string IfUnmodifiedSince = "If-Unmodified-Since";
        internal const string IfRange = "If-Range";
        internal const string Range = "Range";
        internal const string ContentRange = "Content-Range";
        internal const string LastModified = "Last-Modified";
        internal const string HttpDateFormat = "r";
        internal const int Status200Ok = 200;
        internal const int Status304NotModified = 304;
        internal const int Status412PreconditionFailed = 412;

        private static Task CreateCompletedTask()
        {
            var completionSource = new TaskCompletionSource<object>();
            completionSource.SetResult((object)null);
            return completionSource.Task;
        }
    }
}
