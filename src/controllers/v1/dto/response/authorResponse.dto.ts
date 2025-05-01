/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Expose, Type } from "class-transformer"

/**
 * Response DTO for translated full name of an author
 *
 * @property fullName Translated full name of the author
 * @property languageAbbreviation Abbreviation of the language in which the full name is provided
 */
export class TranslatedFullNameDto {
  @Expose()
  fullName!: string

  @Expose()
  languageAbbreviation!: string
}

/**
 * Response DTO for author
 *
 * @property id Database identifier of the author (used for selecting author in some endpoints)
 * @property englishFullName Full name of the author in English
 * @property translatedFullNames List of translated full names of the author
 */
export class AuthorResponseDto {
  @Expose()
  id!: number

  @Expose()
  englishFullName!: string

  @Expose()
  @Type(() => TranslatedFullNameDto)
  translatedFullNames!: TranslatedFullNameDto[]
}
