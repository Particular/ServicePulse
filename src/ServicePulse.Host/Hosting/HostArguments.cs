namespace ServicePulse.Host.Hosting
{
    using System;
    using System.IO;
    using System.Reflection;
    using System.ServiceProcess;
    using System.Text;

    internal class HostArguments
    {
        public HostArguments(string[] args)
        {
            executionMode = ExecutionMode.Run;
            startMode = StartMode.Automatic;
            url = "http://localhost:8081";
            ServiceName = "ServicePulse";
            DisplayName = "ServicePulse in Particular";
            Description = "An Operations Manager’s Best Friend.";
            ServiceAccount = ServiceAccount.LocalSystem;
            Username = String.Empty;
            Password = String.Empty;
            OutputPath = Environment.CurrentDirectory;

            var runOptions = new OptionSet
            {
                {
                    "?|h|help", "Help about the command line options.", key => { Help = true; }
                },
                {
                    "serviceControlUrl=",
                    @"Configures the service control url."
                    , s => { serviceControlUrl = s; }
                },
                {
                    "url=",
                    @"Configures ServicePulse to listen on the specified url."
                    , s => { url = s; }
                }
            };

            extractOptions = new OptionSet
            {
                {
                    "?|h|help", "Help about the command line options.", key => { Help = true; }
                },
                {
                    "e|extract",
                    @"Extract files to be installed in a Web Server."
                    , s => { executionMode = ExecutionMode.Extract; }
                },
                {
                    "serviceControlUrl=",
                    @"Configures the service control url."
                    , s => { serviceControlUrl = s; }
                },
                {
                    "outPath=",
                    @"The output path to extract files to. By default it extracts to the current directory."
                    , s => { OutputPath = s; }
                }
            };

            uninstallOptions = new OptionSet
            {
                {
                    "?|h|help", "Help about the command line options.", key => { Help = true; }
                },
                {
                    "u|uninstall",
                    @"Uninstall the endpoint as a Windows service."
                    , s => { executionMode = ExecutionMode.Uninstall; }
                },
                {
                    "serviceName=",
                    @"Specify the service name for the installed service."
                    , s => { ServiceName = s; }
                }
            };

            installOptions = new OptionSet
            {
                {
                    "?|h|help",
                    "Help about the command line options.",
                    key => { Help = true; }
                },
                {
                    "i|install",
                    @"Install the endpoint as a Windows service."
                    , s => { executionMode = ExecutionMode.Install; }
                },
                {
                    "serviceName=",
                    @"Specify the service name for the installed service."
                    , s => { ServiceName = s; }
                },
                {
                    "displayName=",
                    @"Friendly name for the installed service."
                    , s => { DisplayName = s; }
                },
                {
                    "description=",
                    @"Description for the service."
                    , s => { Description = s; }
                },
                {
                    "username=",
                    @"Username for the account the service should run under."
                    , s => { Username = s; }
                },
                {
                    "password=",
                    @"Password for the service account."
                    , s => { Password = s; }
                },
                {
                    "localservice",
                    @"Run the service with the local service account."
                    , s => { ServiceAccount = ServiceAccount.LocalService; }
                },
                {
                    "networkservice",
                    @"Run the service with the network service permission."
                    , s => { ServiceAccount = ServiceAccount.NetworkService; }
                },
                {
                    "user",
                    @"Run the service with the specified username and password. Alternative the system will prompt for a valid username and password if values for both the username and password are not specified."
                    , s => { ServiceAccount = ServiceAccount.User; }
                },
                {
                    "delayed",
                    @"The service should start automatically (delayed)."
                    , s => { startMode = StartMode.Delay; }
                },
                {
                    "autostart",
                    @"The service should start automatically (default)."
                    , s => { startMode = StartMode.Automatic; }
                },
                {
                    "disabled",
                    @"The service should be set to disabled."
                    , s => { startMode = StartMode.Disabled; }
                },
                {
                    "manual",
                    @"The service should be started manually."
                    , s => { startMode = StartMode.Manual; }
                },
                {
                    "serviceControlUrl=",
                    @"Configures the service control url."
                    , s => { serviceControlUrl = s; }
                },
                {
                    "url=",
                    @"Configures ServicePulse to listen on the specified url."
                    , s => { url = s; }
                }
            };

            try
            {
                installOptions.Parse(args);
                if (executionMode == ExecutionMode.Install)
                {
                    return;
                }

                uninstallOptions.Parse(args);
                if (executionMode == ExecutionMode.Uninstall)
                {
                    return;
                }

                extractOptions.Parse(args);
                if (executionMode == ExecutionMode.Extract)
                {
                    return;
                }

                runOptions.Parse(args);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                Help = true;
            }
        }

        public ExecutionMode ExecutionMode
        {
            get { return executionMode; }
        }

        public bool Help { get; set; }
        public string ServiceName { get; set; }

        public string Url
        {
            get { return url; }
        }

        public string ServiceControlUrl
        {
            get { return serviceControlUrl; }
        }

        public string DisplayName { get; set; }
        public string Description { get; set; }

        public StartMode StartMode
        {
            get { return startMode; }
        }

        public string OutputPath { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public ServiceAccount ServiceAccount { get; set; }

        public void PrintUsage()
        {
            var sb = new StringBuilder();

            var helpText = String.Empty;
            using (
                var stream =
                    Assembly.GetCallingAssembly()
                        .GetManifestResourceStream("ServicePulse.Host.Hosting.Help.txt"))
            {
                if (stream != null)
                {
                    using (var streamReader = new StreamReader(stream))
                    {
                        helpText = streamReader.ReadToEnd();
                    }
                }
            }

            installOptions.WriteOptionDescriptions(new StringWriter(sb));
            var installOptionsHelp = sb.ToString();

            sb.Clear();
            uninstallOptions.WriteOptionDescriptions(new StringWriter(sb));
            var uninstallOptionsHelp = sb.ToString();

            sb.Clear();
            extractOptions.WriteOptionDescriptions(new StringWriter(sb));
            var extractOptionsHelp = sb.ToString();

            Console.Out.WriteLine(helpText, installOptionsHelp, uninstallOptionsHelp, extractOptionsHelp);
        }

        readonly OptionSet extractOptions;
        readonly OptionSet installOptions;
        readonly OptionSet uninstallOptions;
        ExecutionMode executionMode;
        StartMode startMode;
        string url, serviceControlUrl;
    }

    internal enum ExecutionMode
    {
        Install,
        Uninstall,
        Extract,
        Run
    }

    internal enum StartMode
    {
        Manual,
        Automatic,
        Delay,
        Disabled
    }
}