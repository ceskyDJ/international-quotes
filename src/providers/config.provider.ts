/**
 * @file config.provider.ts
 * @module providers
 * @author Michal Šmahel (xsmahe01)
 * @date April 2025
 */

import { Service } from "typedi"

/**
 * @interface HttpServerConfig
 * @classDesc Configuration for the HTTP server
 */
export interface HttpServerConfig {
  port: number
}

/**
 * @interface DatabaseConfig
 * @classDesc Configuration for the database connection
 */
export interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

/**
 * @interface AiApiConfig
 * @classDesc Configuration for the AI APIs
 */
export interface AiApiConfig {
  googleKey: string
}

/**
 * @class ConfigProvider
 * @classDesc Configuration provider for the application
 * @description This class provides configuration for the HTTP server, database connection, and AI APIs
 */
@Service()
export class ConfigProvider {
  private readonly httpServerConfig: HttpServerConfig
  private readonly databaseConfig: DatabaseConfig
  private readonly aiApiConfig: AiApiConfig

  /**
   * @constructor
   * @description Initializes the configuration provider with values from environment variables
   * @throws {Error} If the GOOGLE_AI_API_KEY environment variable is not set
   */
  public constructor() {
    this.httpServerConfig = {
      port: parseInt(process.env.PORT || "3000"),
    }

    this.databaseConfig = {
      host: process.env.POSTGRESQL_HOST || "localhost",
      port: parseInt(process.env.POSTGRESQL_PORT || "5432"),
      user: process.env.POSTGRESQL_USERNAME || "postgres",
      password: process.env.POSTGRESQL_PASSWORD || "password",
      database: process.env.POSTGRESQL_DATABASE || "international-quotes",
    }

    if (!process.env.GOOGLE_AI_API_KEY) {
      throw new Error("GOOGLE_AI_API_KEY environment variable is not set")
    }
    this.aiApiConfig = {
      googleKey: process.env.GOOGLE_AI_API_KEY,
    }
  }

  /**
   * @method provideHttpServerConfig
   * @description Provides the configuration for the HTTP server
   * @returns {HttpServerConfig} The configuration for the HTTP server
   */
  public provideHttpServerConfig(): HttpServerConfig {
    return this.httpServerConfig
  }

  /**
   * @method provideDatabaseConfig
   * @description Provides the configuration for the database connection
   * @returns {DatabaseConfig} The configuration for the database connection
   */
  public provideDatabaseConfig(): DatabaseConfig {
    return this.databaseConfig
  }

  /**
   * @method provideAiApiConfig
   * @description Provides the configuration for the AI APIs
   * @returns {AiApiConfig} The configuration for the AI APIs
   */
  public provideAiApiConfig(): AiApiConfig {
    return this.aiApiConfig
  }
}
