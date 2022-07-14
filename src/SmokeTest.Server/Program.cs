using System;
using System.Threading.Tasks;
using NServiceBus;

class Program
{
    public static bool emulateFailures = false;
    public static bool goodretries = false;
    static async Task Main()
    {
        var endpointConfiguration = new EndpointConfiguration("SmokeTest.Server");

        endpointConfiguration.UseTransport<LearningTransport>();

        endpointConfiguration.Recoverability().Immediate(c => c.NumberOfRetries(0)).Delayed(c => c.NumberOfRetries(0));
        var enpointInstance = await Endpoint.Start(endpointConfiguration);

        var exit = false;
        do
        {
            Console.Clear();
            Console.WriteLine("-------------------------------------");
            Console.ForegroundColor = emulateFailures ? ConsoleColor.Red : ConsoleColor.Green;
            Console.WriteLine("Throw Exceptions To Emulate Failures {0}!", emulateFailures ? "On" : "Off");
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("-------------------------------------");
            Console.WriteLine("[ A ] Emulate Failures");
            Console.WriteLine("[ B ] Process Messages Normally");
            Console.WriteLine("[ C ] Allow Retries {0}", goodretries);
            Console.WriteLine("[ Q ] Quit");
            Console.WriteLine("-------------------------------------");
            Console.Write("Make a Choice: ");

            var key = Console.ReadKey();
            Console.WriteLine();
#pragma warning disable IDE0010 // Add missing cases
            switch (key.Key)
#pragma warning restore IDE0010 // Add missing cases
            {
                case ConsoleKey.A:
                    emulateFailures = true;
                    break;
                case ConsoleKey.B:
                    emulateFailures = false;
                    break;
                case ConsoleKey.C:
                    goodretries = !goodretries;
                    break;
                case ConsoleKey.Q:
                    exit = true;
                    break;
                default:
                    Console.WriteLine("Option not valid, Try again.");
                    break;
            }
        }
        while (!exit);

        await enpointInstance.Stop();
    }
}