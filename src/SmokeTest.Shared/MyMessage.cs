using System;
using NServiceBus;


public class MyMessage : IMessage
{
    public Guid Id { get; set; }
    public bool KillMe { get; set; }
    public string SomeText { get; set; }
}

public class Response : IMessage
{
    public Guid Id { get; set; }
}

public class MyEvent : IEvent
{
    public Guid Id { get; set; }
}