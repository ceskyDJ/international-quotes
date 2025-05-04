/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { XMLParser } from "fast-xml-parser"
import {
  existsSync,
  readFileSync,
  realpathSync,
  unlinkSync,
  writeFile,
} from "node:fs"
import { Service } from "typedi"
import { XXHash3 } from "xxhash-addon"

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
 * Interface for typing the checkpoint
 *
 * @property timestamp Timestamp of the while, when the checkpoint was created
 * @property wikiDumpChecksum Checksum of the wiki dump file
 * @property lastPageTitle Title of the last page processed
 */
interface Checkpoint {
  timestamp: number
  wikiDumpChecksum: string
  lastPageTitle: string
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
    const realPath = realpathSync(path)

    // If a *.done file exists, it means that the wiki dump was already processed
    if (existsSync(`${realPath}.done`)) {
      console.log(
        `[WARNING] Wiki dump ${realPath} was already processed. Skipping...`,
      )
      return
    }

    console.log(
      `[INFO] Loading quotes from wiki dump ${realPath}... This may take a while, depending on the size of the dump files.`,
    )

    // If a *.checkpoint file exists, it means that the wiki dump was partially
    // processed, and we can continue from the last page --> load the checkpoint
    let checkpoint
    if (existsSync(`${realPath}.checkpoint`)) {
      console.log(
        `[INFO] Wiki dump ${realPath} was partially processed. Loading checkpoint...`,
      )

      // Load the checkpoint
      checkpoint = JSON.parse(
        readFileSync(`${realPath}.checkpoint`, "utf-8"),
      ) as Checkpoint

      // Check if the checksum of the wiki dump file is the same as in the checkpoint
      const hasher = new XXHash3(readFileSync(realPath))
      const wikiDumpChecksum = hasher.digest().toString("hex")
      if (wikiDumpChecksum !== checkpoint.wikiDumpChecksum) {
        console.log(
          `[ERROR] Checksum of the wiki dump file ${realPath} does not match the one in the checkpoint. It means that the file was changed since the last processing. Please remove the checkpoint file and start over.`,
        )
        return
      }
    }

    const rawWikiDump = readFileSync(realPath, "utf-8")

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
    let skippingMode = checkpoint !== undefined
    for (const page of parsedWikiDump.mediawiki.page) {
      const pageTitle = String(page.title)
      // If the checkpoint was loaded, skip all pages until the page from the checkpoint
      if (skippingMode && pageTitle !== checkpoint?.lastPageTitle) {
        continue
      } else if (skippingMode && pageTitle === checkpoint?.lastPageTitle) {
        console.log(
          `[INFO] Continuing from the last page ${checkpoint.lastPageTitle}...`,
        )
        skippingMode = false
      }

      try {
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
          console.log(
            `[WARNING] No relevant quotes found for page ${page.title}`,
          )
        } else {
          console.log(
            `[INFO] Loaded ${String(numberOfQuotesPerAuthor)} quotes by ${quotes[0].author.englishFullName}`,
          )
        }

        totalQuotes += numberOfQuotesPerAuthor
      } catch (error) {
        console.log(
          `[ERROR] Failed to process quotes from wiki dump ${realPath}. Saving checkpoint...`,
        )

        // Save the checkpoint, so we can continue from this point later
        const hasher = new XXHash3(readFileSync(realPath))
        writeFile(
          `${realPath}.checkpoint`,
          JSON.stringify({
            timestamp: Date.now(),
            wikiDumpChecksum: hasher.digest().toString("hex"),
            lastPageTitle: page.title,
          } as Checkpoint),
          (fileError) => {
            if (fileError) {
              console.error(fileError)
              console.log(
                `[ERROR] Failed to save checkpoint for wiki dump ${realPath}`,
              )
            }
          },
        )

        // Rethrow the error to stop the processing
        throw error
      }
    }

    console.log(`[INFO] Successfully processed ${String(totalQuotes)} quotes`)

    // Remove a checkpoint file if there was one
    if (checkpoint !== undefined) {
      console.log(`[INFO] Removing checkpoint file ${realPath}.checkpoint...`)
      unlinkSync(`${realPath}.checkpoint`)
    }

    // Mark the wiki dump as processed by creating a *.done file
    writeFile(`${realPath}.done`, "", (error) => {
      if (error) {
        console.error(error)
        console.log(`[ERROR] Failed to mark wiki dump ${realPath} as processed`)
      }
    })
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
