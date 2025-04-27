/**
 * @file languages.ts
 * @description Route definitions for endpoints under /languages
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Get, JsonController } from "routing-controllers"
import { Service } from "typedi"
import { Language } from "../../models/language.model"

/**
 * @class LanguageController
 * @description Controller for handling language-related requests
 */
@JsonController("/languages")
@Service()
export class LanguageController {
  /**
   * @method getAllLanguages
   * @description Lists all supported languages
   * @returns {Language[]} List of languages
   */
  @Get("/")
  public getAllLanguages(): Language[] {
    console.log("Fetching all languages...")
    return []
  }
}
