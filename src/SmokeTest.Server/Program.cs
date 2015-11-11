using System;
using NServiceBus;
using NServiceBus.Features;

class Program
{
    public static bool KillMe = false;
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
            while (true)
            {
                var key = Console.ReadKey();
                switch (key.Key)
                {
                    case ConsoleKey.Enter:
                        KillMe = true;
                        Console.WriteLine("Allow Exception Processing");
                        break;
                    case ConsoleKey.Spacebar:
                        Console.WriteLine("Stop Exception Processing");
                        KillMe = false;
                        break;
                    case ConsoleKey.Q:
                        return;
                }
            }
        }
    }
}




