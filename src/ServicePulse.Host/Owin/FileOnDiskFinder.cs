using System;
using System.IO;
using ServicePulse.Host.Owin.Microsoft;

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
}
