using System;
using System.Threading.Tasks;
using NServiceBus;

class Program
{
    const string wordblob =
        "Flank filet mignon rump prosciutto kevin Tail pancetta tenderloin tongue prosciutto, short loin pork pastrami flank swine leberkas Pig beef ribs hamburger, ball tip pastrami ham hock flank meatloaf Shoulder boudin meatloaf sirloin porchetta short loin ground round corned beef T-bone ground round pork chop pancetta short ribs, tenderloin brisket frankfurter Pig chuck porchetta meatball tongue capicola swine turducken, beef pastrami prosciutto bresaola bacon alcatra";


    static async Task Main()
    {
        var endpointConfiguration = new EndpointConfiguration("SmokeTest.ClientNoHeartbeat");

        endpointConfiguration.UseTransport<LearningTransport>();

        var enpointInstance = await Endpoint.Start(endpointConfiguration);
        Console.WriteLine("Press enter to send a message");
        Console.WriteLine("Press any key to exit");


        var exit = false;
        do
        {
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("-------------------------------------");
            Console.WriteLine("[ A ] Send 1 good Message");
            Console.WriteLine("[ B ] Send 10 bad Messages");
            Console.WriteLine("[ C ] Send Infinite bad Messages ");
            Console.WriteLine("[ Q ] Quit");
            Console.WriteLine("-------------------------------------");
            Console.Write("Make a Choice: ");

            var key = Console.ReadKey();
            Console.WriteLine();


            string text = wordblob.LoremIpsum(5, 5, 1, 1, 1);

#pragma warning disable IDE0010 // Add missing cases
            switch (key.Key)
#pragma warning restore IDE0010 // Add missing cases
            {
                case ConsoleKey.A:
                    await SendMessage(enpointInstance, false, text);
                    break;
                case ConsoleKey.B:

                    for (var i = 0; i < 10; i++)
                    {
                        await SendMessage(enpointInstance, true, text);
                    }
                    break;
                case ConsoleKey.C:

                    while (!Console.KeyAvailable)
                    {
                        await SendMessage(enpointInstance, true, text);
                        Task.Delay(200).Wait(); // 5 messages a second
                        Console.WriteLine("Press any key to stop sending messages");
                    }

                    break;
                case ConsoleKey.Q:
                    exit = true;
                    break;
                default:
                    Console.WriteLine("Option not valid, Try again.");
                    continue;
            }
        }
        while (!exit);

        await enpointInstance.Stop();
    }

    static async Task SendMessage(IMessageSession messageSession, bool emulateFailures, string text)
    {
        var id = Guid.NewGuid();

        await messageSession.Send("SmokeTest.Server", new MyMessage
        {
            Id = id,
            KillMe = emulateFailures,
            SomeText = text
        });

        Console.WriteLine("Sent a new message with id: {0}", id.ToString("N"));
    }
}