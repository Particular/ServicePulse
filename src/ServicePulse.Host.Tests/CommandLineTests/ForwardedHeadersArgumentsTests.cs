namespace ServicePulse.Host.Tests.CommandLineTests
{
    using System;
    using NUnit.Framework;
    using ServicePulse.Host.Hosting;

    [TestFixture]
    public class ForwardedHeadersArgumentsTests
    {
        [Test]
        public void ForwardedHeadersEnabled_Default_Is_True()
        {
            var hostArgs = new HostArguments(Array.Empty<string>());
            Assert.That(hostArgs.ForwardedHeadersEnabled, Is.True);
        }

        [Test]
        public void ForwardedHeadersEnabled_Can_Be_Set_To_False()
        {
            var args = new[] { "--forwardedheadersenabled=false" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersEnabled, Is.False);
        }

        [Test]
        public void ForwardedHeadersEnabled_Can_Be_Set_To_True()
        {
            var args = new[] { "--forwardedheadersenabled=true" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersEnabled, Is.True);
        }

        [Test]
        public void ForwardedHeadersEnabled_Invalid_Value_Uses_Default()
        {
            var args = new[] { "--forwardedheadersenabled=invalid" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersEnabled, Is.True);
        }

        [Test]
        public void ForwardedHeadersTrustAllProxies_Default_Is_True()
        {
            var hostArgs = new HostArguments(Array.Empty<string>());
            Assert.That(hostArgs.ForwardedHeadersTrustAllProxies, Is.True);
        }

        [Test]
        public void ForwardedHeadersTrustAllProxies_Can_Be_Set_To_False()
        {
            var args = new[] { "--forwardedheaderstrustallproxies=false" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersTrustAllProxies, Is.False);
        }

        [Test]
        public void ForwardedHeadersTrustAllProxies_Can_Be_Set_To_True()
        {
            var args = new[] { "--forwardedheaderstrustallproxies=true" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersTrustAllProxies, Is.True);
        }

        [Test]
        public void ForwardedHeadersKnownProxies_Default_Is_Empty()
        {
            var hostArgs = new HostArguments(Array.Empty<string>());
            Assert.That(hostArgs.ForwardedHeadersKnownProxies, Is.Empty);
        }

        [Test]
        public void ForwardedHeadersKnownProxies_Can_Be_Set_Single_IP()
        {
            var args = new[] { "--forwardedheadersknownproxies=192.168.1.1" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersKnownProxies, Has.Count.EqualTo(1));
            Assert.That(hostArgs.ForwardedHeadersKnownProxies[0], Is.EqualTo("192.168.1.1"));
        }

        [Test]
        public void ForwardedHeadersKnownProxies_Can_Be_Set_Multiple_IPs_Comma_Separated()
        {
            var args = new[] { "--forwardedheadersknownproxies=192.168.1.1,10.0.0.1,172.16.0.1" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersKnownProxies, Has.Count.EqualTo(3));
            Assert.That(hostArgs.ForwardedHeadersKnownProxies[0], Is.EqualTo("192.168.1.1"));
            Assert.That(hostArgs.ForwardedHeadersKnownProxies[1], Is.EqualTo("10.0.0.1"));
            Assert.That(hostArgs.ForwardedHeadersKnownProxies[2], Is.EqualTo("172.16.0.1"));
        }

        [Test]
        public void ForwardedHeadersKnownProxies_Can_Be_Set_Multiple_IPs_Semicolon_Separated()
        {
            var args = new[] { "--forwardedheadersknownproxies=192.168.1.1;10.0.0.1" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersKnownProxies, Has.Count.EqualTo(2));
            Assert.That(hostArgs.ForwardedHeadersKnownProxies[0], Is.EqualTo("192.168.1.1"));
            Assert.That(hostArgs.ForwardedHeadersKnownProxies[1], Is.EqualTo("10.0.0.1"));
        }

        [Test]
        public void ForwardedHeadersKnownProxies_Trims_Whitespace()
        {
            var args = new[] { "--forwardedheadersknownproxies= 192.168.1.1 , 10.0.0.1 " };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersKnownProxies, Has.Count.EqualTo(2));
            Assert.That(hostArgs.ForwardedHeadersKnownProxies[0], Is.EqualTo("192.168.1.1"));
            Assert.That(hostArgs.ForwardedHeadersKnownProxies[1], Is.EqualTo("10.0.0.1"));
        }

        [Test]
        public void ForwardedHeadersKnownProxies_Empty_String_Returns_Empty_List()
        {
            var args = new[] { "--forwardedheadersknownproxies=" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersKnownProxies, Is.Empty);
        }

        [Test]
        public void ForwardedHeadersKnownNetworks_Default_Is_Empty()
        {
            var hostArgs = new HostArguments(Array.Empty<string>());
            Assert.That(hostArgs.ForwardedHeadersKnownNetworks, Is.Empty);
        }

        [Test]
        public void ForwardedHeadersKnownNetworks_Can_Be_Set_Single_CIDR()
        {
            var args = new[] { "--forwardedheadersknownnetworks=192.168.1.0/24" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersKnownNetworks, Has.Count.EqualTo(1));
            Assert.That(hostArgs.ForwardedHeadersKnownNetworks[0], Is.EqualTo("192.168.1.0/24"));
        }

        [Test]
        public void ForwardedHeadersKnownNetworks_Can_Be_Set_Multiple_CIDRs()
        {
            var args = new[] { "--forwardedheadersknownnetworks=192.168.1.0/24,10.0.0.0/8" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersKnownNetworks, Has.Count.EqualTo(2));
            Assert.That(hostArgs.ForwardedHeadersKnownNetworks[0], Is.EqualTo("192.168.1.0/24"));
            Assert.That(hostArgs.ForwardedHeadersKnownNetworks[1], Is.EqualTo("10.0.0.0/8"));
        }

        [Test]
        public void ForwardedHeaders_All_Options_Can_Be_Combined()
        {
            var args = new[]
            {
                "--forwardedheadersenabled=true",
                "--forwardedheaderstrustallproxies=false",
                "--forwardedheadersknownproxies=192.168.1.1,10.0.0.1",
                "--forwardedheadersknownnetworks=192.168.0.0/16"
            };
            var hostArgs = new HostArguments(args);

            Assert.That(hostArgs.ForwardedHeadersEnabled, Is.True);
            Assert.That(hostArgs.ForwardedHeadersTrustAllProxies, Is.False);
            Assert.That(hostArgs.ForwardedHeadersKnownProxies, Has.Count.EqualTo(2));
            Assert.That(hostArgs.ForwardedHeadersKnownNetworks, Has.Count.EqualTo(1));
        }

        [TestCase("--FORWARDEDHEADERSENABLED=false")]
        [TestCase("--ForwardedHeadersEnabled=false")]
        [TestCase("--forwardedheadersenabled=false")]
        public void ForwardedHeaders_Argument_Names_Are_Case_Insensitive(string arg)
        {
            var args = new[] { arg };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersEnabled, Is.False);
        }

        [TestCase("FALSE")]
        [TestCase("False")]
        [TestCase("false")]
        public void ForwardedHeadersEnabled_Values_Are_Case_Insensitive(string value)
        {
            var args = new[] { $"--forwardedheadersenabled={value}" };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.ForwardedHeadersEnabled, Is.False);
        }
    }
}
