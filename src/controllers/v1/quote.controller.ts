/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Get, JsonController, Params } from "routing-controllers"
import { Service } from "typedi"
import { plainToInstance } from "class-transformer"

import { AuthorService, LanguageService, QuoteService } from "../../services"

import { LangParams, LangAndAuthorParams, QuoteResponseDto } from "./dto"

/**
 * Controller for handling quote-related requests
 */
@JsonController("/quotes")
@Service()
export class QuoteController {
  /**
   * Constructor for the QuoteController
   *
   * @param quoteService Service for handling quote-related operations (dependency)
   * @param languageService Service for handling language-related operations (dependency)
   * @param authorService Service for handling author-related operations (dependency)
   */
  public constructor(
    private readonly quoteService: QuoteService,
    private readonly languageService: LanguageService,
    private readonly authorService: AuthorService,
  ) {}

  /**
   * Lists all quotes in the selected language
   *
   * @param params Selected language
   * @returns List of quotes
   */
  @Get("/:langAbbr")
  public async getAllQuotes(
    @Params() params: LangParams,
  ): Promise<QuoteResponseDto[]> {
    const language = await this.languageService.fetchByAbbreviation(
      params.langAbbr,
    )

    const quotes = await this.quoteService.fetchAllByLanguage(language)

    return plainToInstance(QuoteResponseDto, quotes, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * List random quote in the selected language
   *
   * @param params Selected language
   * @returns Random quote
   */
  @Get("/:langAbbr/random")
  public async randomQuote(
    @Params() params: LangParams,
  ): Promise<QuoteResponseDto> {
    const language = await this.languageService.fetchByAbbreviation(
      params.langAbbr,
    )

    const quote = await this.quoteService.fetchRandomQuoteByLanguage(language)

    return plainToInstance(QuoteResponseDto, quote, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * Lists all quotes in the selected language authored by the selected author
   *
   * @param params Selected language and author
   * @returns List of quotes
   */
  @Get("/:langAbbr/:authorId")
  public async getAllQuotesByAuthor(
    @Params() params: LangAndAuthorParams,
  ): Promise<QuoteResponseDto[]> {
    const language = await this.languageService.fetchByAbbreviation(
      params.langAbbr,
    )
    const author = await this.authorService.fetchById(params.authorId)

    const quotes = await this.quoteService.fetchAllByLanguageAndAuthor(
      language,
      author,
    )

    return plainToInstance(QuoteResponseDto, quotes, {
      excludeExtraneousValues: true,
    })
  }

  /**
   * Return a random quote in the selected language authored by the selected author
   *
   * @param params Selected language and author
   * @returns Random quote
   */
  @Get("/:langAbbr/:authorId/random")
  public async getRandomQuoteByAuthor(
    @Params() params: LangAndAuthorParams,
  ): Promise<QuoteResponseDto> {
    const language = await this.languageService.fetchByAbbreviation(
      params.langAbbr,
    )
    const author = await this.authorService.fetchById(params.authorId)

    const quote = await this.quoteService.fetchRandomQuoteByLanguageAndAuthor(
      language,
      author,
    )

    return plainToInstance(QuoteResponseDto, quote, {
      excludeExtraneousValues: true,
    })
  }
}
