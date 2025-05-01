/**
 * Main application file that sets up the Express server
 *
 * @author Michal Šmahel (xsmahe01)
 * @date April 2025
 */

import express, { Application } from "express"
import { useExpressServer } from "routing-controllers"
import cors from "cors"
import helmet from "helmet"
import bodyParser from "body-parser"
import path from "path"
import { Service } from "typedi"

/**
 * Bootstrap class for the Express application
 */
@Service()
export class AppBootstrap {
  /**
   * Sets up the Express application with middlewares and routes
   *
   * @returns The configured Express application
   */
  public setup(): Application {
    // Create Express app
    const app = express()

    // Apply middlewares
    app.use(cors())
    app.use(
      helmet({
        contentSecurityPolicy: {
          useDefaults: true,
          directives: {
            "script-src": ["'self'", "https://cdnjs.cloudflare.com"],
          },
        },
      }),
    )
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))

    // Setup static file serving (for index and its linked resources)
    app.use(express.static(path.join(__dirname, "../public")))

    // Setup Express HTTP server for serving API
    useExpressServer(app, {
      cors: true,
      routePrefix: "/api/v1",
      controllers: [`${__dirname}/controllers/v1/*{.js,.ts}`],
      classTransformer: true,
      validation: {
        whitelist: true,
        forbidNonWhitelisted: true,
        validationError: { target: false, value: true },
      },
      defaultErrorHandler: true,
    })

    return app
  }
}
