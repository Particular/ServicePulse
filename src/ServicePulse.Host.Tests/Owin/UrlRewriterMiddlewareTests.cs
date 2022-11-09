namespace ServicePulse.Host.Tests.Owin
{
    using System.Threading.Tasks;
    using Microsoft.Owin;
    using NUnit.Framework;
    using ServicePulse.Host.Owin;

    [TestFixture]
    public class UrlRewriterMiddlewareTests
    {
        [Test]
        public async Task Should_rewrite_slash_url()
        {
            var middleware = new UrlRewriterMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/"),
                    Method = "GET"
                }
            };
            await middleware.Invoke(context);
            Assert.AreEqual("/index.html", context.Request.Path.Value);
        }

        [Test]
        public async Task Should_rewrite_angular_app_constants_js_url()
        {
            var middleware = new UrlRewriterMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/angular/js/app.constants.js"),
                    Method = "GET"
                }
            };
            await middleware.Invoke(context);
            Assert.AreEqual("/app/js/app.constants.js", context.Request.Path.Value);
        }

        [Test]
        public async Task Should_not_rewrite_other_urls()
        {
            var middleware = new UrlRewriterMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/something"),
                    Method = "GET"
                }
            };
            await middleware.Invoke(context);
            Assert.AreEqual("/something", context.Request.Path.Value);
        }

        public class DummyNext : OwinMiddleware
        {
            public DummyNext() : base(null) { }

            public override Task Invoke(IOwinContext context)
            {
                return Task.CompletedTask;
            }
        }
    }

}