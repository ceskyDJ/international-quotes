/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { GoogleGenAI, Type } from "@google/genai"
import { Service } from "typedi"

import { ConfigProvider } from "../../providers"

/**
 * Interface for typing the response from the AI model
 */
interface AiResponse {
  isHuman: boolean
  englishName?: string
}

/**
 * Class for parsing (mainly normalizing) author names using AI
 */
@Service()
export class AuthorNameParser {
  private readonly MODEL_NAME = "gemini-2.5-flash-preview-04-17"

  private readonly googleAi: GoogleGenAI

  /**
   * Constructor for the AuthorNameParser
   *
   * @param configProvider Config provider (dependency)
   */
  public constructor(configProvider: ConfigProvider) {
    const aiApiConfig = configProvider.provideAiApiConfig()

    this.googleAi = new GoogleGenAI({
      apiKey: aiApiConfig.googleKey,
    })
  }

  /**
   * Normalizes the author name using AI
   *
   * Normalized name is an English equivalent of the name (or the same name
   * if it was English or has no equivalent). It's mainly for exotic languages,
   * where the same is composed of different letters (e.g., Cyrillic).
   *
   * This method also checks if the provided name is a human name. If not,
   * it returns null.
   *
   * @param authorName The author name to be normalized
   * @returns The normalized author name or null if not a human name
   */
  public async normalizeAuthorName(authorName: string): Promise<string | null> {
    const config = {
      temperature: 0,
      topP: 1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["isHuman"],
        properties: {
          isHuman: {
            type: Type.BOOLEAN,
          },
          englishName: {
            type: Type.STRING,
          },
        },
      },
      systemInstruction: [
        {
          text: `You are a professional international linguist. You aim to decide whether the provided text sequence in different languages is a human name or something else (e.g., an object name or a verb). You have to form your output as a valid JSON object with two properties:
- isHuman—boolean, which contains the result of your decision, if the text sequence consists of a real human name.
- englishName—string, which is set to an English equivalent of the name (or the same name, if it was English), if isHuman is set to true.

This is an example of general input and output:
<input>
Winston Churchill
</input>
<output>
{"isHuman":true,"englishName":"Winston Churchill"}
</output>

When the input contains a valid name, but it's not in English form, it looks like this:
<input>
Artur Şopenhauer
</input>
<output>
{"isHuman":true,"englishName":"Arthur Schopenhauer"}
</output>

When the input doesn't contain a human name, the input and output could look like this:
<input>
Animal farm
</input>
<output>
{"human-name":false}
</output>`,
        },
      ],
    }

    const response = await this.googleAi.models.generateContent({
      model: this.MODEL_NAME,
      config: config,
      contents: authorName,
    })

    if (response.text === undefined) {
      throw new Error(
        `No text response arrived from language model. Details: ${JSON.stringify(response)}`,
      )
    }

    const parsedResponse = JSON.parse(response.text) as AiResponse

    return parsedResponse.isHuman ? (parsedResponse.englishName ?? null) : null
  }
}
