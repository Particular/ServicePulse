namespace ServicePulse.Host.Tests
{
    using System;
    using System.IO;
    using System.Text.RegularExpressions;
    using NUnit.Framework;

    [TestFixture, Serializable]
    public class RegExTests
    {
        [Ignore]
        [Test]
        public void find_service_control_url()
        {
            var pathToConfig = Path.Combine("app.constants.js");
            var config = File.ReadAllText(pathToConfig);
            Assert.IsTrue(!string.IsNullOrWhiteSpace(config));
            var match = Regex.Match(config, @"(service_control_url: ')([\w:/]*)(')");
            Assert.IsTrue(match.Success);
            Assert.IsTrue(!string.IsNullOrWhiteSpace(match.Value));
        }

        [Ignore]
        [Test]
        public void match_service_control_url_in_string()
        {
            var test = "service_control_url: 'http://localhost:33333/api',";
            var match = Regex.Match(test, @"(service_control_url: ')([\w:/]*)(')");
            Assert.AreEqual("http://localhost:33333/api", match.Groups[2].Value);
        }

       

    }
}