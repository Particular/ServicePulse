// Copyright (c) Microsoft Open Technologies, Inc. All rights reserved. See THIRD-PARTY-NOTICES.txt in the project root for license information.

namespace ServicePulse.Host.Owin.Microsoft
{
    using System;
    using System.IO;
    using System.Reflection;

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
        private readonly Assembly assembly;
        private readonly string resourcePath;
        private readonly string fileName;

        private long? length;

        public EmbeddedResourceFileInfo(Assembly assembly, string resourcePath, string fileName, DateTime lastModified)
        {
            this.assembly = assembly;
            LastModified = lastModified;
            this.resourcePath = resourcePath;
            this.fileName = fileName;
        }

        public long Length
        {
            get
            {
                if (!length.HasValue)
                {
                    using (var stream = assembly.GetManifestResourceStream(resourcePath))
                    {
                        length = stream.Length;
                    }
                }
                return length.Value;
            }
        }

        // Not directly accessible.
        public string PhysicalPath => null;

        public string Name { get; }

        public DateTime LastModified { get; }

        public bool IsDirectory => false;

        public Stream CreateReadStream()
        {
            var stream = assembly.GetManifestResourceStream(resourcePath);
            if (!length.HasValue)
            {
                length = stream.Length;
            }
            return stream;
        }
    }

    public class PhysicalFileInfo : IFileInfo
    {
        private readonly FileInfo info;

        public PhysicalFileInfo(FileInfo info)
        {
            this.info = info;
        }

        public long Length => info.Length;

        public string PhysicalPath => info.FullName;

        public string Name => info.Name;

        public DateTime LastModified => info.LastWriteTime;

        public bool IsDirectory => false;

        public Stream CreateReadStream()
        {
            // Note: Buffer size must be greater than zero, even if the file size is zero.
            return new FileStream(
                PhysicalPath, 
                FileMode.Open, 
                FileAccess.Read, 
                FileShare.ReadWrite, 
                1024 * 64,
                FileOptions.Asynchronous | FileOptions.SequentialScan);
        }
    }
}
