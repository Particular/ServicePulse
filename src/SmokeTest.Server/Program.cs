using System;
using NServiceBus;
using NServiceBus.Features;

class Program
{
    public static bool emulateFailures = false;
    static void Main()
    {
        var busConfiguration = new BusConfiguration();
        busConfiguration.EndpointName("SmokeTest.Server");
        busConfiguration.UseSerialization<JsonSerializer>();
        busConfiguration.EnableInstallers();
        busConfiguration.UsePersistence<InMemoryPersistence>();

        // To disable second level retries(SLR), uncomment the following line. SLR is enabled by default.
        busConfiguration.DisableFeature<SecondLevelRetries>();

       
        using (var bus = Bus.Create(busConfiguration).Start())
        {
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
                Console.WriteLine("[ Q ] Quit");
                Console.WriteLine("-------------------------------------");
                Console.Write("Make a Choice: ");

                var key = Console.ReadKey();
                Console.WriteLine();
                switch (key.Key)
                {
                    case ConsoleKey.A:
                        emulateFailures = true;
                        break;
                    case ConsoleKey.B:
                        emulateFailures = false;
                        break;
                    case ConsoleKey.Q:
                        exit = true;
                        break;
                    default:
                        Console.WriteLine("Option not valid, Try again.");
                        break;
                }
            } while (!exit);
        }
    }
}




