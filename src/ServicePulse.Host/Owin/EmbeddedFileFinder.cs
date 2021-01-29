namespace ServicePulse.Host.Owin
{
    using System;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using ServicePulse.Host.Owin.Microsoft;

    public static class EmbeddedFileFinder
    {
        static readonly Assembly Assembly = Assembly.GetExecutingAssembly();

        public static IFileInfo FindEmbeddedFile(string filePath)
        {
            var lastModified = new FileInfo(Assembly.Location).LastWriteTime;

            var resource = Assembly.GetManifestResourceStream(filePath);
            if (resource != null)
            {
                return new EmbeddedResourceFileInfo(Assembly, filePath, string.Empty, lastModified);
            }

            var matchingKey = Assembly.GetManifestResourceNames()
                .FirstOrDefault(name => string.Compare(filePath, name, StringComparison.OrdinalIgnoreCase) == 0);
            if (matchingKey != null)
            {
                return new EmbeddedResourceFileInfo(Assembly, matchingKey, string.Empty, lastModified);
            }

            return null;
        }
    }
}
