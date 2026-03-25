import { describe, expect, test } from "vitest";
import { detectLanguagesInOrder, formatStackTrace, languages, type StackTraceFrame } from "./stacktraceFormatter";

function frame(result: unknown): StackTraceFrame {
  return result as StackTraceFrame;
}

const english = languages.find((l) => l.name === "english")!;
const danish = languages.find((l) => l.name === "danish")!;
const german = languages.find((l) => l.name === "german")!;
const spanish = languages.find((l) => l.name === "spanish")!;
const russian = languages.find((l) => l.name === "russian")!;
const chinese = languages.find((l) => l.name === "chinese")!;

describe("detectLanguagesInOrder", () => {
  test("detects English stack trace", () => {
    const trace = "   at System.String.Format(String format)";
    const result = detectLanguagesInOrder(trace);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("english");
  });

  test("detects Danish stack trace", () => {
    const trace = "   ved System.String.Format(String format)";
    const result = detectLanguagesInOrder(trace);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("danish");
  });

  test("detects German stack trace", () => {
    const trace = "   bei System.String.Format(String format)";
    const result = detectLanguagesInOrder(trace);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("german");
  });

  test("detects Spanish stack trace", () => {
    const trace = "   en System.String.Format(String format)";
    const result = detectLanguagesInOrder(trace);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("spanish");
  });

  test("detects Russian stack trace", () => {
    const trace = "   в System.String.Format(String format)";
    const result = detectLanguagesInOrder(trace);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("russian");
  });

  test("detects Chinese stack trace", () => {
    const trace = "   在 System.String.Format(String format)";
    const result = detectLanguagesInOrder(trace);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("chinese");
  });

  test("returns empty array for plain text with no stack frames", () => {
    const result = detectLanguagesInOrder("This is not a stack trace");
    expect(result).toHaveLength(0);
  });
});

