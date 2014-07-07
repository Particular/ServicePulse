namespace ServicePulse.Install.CustomActions
{
    using System;
    using System.Linq;
    using System.Net;
    using Microsoft.Deployment.WindowsInstaller;

    public class CustomActions
    {
        [CustomAction]
        public static ActionResult ValidateUrl(Session session)
        {
            Log(session, "Begin custom action ValidateUrl");

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

            if (connectionSuccessful)
            {
                session.Set("VALID_URL", "Valid_Url");
            }
            else
            {
                session.Set("VALID_URL", "Invalid_Url");
            }

            Log(session, "End custom action ValidateUrl");

            return ActionResult.Success;
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

