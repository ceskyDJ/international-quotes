/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Service } from "typedi"
import { Get, JsonController, Params } from "routing-controllers"
import { plainToInstance } from "class-transformer"

import { AuthorService, LanguageService } from "../../services"

import { LangParams, AuthorResponseDto } from "./dto"

/**
 * Controller for handling author-related requests
 */
@JsonController("/authors")
@Service()
export class AuthorController {
  /**
   * Constructor for the AuthorController
   *
   * @param authorService Service for handling author-related operations (dependency)
   * @param languageService Service for handling language-related operations (dependency)
   */
  public constructor(
    private readonly authorService: AuthorService,
    private readonly languageService: LanguageService,
  ) {}

  /**
   * Lists all authors that we have quotes for (at least 1 quote)
   *
   * @returns List of authors
   */
  @Get("/")
  public async getAllAuthors(): Promise<AuthorResponseDto[]> {
    const authors = await this.authorService.fetchAll()

    return plainToInstance(AuthorResponseDto, authors, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * Lists all authors that we have quotes for (at least 1 quote) in the selected language
   *
   * @param params Selected language
   * @returns List of authors
   */
  @Get("/:langAbbr")
  public async getAuthorsByLanguage(
    @Params() params: LangParams,
  ): Promise<AuthorResponseDto[]> {
    const language = await this.languageService.fetchByAbbreviation(
      params.langAbbr,
    )

    const authors = await this.authorService.fetchAllByLanguage(language)

    return plainToInstance(AuthorResponseDto, authors, {
      excludeExtraneousValues: true,
    })
  }
}
