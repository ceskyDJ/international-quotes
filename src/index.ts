/**
 * @file index.ts
 * @description This file is the entry point for the application. It creates an HTTP server running Express.js
 * @author express-generator
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import "reflect-metadata"
import { useContainer } from "routing-controllers"
import { Container } from "typedi"

import { AppBootstrap } from "./app"
import { ConfigProvider } from "./providers/config.provider"

void (async (): Promise<void> => {
  try {
    // Setup DI container
    useContainer(Container)

    // Load configuration
    const configProvider = Container.get(ConfigProvider)
    const httpServerConfig = configProvider.provideHttpServerConfig()

    // Setup application
    const bootstrap = Container.get(AppBootstrap)
    const app = await bootstrap.setup()

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
