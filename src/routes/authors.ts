/**
 * @file authors.ts
 * @description Route definitions for endpoints under /authors
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Request, Response, Router } from "express"

export const router = Router()

// List all authors that we have quotes for (at least 1 quote)
router.get("/", (req: Request, res: Response): void => {
  res.json({ status: "todo", message: "TODO: Implement this endpoint" })
})

// List all authors that we have quotes for (at least 1 quote) in the selected language
router.get("/:langAbbr", (req: Request, res: Response): void => {
  res.json({
    status: "todo",
    message: "TODO: Implement this endpoint",
    language: req.params.langAbbr,
  })
})
