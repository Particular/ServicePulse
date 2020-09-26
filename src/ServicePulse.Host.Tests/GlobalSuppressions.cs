using System.Diagnostics.CodeAnalysis;

[assembly: SuppressMessage("Reliability", "CA2007:Consider calling ConfigureAwait on the awaited task", Justification = "Test project")]
[assembly: SuppressMessage("Code", "PCR0002:Await or Capture Tasks", Justification = "Temporary. Will fix later", Scope = "type", Target = "~T:ServicePulse.Host.Tests.Owin.StaticMiddlewareTests")]
