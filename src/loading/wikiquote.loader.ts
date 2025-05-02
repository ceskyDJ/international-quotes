/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { XMLParser } from "fast-xml-parser"
import { readFileSync } from "node:fs"
import { Service } from "typedi"

import { Author, Language, Quote } from "../entities"
import { AuthorService, LanguageService, QuoteService } from "../services"
import { AuthorNameParser, ContentParser, CzechParser } from "../parsing"

/**
 * Interface for typing a single page from the wiki dump
 *
 * Only relevant parts of the original XML are included!
 *
 * @property title Title of the page
 * @property redirect Present if the page is a redirect (empty string)
 * @property revision Revision of the page (like a snapshot of the page)
 * @property revision.text Text of the page (in original mediawiki format)
 */
interface WikiPage {
  title: string

  redirect?: ""

  revision: {
    text: string
  }
}

/**
 * Interface for typing the whole wiki dump
 *
 * Only relevant parts of the original XML are included!
 *
 * @property mediawiki.siteinfo.dbname Name of the wiki quote instance
 * @property mediawiki.page List of pages in the wiki quote instance
 */
interface WikiDump {
  mediawiki: {
    siteinfo: {
      dbname: string
    }

    page: WikiPage[]
  }
}

/**
 * Parser for wikiquote pages
 *
 * It parses the wiki dump and extracts quotes from it
 */
@Service()
export class WikiquoteLoader {
  private readonly contentParsers: { [key: string]: ContentParser }

  /**
   * Constructor for WikiquoteParser
   *
   * @param languageService Language service (dependency)
   * @param authorService Author service (dependency)
   * @param quoteService Quote service (dependency)
   * @param authorNameParser Author name parser (dependency)
   * @param czechParser Czech parser (dependency)
   */
  public constructor(
    private readonly languageService: LanguageService,
    private readonly authorService: AuthorService,
    private readonly quoteService: QuoteService,
    private readonly authorNameParser: AuthorNameParser,
    czechParser: CzechParser,
  ) {
    this.contentParsers = {
      cs: czechParser,
    }
  }

  /**
   * Loads quotes from the wiki dump file into the database
   *
   * @param path Path to the wiki dump file
   */
  public async loadQuotesFromWikiDump(path: string): Promise<void> {
    console.log(`[INFO] Loading quotes from wiki dump ${path}...`)

    const rawWikiDump = readFileSync(path, "utf-8")

    // Parse the XML data into an object format
    const xmlParser = new XMLParser()
    const parsedWikiDump = xmlParser.parse(rawWikiDump) as WikiDump

    // Load language
    const languageAbbreviation =
      parsedWikiDump.mediawiki.siteinfo.dbname.substring(0, 2)
    const language =
      await this.languageService.fetchByAbbreviation(languageAbbreviation)

    console.log(`[INFO] Detected language: ${language.englishName}`)

    // Parse quotes from pages (usually a page contains quotes of one author)
    let totalQuotes = 0
    for (const page of parsedWikiDump.mediawiki.page) {
      // Skip pages that are just aliases (provides redirects)
      if (page.redirect === "") {
        continue
      }

      // Skip pages that are not relevant for us (has one of the forbidden prefixes)
      const localizedParser = this.contentParsers[languageAbbreviation]
      if (localizedParser.isForbiddenPageName(page.title)) {
        continue
      }

      // Parse quotes and save them to the database
      const quotes = await this.parsePage(page, language)
      await this.quoteService.saveAll(quotes)

      const numberOfQuotesPerAuthor = quotes.length
      if (numberOfQuotesPerAuthor === 0) {
        console.log(`[WARNING] No relevant quotes found for page ${page.title}`)
      } else {
        console.log(
          `[INFO] Loaded ${String(numberOfQuotesPerAuthor)} quotes by ${quotes[0].author.englishFullName}`,
        )
      }

      totalQuotes += numberOfQuotesPerAuthor
    }

    console.log(`[INFO] Successfully processed ${String(totalQuotes)} quotes`)
  }

  /**
   * Parses a single page from the wiki dump
   *
   * @param page Page to parse
   * @param language Language of the page
   * @returns List of quotes from the page
   */
  private async parsePage(
    page: WikiPage,
    language: Language,
  ): Promise<Quote[]> {
    // Get author of quotes on this page
    const author = await this.parseAuthor(page, language)

    // Skip pages that are not focused on some author
    if (author === null) {
      return []
    }

    // Compose the page URL
    const pageUrl = `https://${language.abbreviation}.wikiquote.org/wiki/${page.title}`

    // Let the content parser parse the text of the page and extract quotes
    const contentParser = this.contentParsers[language.abbreviation]

    console.log(`[INFO] Processing quotes by ${author.englishFullName}...`)

    return await contentParser.parse(
      pageUrl,
      page.revision.text,
      author,
      language,
    )
  }

  /**
   * Parses author from the page
   *
   * @param page Page to parse
   * @param language Language of the page
   * @returns Parsed author or null if there is not a human name in page title
   */
  private async parseAuthor(
    page: WikiPage,
    language: Language,
  ): Promise<Author | null> {
    // Load (potentially, as it could be a different type of page) author of
    // quotes on this page
    const potentialAuthorName = page.title
    const normalizedAuthorName =
      await this.authorNameParser.normalizeAuthorName(potentialAuthorName)

    // Check if it's a page with quotes of one author
    // It means that the page title is a human name
    // In case it wasn't a human name, normalizer returned null
    if (normalizedAuthorName === null) {
      return null
    }

    // Get or create an author's entity
    let author
    try {
      // Try to load author from the database (could be there from previous processing)
      author =
        await this.authorService.fetchByEnglishFullName(normalizedAuthorName)
    } catch {
      // If the author is not in the database, we need to add it
      author = await this.authorService.save(new Author(normalizedAuthorName))
    }

    // Add a translated full name (original name from the page's title) to the author
    await this.authorService.addTranslatedFullName(author, language, page.title)

    return author
  }
}
