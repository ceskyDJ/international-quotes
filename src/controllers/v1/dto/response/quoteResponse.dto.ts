/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Expose, Type } from "class-transformer"

import { AuthorResponseDto } from "./authorResponse.dto"

/**
 * Response DTO for quote
 *
 * @property id Database identifier of the quote (used for farther identification in case of problems and other references)
 * @property source URL of the Wiki quote page, where the quote is from
 * @property text Quote's text
 * @property author Author of the quote
 */
export class QuoteResponseDto {
  @Expose()
  id!: number

  @Expose()
  source!: string

  @Expose()
  text!: string

  @Expose()
  @Type(() => AuthorResponseDto)
  author!: AuthorResponseDto
}
