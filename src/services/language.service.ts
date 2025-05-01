/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Repository } from "typeorm"
import { Service } from "typedi"

import { DataSourceProvider } from "../providers"
import { Language } from "../entities"

import { NotFoundError } from "./errors/notFound.error"

/**
 * Service for managing languages
 */
@Service()
export class LanguageService {
  private readonly languageRepository: Repository<Language>

  /**
   * Constructor for LanguageService
   *
   * @param dataSourceProvider Data source provider (dependency)
   */
  public constructor(dataSourceProvider: DataSourceProvider) {
    const dataSource = dataSourceProvider.provide()

    this.languageRepository = dataSource.getRepository(Language)
  }

  /**
   * Fetches all languages
   *
   * @returns List of languages
   */
  public async fetchAll(): Promise<Language[]> {
    return this.languageRepository.find()
  }

  /**
   * Fetches language by its abbreviation
   *
   * @param abbreviation Abbreviation of the language (international two-letter code)
   * @returns Found language that matches the abbreviation
   * @throws NotFoundError If the language with the given abbreviation does not exist in the database
   */
  public async fetchByAbbreviation(abbreviation: string): Promise<Language> {
    const language = await this.languageRepository.findOneBy({
      abbreviation: abbreviation,
    })

    if (language === null) {
      throw new NotFoundError(
        `Language with abbreviation ${abbreviation} not found`,
      )
    }

    return language
  }

  /**
   * Saves the language to the database
   *
   * @param language Language to save
   * @returns Saved language (initialized by ORM)
   */
  public async save(language: Language): Promise<Language> {
    return await this.languageRepository.save(language)
  }
}
