import { Service } from "typedi"
import { Controller, Get, Render } from "routing-controllers"

/**
 * @class IndexController
 * @description Controller for handling requests to the index page
 */
@Controller("/")
@Service()
export class IndexController {
  /**
   * @method renderIndex
   * @description Renders the index page
   * @returns {object} Variables to be passed to the template
   */
  @Get("/")
  @Render("index.html")
  renderIndex(): object {
    return {}
  }
}
