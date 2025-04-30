/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Expose, Type } from "class-transformer"

import { AuthorResponseDto } from "./authorResponse.dto"

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
