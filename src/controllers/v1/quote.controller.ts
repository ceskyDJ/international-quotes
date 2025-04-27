/**
 * @file quotes.ts
 * @description Route definitions for endpoints under /quotes
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Get, JsonController, Params } from "routing-controllers"
import { Quote } from "../../models/quote.model"
import { Service } from "typedi"
import { LangParams } from "./dto/langParams.dto"
import { LangAndAuthorParams } from "./dto/langAndAuthorParams.dto"

@JsonController("/quotes")
@Service()
export class QuoteController {
  /**
   * @method getAllQuotes
   * @description Lists all quotes in the selected language
   * @param {LangParams} params Selected language
   * @returns {Quote[]} List of quotes
   */
  @Get("/:langAbbr")
  public getAllQuotes(@Params() params: LangParams): Quote[] {
    console.log(`Fetching all quotes in language: ${params.langAbbr}...`)
    return []
  }

  /**
   * @method randomQuote
   * @description List random quote in the selected language
   * @param {LangParams} params Selected language
   * @returns {Quote} Random quote
   */
  @Get("/:langAbbr/random")
  public randomQuote(@Params() params: LangParams): Quote {
    console.log(`Fetching random quote in language: ${params.langAbbr}...`)
    return {} as Quote
  }

  /**
   * @method getAllQuotesByAuthor
   * @description Lists all quotes in the selected language authored by the selected author
   * @param {LangAndAuthorParams} params Selected language and author
   * @returns {Quote[]} List of quotes
   */
  @Get("/:langAbbr/:authorId")
  public getAllQuotesByAuthor(@Params() params: LangAndAuthorParams): Quote[] {
    console.log(typeof params.authorId)
    console.log(
      `Fetching all quotes in language: ${params.langAbbr} authored by: ${String(params.authorId)}...`,
    )
    return []
  }

  /**
   * @method getRandomQuoteByAuthor
   * @description Return a random quote in the selected language authored by the selected author
   * @param {LangAndAuthorParams} params Selected language and author
   * @returns {Quote} Random quote
   */
  @Get("/:langAbbr/:authorId/random")
  public getRandomQuoteByAuthor(@Params() params: LangAndAuthorParams): Quote {
    console.log(
      `Fetching random quote in language: ${params.langAbbr} authored by: ${String(params.authorId)}...`,
    )
    return {} as Quote
  }
}
