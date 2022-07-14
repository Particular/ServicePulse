namespace SmokeTest.Client
{
    using System;
    using System.Threading.Tasks;
    using NServiceBus;

    public class MyResponseHandler : IHandleMessages<Response>
    {
        // remove this pragma after upgrading to NServiceBus 8
#pragma warning disable PS0018 // A task-returning method should have a CancellationToken parameter unless it has a parameter implementing ICancellableContext
        public Task Handle(Response message, IMessageHandlerContext context)
#pragma warning restore PS0018 // A task-returning method should have a CancellationToken parameter unless it has a parameter implementing ICancellableContext
        {
            Console.WriteLine(@"Response received. Id: {0}", message.Id);
            throw new InvalidOperationException(message + "Uh oh...Nulls are bad MK");
        }
    }
}