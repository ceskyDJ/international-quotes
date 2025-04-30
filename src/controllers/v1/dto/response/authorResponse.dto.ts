/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Expose, Type } from "class-transformer"

export class TranslatedFullNameDto {
  @Expose()
  fullName!: string

  @Expose()
  languageAbbreviation!: string
}

export class AuthorResponseDto {
  @Expose()
  id!: number

  @Expose()
  englishFullName!: string

  @Expose()
  @Type(() => TranslatedFullNameDto)
  translatedFullNames!: TranslatedFullNameDto[]
}
