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
        public void All_messages_in_group_should_be_sorted_by_time_sent()
        {
            var pathToConfig = Path.Combine("app.constants.js");
            var config = File.ReadAllText(pathToConfig);
            Assert.IsTrue(!string.IsNullOrWhiteSpace(config));
            var match = Regex.Match(config, @"(service_control_url: ')([\w:/]*)(')");
            Assert.IsTrue(match.Success);
            Assert.IsTrue(!string.IsNullOrWhiteSpace(match.Value));
            var result = match.Value.Replace("service_control_url:","").Trim();
            Assert.IsTrue(!string.IsNullOrWhiteSpace(result));
        }
    }
}