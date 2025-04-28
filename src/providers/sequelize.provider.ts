/**
 * @author Michal Šmahel (xsmahe01)
 * @date April 2025
 */

import { Sequelize } from "sequelize-typescript"
import { Service } from "typedi"

import { ConfigProvider } from "./config.provider"

/**
 * Provider for the Sequelize (DB ORM) instance
 *
 * This class provides a singleton instance of Sequelize for database operations.
 * Singleton-like behavior is achieved by using the `Service` decorator from `typedi`.
 */
@Service()
export class SequelizeProvider {
  private readonly sequelizeInstance: Sequelize

  /**
   * Initializes the Sequelize provider with the database configuration
   *
   * @param configProvider Configuration provider for the application (dependency)
   */
  public constructor(private readonly configProvider: ConfigProvider) {
    const databaseConfig = this.configProvider.provideDatabaseConfig()

    this.sequelizeInstance = new Sequelize({
      dialect: "postgres",
      host: databaseConfig.host,
      port: databaseConfig.port,
      username: databaseConfig.user,
      password: databaseConfig.password,
      database: databaseConfig.database,
      repositoryMode: true,
      models: [`${__dirname}/../models/*{.js,.ts}`],
      modelMatch: (filename, member) => {
        // Remove the suffix from the filename
        filename = filename.replace(/\.model$/, "")

        return filename.toLowerCase() === member.toLowerCase()
      },
      logging: false,
    })
  }

  /**
   * Provides the Sequelize instance for database operations
   *
   * @returns The Sequelize instance
   */
  public provide(): Sequelize {
    return this.sequelizeInstance
  }
}
