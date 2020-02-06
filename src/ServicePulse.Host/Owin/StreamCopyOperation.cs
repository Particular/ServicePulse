// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace ServicePulse.Host.Owin
{
    public class StreamCopyOperation
    {
        private readonly TaskCompletionSource<object> _tcs;
        private readonly Stream _source;
        private readonly Stream _destination;
        private readonly byte[] _buffer;
        private readonly AsyncCallback _readCallback;
        private readonly AsyncCallback _writeCallback;
        private long? _bytesRemaining;
        private CancellationToken _cancel;

        internal StreamCopyOperation(
          Stream source,
          Stream destination,
          long? bytesRemaining,
          CancellationToken cancel)
          : this(source, destination, bytesRemaining, 65536, cancel)
        {
        }

        internal StreamCopyOperation(
          Stream source,
          Stream destination,
          long? bytesRemaining,
          int bufferSize,
          CancellationToken cancel)
          : this(source, destination, bytesRemaining, new byte[bufferSize], cancel)
        {
        }

        internal StreamCopyOperation(
          Stream source,
          Stream destination,
          long? bytesRemaining,
          byte[] buffer,
          CancellationToken cancel)
        {
            this._source = source;
            this._destination = destination;
            this._bytesRemaining = bytesRemaining;
            this._cancel = cancel;
            this._buffer = buffer;
            this._tcs = new TaskCompletionSource<object>();
            this._readCallback = this.ReadCallback;
            this._writeCallback = this.WriteCallback;
        }

        internal Task Start()
        {
            ReadNextSegment();
            return (Task)_tcs.Task;
        }

        private void Complete()
        {
            _tcs.TrySetResult(null);
        }

        private bool CheckCancelled()
        {
            if (!_cancel.IsCancellationRequested)
                return false;
            _tcs.TrySetCanceled();
            return true;
        }

        private void Fail(Exception ex)
        {
            _tcs.TrySetException(ex);
        }

        private void ReadNextSegment()
        {
            if (_bytesRemaining.HasValue && _bytesRemaining.Value <= 0L)
            {
                Complete();
            }
            else
            {
                if (CheckCancelled())
                    return;
                try
                {
                    var count = _buffer.Length;
                    if (_bytesRemaining.HasValue)
                        count = (int)Math.Min(_bytesRemaining.Value, count);
                    var asyncResult = _source.BeginRead(_buffer, 0, count, _readCallback, null);
                    if (!asyncResult.CompletedSynchronously)
                        return;
                    WriteToOutputStream(_source.EndRead(asyncResult));
                }
                catch (Exception ex)
                {
                    Fail(ex);
                }
            }
        }

        private void ReadCallback(IAsyncResult async)
        {
            if (async.CompletedSynchronously)
                return;
            try
            {
                WriteToOutputStream(_source.EndRead(async));
            }
            catch (Exception ex)
            {
                Fail(ex);
            }
        }

        private void WriteToOutputStream(int count)
        {
            long num = count;
            if (_bytesRemaining.HasValue)
            {
                var bytesRemaining = _bytesRemaining;
                _bytesRemaining = bytesRemaining.HasValue ? bytesRemaining.GetValueOrDefault() - num : new long?();
            }
            if (count == 0)
            {
                this.Complete();
            }
            else
            {
                if (this.CheckCancelled())
                    return;
                try
                {
                    var asyncResult = _destination.BeginWrite(_buffer, 0, count, _writeCallback, null);
                    if (!asyncResult.CompletedSynchronously)
                        return;
                    _destination.EndWrite(asyncResult);
                    ReadNextSegment();
                }
                catch (Exception ex)
                {
                    this.Fail(ex);
                }
            }
        }

        private void WriteCallback(IAsyncResult async)
        {
            if (async.CompletedSynchronously)
                return;
            try
            {
                _destination.EndWrite(async);
                ReadNextSegment();
            }
            catch (Exception ex)
            {
                Fail(ex);
            }
        }
    }
}