describe("formatStackTrace", () => {
  describe("exception message lines are not mangled (bug fix)", () => {
    // Regression test: the regex previously matched 'at' inside words like 'that',
    // causing exception message text to be parsed as stack frames and dropped from output.
    test("preserves SQL exception message containing 'at' followed by parenthesized text", () => {
      const trace = [
        "System.Data.SqlClient.SqlException (0x80131904): A network-related or instance-specific error occurred while establishing a connection to SQL Server. The server was not found or was not accessible. Verify that the instance name is correct and that SQL Server is configured to allow remote connections. (provider: Named Pipes Provider, error: 40 - Could not open a connection to SQL Server)",
        "   at System.Data.SqlClient.SqlConnection.Open()",
      ].join("\n");

      const result = formatStackTrace(trace, english);

      expect(typeof result[0]).toBe("string");
      expect(result[0] as string).toContain("Verify that the instance name is correct");
      expect(result[0] as string).toContain("provider: Named Pipes Provider");
    });

    test("exception message line with parenthesized content is not parsed as a frame", () => {
      const trace = "System.Exception: Something went wrong (see inner exception for details)";
      const result = formatStackTrace(trace, english);
      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe("string");
    });
  });

  describe("English stack frames", () => {
    test("parses a simple frame with no parameters and no file info", () => {
      const trace = "   at System.String.Format()";
      const result = formatStackTrace(trace, english);
      expect(result).toHaveLength(1);
      const f = frame(result[0]);
      expect(f.type).toBe("System.String");
      expect(f.method).toBe("Format");
      expect(f.params).toEqual([]);
      expect(f.file).toBeUndefined();
      expect(f.lineNumber).toBeUndefined();
      expect(f.spaces).toBe("   ");
    });

    test("parses a frame with one parameter", () => {
      const trace = "   at System.Int32.Parse(String s)";
      const result = formatStackTrace(trace, english);
      const f = frame(result[0]);
      expect(f.type).toBe("System.Int32");
      expect(f.method).toBe("Parse");
      expect(f.params).toEqual([{ type: "String", name: "s" }]);
    });

    test("parses a frame with multiple parameters", () => {
      const trace = "   at System.Number.ParseInt32(ReadOnlySpan`1 value, NumberStyles styles, NumberFormatInfo info)";
      const result = formatStackTrace(trace, english);
      const f = frame(result[0]);
      expect(f.type).toBe("System.Number");
      expect(f.method).toBe("ParseInt32");
      expect(f.params).toEqual([
        { type: "ReadOnlySpan`1", name: "value" },
        { type: "NumberStyles", name: "styles" },
        { type: "NumberFormatInfo", name: "info" },
      ]);
    });

    test("parses a frame with file path and line number", () => {
      const trace = "   at MyNamespace.IntParser.Execute(String s) in C:\\apps\\MyNamespace\\IntParser.cs:line 13";
      const result = formatStackTrace(trace, english);
      const f = frame(result[0]);
      expect(f.type).toBe("MyNamespace.IntParser");
      expect(f.method).toBe("Execute");
      expect(f.file).toBe("C:\\apps\\MyNamespace\\IntParser.cs");
      expect(f.lineNumber).toBe("13");
    });

    test("passes non-frame lines through as strings", () => {
      const trace = [
        "System.ApplicationException: Runtime error",
        " ---> System.FormatException: The input string was not formatted correctly.",
        "   at System.Number.ThrowOverflowOrFormatException(ParsingStatus status, TypeCode type)",
        "   --- End of stack trace from previous location ---",
      ].join("\n");

      const result = formatStackTrace(trace, english);
      expect(typeof result[0]).toBe("string");
      expect(typeof result[1]).toBe("string");
      expect(typeof result[2]).toBe("object");
      expect(typeof result[3]).toBe("string");
    });

    test("parses a deeply namespaced type and method", () => {
      const trace = "   at MyApp.Controllers.AccountController.ChangeEmail(String secret)";
      const result = formatStackTrace(trace, english);
      const f = frame(result[0]);
      expect(f.type).toBe("MyApp.Controllers.AccountController");
      expect(f.method).toBe("ChangeEmail");
      expect(f.params).toEqual([{ type: "String", name: "secret" }]);
    });

    test("preserves indentation whitespace in spaces field", () => {
      const trace = "      at System.String.Format()";
      const result = formatStackTrace(trace, english);
      const f = frame(result[0]);
      expect(f.spaces).toBe("      ");
    });

    test("parses full real-world English trace with mixed frame and non-frame lines", () => {
      const trace = [
        "System.ApplicationException: Runtime error",
        " ---> System.FormatException: The input string was not formatted correctly.",
        "   at System.Number.ThrowOverflowOrFormatException(ParsingStatus status, TypeCode type)",
        "   at System.Number.ParseInt32(ReadOnlySpan`1 value, NumberStyles styles, NumberFormatInfo info)",
        "   at System.Int32.Parse(String s)",
        "   at MyNamespace.IntParser.Execute(String s) in C:\\apps\\MyNamespace\\IntParser.cs:line 13",
        "   --- End of stack trace from previous location where exception was thrown ---",
        "   at MyNamespace.Program.Main(String[] args) in C:\\apps\\MyNamespace\\Program.cs:line 13",
      ].join("\n");

      const result = formatStackTrace(trace, english);
      expect(typeof result[0]).toBe("string");
      expect(typeof result[1]).toBe("string");
      expect(typeof result[2]).toBe("object");
      expect(typeof result[3]).toBe("object");
      expect(typeof result[4]).toBe("object");
      expect(typeof result[5]).toBe("object");
      expect(typeof result[6]).toBe("string");
      expect(typeof result[7]).toBe("object");

      const executeFrame = frame(result[5]);
      expect(executeFrame.file).toBe("C:\\apps\\MyNamespace\\IntParser.cs");
      expect(executeFrame.lineNumber).toBe("13");
    });

    test("preserves ServiceBus exception message containing URLs and parenthesized content", () => {
      const trace = [
        "Azure.Messaging.ServiceBus.ServiceBusException: The lock supplied is invalid. Either the lock expired, or the message has already been removed from the queue, or was received by a different receiver instance. (MessageLockLost). For troubleshooting information, see https://aka.ms/azsdk/net/servicebus/exceptions/troubleshoot.",
        "   at Azure.Messaging.ServiceBus.Amqp.AmqpReceiver.ThrowLockLostException()",
        "   at Azure.Messaging.ServiceBus.Amqp.AmqpReceiver.DisposeMessageAsync(Guid lockToken, Outcome outcome, TimeSpan timeout)",
      ].join("\n");

      const result = formatStackTrace(trace, english);
      expect(typeof result[0]).toBe("string");
      expect(result[0] as string).toContain("ServiceBusException");
      expect(result[0] as string).toContain("MessageLockLost");

      const f = frame(result[1]);
      expect(f.type).toBe("Azure.Messaging.ServiceBus.Amqp.AmqpReceiver");
      expect(f.method).toBe("ThrowLockLostException");
    });
  });

  describe("Danish stack frames", () => {
    test("parses a Danish frame with file and line", () => {
      const trace = "   ved MyNamespace.IntParser.Execute(String s) i C:\\apps\\MyNamespace\\IntParser.cs:linje 13";
      const result = formatStackTrace(trace, danish);
      const f = frame(result[0]);
      expect(f.type).toBe("MyNamespace.IntParser");
      expect(f.method).toBe("Execute");
      expect(f.file).toBe("C:\\apps\\MyNamespace\\IntParser.cs");
      expect(f.lineNumber).toBe("13");
    });

    test("passes non-frame Danish lines through as strings", () => {
      const trace = "System.ApplicationException: Kørselsfejl";
      const result = formatStackTrace(trace, danish);
      expect(typeof result[0]).toBe("string");
    });
  });

  describe("German stack frames", () => {
    test("parses a German frame with file and line", () => {
      const trace = "   bei MyNamespace.IntParser.Execute(String s) in C:\\apps\\MyNamespace\\IntParser.cs:Zeile 13";
      const result = formatStackTrace(trace, german);
      const f = frame(result[0]);
      expect(f.type).toBe("MyNamespace.IntParser");
      expect(f.method).toBe("Execute");
      expect(f.file).toBe("C:\\apps\\MyNamespace\\IntParser.cs");
      expect(f.lineNumber).toBe("13");
    });
  });

  describe("Spanish stack frames", () => {
    test("parses a Spanish frame type and method", () => {
      const trace = "   en WinForm_gRPC.Form1.btnLogin_Click(Object sender, EventArgs e) en C:\\Users\\2590\\source\\repos\\WinForm_gRPC\\WinForm_gRPC\\Form1.cs:línea 135";
      const result = formatStackTrace(trace, spanish);
      const f = frame(result[0]);
      expect(f.type).toBe("WinForm_gRPC.Form1");
      expect(f.method).toBe("btnLogin_Click");
      expect(f.lineNumber).toBe("135");
    });
  });

  describe("Russian stack frames", () => {
    test("parses a Russian frame type and method", () => {
      const trace = "   в MyNamespace.IntParser.Execute(String s) в C:\\apps\\MyNamespace\\IntParser.cs:строка 13";
      const result = formatStackTrace(trace, russian);
      const f = frame(result[0]);
      expect(f.type).toBe("MyNamespace.IntParser");
      expect(f.method).toBe("Execute");
      expect(f.lineNumber).toBe("13");
    });
  });

  describe("Chinese stack frames", () => {
    test("parses a Chinese frame without file info", () => {
      const trace = "   在 System.Runtime.ExceptionServices.ExceptionDispatchInfo.Throw()";
      const result = formatStackTrace(trace, chinese);
      const f = frame(result[0]);
      expect(f.type).toBe("System.Runtime.ExceptionServices.ExceptionDispatchInfo");
      expect(f.method).toBe("Throw");
    });
  });

  describe("edge cases", () => {
    test("returns single text element for a plain string with no stack frames", () => {
      const result = formatStackTrace("This is not a stack trace", english);
      expect(result).toHaveLength(1);
      expect(typeof result[0]).toBe("string");
      expect(result[0]).toBe("This is not a stack trace");
    });

    test("empty string produces one empty string element", () => {
      const result = formatStackTrace("", english);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe("");
    });

    test("frame line without leading whitespace is not parsed as a frame", () => {
      // The fix: requires at least one whitespace before 'at'
      const trace = "at System.String.Format(String format)";
      const result = formatStackTrace(trace, english);
      expect(typeof result[0]).toBe("string");
    });
  });
});
