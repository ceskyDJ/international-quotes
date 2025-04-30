/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Service } from "typedi"
import { Repository } from "typeorm"

import { DataSourceProvider } from "../providers"
import { Author, Language, Quote } from "../entities"

import { NotFoundError } from "./errors/notFound.error"

/**
 * Service for managing authors
 */
@Service()
export class AuthorService {
  private readonly authorRepository: Repository<Author>
  private readonly quoteRepository: Repository<Quote>

  /**
   * Constructor for the AuthorService
   *
   * @param dataSourceProvider Data source provider (dependency)
   */
  public constructor(dataSourceProvider: DataSourceProvider) {
    const dataSource = dataSourceProvider.provide()

    this.authorRepository = dataSource.getRepository(Author)
    this.quoteRepository = dataSource.getRepository(Quote)
  }

  /**
   * Fetches all authors
   *
   * @returns List of authors
   */
  public async fetchAll(): Promise<Author[]> {
    return (
      this.authorRepository
        .createQueryBuilder("author")
        .leftJoinAndSelect("author.translatedFullNames", "translatedFullName")
        /* Limit to authors that have at least one quote */
        .whereExists(
          this.quoteRepository
            .createQueryBuilder("quote")
            .select("1")
            .where("quote.authorId = author.id"),
        )
        .getMany()
    )
  }

  /**
   * Fetches all authors that authored at least one quote in the selected language
   *
   * By "authored" we mean in the context of this application, so there are just
   * a subset of quotes the person really authored.
   *
   * @param language Selected language
   * @returns List of authors
   */
  public async fetchAllByLanguage(language: Language): Promise<Author[]> {
    return (
      this.authorRepository
        .createQueryBuilder("author")
        .leftJoinAndSelect("author.translatedFullNames", "translatedFullName")
        .where("translatedFullName.languageAbbreviation = :langAbbr", {
          langAbbr: language.abbreviation,
        })
        /* Limit to authors that have at least one quote in the selected language */
        .andWhereExists(
          this.quoteRepository
            .createQueryBuilder("quote")
            .select("1")
            .where(
              "quote.authorId = author.id AND quote.languageAbbreviation = :langAbbr",
              { langAbbr: language.abbreviation },
            ),
        )
        .getMany()
    )
  }

  /**
   * Fetches author by identifier
   *
   * @param id Author's numeric identifier (based on the data in the database, obtained, e.g., from /authors)
   * @returns Found author that has the given identifier
   * @throws NotFoundError If the author with the given identifier does not exist in the database
   */
  public async fetchById(id: number): Promise<Author> {
    const author = await this.authorRepository.findOneBy({ id: id })

    if (author === null) {
      throw new NotFoundError(`Author with ID ${String(id)} not found`)
    }

    return author
  }
}
