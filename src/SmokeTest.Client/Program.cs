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

            while (true)
            {
                var killMe = false;
                var count = 1;

                var key = Console.ReadKey();
                switch (key.Key)
                {
                    case ConsoleKey.Enter:
                        killMe = true;
                        count = 10;
                        break;
                    case ConsoleKey.Spacebar:
                        killMe = true;
                        break;
                    case ConsoleKey.Q:
                        return;
                }

                var text = wordblob.LoremIpsum(5, 5, 1, 1, 1);
                for (var i = 0; i < count; i++)
                {
                    var id = Guid.NewGuid();

                    bus.Send("SmokeTest.Server", new MyMessage
                    {
                        Id = id,
                        KillMe = killMe,
                        SomeText = text
                    });

                    Console.WriteLine("Sent a new message with id: {0}", id.ToString("N"));
                }
             
            }
        }
    }
}
