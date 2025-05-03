/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Service } from "typedi"
import OpenAI from "openai"
import { ChatCompletionMessageParam } from "openai/resources/chat/completions/completions"
import { ResponseFormatJSONSchema } from "openai/resources"

import { ConfigProvider } from "../../providers"

/**
 * Interface for typing the response from the AI model
 *
 * @property score Score given by the language model
 * @property cleanQuote Cleaned quote (if score is 0, this should be empty string)
 */
interface AiResponse {
  score: number

  cleanQuote: string
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
 * @property cleanQuote The cleaned quote (if the score is not 0, otherwise implementation defined value)
 */
export interface ParsedQuote {
  score: number

  cleanQuote: string
}

/**
 * Class for parsing (mainly scoring) quotes using Google AI
 */
@Service()
export class QuoteParser {
  /**
   * API name of the language model used for parsing quotes
   */
  private readonly MODEL_NAME = "gpt-4.1-mini"
  /**
   * Maximum number of output (and possibly reasoning) tokens for the language model
   *
   * This is the maximum number of tokens that can be used in a single request.
   * The model will not process requests with more tokens than this value.
   *
   * It should be large enough to fit a quote with reasonable length
   */
  private readonly MAX_TOKENS = 2048
  /**
   * Maximum number of retries for the request to AI API
   *
   * This is the maximum number of times the request will be retried in case of
   * an error (e.g., server error, timeout, etc.). The delay between retries
   * is increasing (quadratic) to avoid overwhelming the server and getting
   * blocked by rate limiting.
   */
  private readonly MAX_RETRIES = 3

  /**
   * Abstraction of OpenAI API that constructs API calls under the hood
   */
  private readonly openai: OpenAI

  /**
   * Constructor for the QuoteParser
   *
   * @param configProvider Config provider (dependency)
   */
  public constructor(configProvider: ConfigProvider) {
    const aiApiConfig = configProvider.provideAiApiConfig()

    this.openai = new OpenAI({
      apiKey: aiApiConfig.openaiKey,
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
    // Skip too long quotes (would fail processing by the language model anyway)
    if (quote.length > 1_000) {
      return { score: 0, cleanQuote: "" } as AiResponse
    }

    const messages = [
      {
        role: "system",
        content: [
          {
            text: 'You are an international expert focused on quotes. You will get quotes in different languages and aim to score their correctness and contribution to society using a single integer from 0 to 100. You can measure the contribution value according to the quote\'s popularity (or its variants in other languages), penalizing very long quotes, as people often skip reading for their complexity.\n\nConstruct output as a JSON object with these two properties:\n- score—integer, which is set to the quote score you gave to the quote.\n- cleanQuote—string, where you put the quote cleaned of other variants of the quote (in different languages) and other text not corresponding to the quote, if the score isn\'t zero.\n\nHere is an example of a standard input:\n<input>\nOscar Wilde: "Be yourself; everyone else is already taken."\n</input>\n<output>\n{"score":95,"cleanQuote":"Be yourself; everyone else is already taken."}\n</output>\n\nSometimes, you get a text that is structured as a quote (Author name: "Some text here"), but the text in quotes isn\'t a quote of some person but just some random (e.g., descriptive) text. This means the input is wrong (the text was wrongly classified as a quote). In this case, return 0 as an output. An example could look like this:\n<input>\nDante Alighieri: "Libri iii, Caput XIII, (XV.) emendati Johann Heinrich F. Karl Witte (1874) p. 25. Translation as quoted by Hannah Arendt, The Human Condition (1958), p. 175."\n</input>\n<output>\n{"score":0}\n</output>\n\nWhen the quote contains other language variants or something that does not correspond with the quote, you need to clean the quote. An example could look like this:\n<input>\nLucius Annaeus Seneca: "Svolného osud vede, zpurného vleče. (Volentem fata ducunt, nolentem trahunt.)"\n</input>\n<output>\n{"score":92,"cleanQuote":"Svolného osud vede, zpurného vleče."}\n</output>',
            type: "text",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${author}: "${quote}"`,
          },
        ],
      },
    ] as ChatCompletionMessageParam[]

    const responseFormat = {
      type: "json_schema",
      json_schema: {
        name: "quote_evaluation",
        schema: {
          type: "object",
          required: ["score", "cleanQuote"],
          properties: {
            score: {
              type: "integer",
              description: "The score given to the quote.",
            },
            cleanQuote: {
              type: "string",
              description:
                "The cleaned version of the quote, free from variants and irrelevant text.",
            },
          },
          additionalProperties: false,
        },
        strict: true,
      },
    } as ResponseFormatJSONSchema

    // Try to get answer from the AI model
    // Sometimes, there could be some error on the server side, so multiple attempts are used
    let response
    let parsedResponse
    for (let i = 0; i < this.MAX_RETRIES; i++) {
      try {
        response = await this.openai.chat.completions.create({
          model: this.MODEL_NAME,
          messages: messages,
          response_format: responseFormat,
          max_completion_tokens: this.MAX_TOKENS,
          temperature: 0, // No creativity (almost)
          top_p: 1, // No limit for tokens available for usage
          frequency_penalty: 0, // We're not generating creative text, so no penalty
          presence_penalty: 0, // We're not generating creative text, so no penalty
          store: false, // Don't store the chat logs
        })

        // Very long quotes aren't processed successfully by the language model,
        // but we don't want them at all, so we just ignore them by scoring to 0
        if (response.choices[0].finish_reason === "length") {
          parsedResponse = { score: 0, cleanQuote: "" } as AiResponse
          break
        }

        // Check if the response content is valid
        const responseText = response.choices[0].message.content
        if (responseText === null) {
          // Response without text is similar to no response at all, so we
          // simulate communication error (using locally caught error) to retry
          // noinspection ExceptionCaughtLocallyJS
          throw new Error()
        }

        // Output is a JSON object, so need to be parsed and typed
        parsedResponse = JSON.parse(responseText) as AiResponse

        break
      } catch (error) {
        console.error(error)

        // Ignore errors and try again after a short delay
        // d = a^2 seconds (d = delay, a = attempt number indexed from 1)
        // Source: https://stackoverflow.com/a/49139664
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1) ** 2))
      }
    }

    // Check if we got a response
    if (response === undefined) {
      throw new Error(
        `No response arrived from language model after ${String(this.MAX_RETRIES)} attempts.`,
      )
    }

    // Check if a language model returned some text
    if (parsedResponse === undefined) {
      throw new Error(
        `No text response arrived from language model. Details: ${JSON.stringify(response)}`,
      )
    }

    // TODO: Remove this debug log
    console.log(`${String(parsedResponse.score)}: ${parsedResponse.cleanQuote}`)

    return {
      score: parsedResponse.score,
      cleanQuote: parsedResponse.cleanQuote,
    }
  }
}
