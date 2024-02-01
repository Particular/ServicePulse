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
            Assert.That(context.Request.Path.Value, Is.EqualTo("/index.html"));
        }

        [Test]
        public async Task Should_rewrite_angular_app_constants_js_url()
        {
            var middleware = new UrlRewriterMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/a/js/app.constants.js"),
                    Method = "GET"
                }
            };
            await middleware.Invoke(context);
            Assert.That(context.Request.Path.Value, Is.EqualTo("/js/app.constants.js"));
        }

        [Test]
        public async Task Should_rewrite_other_urls_to_vue_index()
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
            Assert.That(context.Request.Path.Value, Is.EqualTo("/index.html"));
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