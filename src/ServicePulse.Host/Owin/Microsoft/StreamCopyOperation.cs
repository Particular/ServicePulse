// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See THIRD-PARTY-NOTICES.txt in the project root for license information.

namespace ServicePulse.Host.Owin.Microsoft
{
    using System;
    using System.IO;
    using System.Threading;
    using System.Threading.Tasks;

    public class StreamCopyOperation
    {
        private readonly TaskCompletionSource<object> tcs;
        private readonly Stream source;
        private readonly Stream destination;
        private readonly byte[] buffer;
        private readonly AsyncCallback readCallback;
        private readonly AsyncCallback writeCallback;
        private long? bytesRemaining;
        private CancellationToken cancel;

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
            this.source = source;
            this.destination = destination;
            this.bytesRemaining = bytesRemaining;
            this.cancel = cancel;
            this.buffer = buffer;
            this.tcs = new TaskCompletionSource<object>();
            this.readCallback = this.ReadCallback;
            this.writeCallback = this.WriteCallback;
        }

        internal Task Start()
        {
            ReadNextSegment();
            return (Task)tcs.Task;
        }

        private void Complete()
        {
            tcs.TrySetResult(null);
        }

        private bool CheckCancelled()
        {
            if (!cancel.IsCancellationRequested)
                return false;
            tcs.TrySetCanceled();
            return true;
        }

        private void Fail(Exception ex)
        {
            tcs.TrySetException(ex);
        }

        private void ReadNextSegment()
        {
            if (bytesRemaining.HasValue && bytesRemaining.Value <= 0L)
            {
                Complete();
            }
            else
            {
                if (CheckCancelled())
                    return;
                try
                {
                    var count = buffer.Length;
                    if (bytesRemaining.HasValue)
                        count = (int)Math.Min(bytesRemaining.Value, count);
                    var asyncResult = source.BeginRead(buffer, 0, count, readCallback, null);
                    if (!asyncResult.CompletedSynchronously)
                        return;
                    WriteToOutputStream(source.EndRead(asyncResult));
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
                WriteToOutputStream(source.EndRead(async));
            }
            catch (Exception ex)
            {
                Fail(ex);
            }
        }

        private void WriteToOutputStream(int count)
        {
            long num = count;
            if (bytesRemaining.HasValue)
            {
                var bytesRemaining = this.bytesRemaining;
                this.bytesRemaining = bytesRemaining.HasValue ? bytesRemaining.GetValueOrDefault() - num : default(long?);
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
                    var asyncResult = destination.BeginWrite(buffer, 0, count, writeCallback, null);
                    if (!asyncResult.CompletedSynchronously)
                        return;
                    destination.EndWrite(asyncResult);
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
