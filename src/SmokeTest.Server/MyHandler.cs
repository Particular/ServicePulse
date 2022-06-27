namespace SmokeTest.Server.Particular.Core.Deliberately.Insanely.Long.NamespaceToEmulateTheCrazyNamespaceLengthsPeopleGiveNamespacesInTheirSystems
{
    using System;
    using System.Threading.Tasks;
    using NServiceBus;

    public class MyHandler : IHandleMessages<MyMessage>
    {
        // remove this pragma after upgrading to NServiceBus 8
#pragma warning disable PS0018 // A task-returning method should have a CancellationToken parameter unless it has a parameter implementing ICancellableContext
        public async Task Handle(MyMessage message, IMessageHandlerContext context)
#pragma warning restore PS0018 // A task-returning method should have a CancellationToken parameter unless it has a parameter implementing ICancellableContext
        {
            Console.WriteLine(@"Message received. Id: {0}", message.Id);

            await context.Reply(new Response() { Id = Guid.NewGuid() }).ConfigureAwait(false);
            await context.Publish(new MyEvent() { Id = Guid.NewGuid() }).ConfigureAwait(false);
            if (Program.goodretries || !message.KillMe)
            {
                return;
            }

            if (!Program.emulateFailures)
            {
                RandomException(message.SomeText);
            }
            else
            {
                throw new InvalidOperationException(message + "Uh oh...Nulls are bad MK");
            }
        }

        static void RandomException(string message)
        {
            var rand = new Random();
            var wheelOfFortune = rand.Next(3) + 1;

            switch (wheelOfFortune)
            {
                case 1:
                    throw new OutOfMemoryException(message + "Uh oh...I forget Why this happened");
                case 2:
                    throw new NullReferenceException(message + "Uh oh...Nulls are bad MK");
                case 3:
                    throw new DivideByZeroException(message + "Uh oh...Zero and Divisions just don't get along");
                default:
                    throw new Exception(message + "Uh oh...Because, Reasons");
            }

        }
    }
}