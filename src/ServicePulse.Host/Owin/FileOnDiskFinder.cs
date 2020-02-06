using System;
using System.IO;

namespace ServicePulse.Host.Owin
{
    public static class FileOnDiskFinder
    {
        public static bool FindFile(string filePath, out IFileInfo fileInfo)
        {
            var fileWithFullDirectoryPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, filePath));

            if (File.Exists(fileWithFullDirectoryPath))
            {
                fileInfo = new PhysicalFileInfo(new FileInfo(fileWithFullDirectoryPath));
                return true;
            }

            fileInfo = null;
            return false;
        }
    }

    // Copyright(c) Microsoft Open Technologies, Inc.All rights reserved.See License.txt in the project root for license information.
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
