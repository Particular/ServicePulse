namespace ServicePulse.Host.Tests.Owin
{
    using System.IO;
    using System.Threading.Tasks;
    using Microsoft.Owin;
    using NUnit.Framework;
    using ServicePulse.Host.Owin;

    [TestFixture]
    public class StaticMiddlewareTests
    {
        [Test]
        public async Task Should_return_correct_mimetype()
        {
            var middleware = new StaticFileMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/js/app.constants.js"),
                    Method = "GET"
                },
                Response =
                {
                    Body = new MemoryStream()
                }
            };
            await middleware.Invoke(context);
            Assert.That(context.Response.ContentType, Is.EqualTo("application/javascript"));
        }

        [Test]
        public async Task Should_only_handle_get_and_head()
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
            await middleware.Invoke(context);
            Assert.That(context.Response.ContentLength, Is.Null);
            Assert.That(context.Response.ContentType, Is.Null);
        }

        [TestCase("HEAD")]
        [TestCase("GET")]
        public async Task Should_handle_get_and_head(string method)
        {
            var middleware = new StaticFileMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/favicon.ico"),
                    Method = method
                },
                Response =
                {
                    Body = new MemoryStream()
                }
            };
            await middleware.Invoke(context);
            Assert.That(context.Response.ContentLength, Is.Not.Null);
            Assert.That(context.Response.ContentType, Is.Not.Empty);
        }

        [Test]
        public async Task Should_find_file_embedded_in_assembly()
        {
            var middleware = new StaticFileMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/favicon.ico"),
                    Method = "GET"
                },
                Response =
                {
                    Body = new MemoryStream()
                }
            };
            await middleware.Invoke(context);
            const long sizeOfEmbeddedHtmlFile = 5182; // this is the favicon.ico file embedded into ServicePulse.Host.exe
            Assert.That(context.Response.ContentLength, Is.EqualTo(sizeOfEmbeddedHtmlFile));
            Assert.That(context.Response.ContentType, Is.EqualTo("image/x-icon"));
        }

        [Test]
        public async Task Should_find_file_embedded_in_assembly_is_case_insensitive()
        {
            var middleware = new StaticFileMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/faVicon.ico"),
                    Method = "GET"
                },
                Response =
                {
                    Body = new MemoryStream()
                }
            };
            await middleware.Invoke(context);
            const long sizeOfEmbeddedHtmlFile = 5182; // this is the favicon.ico file embedded into ServicePulse.Host.exe
            Assert.That(context.Response.ContentLength, Is.EqualTo(sizeOfEmbeddedHtmlFile));
            Assert.That(context.Response.ContentType, Is.EqualTo("image/x-icon"));
        }

        [Test]
        public async Task Should_find_prefer_constants_file_on_disk_over_embedded_if_both_exist()
        {
            var middleware = new StaticFileMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/js/app.constants.js"), //this exists both BOTH embedded in ServicePulse.Host.exe and on disk
                    Method = "GET"
                },
                Response =
                {
                    Body = new MemoryStream()
                }
            };
            await middleware.Invoke(context);
            const long sizeOfFileOnDisk = 215; // this is the /app/js/app.constants.js file
            Assert.That(context.Response.ContentLength, Is.EqualTo(sizeOfFileOnDisk));
            Assert.That(context.Response.ContentType, Is.EqualTo("application/javascript"));
        }

        [Test]
        public async Task Should_not_find_other_files_on_disk()
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
            await middleware.Invoke(context);
            Assert.That(context.Response.ContentLength, Is.Null);
            Assert.That(context.Response.ContentType, Is.Null);

            context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/../ServicePulse.Host.exe.config"),
                    Method = "GET"
                }
            };
            await middleware.Invoke(context);
            Assert.That(context.Response.ContentLength, Is.Null);
            Assert.That(context.Response.ContentType, Is.Null);
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