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
 * @property isHuman Language model's decision if the text sequence is a human name
 * @property englishName The English equivalent of the name (if isHuman is false, this should be empty string)
 */
interface AiResponse {
  isHuman: boolean

  englishName: string
}

/**
 * Class for parsing (mainly normalizing) author names using AI
 */
@Service()
export class AuthorNameParser {
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
  private readonly MAX_TOKENS = 32
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
   * Constructor for the AuthorNameParser
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
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: [
          {
            type: "text",
            text: 'You are a professional international linguist. You aim to decide whether the provided text sequence in different languages is a human name or something else (e.g., an object name or a verb). You have to form your output as a valid JSON object with two properties:\n- isHuman—boolean, which contains the result of your decision, if the text sequence consists of a real human name.\n- englishName—string, which is set to an English equivalent of the name (or the same name, if it was English), if isHuman is set to true.\n\nThis is an example of general input and output:\n<input>\nWinston Churchill\n</input>\n<output>\n{"isHuman":true,"englishName":"Winston Churchill"}\n</output>\n\nWhen the input contains a valid name, but it\'s not in English form, it looks like this:\n<input>\nArtur Şopenhauer\n</input>\n<output>\n{"isHuman":true,"englishName":"Arthur Schopenhauer"}\n</output>\n\nWhen the input doesn\'t contain a human name, the input and output could look like this:\n<input>\nAnimal farm\n</input>\n<output>\n{"isHuman":false,"englishName":""}\n</output>',
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: authorName,
          },
        ],
      },
    ]

    const responseFormat = {
      type: "json_schema",
      json_schema: {
        name: "name_normalizing_schema",
        strict: true,
        schema: {
          type: "object",
          properties: {
            isHuman: {
              type: "boolean",
              description:
                "Indicates if the text sequence is a real human name.",
            },
            englishName: {
              type: "string",
              description:
                "The English equivalent of the name, or the same name if it is English.",
            },
          },
          required: ["isHuman", "englishName"],
          additionalProperties: false,
        },
      },
    } as ResponseFormatJSONSchema

    // Try to get answer from the AI model
    // Sometimes, there could be some error on the server side, so multiple attempts are used
    let response
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

        // Check if the response content is valid
        if (response.choices[0].message.content === null) {
          // Response without text is similar to no response at all, so we
          // simulate communication error (using locally caught error) to retry
          // noinspection ExceptionCaughtLocallyJS
          throw new Error()
        }

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
    const responseText = response.choices[0].message.content
    if (responseText === null) {
      throw new Error(
        `No text response arrived from language model. Details: ${JSON.stringify(response)}`,
      )
    }

    const parsedResponse = JSON.parse(responseText) as AiResponse

    return parsedResponse.isHuman ? parsedResponse.englishName : null
  }
}
