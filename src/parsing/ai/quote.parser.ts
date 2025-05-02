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
  score: number

  cleanQuote?: string
}

/**
 * Cleaned quote with score from the AI model
 *
 * Sometimes, the quote text contains more variants (in different languages)
 * of the same quote or other text that do not correspond with the quote.
 * This is resolved by a language model, which cleans the quote and returns
 * just a single variant of the pronounced text.
 *
 * @property score The score of the quote (from 0 to 100)
 * @property cleanQuote The cleaned quote (if the score is not 0)
 */
export interface ParsedQuote {
  score: number

  cleanQuote?: string
}

/**
 * Class for parsing (mainly scoring) quotes using Google AI
 */
@Service()
export class QuoteParser {
  private readonly MODEL_NAME = "gemini-2.5-flash-preview-04-17"

  private readonly googleAi: GoogleGenAI

  /**
   * Constructor for the QuoteParser
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
   * Scores the quote using AI
   *
   * The score is an integer from 0 to 100, where 0 means the quote is not a quote
   * or is not valuable for society, and 100 means the quote is correct and valuable.
   *
   * When it's above 50, it means the quote should be interesting enough.
   *
   * @param author The author of the quote
   * @param quote The quote to be scored
   * @returns The score of the quote
   */
  public async parseQuote(author: string, quote: string): Promise<ParsedQuote> {
    const config = {
      temperature: 0,
      topP: 1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        required: ["score"],
        properties: {
          score: {
            type: Type.INTEGER,
          },
          cleanQuote: {
            type: Type.STRING,
          },
        },
      },
      systemInstruction: [
        {
          text: `You are an international expert focused on quotes. You will get quotes in different languages and aim to score their correctness and contribution to society using a single integer from 0 to 100. You can measure the contribution value according to the quote's popularity (or its variants in other languages), penalizing very long quotes, as people often skip reading for their complexity.

Construct output as a JSON object with these two properties:
- score—integer, which is set to the quote score you gave to the quote.
- cleanQuote—string, where you put the quote cleaned of other variants of the quote (in different languages) and other text not corresponding to the quote, if the score isn't zero.

Here is an example of a standard input:
<input>
Oscar Wilde: "Be yourself; everyone else is already taken."
</input>
<output>
{"score":95,"cleanQuote":"Be yourself; everyone else is already taken."}
</output>

Sometimes, you get a text that is structured as a quote (Author name: "Some text here"), but the text in quotes isn't a quote of some person but just some random (e.g., descriptive) text. This means the input is wrong (the text was wrongly classified as a quote). In this case, return 0 as an output. An example could look like this:
<input>
Dante Alighieri: "Libri iii, Caput XIII, (XV.) emendati Johann Heinrich F. Karl Witte (1874) p. 25. Translation as quoted by Hannah Arendt, The Human Condition (1958), p. 175."
</input>
<output>
{"score":0}
</output>

When the quote contains other language variants or something that does not correspond with the quote, you need to clean the quote. An example could look like this:
<input>
Lucius Annaeus Seneca: "Svolného osud vede, zpurného vleče. (Volentem fata ducunt, nolentem trahunt.)"
</input>
<output>
{"score":92,"cleanQuote":"Svolného osud vede, zpurného vleče."}
</output>`,
        },
      ],
    }

    const response = await this.googleAi.models.generateContent({
      model: this.MODEL_NAME,
      config: config,
      contents: `${author}: "${quote}"`,
    })

    if (response.text === undefined) {
      throw new Error(
        `No text response arrived from language model. Details: ${JSON.stringify(response)}`,
      )
    }

    const parsedResponse = JSON.parse(response.text) as AiResponse

    return {
      score: parsedResponse.score,
      cleanQuote: parsedResponse.cleanQuote,
    }
  }
}
