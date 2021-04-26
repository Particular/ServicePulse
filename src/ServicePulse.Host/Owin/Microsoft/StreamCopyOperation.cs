// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See THIRD-PARTY-NOTICES.txt in the project root for license information.

namespace ServicePulse.Host.Owin.Microsoft
{
    using System;
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;

    public class StreamCopyOperation
    {
        readonly TaskCompletionSource<object> tcs;
        readonly Stream source;
        readonly Stream destination;
        readonly byte[] buffer;
        readonly AsyncCallback readCallback;
        readonly AsyncCallback writeCallback;
        long? bytesRemaining;
        CancellationToken cancellationToken;

        internal StreamCopyOperation(
          Stream source,
          Stream destination,
          long? bytesRemaining,
          CancellationToken cancellationToken)
          : this(source, destination, bytesRemaining, 65536, cancellationToken)
        {
        }

        internal StreamCopyOperation(
          Stream source,
          Stream destination,
          long? bytesRemaining,
          int bufferSize,
          CancellationToken cancellationToken)
          : this(source, destination, bytesRemaining, new byte[bufferSize], cancellationToken)
        {
        }

        internal StreamCopyOperation(
          Stream source,
          Stream destination,
          long? bytesRemaining,
          byte[] buffer,
          CancellationToken cancellationToken)
        {
            this.source = source;
            this.destination = destination;
            this.bytesRemaining = bytesRemaining;
            this.cancellationToken = cancellationToken;
            this.buffer = buffer;
            tcs = new TaskCompletionSource<object>();
            readCallback = ReadCallback;
            writeCallback = WriteCallback;
        }

        internal Task Start()
        {
            ReadNextSegment();
            return tcs.Task;
        }

        void Complete()
        {
            tcs.TrySetResult(null);
        }

        bool CheckCancelled()
        {
            if (!cancellationToken.IsCancellationRequested)
            {
                return false;
            }

            tcs.TrySetCanceled();
            return true;
        }

        void Fail(Exception ex)
        {
            tcs.TrySetException(ex);
        }

        void ReadNextSegment()
        {
            if (bytesRemaining.HasValue && bytesRemaining.Value <= 0L)
            {
                Complete();
            }
            else
            {
                if (CheckCancelled())
                {
                    return;
                }

                try
                {
                    var count = buffer.Length;
                    if (bytesRemaining.HasValue)
                    {
                        count = (int)Math.Min(bytesRemaining.Value, count);
                    }

                    var asyncResult = source.BeginRead(buffer, 0, count, readCallback, null);
                    if (!asyncResult.CompletedSynchronously)
                    {
                        return;
                    }

                    WriteToOutputStream(source.EndRead(asyncResult));
                }
                catch (Exception ex)
                {
                    Fail(ex);
                }
            }
        }

        void ReadCallback(IAsyncResult async)
        {
            if (async.CompletedSynchronously)
            {
                return;
            }

            try
            {
                WriteToOutputStream(source.EndRead(async));
            }
            catch (Exception ex)
            {
                Fail(ex);
            }
        }

        void WriteToOutputStream(int count)
        {
            long num = count;
            if (bytesRemaining.HasValue)
            {
                var bytesRemaining = this.bytesRemaining;
                this.bytesRemaining = bytesRemaining.HasValue ? bytesRemaining.GetValueOrDefault() - num : default(long?);
            }
            if (count == 0)
            {
                Complete();
            }
            else
            {
                if (CheckCancelled())
                {
                    return;
                }

                try
                {
                    var asyncResult = destination.BeginWrite(buffer, 0, count, writeCallback, null);
                    if (!asyncResult.CompletedSynchronously)
                    {
                        return;
                    }

                    destination.EndWrite(asyncResult);
                    ReadNextSegment();
                }
                catch (Exception ex)
                {
                    Fail(ex);
                }
            }
        }

        void WriteCallback(IAsyncResult async)
        {
            if (async.CompletedSynchronously)
            {
                return;
            }

            try
            {
                destination.EndWrite(async);
                ReadNextSegment();
            }
            catch (Exception ex)
            {
                Fail(ex);
            }
        }
    }
}
