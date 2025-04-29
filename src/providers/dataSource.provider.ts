/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Service } from "typedi"
import { DataSource } from "typeorm"

import { ConfigProvider } from "./config.provider"

/**
 * Provider for the TypeORM data source
 */
@Service()
export class DataSourceProvider {
  private readonly dataSource: DataSource

  /**
   * Initializes the data source provider with configured options
   *
   * @param configProvider Configuration provider (dependency)
   */
  public constructor(private readonly configProvider: ConfigProvider) {
    const appConfig = this.configProvider.provideAppConfig()
    const databaseConfig = this.configProvider.provideDatabaseConfig()

    this.dataSource = new DataSource({
      type: "postgres",
      host: databaseConfig.host,
      port: databaseConfig.port,
      username: databaseConfig.user,
      password: databaseConfig.password,
      database: databaseConfig.database,
      synchronize: appConfig.devMode,
      logging: appConfig.devMode,
      entities: [`${__dirname}/../entities/*{.js,.ts}`],
    })
  }

  /**
   * Provides the TypeORM data source
   *
   * @returns TypeORM data source
   */
  public provide(): DataSource {
    return this.dataSource
  }
}
