using System.Web.Http;
using Owin;

namespace ServicePulse.Host.Owin
{
    using System.Web.Http;

    public class OwinBootstrapper
    {
        public void Configuration(IAppBuilder app)
        {
            //HttpConfiguration config = new HttpConfiguration();
            //config.Routes.MapHttpRoute(
            //    name: "DefaultApi",
            //    routeTemplate: "api/{controller}/{id}",
            //    defaults: new {id = RouteParameter.Optional}
            //);

            ////config.Routes.
            //app.UseWebApi(config);
            
        }
    }

}
