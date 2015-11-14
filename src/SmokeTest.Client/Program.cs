using System;
using NServiceBus;

class Program
{
    const string wordblob = "Flank filet mignon rump prosciutto kevin Tail pancetta tenderloin tongue prosciutto, short loin pork pastrami flank swine leberkas Pig beef ribs hamburger, ball tip pastrami ham hock flank meatloaf Shoulder boudin meatloaf sirloin porchetta short loin ground round corned beef T-bone ground round pork chop pancetta short ribs, tenderloin brisket frankfurter Pig chuck porchetta meatball tongue capicola swine turducken, beef pastrami prosciutto bresaola bacon alcatra";


    static void Main()
    {
        var busConfiguration = new BusConfiguration();
        busConfiguration.EndpointName("SmokeTest.Client");
        busConfiguration.UseSerialization<JsonSerializer>();
        busConfiguration.EnableInstallers();
        busConfiguration.UsePersistence<InMemoryPersistence>();

        using (var bus = Bus.Create(busConfiguration).Start())
        {
            Console.WriteLine("Press enter to send a message");
            Console.WriteLine("Press any key to exit");


            var exit = false;
            var emulateFailures = false;
            var count = 1;
            do
            {
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine("-------------------------------------");
                Console.WriteLine("[ A ] Send 1 good Message");
                Console.WriteLine("[ B ] Send 10 bad Messages");
                Console.WriteLine("[ Q ] Quit");
                Console.WriteLine("-------------------------------------");
                Console.Write("Make a Choice: ");

                var key = Console.ReadKey();
                Console.WriteLine();
                switch (key.Key)
                {
                    case ConsoleKey.A:
                        emulateFailures = false;
                        count = 1;
                        break;
                    case ConsoleKey.B:
                        emulateFailures = true;
                        count = 10;
                        break;
                    case ConsoleKey.Q:
                        exit = true;
                        break;
                    default:
                        Console.WriteLine("Option not valid, Try again.");
                        continue;
                        
                }

                Console.ForegroundColor = ConsoleColor.Gray;

                var text = wordblob.LoremIpsum(5, 5, 1, 1, 1);
                for (var i = 0; i < count; i++)
                {
                    var id = Guid.NewGuid();

                    bus.Send("SmokeTest.Server", new MyMessage
                    {
                        Id = id,
                        KillMe = emulateFailures,
                        SomeText = text
                    });

                    Console.WriteLine("Sent a new message with id: {0}", id.ToString("N"));
                }

            } while (!exit);
        }
    }
}
