/**
 * @file index.ts
 * @description This file is the entry point for the application. It creates an HTTP server running Express.js
 * @author express-generator
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import http from "http"
import debug from "debug"

import app from "./app"
import config from "./config/config"
import { HttpError } from "http-errors"

// Set port to application controller
app.set("port", config.port)

// Configure the HTTP server and start listening for connections
// eslint-disable-next-line @typescript-eslint/no-misused-promises
const server = http.createServer(app)
server.listen(config.port)
server.on("error", onError)
server.on("listening", onListening)

/**
 * Event listener for HTTP server "error" event.
 */
function onError(error: HttpError): void {
  if (error.syscall !== "listen") {
    throw error
  }

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`Port ${String(config.port)} requires elevated privileges`)
      process.exit(1)
      break
    case "EADDRINUSE":
      console.error(`Port ${String(config.port)} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(): void {
  const addr = server.address()

  if (addr === null) {
    throw new Error("Server didn't start properly, as its address is null")
  }

  if (typeof addr === "string") {
    throw new Error(
      `Server didn't start properly, as its address is a string: ${addr}`,
    )
  }

  debug(`Listening on port ${String(addr.port)}...`)
}
