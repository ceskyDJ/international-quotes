/**
 * @file app.ts
 * @description Main application file that sets up the Express server
 * @author express-generator
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import express from "express"
import morgan from "morgan"

import { router as authorsRouter } from "./routes/authors"
import { router as languagesRouter } from "./routes/languages"
import { router as quotesRouter } from "./routes/quotes"

const app = express()

app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use("/authors", authorsRouter)
app.use("/languages", languagesRouter)
app.use("/quotes", quotesRouter)

export default app
