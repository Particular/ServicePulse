namespace ServicePulse.Host.Hosting
{
    using System;
    using System.Collections.Generic;
#if DEBUG
    using System.Diagnostics;
#endif
    using System.IO;
    using System.Linq;
    using System.Reflection;
    using System.ServiceProcess;
    using System.Text;
    using Commands;

    class HostArguments
    {
        public ExecutionMode executionMode = ExecutionMode.Run;

        public HostArguments(string[] args)
        {
            Commands = new List<Type> { typeof(RemoveDeprecatedOveridesCommand), typeof(RunCommand) };
            StartMode = StartMode.Automatic;
            Url = "http://localhost:8081";
            ServiceName = "Particular.ServicePulse";
            DisplayName = "Particular ServicePulse";
            Description = "An Operations Manager's Best Friend in Particular.";
            ServiceAccount = ServiceAccount.LocalService;
            Username = string.Empty;
            Password = string.Empty;
            OutputPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "dist");

            var runOptions = new CaseLessOptionSet
            {
                {
                    "?|h|help", "Help about the command line options.", key => { Help = true; }
                },
                {
                    "url=",
                    @"Configures ServicePulse to listen on the specified url.",
                    s => { Url = s; }
                }
            };

            extractOptions = new CaseLessOptionSet
            {
                {
                    "?|h|help", "Help about the command line options.", key => { Help = true; }
                },
                {
                    "e|extract",
                    @"Extract files to be installed in a Web Server.",
                    s =>
                    {
                        Commands = new List<Type> { typeof(ExtractCommand), typeof(ExtractAndUpdateConstantsCommand) };
                        executionMode = ExecutionMode.Extract;
                    }
                },
                {
                    "servicecontrolurl=",
                    @"Configures the service control url.",
                    s => { ServiceControlUrl = s; }
                },
                {
                    "servicecontrolmonitoringurl=",
                    @"Configures the service control monitoring url.",
                    s => { ServiceControlMonitoringUrl = s; }
                },
                {
                    "outpath=",
                    @"The output path to extract files to. By default it extracts to the current directory.",
                    s => { OutputPath = s; }
                }
            };

            uninstallOptions = new CaseLessOptionSet
            {
                {
                    "?|h|help", "Help about the command line options.", key => { Help = true; }
                },
                {
                    "u|uninstall",
                    @"Uninstall the endpoint as a Windows service.",
                    s =>
                    {
                        Commands = new List<Type> {typeof(UninstallCommand)};
                        executionMode = ExecutionMode.Uninstall;
                    }
                },
                {
                    "servicename=",
                    @"Specify the service name for the installed service.",
                    s => { ServiceName = s; }
                }
            };

            installOptions = new CaseLessOptionSet
            {
                {
                    "?|h|help",
                    "Help about the command line options.",
                    key => { Help = true; }
                },
                {
                    "i|install",
                    @"Install the endpoint as a Windows service.",
                    s =>
                    {
                        Commands = new List<Type> { typeof(RemoveDeprecatedOveridesCommand), typeof(ExtractAndUpdateConstantsCommand), typeof(InstallCommand) };
                        executionMode = ExecutionMode.Install;
                    }
                },
                {
                    "servicename=",
                    @"Specify the service name for the installed service.",
                    s => { ServiceName = s; }
                },
                {
                    "displayname=",
                    @"Friendly name for the installed service.",
                    s => { DisplayName = s; }
                },
                {
                    "description=",
                    @"Description for the service.",
                    s => { Description = s; }
                },
                {
                    "username=",
                    @"Username for the account the service should run under.",
                    s => { Username = s; }
                },
                {
                    "password=",
                    @"Password for the service account.",
                    s => { Password = s; }
                },
                {
                    "localservice",
                    @"Run the service with the local service account.",
                    s => { ServiceAccount = ServiceAccount.LocalService; }
                },
                {
                    "networkservice",
                    @"Run the service with the network service permission.",
                    s => { ServiceAccount = ServiceAccount.NetworkService; }
                },
                {
                    "user",
                    @"Run the service with the specified username and password. Alternative the system will prompt for a valid username and password if values for both the username and password are not specified.",
                    s => { ServiceAccount = ServiceAccount.User; }
                },
                {
                    "delayed",
                    @"The service should start automatically (delayed).",
                    s => { StartMode = StartMode.Delay; }
                },
                {
                    "autostart",
                    @"The service should start automatically (default).",
                    s => { StartMode = StartMode.Automatic; }
                },
                {
                    "disabled",
                    @"The service should be set to disabled.",
                    s => { StartMode = StartMode.Disabled; }
                },
                {
                    "manual",
                    @"The service should be started manually.",
                    s => { StartMode = StartMode.Manual; }
                },
                {
                    "servicecontrolurl=",
                    @"Configures the service control url.",
                    s => { ServiceControlUrl = s; }
                },
                {
                    "servicecontrolmonitoringurl=",
                    @"Configures the service control monitoring url.",
                    s => { ServiceControlMonitoringUrl = s; }
                },
                {
                    "url=",
                    @"Configures ServicePulse to listen on the specified url.",
                    s => { Url = s; }
                }
            };

            try
            {
                List<string> unknownArgsList;

                unknownArgsList = installOptions.Parse(args);
                if (executionMode == ExecutionMode.Install)
                {
                    ThrowIfUnknownArgs(unknownArgsList);
                    ValidateArgs();
                    return;
                }

                unknownArgsList = uninstallOptions.Parse(args);
                if (executionMode == ExecutionMode.Uninstall)
                {
                    ThrowIfUnknownArgs(unknownArgsList);
                    return;
                }

                unknownArgsList = extractOptions.Parse(args);
                if (executionMode == ExecutionMode.Extract)
                {
                    ThrowIfUnknownArgs(unknownArgsList);
                    ValidateArgs();
                    return;
                }

                unknownArgsList = runOptions.Parse(args);
                ThrowIfUnknownArgs(unknownArgsList);
                ValidateArgs();
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                Help = true;
            }
        }

        void ThrowIfUnknownArgs(List<string> unknownArgsList)
        {
            if (unknownArgsList.Count > 0)
            {
                throw new ApplicationException(string.Format("Unknown command line argument(s) : {0} ", string.Join(" ", unknownArgsList)));
            }
        }

        void ValidateArgs()
        {
            var validProtocols = new[]
            {
                "http",
                "https"
            };

            switch (executionMode)
            {
                case ExecutionMode.Extract:
                case ExecutionMode.Install:
                    // param for sc url is optional.
                    if (!string.IsNullOrEmpty(ServiceControlUrl))
                    {
                        if ((!Uri.TryCreate(ServiceControlUrl, UriKind.Absolute, out Uri scUri)) || (!validProtocols.Contains(scUri.Scheme, StringComparer.OrdinalIgnoreCase)))
                        {
                            throw new Exception("The value specified for 'serviceControlUrl' is not a valid URL");
                        }
                    }

                    // param for sc url is optional.
                    if (!string.IsNullOrEmpty(ServiceControlMonitoringUrl))
                    {
                        if ((!Uri.TryCreate(ServiceControlMonitoringUrl, UriKind.Absolute, out Uri scUri)) || (!validProtocols.Contains(scUri.Scheme, StringComparer.OrdinalIgnoreCase)))
                        {
                            throw new Exception("The value specified for 'serviceControlMonitoringUrl' is not a valid URL");
                        }
                    }

                    goto case ExecutionMode.Run;

                case ExecutionMode.Run:
                    Uri spUri;
                    if (!Uri.TryCreate(Url, UriKind.Absolute, out spUri) || (!validProtocols.Contains(spUri.Scheme, StringComparer.OrdinalIgnoreCase)))
                    {
                        throw new Exception("The value specified for 'url' is not a valid URL");
                    }
                    break;

                case ExecutionMode.Uninstall:
                default:
                    break;
            }
        }

        public List<Type> Commands { get; private set; }

        public bool Help { get; set; }
        public string ServiceName { get; set; }

        public string Url { get; private set; }

        public string ServiceControlUrl { get; set; }

        public string ServiceControlMonitoringUrl { get; set; }

        public string DisplayName { get; set; }
        public string Description { get; set; }

        public StartMode StartMode { get; private set; }

        public string OutputPath { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public ServiceAccount ServiceAccount { get; set; }

        public void PrintUsage()
        {
            var sb = new StringBuilder();

            var helpText = string.Empty;
            using (var stream = Assembly.GetCallingAssembly().GetManifestResourceStream("ServicePulse.Host.Hosting.Help.txt"))
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
    }

    enum ExecutionMode
    {
        Install,
        Uninstall,
        Extract,
        Run
    }

    enum StartMode
    {
        Manual,
        Automatic,
        Delay,
        Disabled
    }
}