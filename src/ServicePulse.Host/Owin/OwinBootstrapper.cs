using Owin;

namespace ServicePulse.Host.Owin
{
    public class OwinBootstrapper
    {
        public void Configuration(IAppBuilder app)
        {
            app.UseIndexUrlRewriter();
            app.UseStaticFiles();
        }
    }
}
