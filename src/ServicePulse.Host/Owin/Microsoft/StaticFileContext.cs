﻿// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See THIRD-PARTY-NOTICES.txt in the project root for license information.

namespace ServicePulse.Host.Owin.Microsoft
{
    using System;
    using System.Collections.Generic;
    using System.Globalization;
    using System.Threading.Tasks;
    using global::Microsoft.Owin;
    using SendFileFunc = System.Func<string, long, long?, System.Threading.CancellationToken, System.Threading.Tasks.Task>;

    struct StaticFileContext
    {
        readonly IOwinRequest request;
        readonly IOwinResponse response;
        string method;
        bool isGet;
        string contentType;
        IFileInfo fileInfo;
        long length;
        DateTime lastModified;
        string lastModifiedString;
        string etag;
        string etagQuoted;

        PreconditionState ifMatchState;
        PreconditionState ifNoneMatchState;
        PreconditionState ifModifiedSinceState;
        PreconditionState ifUnmodifiedSinceState;

        public StaticFileContext(IOwinContext context)
        {
            request = context.Request;
            response = context.Response;

            method = null;
            isGet = false;
            IsHeadMethod = false;
            contentType = null;
            fileInfo = null;
            length = 0;
            lastModified = default;
            etag = null;
            etagQuoted = null;
            lastModifiedString = null;
            ifMatchState = PreconditionState.Unspecified;
            ifNoneMatchState = PreconditionState.Unspecified;
            ifModifiedSinceState = PreconditionState.Unspecified;
            ifUnmodifiedSinceState = PreconditionState.Unspecified;
        }

        internal enum PreconditionState
        {
            Unspecified,
            NotModified,
            ShouldProcess,
            PreconditionFailed,
        }

        public bool IsHeadMethod { get; private set; }

        public bool ValidateMethod()
        {
            method = request.Method;
            isGet = string.Equals("GET", method, StringComparison.OrdinalIgnoreCase);
            IsHeadMethod = string.Equals("HEAD", method, StringComparison.OrdinalIgnoreCase);
            return isGet || IsHeadMethod;
        }

        public bool SetPayload(IFileInfo fileInfo, string contentType)
        {
            this.contentType = contentType;
            this.fileInfo = fileInfo;
            length = this.fileInfo.Length;

            var last = this.fileInfo.LastModified;
            // Truncate to the second.
            lastModified = new DateTime(last.Year, last.Month, last.Day, last.Hour, last.Minute, last.Second, last.Kind);
            lastModifiedString = lastModified.ToString(Constants.HttpDateFormat, CultureInfo.InvariantCulture);

            long etagHash = lastModified.ToFileTimeUtc() ^ length;
            etag = Convert.ToString(etagHash, 16);
            etagQuoted = '\"' + etag + '\"';
            return true;
        }

        public void ComprehendRequestHeaders()
        {
            ComputeIfMatch();

            ComputeIfModifiedSince();
        }

        void ComputeIfMatch()
        {
            // 14.24 If-Match
            IList<string> ifMatch = request.Headers.GetCommaSeparatedValues(Constants.IfMatch); // Removes quotes
            if (ifMatch != null)
            {
                ifMatchState = PreconditionState.PreconditionFailed;
                foreach (var segment in ifMatch)
                {
                    if (segment.Equals("*", StringComparison.Ordinal)
                        || segment.Equals(etag, StringComparison.Ordinal))
                    {
                        ifMatchState = PreconditionState.ShouldProcess;
                        break;
                    }
                }
            }

            // 14.26 If-None-Match
            var ifNoneMatch = request.Headers.GetCommaSeparatedValues(Constants.IfNoneMatch);
            if (ifNoneMatch != null)
            {
                ifNoneMatchState = PreconditionState.ShouldProcess;
                foreach (var segment in ifNoneMatch)
                {
                    if (segment.Equals("*", StringComparison.Ordinal)
                        || segment.Equals(etag, StringComparison.Ordinal))
                    {
                        ifNoneMatchState = PreconditionState.NotModified;
                        break;
                    }
                }
            }
        }

        static bool TryParseHttpDate(string dateString, out DateTime parsedDate)
        {
            return DateTime.TryParseExact(dateString, "r", CultureInfo.InvariantCulture, DateTimeStyles.None, out parsedDate);
        }

        void ComputeIfModifiedSince()
        {
            // 14.25 If-Modified-Since
            var ifModifiedSinceString = request.Headers.Get(Constants.IfModifiedSince);
            if (TryParseHttpDate(ifModifiedSinceString, out var ifModifiedSince))
            {
                var modified = ifModifiedSince < lastModified;
                ifModifiedSinceState = modified ? PreconditionState.ShouldProcess : PreconditionState.NotModified;
            }

            // 14.28 If-Unmodified-Since
            var ifUnmodifiedSinceString = request.Headers.Get(Constants.IfUnmodifiedSince);
            if (TryParseHttpDate(ifUnmodifiedSinceString, out var ifUnmodifiedSince))
            {
                var unmodified = ifUnmodifiedSince >= lastModified;
                ifUnmodifiedSinceState = unmodified ? PreconditionState.ShouldProcess : PreconditionState.PreconditionFailed;
            }
        }

        public void ApplyResponseHeaders(int statusCode)
        {
            response.StatusCode = statusCode;
            if (statusCode < 400)
            {
                // these headers are returned for 200, 206, and 304
                // they are not returned for 412 and 416
                if (!string.IsNullOrEmpty(contentType))
                {
                    response.ContentType = contentType;
                }
                response.Headers.Set(Constants.LastModified, lastModifiedString);
                response.ETag = etagQuoted;
            }
            if (statusCode == Constants.Status200Ok)
            {
                // this header is only returned here for 200
                // it already set to the returned range for 206
                // it is not returned for 304, 412, and 416
                response.ContentLength = length;
            }
        }

        public PreconditionState GetPreconditionState()
        {
            return GetMaxPreconditionState(
                ifMatchState,
                ifNoneMatchState,
                ifModifiedSinceState,
                ifUnmodifiedSinceState);
        }

        static PreconditionState GetMaxPreconditionState(params PreconditionState[] states)
        {
            var max = PreconditionState.Unspecified;
            foreach (var t in states)
            {
                if (t > max)
                {
                    max = t;
                }
            }
            return max;
        }

        public Task SendStatusAsync(int statusCode)
        {
            ApplyResponseHeaders(statusCode);

            return Constants.CompletedTask;
        }

        public async Task SendAsync()
        {
            ApplyResponseHeaders(Constants.Status200Ok);

            var physicalPath = fileInfo.PhysicalPath;
            var sendFile = response.Get<SendFileFunc>(Constants.SendFileAsyncKey);
            if (sendFile != null && !string.IsNullOrEmpty(physicalPath))
            {
                await sendFile(physicalPath, 0, length, request.CallCancelled)
                    .ConfigureAwait(false);
            }

            using (var readStream = fileInfo.CreateReadStream())
            {
                await new StreamCopyOperation(readStream, response.Body, length, request.CallCancelled).Start()
                    .ConfigureAwait(false);
            }
        }
    }
}
