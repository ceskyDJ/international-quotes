/**
 * @file index.controller.ts
 * @model controllers.static
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Service } from "typedi"
import { Controller, Get, Render } from "routing-controllers"

/**
 * Controller for handling requests to the index page
 */
@Controller("/")
@Service()
export class IndexController {
  /**
   * Renders the index page
   *
   * @returns Variables to be passed to the template
   */
  @Get("/")
  @Render("index.html")
  renderIndex(): object {
    return {}
  }
}
