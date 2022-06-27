namespace SmokeTest.Server.Particular.Core.Deliberately.Insanely.Long.NamespaceToEmulateTheCrazyNamespaceLengthsPeopleGiveNamespacesInTheirSystems
{
    using System;
    using System.Threading.Tasks;
    using NServiceBus;

    public class MyEventHnd : IHandleMessages<MyEvent>
    {
#pragma warning disable PS0018
        public Task Handle(MyEvent message, IMessageHandlerContext context)
#pragma warning restore PS0018
        {
            Console.WriteLine(@"Evemt received. Id: {0}", message.Id);
            return Task.FromResult(0);
        }
    }
}