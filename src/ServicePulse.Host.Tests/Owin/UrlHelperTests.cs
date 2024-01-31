namespace ServicePulse.Host.Tests.Owin
{
    using NUnit.Framework;
    using ServicePulse.Host.Owin;

    [TestFixture]
    public class UrlHelperTests
    {
        [Test]
        public void Should_replace_localhost()
        {
            var url = UrlHelper.RewriteLocalhostUrl("http://localhost:8081/");
            Assert.That(url, Is.EqualTo("http://+:8081/"));
        }

        [Test]
        public void Should_replace_localhost_case_insensitive()
        {
            var url = UrlHelper.RewriteLocalhostUrl("http://LOCALhosT:8081/");
            Assert.That(url, Is.EqualTo("http://+:8081/"));
        }

        [Test]
        public void Should_not_replace_other_names()
        {
            var url = UrlHelper.RewriteLocalhostUrl("http://particular.net:8081/");
            Assert.That(url, Is.EqualTo("http://particular.net:8081/"));
        }
    }

}