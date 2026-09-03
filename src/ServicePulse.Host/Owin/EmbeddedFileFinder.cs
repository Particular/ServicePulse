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

            // The embedded resource names are derived from file paths at build time, so their
            // directory separator is that of the OS the build ran on. Look the file up under
            // both separators so the frontend is served regardless of where it was built.
            var candidates = new[] { filePath, filePath.Replace('\\', '/') };

            foreach (var candidate in candidates)
            {
                var resource = Assembly.GetManifestResourceStream(candidate);
                if (resource != null)
                {
                    return new EmbeddedResourceFileInfo(Assembly, candidate, string.Empty, lastModified);
                }
            }

            var matchingKey = Assembly.GetManifestResourceNames()
                .FirstOrDefault(name => candidates.Any(candidate => string.Compare(candidate, name, StringComparison.OrdinalIgnoreCase) == 0));
            if (matchingKey != null)
            {
                return new EmbeddedResourceFileInfo(Assembly, matchingKey, string.Empty, lastModified);
            }

            return null;
        }
    }
}
