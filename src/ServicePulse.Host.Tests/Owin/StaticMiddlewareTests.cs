using System.Threading.Tasks;
using Microsoft.Owin;
using NUnit.Framework;
using ServicePulse.Host.Owin;

namespace ServicePulse.Host.Tests
{
    [TestFixture]
    public class StaticMiddlewareTests
    {
        [Test]
        public void Should_default_to_octetstream_mimetype()
        {
            var middleware = new StaticFileMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/filename.unknown"),
                    Method = "GET"
                }
            };
            middleware.Invoke(context);
            Assert.AreEqual(("application/octet-stream"), context.Response.ContentType);
        }
        [Test]
        public void Should_return_correct_mimetype()
        {
            var middleware = new StaticFileMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/filename.js"),
                    Method = "GET"
                }
            };
            middleware.Invoke(context);
            Assert.AreEqual(("application/javascript"), context.Response.ContentType);
        }
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