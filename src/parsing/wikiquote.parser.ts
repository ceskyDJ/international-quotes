/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { XMLParser } from "fast-xml-parser"
import { readFileSync } from "node:fs"
import { Service } from "typedi"

import { Author, Language, Quote } from "../entities"
import { AuthorService, LanguageService } from "../services"

import { AuthorNameParser } from "./ai"
import { ContentParser, CzechParser } from "./content"

/**
 * Interface for typing a single page from the wiki dump
 *
 * Only relevant parts of the original XML are included!
 *
 * @property title Title of the page
 * @property revision Revision of the page (like a snapshot of the page)
 * @property revision.text Text of the page (in original mediawiki format)
 */
interface WikiPage {
  title: string

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
export class WikiquoteParser {
  private readonly contentParsers: { [key: string]: ContentParser }

  /**
   * Constructor for WikiquoteParser
   *
   * @param languageService Language service (dependency)
   * @param authorService Author service (dependency)
   * @param authorNameParser Author name parser (dependency)
   * @param czechParser Czech parser (dependency)
   */
  public constructor(
    private readonly languageService: LanguageService,
    private readonly authorService: AuthorService,
    private readonly authorNameParser: AuthorNameParser,
    czechParser: CzechParser,
  ) {
    this.contentParsers = {
      cs: czechParser,
    }
  }

  /**
   * Parses the wiki dump and extracts quotes from it
   *
   * @param path Path to the wiki dump file
   * @returns List of quotes from the wiki dump
   */
  public async parseWikiDump(path: string): Promise<Quote[]> {
    const quotes: Quote[] = []

    const rawWikiDump = readFileSync(path, "utf-8")

    // Parse the XML data into an object format
    const xmlParser = new XMLParser()
    const parsedWikiDump = xmlParser.parse(rawWikiDump) as WikiDump

    // Load language
    const languageAbbreviation =
      parsedWikiDump.mediawiki.siteinfo.dbname.substring(0, 2)
    const language =
      await this.languageService.fetchByAbbreviation(languageAbbreviation)

    // Parse quotes from pages (usually a page contains quotes of one author)
    for (const page of parsedWikiDump.mediawiki.page) {
      quotes.concat(await this.parsePage(page, language))
    }

    return quotes
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
    try {
      // Get author of quotes on this page
      const author = await this.parseAuthor(page, language)

      // Let the content parser parse the text of the page and extract quotes
      const contentParser = this.contentParsers[language.abbreviation]

      return await contentParser.parse(page.revision.text, author, language)
    } catch {
      // This is a different type of page that needs to be skipped
      return []
    }
  }

  /**
   * Parses author from the page
   *
   * @param page Page to parse
   * @param language Language of the page
   * @returns Parsed author
   */
  private async parseAuthor(
    page: WikiPage,
    language: Language,
  ): Promise<Author> {
    // Load (potentially, as it could be a different type of page) author of
    // quotes on this page
    const potentialAuthorName = page.title
    const normalizedAuthorName =
      await this.authorNameParser.normalizeAuthorName(potentialAuthorName)

    // Check if it's a page with quotes of one author
    // It means that the page title is a human name
    // In case it wasn't a human name, normalizer returned null
    if (normalizedAuthorName === null) {
      throw new Error("Page title is not a human name")
    }

    // Get or create an author's entity
    let author
    try {
      // Try to load author from the database (could be there from previous processing)
      author =
        await this.authorService.fetchByEnglishFullName(normalizedAuthorName)
    } catch {
      // If the author is not in the database, we need to add it
      author = new Author(normalizedAuthorName)

      await this.authorService.save(author)
    }

    // Add a translated full name (original name from the page's title) to the author
    await this.authorService.addTranslatedFullName(author, language, page.title)

    return author
  }
}
