using System;
using System.IO;
using ServicePulse.Host.Owin.Microsoft;

namespace ServicePulse.Host.Owin
{
    public static class FileOnDiskFinder
    {
        public static IFileInfo FindFile(string filePath)
        {
            var fileWithFullDirectoryPath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, filePath));

            IFileInfo fileInfo = null;

            if (File.Exists(fileWithFullDirectoryPath))
            {
                fileInfo = new PhysicalFileInfo(new FileInfo(fileWithFullDirectoryPath));
            }

            return fileInfo;
        }
    }
}
