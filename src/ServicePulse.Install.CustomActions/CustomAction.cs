namespace ServicePulse.Install.CustomActions
{
    using System;
    using System.Diagnostics;
    using System.IO;
    using System.Linq;
    using System.Net;
    using System.Text.RegularExpressions;
    using Microsoft.Deployment.WindowsInstaller;

    public class CustomActions
    {
        [CustomAction]
        public static ActionResult CheckServiceControlUrl(Session session)
        {
            Log(session, "Begin custom action CheckServiceControlUrl");
            var url = session.Get("INST_URI");
            session.Set("VALID_CONTROL_URL", UrlIsValid(url,session) ? "TRUE" : "FALSE");
            Log(session, "End custom action CheckServiceControlUrl");
            return ActionResult.Success;
        }

        [CustomAction]
        public static ActionResult ContactServiceControl(Session session)
        {
            Log(session, "Begin custom action ContactServiceControl");
            // getting URL from property
            var url = session.Get("INST_URI");
            var connectionSuccessful = false;
            try
            {
                if (url == null)
                {
                    return ActionResult.Success;
                }

                var request = WebRequest.Create(url);
                request.Timeout = 2000;
                using (var response = request.GetResponse() as HttpWebResponse)
                {
                    if (response == null)
                    { 
                        throw new Exception("No response");
                    }

                    if (response.StatusCode != HttpStatusCode.OK)
                    {
                        throw new Exception(response.StatusDescription);
                    }
                    var version = response.Headers["X-Particular-Version"];
                    if (!string.IsNullOrEmpty(version))
                    {
                        session.Set("REPORTED_VERSION", version.Split(' ').First());
                    }
                }

                connectionSuccessful = true;
            }
            catch (Exception ex)
            {
                Log(session, ex.ToString());
            }
            session.Set("CONTACT_SERVICECONTROL", connectionSuccessful ? "TRUE" : "FALSE");
            Log(session, "End custom action ContactServiceControl");
            return ActionResult.Success;
        }

        [CustomAction]
        public static ActionResult SetUrlAcl(Session session)
        {
           Log(session, "Start custom action SetUrlAcl");
           var port = session.Get("INST_PORT_PULSE"); 
           var aclUrl =  string.Format("http://+:{0}/", port);
           
           RunNetsh(string.Format("http del urlacl url={0}", aclUrl));
           // sddl=D:(A;;GX;;;WD) maps to the same as setting user=Everyone  
           // user=everyone fails if the OS language is not English,  localised lookup of NTAccount fails as MSI is set to English US 
           var addUrlAclCommand = string.Format("http add urlacl url={0} sddl=D:(A;;GX;;;WD)", aclUrl);
           var exitCode = RunNetsh(addUrlAclCommand);
           if (exitCode != 0)
           {
                Log(session, string.Format("Error: 'netsh.exe {0}' returned {1}", addUrlAclCommand, exitCode));
                Log(session, "End custom action SetUrlAcl");
                return ActionResult.Failure;
            }
            Log(session, string.Format("Success :Executed: 'netsh.exe {0}'", addUrlAclCommand));
            Log(session, "End custom action SetUrlAcl");
            return ActionResult.Success;
        }

        [CustomAction]
        public static ActionResult CheckPulsePort(Session session)
        {
            try
            {
                Log(session, "Start custom action CheckPulsePort");
                var port = session.Get("INST_PORT_PULSE");
                UInt16 portNumber;
                if (UInt16.TryParse(port, out portNumber))
                {
                    // Port number 49152 and above should no be used http://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml
                    if (portNumber < 49152)
                    {
                        session.Set("VALID_PORT", "TRUE");
                        return ActionResult.Success;
                    }
                }
                session.Set("VALID_PORT", "FALSE");
                return ActionResult.Success;
            }
            finally
            {
                Log(session, "End custom action CheckPulsePort");
            }
        }
       
        [CustomAction]
        public static ActionResult ReadServiceControlUrlFromConfigJS(Session session)
        {
            try
            {
                Log(session, "Start custom action ReadServiceControlUrlFromConfigJS");
                var targetPath = session.Get("APPDIR");
                var configFiles = new[]
                {
                    @"app\config.js",   /* Pre SC 1.3 path */
                    @"app\js\app.constants.js"  /* Post SC 1.3 path */
                };

                string uri = null;

                foreach (var file in configFiles)
                {
                    var filePath = Path.Combine(targetPath, file);
                    if (!File.Exists(filePath))
                    {
                        Log(session, string.Format("File {0} does not exist - skipping", filePath));
                        continue;
                    }
                    var extracted = ExtractServiceControlURI(filePath);
                    if (extracted == null)
                    {
                        Log(session, string.Format("No URI found in {0}", filePath));
                    }
                    else
                    {
                        Log(session, string.Format(@"Extracted {0} from {1}", extracted, filePath));
                        uri = extracted;
                    }
                }

                if (uri != null)
                {
                    session.Set("INST_URI", uri);
                }
                return ActionResult.Success;
            }
            finally
            {
                Log(session, "End custom action ReadServiceControlUrlFromConfigJS");
            }
        }
        
        static string ExtractServiceControlURI(string file)
        {
            var pattern = new Regex(@"(service_control_url\s*\:\s*['""])(.*?)(['""])");
            var matches = pattern.Match(File.ReadAllText(file));
            return matches.Success ? matches.Groups[2].Value : null;
        }

        static int RunNetsh(string command)
        {
           var pi = new ProcessStartInfo
           {
               Arguments = command, 
               FileName = Path.Combine(Environment.SystemDirectory, "netsh.exe"),
               WindowStyle = ProcessWindowStyle.Hidden
           };

           using (var p = new Process {StartInfo = pi})
           {
               p.Start();
               p.WaitForExit();
               return p.ExitCode;
           }            
        }

        static bool UrlIsValid(string url, Session session)
        {
            Uri uri;
            if (Uri.TryCreate(url, UriKind.Absolute, out uri))
            {
                if ((uri.Scheme == Uri.UriSchemeHttp) || (uri.Scheme == Uri.UriSchemeHttps))
                {
                    Log(session, string.Format("Url is valid - {0}", url));
                    return true;
                }
            }
            Log(session, string.Format("Url is invalid - {0}", url));
            return false;
        }

        static void Log(Session session, string message)
        {
            LogAction(session, message);
        }

        public static Action<Session, string> LogAction = (s, m) => s.Log(m);

        public static Func<Session, string, string> GetAction = (s, key) => s[key];

        public static Action<Session, string, string> SetAction = (s, key, value) => s[key] = value;
    }

    public static class SessionExtensions
    {
        public static string Get(this Session session, string key)
        {
            return CustomActions.GetAction(session, key);
        }

        public static void Set(this Session session, string key, string value)
        {
            CustomActions.SetAction(session, key, value);
        }
    }
}

