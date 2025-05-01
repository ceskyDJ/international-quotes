/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { IsAlpha, IsInt, IsLowercase, Length, Min } from "class-validator"
import { Type } from "class-transformer"

/**
 * DTO for validating language and author parameters
 *
 * @property langAbbr Language abbreviation (2 lowercase letters)
 * @property authorId Author ID (integer)
 */
export class LangAndAuthorParams {
  @Length(2, 2)
  @IsAlpha()
  @IsLowercase()
  langAbbr!: string

  @Min(1)
  @IsInt()
  @Type(() => Number)
  authorId!: number
}
