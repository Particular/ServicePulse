﻿namespace ServicePulse.Host.Tests
{
    using NUnit.Framework;
    using ServicePulse.Host.Hosting;

    [TestFixture]
    public class CaseLessOptionSetTests
    {
        bool flag;
        OptionSet testOptions;

        [SetUp]
        public void Setup()
        {
            testOptions = new CaseLessOptionSet
            {
                {
                    "t|test",
                    "Test option",
                    key => { flag = true; }
                }
            };
        }

        [Test]
        public void LowercaseTestShouldSucceed()
        {
            flag = false;
            testOptions.Parse(new[] { "-test" });
            Assert.IsTrue(flag, "-test did not parse as a valid option");
        }

        [Test]
        public void MixedCaseTestShouldSucceed()
        {
            flag = false;
            testOptions.Parse(new[] { "-Test" });
            Assert.IsTrue(flag, "-Test did not parse as a valid option");
        }

        [Test]
        public void UppercaseTestShouldSucceed()
        {
            flag = false;
            testOptions.Parse(new[] { "-TEST" });
            Assert.IsTrue(flag, "-TEST did not parse as a valid option");
        }

        [Test]
        public void ShortTestShouldSucceed()
        {
            flag = false;
            testOptions.Parse(new[] { "-t" });
            Assert.IsTrue(flag, "-TEST did not parse as a valid option");
        }

        [Test]
        public void ShortTestShouldFail()
        {
            flag = false;
            testOptions.Parse(new[] { "-x" });
            Assert.IsFalse(flag, "-x should not parse as a valid option");
        }

        [Test]
        public void Ensure_MultiSet_Option_Work()
        {

            const string validUrl = @"http://localhost:1010/sp/";
            var executionMode = ExecutionMode.Run;

            var installOptions = new CaseLessOptionSet
            {
                {
                    "?|h|help",
                    "Help about the command line options.",
                    key => { }
                },
                {
                    "i|install",
                    @"Install the endpoint as a Windows service.",
                    s =>{executionMode = ExecutionMode.Install;}
                },
                {
                    "servicename=",
                    @"Specify the service name for the installed service.",
                    s => {  }
                },
                {
                    "servicecontrolurl=",
                    @"Configures the service control url.",
                    s => {  }
                },
                {
                    "url=",
                    @"Configures ServicePulse to listen on the specified url.",
                    s => {  }
                }
            };


            var extractOptions = new CaseLessOptionSet
            {
                {
                    "?|h|help",
                    "Help about the command line options.",
                    key => { }
                },
                {
                    "e|extract",
                    @"Extract files to be installed in a Web Server.",
                    s => {executionMode = ExecutionMode.Extract;}
                },
                {
                    "servicecontrolurl=",
                    @"Configures the service control url.",
                    s => { }
                },
                {
                    "outpath=",
                    @"The output path to extract files to. By default it extracts to the current directory.",
                    s => {  }
                }
            };

            var path = @"c:\foo\bar";
            var args = new[]
            {
                "-e",
                $"--servicecontrolurl={validUrl}",
                $"--outpath={path}"
            };


            installOptions.Parse(args);
            Assert.IsTrue(executionMode == ExecutionMode.Run);
            extractOptions.Parse(args);
            Assert.IsTrue(executionMode == ExecutionMode.Extract);
        }


        [Test]
        public void ReturnsUnknownArguments()
        {
            var unknownArgs = testOptions.Parse(new[] { "-test", "-unknown" });
            Assert.IsTrue(unknownArgs.Count == 1, "Unknown argument was not detected");
            Assert.IsTrue(unknownArgs[0].Equals("-unknown"), "Unknown argument was not returned");
        }
    }
}
