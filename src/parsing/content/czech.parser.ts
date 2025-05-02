/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Service } from "typedi"

import { Author, Language, Quote } from "../../entities"

import { QuoteParser } from "../ai"
import { ContentParser } from "./content.parser"

/**
 * Interface for typing a list of sentences from wtf_wikipedia
 *
 * This interface is copied from the wtf_wikipedia module, as there are some
 * typing errors in Section's methods, and we can't simply import classes like
 * List from wtf_wikipedia due to ESM vs. CommonJS modules incompatibility.
 * Some methods using other types (as Link) are not included, as we don't need
 * them, and their presence would require adding more interfaces.
 *
 * @see https://www.npmjs.com/package/wtf_wikipedia
 */
interface List {
  json(options?: object): object
  lines(): object[]
  text(): string
  wikitext(): string
}

/**
 * Interface for typing a sentence from wtf_wikipedia
 *
 * This interface is copied from the wtf_wikipedia module, as there are some
 * typing errors in Section's methods, and we can't simply import classes like
 * List from wtf_wikipedia due to ESM vs. CommonJS modules incompatibility.
 * Some methods using other types (as Link) are not included, as we don't need
 * them, and their presence would require adding more interfaces.
 *
 * @see https://www.npmjs.com/package/wtf_wikipedia
 */
interface Sentence {
  bold(clue?: number): string
  bolds(): string[]
  isEmpty(): boolean
  italic(clue?: number): string
  italics(): string[]
  json(options?: object): object
  plaintext: (str?: string) => string
  text(str?: string): string
  wikitext(): string
}

/**
 * Parser for Czech wikiquote pages
 */
@Service()
export class CzechParser extends ContentParser {
  private readonly forbiddenPagePrefixes: string[] = [
    "MediaWiki:",
    "Wikicitáty:",
    "Uživatel:",
    "Kategorie:",
    "Diskuse:",
    "Diskuse ke kategorii:",
    "Diskuse s uživatelem:",
    "Nápověda:",
    "Speciální:",
    "Dílo:",
  ]
  private readonly forbiddenPagePrefixesRegex: RegExp

  /**
   * Constructor for CzechParser
   *
   * @param quoteParser Quote parser (dependency)
   */
  public constructor(private readonly quoteParser: QuoteParser) {
    super()

    // Create a regex from the list of forbidden page prefixes for faster checking
    this.forbiddenPagePrefixesRegex = new RegExp(
      "^(" + this.forbiddenPagePrefixes.join("|") + ").*",
    )
  }

  /**
   * Checks if the wiki page title starts with the prefix of forbidden pages
   *
   * Prefixes are specific for each language, so a parser for each language needs to
   * provide a list for its own language.
   *
   * @param pageTitle Page title of the wiki page to check
   * @returns Is the page title corresponding to a forbidden page?
   */
  public isForbiddenPageName(pageTitle: string): boolean {
    return this.forbiddenPagePrefixesRegex.test(pageTitle)
  }

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
  public async parse(
    pageUrl: string,
    pageContent: string,
    author: Author,
    language: Language,
  ): Promise<Quote[]> {
    const quotes: Quote[] = []

    // Import the wtf_wikipedia module dynamically (as it uses ESM and this
    // project is running on CommonJS modules and can't be easily converted)
    const wtfModule = await import("wtf_wikipedia")
    const wtf = wtfModule.default

    // Load i18n plugin for better parsing of non-English pages
    // eslint-disable-next-line @typescript-eslint/no-require-imports,@typescript-eslint/no-unsafe-argument
    wtf.extend(require("wtf-plugin-i18n"))

    // Parse the page content using wtf_wikipedia
    const parsedPageContent = wtf(pageContent)

    // Find the section with quotes
    const quoteSectionIndex = parsedPageContent.section("Výroky")?.index()

    // If the section with quotes is missing or named differently,
    // end with processing, because we don't know how to parse it
    if (quoteSectionIndex === null || quoteSectionIndex === undefined) {
      return []
    }

    // Extract all lists from the top-level section with quotes
    let lists = parsedPageContent.section(quoteSectionIndex)?.lists() as List[]

    // Extract all lists from the subsections
    let i = quoteSectionIndex + 1
    let indentation = parsedPageContent.section(i)?.indentation()
    while (indentation !== undefined && indentation > 0) {
      lists = lists.concat(parsedPageContent.section(i)?.lists() as List[])

      i++
      indentation = parsedPageContent.section(i)?.indentation()
    }

    // Parse all lists and extract quotes
    for (const list of lists) {
      const listItems = list.lines() as Sentence[]

      // Skip empty lists
      if (listItems.length === 0) {
        continue
      }

      // Parse the list items and extract candidate quotes
      for (const sentence of listItems) {
        // Skip empty sentences
        if (sentence.isEmpty()) {
          continue
        }

        // Convert the sentence to plain text, which is a quote candidate
        const quoteCandidateText = sentence
          .text()
          // If there are some descriptive texts on new lines after the quote,
          // there is "<br" (without quotes) in the text
          .replace(/\s*<br\s*/, "")

        // Evaluate the quote candidate using the quote parser
        const parsedQuote = await this.quoteParser.parseQuote(
          author.englishFullName,
          quoteCandidateText,
        )

        // Skip quote candidates that are not likely to be quotes
        // or not good enough
        if (parsedQuote.score <= 50 || parsedQuote.cleanQuote?.trim() === "") {
          continue
        }

        // Skip too long quotes
        if ((parsedQuote.cleanQuote?.length ?? 0) > 500) {
          continue
        }

        const quote = new Quote(
          // cleanQuote should always be present (it's missing only for quotes
          // with score 0), but strict typing has to be satisfied
          parsedQuote.cleanQuote ?? quoteCandidateText,
          pageUrl,
          parsedQuote.score,
          author,
          language,
        )

        // Add the quote to the list of quotes
        quotes.push(quote)
      }
    }

    return quotes
  }
}
