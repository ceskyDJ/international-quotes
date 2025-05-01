/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Author, Quote, Language } from "../../entities"

/**
 * Abstract content parser for grouping all content parsers
 */
export abstract class ContentParser {
  /**
   * Parses the content of a wiki page and returns a list of obtained quotes
   *
   * @param pageContent Content of the wiki page (in original mediawiki format)
   * @param author Author associated with the wiki page
   * @param language Language of the wiki page
   *
   * @returns List of quotes
   */
  public abstract parse(
    pageContent: string,
    author: Author,
    language: Language,
  ): Promise<Quote[]>
}
