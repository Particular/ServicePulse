namespace ServicePulse.Host.Owin
{
    using global::Owin;

    public class OwinBootstrapper
    {
        public void Configuration(IAppBuilder app)
        {
            app.UseIndexUrlRewriter();
            app.UseStaticFiles();
        }
    }
}
