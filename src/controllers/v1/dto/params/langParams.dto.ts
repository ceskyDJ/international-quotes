/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { IsAlpha, IsLowercase, Length } from "class-validator"

/**
 * DTO for validating language parameter
 *
 * @property {string} langAbbr Language abbreviation (2 lowercase letters)
 */
export class LangParams {
  @Length(2, 2)
  @IsAlpha()
  @IsLowercase()
  langAbbr!: string
}
