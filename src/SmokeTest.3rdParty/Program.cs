using System;
using System.IO;
using System.Net;
using System.Xml.Serialization;



class Program
{
    static bool isReturningOk = true;
    static HttpListener listener;


    static void Main()
    {
        using (listener = new HttpListener())
        {
            var exit = false;
            listener.Prefixes.Add("http://localhost:57789/");
            listener.Start();
            listener.BeginGetContext(ListenerCallback, listener);

            do
            {
                Console.Clear();
                Console.WriteLine("-------------------------------------");
                Console.ForegroundColor = isReturningOk ? ConsoleColor.Green : ConsoleColor.Red;
                Console.WriteLine("Currently returning {0}!", isReturningOk ? "Success" : "Error");
                Console.ForegroundColor = ConsoleColor.White;
                Console.WriteLine("-------------------------------------");
                Console.WriteLine("[ A ] Return Success");
                Console.WriteLine("[ B ] Return Error");
                Console.WriteLine("[ Q ] Quit");
                Console.WriteLine("-------------------------------------");
                Console.Write("Make a Choice: ");

                ConsoleKeyInfo key = Console.ReadKey();
                Console.WriteLine();
                switch (key.Key)
                {
                    case ConsoleKey.A:
                        isReturningOk = true;
                        break;
                    case ConsoleKey.B:
                        isReturningOk = false;
                        break;
                    case ConsoleKey.Q:
                        exit = true;
                        listener.Close();
                        break;
                    default:
                        Console.WriteLine("Option not valid, Try again.");
                        break;
                }

                

            } while (!exit);
        }
    }


    static void ListenerCallback(IAsyncResult result)
    {
        if (!listener.IsListening)
        {
            return;
        }
        HttpListenerContext context = listener.EndGetContext(result);
        HttpListenerResponse response = context.Response;
        if (isReturningOk)
        {
            WriteResponse(response, HttpStatusCode.OK);
        }
        else
        {
            WriteResponse(response, HttpStatusCode.InternalServerError);
        }
        response.Close();
        listener.BeginGetContext(ListenerCallback, listener);
    }

    static void WriteResponse(HttpListenerResponse response, HttpStatusCode statusCode)
    {
        response.StatusCode = (int) statusCode;
        string text = statusCode.ToString();
        using (StreamWriter streamWriter = new StreamWriter(response.OutputStream))
        {
            streamWriter.Write(text);
        }
        response.StatusDescription = text;
    }
}