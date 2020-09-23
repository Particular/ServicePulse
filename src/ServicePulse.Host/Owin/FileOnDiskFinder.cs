namespace ServicePulse.Host.Owin
{
    using System;
    using System.IO;
    using ServicePulse.Host.Owin.Microsoft;

    public static class FileOnDiskFinder
    {
        static readonly string appConstantsPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "app", "js", "app.constants.js"));

        public static IFileInfo FindFile(string filePath)
        {
            var fileWithFullDirectoryPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, filePath));

            IFileInfo fileInfo = null;

            if (fileWithFullDirectoryPath.Equals(appConstantsPath, StringComparison.OrdinalIgnoreCase) && File.Exists(fileWithFullDirectoryPath))
            {
                fileInfo = new PhysicalFileInfo(new FileInfo(fileWithFullDirectoryPath));
            }

            return fileInfo;
        }
    }
}
