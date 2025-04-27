/**
 * @file authors.ts
 * @description Route definitions for endpoints under /authors
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import "reflect-metadata"
import { Service } from "typedi"
import { Get, JsonController, Params } from "routing-controllers"
import { Author } from "../../models/author.model"
import { LangParams } from "./dto/langParams.dto"

/**
 * @class AuthorController
 * @description Controller for handling author-related requests
 */
@JsonController("/authors")
@Service()
export class AuthorController {
  /**
   * @method getAllAuthors
   * @description Lists all authors that we have quotes for (at least 1 quote)
   * @returns {Author[]} List of authors
   */
  @Get("/")
  public getAllAuthors(): Author[] {
    console.log("Fetching all authors...")
    return []
  }

  /**
   * @method getAuthorsByLanguage
   * @description Lists all authors that we have quotes for (at least 1 quote) in the selected language
   * @param {LangParams} params Selected language
   * @returns {Author[]} List of authors
   */
  @Get("/:langAbbr")
  public getAuthorsByLanguage(@Params() params: LangParams): Author[] {
    console.log(`Fetching authors for language: ${params.langAbbr}...`)
    return []
  }
}
