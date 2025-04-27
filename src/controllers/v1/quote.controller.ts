/**
 * @file quotes.ts
 * @description Route definitions for endpoints under /quotes
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Get, JsonController, QueryParam } from "routing-controllers"
import { Quote } from "../../models/quote.model"
import { Service } from "typedi"

@JsonController("/quotes")
@Service()
export class QuoteController {
  /**
   * @method getAllQuotes
   * @description Lists all quotes in the selected language
   * @param {string} langAbbr Language abbreviation of the selected language
   * @returns {Quote[]} List of quotes
   */
  @Get("/:langAbbr")
  public getAllQuotes(
    @QueryParam("langAbbr", { required: true, type: String }) langAbbr: string,
  ): Quote[] {
    console.log(`Fetching all quotes in language: ${langAbbr}...`)
    return []
  }

  /**
   * @method randomQuote
   * @description List random quote in the selected language
   * @param {string} langAbbr Language abbreviation of the selected language
   * @returns {Quote} Random quote
   */
  @Get("/:langAbbr/random")
  public randomQuote(
    @QueryParam("langAbbr", { required: true, type: String }) langAbbr: string,
  ): Quote {
    console.log(`Fetching random quote in language: ${langAbbr}...`)
    return {} as Quote
  }

  /**
   * @method getAllQuotesByAuthor
   * @description Lists all quotes in the selected language authored by the selected author
   * @param {string} langAbbr Language abbreviation of the selected language
   * @param {number} authorId Identifier of the selected author
   * @returns {Quote[]} List of quotes
   */
  @Get("/:langAbbr/:authorId")
  public getAllQuotesByAuthor(
    @QueryParam("langAbbr", { required: true, type: String }) langAbbr: string,
    @QueryParam("authorId", { required: true, type: Number }) authorId: number,
  ): Quote[] {
    console.log(
      `Fetching all quotes in language: ${langAbbr} authored by: ${String(authorId)}...`,
    )
    return []
  }

  /**
   * @method getRandomQuoteByAuthor
   * @description Return a random quote in the selected language authored by the selected author
   * @param {string} langAbbr Language abbreviation of the selected language
   * @param {number} authorId Identifier of the selected author
   * @returns {Quote} Random quote
   */
  public getRandomQuoteByAuthor(
    @QueryParam("langAbbr", { required: true, type: String }) langAbbr: string,
    @QueryParam("authorId", { required: true, type: Number }) authorId: number,
  ): Quote {
    console.log(
      `Fetching random quote in language: ${langAbbr} authored by: ${String(authorId)}...`,
    )
    return {} as Quote
  }
}
