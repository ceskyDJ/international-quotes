/**
 * @file quotes.ts
 * @description Route definitions for endpoints under /quotes
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Request, Response, Router } from "express"

export const router = Router()

// List quotes in the selected language
router.get("/:langAbbr", (req: Request, res: Response): void => {
  res.json({
    status: "todo",
    message: "TODO: Implement this endpoint",
    language: req.params.langAbbr,
  })
})

// Return a random quote in the selected language
router.get("/:langAbbr/random", (req: Request, res: Response): void => {
  res.json({
    status: "todo",
    message: "TODO: Implement this endpoint",
    language: req.params.langAbbr,
  })
})

// List quotes in the selected language authored by the selected author
router.get("/:langAbbr/:authorId", (req: Request, res: Response): void => {
  res.json({
    status: "todo",
    message: "TODO: Implement this endpoint",
    language: req.params.langAbbr,
    author: req.params.authorId,
  })
})

// Return a random quote in the selected language authored by the selected author
router.get(
  "/:langAbbr/:authorId/random",
  (req: Request, res: Response): void => {
    res.json({
      status: "todo",
      message: "TODO: Implement this endpoint",
      language: req.params.langAbbr,
      author: req.params.authorId,
    })
  },
)
