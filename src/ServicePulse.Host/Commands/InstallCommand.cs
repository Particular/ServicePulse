﻿namespace ServicePulse.Host.Commands
{
    using System;
    using System.Collections;
    using Hosting;

    class InstallCommand : ServiceCommand
    {
        public InstallCommand() : base(installer => installer.Install(new Hashtable()))
        {
        }

        public override void Execute(HostArguments args)
        {
            if (IsServiceInstalled(args.ServiceName))
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.Out.WriteLine("The '{0}' service is already installed.", args.ServiceName);
                Console.ResetColor();

                return;
            }

            ExecuteInternal(args);
        }
    }
}