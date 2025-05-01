/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Service } from "typedi"

import { Author, Language, Quote } from "../../entities"

import { QuoteParser } from "../ai"
import { ContentParser } from "./content.parser"

/**
 * Parser for Czech wikiquote pages
 */
@Service()
export class CzechParser extends ContentParser {
  /**
   * Constructor for CzechParser
   *
   * @param quoteParser Quote parser (dependency)
   */
  public constructor(private readonly quoteParser: QuoteParser) {
    super()
  }

  /**
   * Parses the content of a wiki page and returns a list of obtained quotes
   *
   * @param pageContent Content of the wiki page (in original mediawiki format)
   * @param author Author associated with the wiki page
   * @param language Language of the wiki page
   *
   * @returns List of quotes
   */
  public async parse(
    pageContent: string,
    author: Author,
    language: Language,
  ): Promise<Quote[]> {
    const quotes: Quote[] = []

    // TODO: Implement the parsing logic for Czech wikiquote pages

    return quotes
  }
}
