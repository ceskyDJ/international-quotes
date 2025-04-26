/**
 * @file languages.ts
 * @description Route definitions for endpoints under /languages
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Request, Response, Router } from "express"

export const router = Router()

// List all supported languages
router.get("/", (req: Request, res: Response): void => {
  res.json({ status: "todo", message: "TODO: Implement this endpoint" })
})
