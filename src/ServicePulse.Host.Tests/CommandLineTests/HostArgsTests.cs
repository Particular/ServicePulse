namespace ServicePulse.Host.Tests
{
    using System;
    using NUnit.Framework;
    using ServicePulse.Host.Hosting;

    [TestFixture]
    public class HostArgumentsTests
    {
        string[] args;
        const string validUrl = @"http://localhost:1010/sp/";
        const string invalidUrl = @"http//localhost:1010/sp/";

        [Test]
        public void Run_Args_Unknown_Argument_Shows_Help()
        {
            args = new[]
            {
                "--foobar"
            };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.Help, Is.True, "Unknown argument did not set help flag");
        }

        [Test]
        public void Run_Args_No_Arguments_Is_Valid()
        {
            // No Arguments
            args = new string[] { };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.executionMode == ExecutionMode.Run, Is.True, "With no args execution mode should be run");
            Assert.That(hostArgs.Help, Is.False, "With no args help should not be triggered");
        }

        [Test]
        public void Run_Args_With_Valid_URL()
        {
            args = new[]
            {
                $"--url={validUrl}"
            };

            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.executionMode == ExecutionMode.Run, Is.True, "With only valid url args execution mode should be run");
            Assert.That(hostArgs.Help, Is.False, "With only valid url arguments help should not be triggered");
            Assert.That(hostArgs.Url.Equals(validUrl, StringComparison.Ordinal), Is.True, "Valid url argument was not parsed correctly");
        }

        [Test]
        public void Run_Args_With_Invalid_URL()
        {

            args = new[]
            {
                $"--url={invalidUrl}"
            };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.Help, Is.True, "With invalid url argument help should be triggered");
        }

        [Test]
        public void Run_Args_Extra_Args_Trigger_help()
        {

            args = new[]
            {
                $"--url={validUrl}",
                $"--serviceControlUrl={validUrl}"    //ServiceControl URL isn't valid in run mode. Needs to be manually set
            };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.Help, Is.True, "With extra arguments help should be triggered");
        }

        [Test]
        public void Extract_Args_With_Defaults()
        {
            args = new[]
            {
                "-extract"
            };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.Help, Is.False, "extract argument should not show help");
            Assert.That(hostArgs.executionMode == ExecutionMode.Extract, Is.True, "extract argument did not parse to correct execution mode");
        }

        [Test]
        public void Extract_Args_With_SC_Specified()
        {
            args = new[]
            {
                "-extract",
                $"--serviceControlUrl={validUrl}"
            };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.Help, Is.False, "extract argument should not show help");
            Assert.That(hostArgs.executionMode == ExecutionMode.Extract, Is.True, "extract argument did not parse to correct execution mode");
            Assert.That(hostArgs.ServiceControlUrl.Equals(validUrl, StringComparison.Ordinal), Is.True, "ServiceControlUrl argument was not parsed correctly");
        }

        [Test]
        public void Extract_Args_With_SC_Monitoring_Specified()
        {
            args = new[]
            {
                "-extract",
                $"--serviceControlMonitoringUrl={validUrl}"
            };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.Help, Is.False, "extract argument should not show help");
            Assert.That(hostArgs.executionMode == ExecutionMode.Extract, Is.True, "extract argument did not parse to correct execution mode");
            Assert.That(hostArgs.ServiceControlMonitoringUrl.Equals(validUrl, StringComparison.Ordinal), Is.True, "ServiceControlMonitoringUrl argument was not parsed correctly");
        }

        [Test]
        public void Extract_Args_With_Output_Specified()
        {
            var path = @"c:\foo\bar";
            args = new[]
            {
                "-extract",
                $"--outPath={path}"
            };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.executionMode == ExecutionMode.Extract, Is.True, "extract argument did not parse to correct execution mode");
            Assert.That(hostArgs.Help, Is.False, "extract argument should not show help");
            Assert.That(hostArgs.OutputPath.Equals(path, StringComparison.Ordinal), Is.True, "outpath argument was not parsed correctly");
        }

        [Test]
        public void Extract_Args_With_All_Params_Specified()
        {
            var path = @"c:\foo\bar";
            args = new[]
            {
                "-e",
                $"--servicecontrolurl={validUrl}",
                $"--serviceControlMonitoringUrl={validUrl}",
                $"--outpath={path}"

            };
            var hostArgs = new HostArguments(args);
            Assert.That(hostArgs.executionMode == ExecutionMode.Extract, Is.True, "extract argument did not parse to correct execution mode");
            Assert.That(hostArgs.Help, Is.False, "extract argument should not show help");
            Assert.That(hostArgs.OutputPath.Equals(path, StringComparison.Ordinal), Is.True, "outpath argument was not parsed correctly");
            Assert.That(hostArgs.ServiceControlUrl.Equals(validUrl, StringComparison.Ordinal), Is.True, "ServiceControlUrl argument was not parsed correctly");
            Assert.That(hostArgs.ServiceControlMonitoringUrl.Equals(validUrl, StringComparison.Ordinal), Is.True, "ServiceControlMonitoringUrl argument was not parsed correctly");
        }
    }
}