export interface Language {
  name: string;
  at: string;
  in: string;
  line: string;
}

export type StackTraceText = string;

export interface StackTraceFrame {
  params: Array<{ name: string; type: string }>;
  type: string;
  lineNumber?: string;
  file?: string;
  method: string;
  spaces: string;
}

export type StackTraceElement = StackTraceText | StackTraceFrame;

export const languages: Language[] = [
  { name: "english", at: "at", in: "in", line: "line" },
  { name: "danish", at: "ved", in: "i", line: "linje" },
  { name: "german", at: "bei", in: "in", line: "Zeile" },
  { name: "spanish", at: "en", in: "en", line: "línea" },
  { name: "russian", at: "в", in: "в", line: "строка" },
  { name: "chinese", at: "在", in: "位置", line: "行号" },
];

export const detectLanguagesInOrder = (text: string): Language[] => {
  const languageRegexes = {
    english: /\s+at .*?\)/g,
    danish: /\s+ved .*?\)/g,
    german: /\s+bei .*?\)/g,
    spanish: /\s+en .*?\)/g,
    russian: /\s+в .*?\)/g,
    chinese: /\s+在 .*?\)/g,
  };

  const detectedLanguages: Language[] = [];
  for (const lang in languageRegexes) {
    if (languageRegexes[lang as keyof typeof languageRegexes].test(text)) {
      const foundLang = languages.find((l) => l.name === lang);
      if (foundLang) {
        detectedLanguages.push(foundLang);
      }
    }
  }

  return detectedLanguages;
};

export const formatStackTrace = (stackTrace: string, selectedLang: Language): StackTraceElement[] => {
  const lines = stackTrace.split("\n");
  const fileAndLineNumberRegEx = new RegExp(`${selectedLang.in} (.+):${selectedLang.line} (\\d+)`);
  const atRegex = new RegExp(`^(\\s+)(${selectedLang.at}) (.+?)\\((.*?)\\)`);

  return lines.map((line) => {
    const match = line.match(atRegex);
    if (match) {
      const [, spaces, , methodWithType, paramsWithFile] = match;

      const [type, method] = (() => {
        const parts = methodWithType.split(".");
        const method = parts.pop() ?? "";
        const type = parts.join(".");
        return [type, method];
      })();

      const params = paramsWithFile
        ? paramsWithFile.split(", ").map((param) => {
            const [paramType, paramName] = param.split(" ");
            return { name: paramName, type: paramType };
          })
        : [];

      const matchFile = line.match(fileAndLineNumberRegEx);
      let file, lineNumber;
      if (matchFile) {
        [, file, lineNumber] = matchFile;
      }

      return { method, type, params, file, lineNumber, spaces } satisfies StackTraceFrame;
    } else {
      return line;
    }
  });
};
