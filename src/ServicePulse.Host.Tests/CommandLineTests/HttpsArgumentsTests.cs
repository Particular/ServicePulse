namespace ServicePulse.Host.Tests.CommandLineTests
{
    using System;
    using NUnit.Framework;
    using ServicePulse.Host.Hosting;

    [TestFixture]
    public class HttpsArgumentsTests
    {
        [Test]
        public void HttpsEnabled_Default_Is_False()
        {
            var hostArgs = new HostArguments(Array.Empty<string>());
            Assert.That(hostArgs.HttpsEnabled, Is.False);
        }

        [Test]
        public void HttpsEnabled_Can_Be_Set_To_True()
        {
            var args = new[] { "--httpsenabled=true" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsEnabled, Is.True);
        }

        [Test]
        public void HttpsEnabled_Can_Be_Set_To_False()
        {
            var args = new[] { "--httpsenabled=false" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsEnabled, Is.False);
        }

        [Test]
        public void HttpsEnabled_Invalid_Value_Uses_Default()
        {
            var args = new[] { "--httpsenabled=invalid" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsEnabled, Is.False);
        }

        [Test]
        public void HttpsRedirectHttpToHttps_Default_Is_False()
        {
            var hostArgs = new HostArguments(Array.Empty<string>());
            Assert.That(hostArgs.HttpsRedirectHttpToHttps, Is.False);
        }

        [Test]
        public void HttpsRedirectHttpToHttps_Can_Be_Set_To_True()
        {
            var args = new[] { "--httpsredirecthttptohttps=true" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsRedirectHttpToHttps, Is.True);
        }

        [Test]
        public void HttpsRedirectHttpToHttps_Can_Be_Set_To_False()
        {
            var args = new[] { "--httpsredirecthttptohttps=false" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsRedirectHttpToHttps, Is.False);
        }

        [Test]
        public void HttpsPort_Default_Is_Null()
        {
            var hostArgs = new HostArguments(Array.Empty<string>());
            Assert.That(hostArgs.HttpsPort, Is.Null);
        }

        [Test]
        public void HttpsPort_Can_Be_Set()
        {
            var args = new[] { "--httpsport=443" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsPort, Is.EqualTo(443));
        }

        [Test]
        public void HttpsPort_Custom_Value()
        {
            var args = new[] { "--httpsport=8443" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsPort, Is.EqualTo(8443));
        }

        [Test]
        public void HttpsPort_Invalid_Value_Returns_Null()
        {
            var args = new[] { "--httpsport=invalid" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsPort, Is.Null);
        }

        [Test]
        public void HttpsEnableHsts_Default_Is_False()
        {
            var hostArgs = new HostArguments(Array.Empty<string>());
            Assert.That(hostArgs.HttpsEnableHsts, Is.False);
        }

        [Test]
        public void HttpsEnableHsts_Can_Be_Set_To_True()
        {
            var args = new[] { "--httpsenablehsts=true" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsEnableHsts, Is.True);
        }

        [Test]
        public void HttpsHstsMaxAgeSeconds_Default_Is_OneYear()
        {
            var hostArgs = new HostArguments(Array.Empty<string>());
            Assert.That(hostArgs.HttpsHstsMaxAgeSeconds, Is.EqualTo(31536000));
        }

        [Test]
        public void HttpsHstsMaxAgeSeconds_Can_Be_Set()
        {
            var args = new[] { "--httpshstsmaxageseconds=86400" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsHstsMaxAgeSeconds, Is.EqualTo(86400));
        }

        [Test]
        public void HttpsHstsMaxAgeSeconds_Invalid_Value_Uses_Default()
        {
            var args = new[] { "--httpshstsmaxageseconds=invalid" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsHstsMaxAgeSeconds, Is.EqualTo(31536000));
        }

        [Test]
        public void HttpsHstsIncludeSubDomains_Default_Is_False()
        {
            var hostArgs = new HostArguments(Array.Empty<string>());
            Assert.That(hostArgs.HttpsHstsIncludeSubDomains, Is.False);
        }

        [Test]
        public void HttpsHstsIncludeSubDomains_Can_Be_Set_To_True()
        {
            var args = new[] { "--httpshstsincludesubdomains=true" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsHstsIncludeSubDomains, Is.True);
        }

        [Test]
        public void Https_All_Options_Can_Be_Combined()
        {
            var args = new[]
            {
                "--httpsenabled=true",
                "--httpsredirecthttptohttps=true",
                "--httpsport=443",
                "--httpsenablehsts=true",
                "--httpshstsmaxageseconds=86400",
                "--httpshstsincludesubdomains=true"
            };
            var hostArgs = new HostArguments(args);

            Assert.That(hostArgs.HttpsEnabled, Is.True);
            Assert.That(hostArgs.HttpsRedirectHttpToHttps, Is.True);
            Assert.That(hostArgs.HttpsPort, Is.EqualTo(443));
            Assert.That(hostArgs.HttpsEnableHsts, Is.True);
            Assert.That(hostArgs.HttpsHstsMaxAgeSeconds, Is.EqualTo(86400));
            Assert.That(hostArgs.HttpsHstsIncludeSubDomains, Is.True);
        }

        [TestCase("TRUE")]
        [TestCase("True")]
        [TestCase("true")]
        public void HttpsEnabled_Is_Case_Insensitive(string value)
        {
            var args = new[] { $"--httpsenabled={value}" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsEnabled, Is.True);
        }

        [TestCase("--HTTPSENABLED=true")]
        [TestCase("--HttpsEnabled=true")]
        [TestCase("--httpsenabled=true")]
        public void Https_Argument_Names_Are_Case_Insensitive(string arg)
        {
            var args = new[] { arg };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.HttpsEnabled, Is.True);
        }
    }
}
