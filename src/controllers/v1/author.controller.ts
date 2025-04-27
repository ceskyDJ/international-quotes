/**
 * @file authors.ts
 * @description Route definitions for endpoints under /authors
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import "reflect-metadata"
import { Service } from "typedi"
import { Get, JsonController, QueryParam } from "routing-controllers"
import { Author } from "../../models/author.model"

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
   * @param {string} langAbbr Abbreviation of the selected language
   * @returns {Author[]} List of authors
   */
  @Get("/:langAbbr")
  public getAuthorsByLanguage(
    @QueryParam("langAbbr", { required: true, type: String }) langAbbr: string,
  ): Author[] {
    console.log(`Fetching authors for language: ${langAbbr}...`)
    return []
  }
}
