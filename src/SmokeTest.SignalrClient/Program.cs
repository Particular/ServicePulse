namespace SmokeTest.SignalrClient
{
    using System.Diagnostics;

    class Program
    {
        static void Main()
        {
            Process.Start(new ProcessStartInfo("index.html") { UseShellExecute = true });
        }
    }
}
