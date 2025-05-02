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
   * Checks if the wiki page title starts with the prefix of forbidden pages
   *
   * Prefixes are specific for each language, so a parser for each language needs to
   * provide a list for its own language.
   *
   * @param pageTitle Page title of the wiki page to check
   * @returns Is the page title corresponding to a forbidden page?
   */
  public abstract isForbiddenPageName(pageTitle: string): boolean

  /**
   * Parses the content of a wiki page and returns a list of obtained quotes
   *
   * @param pageUrl URL of the wiki page (for source attribution)
   * @param pageContent Content of the wiki page (in original mediawiki format)
   * @param author Author associated with the wiki page
   * @param language Language of the wiki page
   *
   * @returns List of quotes
   */
  public abstract parse(
    pageUrl: string,
    pageContent: string,
    author: Author,
    language: Language,
  ): Promise<Quote[]>
}
