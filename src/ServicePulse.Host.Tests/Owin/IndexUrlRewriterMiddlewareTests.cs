using System.Threading.Tasks;
using Microsoft.Owin;
using NUnit.Framework;
using ServicePulse.Host.Owin;

namespace ServicePulse.Host.Tests.Owin
{
    [TestFixture]
    public class IndexUrlRewriterMiddlewareTests
    {
        [Test]
        public async Task Should_rewrite_slash_url()
        {
            var middleware = new IndexUrlRewriterMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/"),
                    Method = "GET"
                }
            };
            await middleware.Invoke(context);
            Assert.AreEqual(("/index.html"), context.Request.Path.Value);
        }

        [Test]
        public async Task Should_not_rewrite_other_urls()
        {
            var middleware = new IndexUrlRewriterMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/something"),
                    Method = "GET"
                }
            };
            await middleware.Invoke(context);
            Assert.AreEqual(("/something"), context.Request.Path.Value);
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