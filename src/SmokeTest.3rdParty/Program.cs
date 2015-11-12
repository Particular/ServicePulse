﻿using System;
using System.IO;
using System.Net;

class Program
{
    static bool isReturningOk = true;
    static HttpListener listener;

    static void Main()
    {
        Console.WriteLine("Press enter key to toggle the server to return a error or success");
        Console.WriteLine("Press any key to exit");

        using (listener = new HttpListener())
        {
            listener.Prefixes.Add("http://localhost:57789/");
            listener.Start();
            listener.BeginGetContext(ListenerCallback, listener);

            while (true)
            {
                ConsoleKeyInfo key = Console.ReadKey();
                Console.WriteLine();

                if (key.Key != ConsoleKey.Enter)
                {
                    return;
                }
                listener.Close();
                
                isReturningOk = !isReturningOk;

                Console.WriteLine("Currently returning {0}!", isReturningOk ? "Success" : "Error");
            }
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