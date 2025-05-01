/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Expose } from "class-transformer"

/**
 * Response DTO for language
 *
 * @property abbreviation Official 2-letter abbreviation of the language (e.g. "cs")
 * @property englishName English name of the language (e.g. "Czech")
 * @property nativeName Native name of the language (e.g. "Čeština")
 */
export class LanguageResponseDto {
  @Expose()
  abbreviation!: string

  @Expose()
  englishName!: string

  @Expose()
  nativeName!: string
}
