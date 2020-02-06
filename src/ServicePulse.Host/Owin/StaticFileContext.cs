// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Owin;

namespace ServicePulse.Host.Owin
{
    using SendFileFunc = Func<string, long, long?, CancellationToken, Task>;

    internal struct StaticFileContext
    {
        private readonly IOwinContext _context;
        private readonly IOwinRequest _request;
        private readonly IOwinResponse _response;
        private string _method;
        private bool _isGet;
        private PathString _subPath;
        private string _contentType;
        private IFileInfo _fileInfo;
        private long _length;
        private DateTime _lastModified;
        private string _lastModifiedString;
        private string _etag;
        private string _etagQuoted;

        private PreconditionState _ifMatchState;
        private PreconditionState _ifNoneMatchState;
        private PreconditionState _ifModifiedSinceState;
        private PreconditionState _ifUnmodifiedSinceState;
        
        public StaticFileContext(IOwinContext context)
        {
            _context = context;
            _request = context.Request;
            _response = context.Response;

            _method = null;
            _isGet = false;
            IsHeadMethod = false;
            _subPath = PathString.Empty;
            _contentType = null;
            _fileInfo = null;
            _length = 0;
            _lastModified = new DateTime();
            _etag = null;
            _etagQuoted = null;
            _lastModifiedString = null;
            _ifMatchState = PreconditionState.Unspecified;
            _ifNoneMatchState = PreconditionState.Unspecified;
            _ifModifiedSinceState = PreconditionState.Unspecified;
            _ifUnmodifiedSinceState = PreconditionState.Unspecified;
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
            _method = _request.Method;
            _isGet = string.Equals("GET", _method, StringComparison.OrdinalIgnoreCase);
            IsHeadMethod = string.Equals("HEAD", _method, StringComparison.OrdinalIgnoreCase);
            return _isGet || IsHeadMethod;
        }

       public bool LookupContentType()
       {
           var fileName = Path.GetFileName(_context.Request.Path.ToString());
           return FileExtensionContentTypeProvider.TryGetContentType(fileName, out _contentType);
        }

        public bool LookupFileInfo()
        {
            var found = FindFile(out _fileInfo);
            if (!found)
            {
                return false;
            }

            _length = _fileInfo.Length;

            var last = _fileInfo.LastModified;
            // Truncate to the second.
            _lastModified = new DateTime(last.Year, last.Month, last.Day, last.Hour, last.Minute, last.Second, last.Kind);
            _lastModifiedString = _lastModified.ToString(Constants.HttpDateFormat, CultureInfo.InvariantCulture);

            long etagHash = _lastModified.ToFileTimeUtc() ^ _length;
            _etag = Convert.ToString(etagHash, 16);
            _etagQuoted = '\"' + _etag + '\"';
            return true;
        }

        private bool FindFile(out IFileInfo fileInfo)
        {
            var requestPath = _context.Request.Path.ToString();

            if (requestPath.Equals("/"))
            {
                requestPath = "/index.html";
            }

            var filePath = "app" + requestPath.Replace('/', '\\');

            return FileOnDiskFinder.FindFile(filePath, out fileInfo); //TODO fix support for embedded files
        }


        public void ComprehendRequestHeaders()
        {
            ComputeIfMatch();

            ComputeIfModifiedSince();
        }

        private void ComputeIfMatch()
        {
            // 14.24 If-Match
            IList<string> ifMatch = _request.Headers.GetCommaSeparatedValues(Constants.IfMatch); // Removes quotes
            if (ifMatch != null)
            {
                _ifMatchState = PreconditionState.PreconditionFailed;
                foreach (var segment in ifMatch)
                {
                    if (segment.Equals("*", StringComparison.Ordinal)
                        || segment.Equals(_etag, StringComparison.Ordinal))
                    {
                        _ifMatchState = PreconditionState.ShouldProcess;
                        break;
                    }
                }
            }

            // 14.26 If-None-Match
            var ifNoneMatch = _request.Headers.GetCommaSeparatedValues(Constants.IfNoneMatch);
            if (ifNoneMatch != null)
            {
                _ifNoneMatchState = PreconditionState.ShouldProcess;
                foreach (var segment in ifNoneMatch)
                {
                    if (segment.Equals("*", StringComparison.Ordinal)
                        || segment.Equals(_etag, StringComparison.Ordinal))
                    {
                        _ifNoneMatchState = PreconditionState.NotModified;
                        break;
                    }
                }
            }
        }

        internal static bool TryParseHttpDate(string dateString, out DateTime parsedDate)
        {
            return DateTime.TryParseExact(dateString, "r", (IFormatProvider)CultureInfo.InvariantCulture, DateTimeStyles.None, out parsedDate);
        }

        private void ComputeIfModifiedSince()
        {
            // 14.25 If-Modified-Since
            var ifModifiedSinceString = _request.Headers.Get(Constants.IfModifiedSince);
            if (TryParseHttpDate(ifModifiedSinceString, out var ifModifiedSince))
            {
                var modified = ifModifiedSince < _lastModified;
                _ifModifiedSinceState = modified ? PreconditionState.ShouldProcess : PreconditionState.NotModified;
            }

            // 14.28 If-Unmodified-Since
            var ifUnmodifiedSinceString = _request.Headers.Get(Constants.IfUnmodifiedSince);
            if (TryParseHttpDate(ifUnmodifiedSinceString, out var ifUnmodifiedSince))
            {
                var unmodified = ifUnmodifiedSince >= _lastModified;
                _ifUnmodifiedSinceState = unmodified ? PreconditionState.ShouldProcess : PreconditionState.PreconditionFailed;
            }
        }

        public void ApplyResponseHeaders(int statusCode)
        {
            _response.StatusCode = statusCode;
            if (statusCode < 400)
            {
                // these headers are returned for 200, 206, and 304
                // they are not returned for 412 and 416
                if (!string.IsNullOrEmpty(_contentType))
                {
                    _response.ContentType = _contentType;
                }
                _response.Headers.Set(Constants.LastModified, _lastModifiedString);
                _response.ETag = _etagQuoted;
            }
            if (statusCode == Constants.Status200Ok)
            {
                // this header is only returned here for 200
                // it already set to the returned range for 206
                // it is not returned for 304, 412, and 416
                _response.ContentLength = _length;
            }
        }

        public PreconditionState GetPreconditionState()
        {
            return GetMaxPreconditionState(_ifMatchState, _ifNoneMatchState,
                _ifModifiedSinceState, _ifUnmodifiedSinceState);
        }

        private static PreconditionState GetMaxPreconditionState(params PreconditionState[] states)
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

        public Task SendAsync()
        {
            ApplyResponseHeaders(Constants.Status200Ok);

            var physicalPath = _fileInfo.PhysicalPath;
            var sendFile = _response.Get<SendFileFunc>(Constants.SendFileAsyncKey);
            if (sendFile != null && !string.IsNullOrEmpty(physicalPath))
            {
                return sendFile(physicalPath, 0, _length, _request.CallCancelled);
            }

            var readStream = _fileInfo.CreateReadStream();
            var copyOperation = new StreamCopyOperation(readStream, _response.Body, _length, _request.CallCancelled);
            var task = copyOperation.Start();
            task.ContinueWith(resultTask => readStream.Close(), TaskContinuationOptions.ExecuteSynchronously);
            return task;
        }
    }
}
