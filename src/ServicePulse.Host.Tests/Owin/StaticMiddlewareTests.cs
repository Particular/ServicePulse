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
            Assert.AreEqual("application/javascript", context.Response.ContentType);
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
            Assert.AreEqual(null, context.Response.ContentLength);
            Assert.AreEqual(null, context.Response.ContentType);
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
                    Path = new PathString("/angular/app.js"),
                    Method = method
                },
                Response =
                {
                    Body = new MemoryStream()
                }
            };
            await middleware.Invoke(context);
            Assert.IsNotNull(context.Response.ContentLength);
            Assert.IsNotEmpty(context.Response.ContentType);
        }

        [Test]
        public async Task Should_find_file_embedded_in_assembly()
        {
            var middleware = new StaticFileMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/NoIE.html"),
                    Method = "GET"
                },
                Response =
                {
                    Body = new MemoryStream()
                }
            };
            await middleware.Invoke(context);
            const long sizeOfEmbeddedHtmlFile = 1302; // this is the NoIe.html file embedded into ServicePulse.Host.exe
            Assert.AreEqual(sizeOfEmbeddedHtmlFile, context.Response.ContentLength);
            Assert.AreEqual("text/html", context.Response.ContentType);
        }

        [Test]
        public async Task Should_find_file_embedded_in_assembly_is_case_insensitive()
        {
            var middleware = new StaticFileMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/nOie.html"),
                    Method = "GET"
                },
                Response =
                {
                    Body = new MemoryStream()
                }
            };
            await middleware.Invoke(context);
            const long sizeOfEmbeddedHtmlFile = 1302; // this is the NoIe.html file embedded into ServicePulse.Host.exe
            Assert.AreEqual(sizeOfEmbeddedHtmlFile, context.Response.ContentLength);
            Assert.AreEqual("text/html", context.Response.ContentType);
        }


        [Test]
        public async Task Should_find_deep_linking_file_embedded_in_assembly()
        {
            var middleware = new StaticFileMiddleware(new DummyNext());
            var context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/angular/views/message/editor/messageEditorModal.controller.js"),
                    Method = "GET"
                },
                Response =
                {
                    Body = new MemoryStream()
                }
            };
            await middleware.Invoke(context);
            const long sizeOfEmbeddedHtmlFile = 8586; // this is the messageEditorModal.controller.js file embedded into ServicePulse.Host.exe
            Assert.AreEqual(sizeOfEmbeddedHtmlFile, context.Response.ContentLength);
            Assert.AreEqual("application/javascript", context.Response.ContentType);
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
            const long sizeOfFileOnDisk = 231; // this is the /app/js/app.constants.js file
            Assert.AreEqual(sizeOfFileOnDisk, context.Response.ContentLength);
            Assert.AreEqual("application/javascript", context.Response.ContentType);
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
            Assert.AreEqual(null, context.Response.ContentLength);
            Assert.AreEqual(null, context.Response.ContentType);

            context = new OwinContext
            {
                Request =
                {
                    Path = new PathString("/../ServicePulse.Host.exe.config"),
                    Method = "GET"
                }
            };
            await middleware.Invoke(context);
            Assert.AreEqual(null, context.Response.ContentLength);
            Assert.AreEqual(null, context.Response.ContentType);
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