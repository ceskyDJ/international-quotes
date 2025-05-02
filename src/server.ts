/**
 * This file is the entry point for the application. It creates an HTTP server running Express.js
 *
 * @author Michal Šmahel (xsmahe01)
 * @date April 2025
 */

import "reflect-metadata"
import { useContainer } from "routing-controllers"
import { Container } from "typedi"

import { AppBootstrap } from "./app"
import { ConfigProvider, DataSourceProvider } from "./providers"
import { QuoteService } from "./services"
import { WikiquoteLoader } from "./loading"

void (async (): Promise<void> => {
  try {
    // Setup DI container for controllers
    useContainer(Container)

    // Load configuration
    const configProvider = Container.get(ConfigProvider)
    const httpServerConfig = configProvider.provideAppConfig()

    // Initialize database ORM
    const dataSourceProvider = Container.get(DataSourceProvider)
    const dataSource = dataSourceProvider.provide()
    await dataSource.initialize()

    // Prepare data to be served by application (if needed)
    const quoteService = Container.get(QuoteService)
    if ((await quoteService.count()) === 0) {
      console.log(
        "[WARNING] Database is empty. Loading quotes from Wikiquote dumps..." +
          " This may take a while, depending on the size of the dump files.",
      )

      const wikiQuoteLoader = Container.get(WikiquoteLoader)
      await wikiQuoteLoader.loadQuotesFromWikiDump(
        `${__dirname}/../dumps/cswikiquote-20250320-pages-meta-current.xml`,
      )
    }

    // Setup application
    const bootstrap = Container.get(AppBootstrap)
    const app = bootstrap.setup()

    // Start an HTTP server serving the application
    app.listen(httpServerConfig.port, () => {
      console.log("Application started successfully")
      console.log(`Listening on port ${String(httpServerConfig.port)}...`)
    })
  } catch (error) {
    console.error(`Failed to start application: ${String(error)}`)
    process.exit(1)
  }
})()
