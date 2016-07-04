namespace ServicePulse.Host.Nancy
{
    using System;
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.Security.Cryptography;
    using System.Text;
    using global::Nancy;

    public class SpecialEmbeddedFileResponse : Response
    {
        public SpecialEmbeddedFileResponse(Assembly assembly, string resourcePath)
        {
            ContentType = MimeTypes.GetMimeType(Path.GetFileName(resourcePath));
            StatusCode = HttpStatusCode.OK;

            var content = LoadContentFromManifest(assembly, resourcePath);
            
            if (content == null)
            {
                StatusCode = HttpStatusCode.NotFound;
                return;
            }

            this.WithHeader("ETag", GenerateETag(content));
            this.WithHeader("X-UA-Compatible", "IE=edge");
            Contents = GetFileContent(content);
        }

        private Stream LoadContentFromManifest(Assembly assembly, string resourcePath)
        {
            var resource = assembly.GetManifestResourceStream(resourcePath);

            if (resource != null)
            {
                return resource;
            }

            var matchingKey =
                assembly.GetManifestResourceNames()
                    .FirstOrDefault(name => string.Compare(resourcePath, name, StringComparison.OrdinalIgnoreCase) == 0);

            return assembly.GetManifestResourceStream(matchingKey);
        }

        private static Action<Stream> GetFileContent(Stream content)
        {
            return stream =>
            {
                using (content)
                {
                    content.Seek(0, SeekOrigin.Begin);
                    content.CopyTo(stream);
                }
            };
        }

        private static string GenerateETag(Stream stream)
        {
            using (var md5 = MD5.Create())
            {
                var hash = md5.ComputeHash(stream);
                return string.Concat("\"", ByteArrayToString(hash), "\"");
            }
        }

        private static string ByteArrayToString(byte[] data)
        {
            var output = new StringBuilder(data.Length);
            foreach (var b in data)
            {
                output.Append(b.ToString("X2"));
            }

            return output.ToString();
        }
    }
}
