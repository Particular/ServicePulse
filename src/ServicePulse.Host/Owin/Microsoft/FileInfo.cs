// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See License.txt in the project root for license information.

using System;
using System.IO;
using System.Reflection;

namespace ServicePulse.Host.Owin.Microsoft
{
    public interface IFileInfo
    {
        /// <summary>
        /// The length of the file in bytes, or -1 for a directory info
        /// </summary>
        long Length { get; }

        /// <summary>
        /// The path to the file, including the file name.  Return null if the file is not directly accessible.
        /// </summary>
        string PhysicalPath { get; }

        /// <summary>The name of the file</summary>
        string Name { get; }

        /// <summary>When the file was last modified</summary>
        DateTime LastModified { get; }

        /// <summary>
        /// True for the case TryGetDirectoryContents has enumerated a sub-directory
        /// </summary>
        bool IsDirectory { get; }

        /// <summary>
        /// Return file contents as readonly stream. Caller should dispose stream when complete.
        /// </summary>
        /// <returns>The file stream</returns>
        Stream CreateReadStream();
    }

    public class EmbeddedResourceFileInfo : IFileInfo
    {
        private readonly Assembly _assembly;
        private readonly string _resourcePath;
        private readonly string _fileName;

        private long? _length;

        public EmbeddedResourceFileInfo(Assembly assembly, string resourcePath, string fileName, DateTime lastModified)
        {
            _assembly = assembly;
            LastModified = lastModified;
            _resourcePath = resourcePath;
            _fileName = fileName;
        }

        public long Length
        {
            get
            {
                if (!_length.HasValue)
                {
                    using (var stream = _assembly.GetManifestResourceStream(_resourcePath))
                    {
                        _length = stream.Length;
                    }
                }
                return _length.Value;
            }
        }

        // Not directly accessible.
        public string PhysicalPath => null;

        public string Name { get; }

        public DateTime LastModified { get; }

        public bool IsDirectory => false;

        public Stream CreateReadStream()
        {
            var stream = _assembly.GetManifestResourceStream(_resourcePath);
            if (!_length.HasValue)
            {
                _length = stream.Length;
            }
            return stream;
        }
    }

    public class PhysicalFileInfo : IFileInfo
    {
        private readonly FileInfo _info;

        public PhysicalFileInfo(FileInfo info)
        {
            _info = info;
        }

        public long Length => _info.Length;

        public string PhysicalPath => _info.FullName;

        public string Name => _info.Name;

        public DateTime LastModified => _info.LastWriteTime;

        public bool IsDirectory => false;

        public Stream CreateReadStream()
        {
            // Note: Buffer size must be greater than zero, even if the file size is zero.
            return new FileStream(PhysicalPath, FileMode.Open, FileAccess.Read, FileShare.ReadWrite, 1024 * 64,
                FileOptions.Asynchronous | FileOptions.SequentialScan);
        }
    }
}
