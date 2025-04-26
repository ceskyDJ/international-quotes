/**
 * @file config.ts
 * @description Config loader for the application (loads from .env file)
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import "dotenv/config"

interface Config {
  port: number
  db: {
    host: string
    port: number
    user: string
    password: string
    database: string
  }
  googleAiApiKey: string
}

const config: Config = {
  port: parseInt(process.env.PORT || "3000"),
  db: {
    host: process.env.MARIADB_HOST || "localhost",
    port: parseInt(process.env.MARIADB_PORT || "3306"),
    user: process.env.MARIADB_USERNAME || "mariadb",
    password: process.env.MARIADB_PASSWORD || "password",
    database: process.env.MARIADB_DATABASE || "international-quotes",
  },
  googleAiApiKey: process.env.GOOGLE_AI_API_KEY || "",
}

export default config
