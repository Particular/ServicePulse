using System.Threading.Tasks;
using Microsoft.Owin;
using NUnit.Framework;
using ServicePulse.Host.Owin;

namespace ServicePulse.Host.Tests.Owin
{
    [TestFixture]
    public class UrlHelperTests
    {
        [Test]
        public void Should_replace_localhost()
        {
            var url = UrlHelper.RewriteLocalhostUrl("http://localhost:8081/");
            Assert.AreEqual("http://+:8081/", url);
        }

        [Test]
        public void Should_replace_localhost_case_insensitive()
        {
            var url = UrlHelper.RewriteLocalhostUrl("http://LOCALhosT:8081/");
            Assert.AreEqual("http://+:8081/", url);
        }

        [Test]
        public void Should_not_replace_other_names()
        {
            var url = UrlHelper.RewriteLocalhostUrl("http://particular.net:8081/");
            Assert.AreEqual("http://particular.net:8081/", url);
        }
    }

}