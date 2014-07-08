namespace ServicePulse.Install.CustomActions
{
    using System;
    using System.Linq;
    using System.Net;
    using Microsoft.Deployment.WindowsInstaller;

    public class CustomActions
    {
        [CustomAction]
        public static ActionResult CheckServicePulseUrl(Session session)
        {
            Log(session, "Begin custom action CheckServicePulseUrl");
            string url = session.Get("INST_URI_PULSE");
            session.Set("VALID_PULSE_URL", UrlIsValid(url, session) ? "TRUE" : "FALSE");
            Log(session, "End custom action CheckServicePulseUrl");
            return ActionResult.Success;
        }

        [CustomAction]
        public static ActionResult CheckServiceControlUrl(Session session)
        {
            Log(session, "Begin custom action CheckServiceControlUrl");
            string url = session.Get("INST_URI");
            session.Set("VALID_CONTROL_URL", UrlIsValid(url,session) ? "TRUE" : "FALSE");
            Log(session, "End custom action CheckServiceControlUrl");
            return ActionResult.Success;
        }


        [CustomAction]
        public static ActionResult ContactServiceControl(Session session)
        {
            Log(session, "Begin custom action ContactServiceControl");
            // getting URL from property
            string url = session.Get("INST_URI");
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
                    if (response.StatusCode != HttpStatusCode.OK)
                    {
                        throw new Exception(response.StatusDescription);
                    }
                    string version = response.Headers["X-Particular-Version"];
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

    public static class SessionExtentions
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

