/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Repository } from "typeorm"
import { Service } from "typedi"

import { DataSourceProvider } from "../providers"
import { Author, Language, Quote } from "../entities"

import { NotFoundError } from "./errors/notFound.error"

/**
 * Service for managing quotes
 */
@Service()
export class QuoteService {
  private readonly quoteRepository: Repository<Quote>

  /**
   * Constructor for QuoteService
   *
   * @param dataSourceProvider Data source provider (dependency)
   */
  public constructor(dataSourceProvider: DataSourceProvider) {
    const dataSource = dataSourceProvider.provide()

    this.quoteRepository = dataSource.getRepository(Quote)
  }

  /**
   * Fetches all quotes
   *
   * @returns List of quotes
   */
  public async fetchAllByLanguage(language: Language): Promise<Quote[]> {
    return this.quoteRepository.find({
      where: {
        language: language,
        author: { translatedFullNames: { language: language } },
      },
      relations: {
        author: {
          translatedFullNames: true,
        },
      },
    })
  }

  /**
   * Fetches all quotes authored by the selected author in the selected language
   *
   * @param language Selected language
   * @param author Selected author
   * @returns List of quotes
   */
  public async fetchAllByLanguageAndAuthor(
    language: Language,
    author: Author,
  ): Promise<Quote[]> {
    return this.quoteRepository.find({
      where: {
        language: { abbreviation: language.abbreviation },
        author: { id: author.id, translatedFullNames: { language: language } },
      },
      relations: {
        author: {
          translatedFullNames: true,
        },
      },
    })
  }

  /**
   * Fetches a random quote in the selected language
   *
   * @param language Selected language
   * @returns Random quote
   * @throws NotFoundError If no quote is found for the selected language in the database
   */
  public async fetchRandomQuoteByLanguage(language: Language): Promise<Quote> {
    const quote = await this.quoteRepository
      .createQueryBuilder("quote")
      .leftJoinAndSelect("quote.author", "author")
      .leftJoinAndSelect("author.translatedFullNames", "translatedFullName")
      .where("quote.languageAbbreviation = :langAbbr", {
        langAbbr: language.abbreviation,
      })
      .andWhere("translatedFullName.languageAbbreviation = :langAbbr", {
        langAbbr: language.abbreviation,
      })
      .orderBy("RANDOM()")
      .limit(1)
      .getOne()

    if (quote === null) {
      throw new NotFoundError(
        `No quote found for language with abbreviation ${language.abbreviation}`,
      )
    }

    return quote
  }

  /**
   * Fetches a random quote in the selected language authored by the selected author
   *
   * @param language Selected language
   * @param author Selected author
   * @returns Random quote
   * @throws NotFoundError If no quote is found for the selected language and author in the database
   */
  public async fetchRandomQuoteByLanguageAndAuthor(
    language: Language,
    author: Author,
  ): Promise<Quote> {
    const quote = await this.quoteRepository
      .createQueryBuilder("quote")
      .leftJoinAndSelect("quote.author", "author")
      .leftJoinAndSelect("author.translatedFullNames", "translatedFullName")
      .where("quote.languageAbbreviation = :langAbbr", {
        langAbbr: language.abbreviation,
      })
      .andWhere("translatedFullName.languageAbbreviation = :langAbbr", {
        langAbbr: language.abbreviation,
      })
      .andWhere("quote.authorId = :authorId", {
        authorId: author.id,
      })
      .orderBy("RANDOM()")
      .limit(1)
      .getOne()

    if (quote === null) {
      throw new NotFoundError(
        `No quote found for language with abbreviation ${language.abbreviation} and author with ID ${String(author.id)}`,
      )
    }

    return quote
  }

  /**
   * Counts the number of quotes in the database
   */
  public async count(): Promise<number> {
    return this.quoteRepository.count()
  }

  /**
   * Saves a list of quotes to the database
   *
   * @param quotes List of quotes to save
   */
  public async saveAll(quotes: Quote[]): Promise<void> {
    await this.quoteRepository.save(quotes)
  }
}
