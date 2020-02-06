using System.Web.Http;
using Owin;

namespace ServicePulse.Host.Owin
{
    using System.Web.Http;

    public class OwinBootstrapper
    {
        public void Configuration(IAppBuilder app)
        {
            app.UseStaticFiles();
        }
    }

}
