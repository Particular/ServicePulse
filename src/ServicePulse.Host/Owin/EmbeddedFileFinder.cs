using System;
using System.IO;
using System.Linq;
using System.Reflection;
using ServicePulse.Host.Owin.Microsoft;

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
}
