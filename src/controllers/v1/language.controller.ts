/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Get, JsonController } from "routing-controllers"
import { Service } from "typedi"
import { plainToInstance } from "class-transformer"

import { LanguageService } from "../../services"

import { LanguageResponseDto } from "./dto"

/**
 * Controller for handling language-related requests
 */
@JsonController("/languages")
@Service()
export class LanguageController {
  /**
   * Constructor for the LanguageController
   *
   * @param languageService Service for handling language-related operations (dependency)
   */
  public constructor(private readonly languageService: LanguageService) {}

  /**
   * Lists all supported languages
   *
   * @returns List of languages
   */
  @Get("/")
  public async getAllLanguages(): Promise<LanguageResponseDto[]> {
    const languages = await this.languageService.fetchAll()

    return plainToInstance(LanguageResponseDto, languages, {
      excludeExtraneousValues: true,
    })
  }
}
