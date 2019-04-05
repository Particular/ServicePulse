using System.Diagnostics;

namespace SmokeTest.SignalrClient
{
    class Program
    {
        static void Main(string[] args)
        {
            Process.Start(new ProcessStartInfo("index.html") { UseShellExecute = true });
        }
    }
}
