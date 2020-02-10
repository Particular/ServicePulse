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

        [Test]
        public void Should_only_handle_get_and_head()
        {
            var middleware = new StaticFileMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/whatever"),
                    Method = "POST"
                }
            };
            middleware.Invoke(context);
            Assert.AreEqual(null, context.Response.ContentLength);
            Assert.AreEqual(null, context.Response.ContentType);
        }

        [TestCase("HEAD")]
        [TestCase("GET")]
        public void Should_handle_get_and_head(string method)
        {
            var middleware = new StaticFileMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/filename.js"),
                    Method = method
                }
            };
            middleware.Invoke(context);
            Assert.IsNotNull(context.Response.ContentLength);
            Assert.IsNotEmpty(context.Response.ContentType);
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