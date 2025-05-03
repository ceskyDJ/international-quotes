/**
 * @author Michal Šmahel (xsmahe01)
 * @date April 2025
 */

import { Service } from "typedi"

/**
 * General configuration for the application (and HTTP server)
 *
 * @property port The port on which the HTTP server will listen to
 * @property devMode Is the application running in development mode?
 */
export interface AppConfig {
  port: number
  devMode: boolean
}

/**
 * Configuration for the database connection
 *
 * @property host The host of the database server
 * @property port The port of the database server
 * @property user The username for logging into the database
 * @property password The password for logging into the database
 * @property database The name of the database to use
 */
export interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

/**
 * Configuration for the AI APIs
 *
 * @property openaiKey The API key for OpenAI API
 */
export interface AiApiConfig {
  openaiKey: string
}

/**
 * Configuration provider for the application
 *
 * This class provides configuration for the HTTP server, database connection, and AI APIs
 */
@Service()
export class ConfigProvider {
  private readonly appConfig: AppConfig
  private readonly databaseConfig: DatabaseConfig
  private readonly aiApiConfig: AiApiConfig

  /**
   * Initializes the configuration provider with values from environment variables
   *
   * @throws {Error} If the GOOGLE_AI_API_KEY environment variable is not set
   */
  public constructor() {
    this.appConfig = {
      port: parseInt(process.env.PORT || "3000"),
      devMode: process.env.NODE_ENV !== "production",
    }

    this.databaseConfig = {
      host: process.env.POSTGRESQL_HOST || "localhost",
      port: parseInt(process.env.POSTGRESQL_PORT || "5432"),
      user: process.env.POSTGRESQL_USERNAME || "postgres",
      password: process.env.POSTGRESQL_PASSWORD || "password",
      database: process.env.POSTGRESQL_DATABASE || "international-quotes",
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY environment variable is not set")
    }
    this.aiApiConfig = {
      openaiKey: process.env.OPENAI_API_KEY,
    }
  }

  /**
   * Provides the general application (and HTTP server) configuration
   *
   * @returns The general configuration for application and HTTP server
   */
  public provideAppConfig(): AppConfig {
    return this.appConfig
  }

  /**
   * Provides the configuration for the database connection
   *
   * @returns The configuration for the database connection
   */
  public provideDatabaseConfig(): DatabaseConfig {
    return this.databaseConfig
  }

  /**
   * Provides the configuration for the AI APIs
   * @returns The configuration for the AI APIs
   */
  public provideAiApiConfig(): AiApiConfig {
    return this.aiApiConfig
  }
}
