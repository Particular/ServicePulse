using System;
using System.Text;

public static class WordGen
{
    public static string LoremIpsum(this string wordblob, int minWords, int maxWords, int minSentences, int maxSentences, int numParagraphs)
    {
        var words = wordblob.Split(' ');

        var rand = new Random();
        var numSentences = rand.Next(maxSentences - minSentences) + minSentences + 1;
        var numWords = rand.Next(maxWords - minWords) + minWords + 1;

        var result = new StringBuilder();

        for (var p = 0; p < numParagraphs; p++)
        {
            for (var s = 0; s < numSentences; s++)
            {
                for (var w = 0; w < numWords; w++)
                {
                    if (w > 0)
                    { result.Append(" "); }
                    result.Append(words[rand.Next(words.Length)]);
                }
            }
        }

        return result.ToString();
    }


}