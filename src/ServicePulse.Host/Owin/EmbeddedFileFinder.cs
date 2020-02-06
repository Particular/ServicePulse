using System;
using System.IO;
using System.Linq;
using System.Reflection;

namespace ServicePulse.Host.Owin
{
    public static class EmbeddedFileFinder
    {
        private static readonly Assembly Assembly = Assembly.GetExecutingAssembly();
        
        public static bool FindEmbeddedFile(string filePath, out IFileInfo fileInfo)
        {
            var lastModified = new FileInfo(Assembly.Location).LastWriteTime;

            var resource = Assembly.GetManifestResourceStream(filePath);
            if (resource != null)
            {
                fileInfo = new EmbeddedResourceFileInfo(Assembly, filePath, string.Empty, lastModified);
                return true;
            }
            
            var matchingKey = Assembly.GetManifestResourceNames()
                .FirstOrDefault(name => string.Compare(filePath, name, StringComparison.OrdinalIgnoreCase) == 0);
            if (matchingKey != null)
            {
                fileInfo = new EmbeddedResourceFileInfo(Assembly, matchingKey, string.Empty, lastModified);
                return true;
            }

            fileInfo = null;
            return false;
        }
    }

    // Copyright(c) Microsoft Open Technologies, Inc.All rights reserved.See License.txt in the project root for license information.
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
}
