namespace ServicePulse;

using System.Collections.Concurrent;
using Microsoft.Extensions.Logging;

static class LoggerUtil
{
    static readonly ConcurrentDictionary<LogLevel, ILoggerFactory> factories = new();

    static ILoggerFactory GetOrCreateLoggerFactory(LogLevel level)
    {
        if (!factories.TryGetValue(level, out var factory))
        {
            factory = LoggerFactory.Create(builder => builder.AddConsole().SetMinimumLevel(level));
            factories[level] = factory;
        }

        return factory;
    }

    public static ILogger<T> CreateStaticLogger<T>(LogLevel level = LogLevel.Information)
    {
        var factory = GetOrCreateLoggerFactory(level);
        return factory.CreateLogger<T>();
    }
}
