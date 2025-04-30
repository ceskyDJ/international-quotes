/**
 * @author Michal Šmahel (xsmahe01)
 * @date 25th April 2025
 */

import { Expose } from "class-transformer"

export class LanguageResponseDto {
  @Expose()
  abbreviation!: string

  @Expose()
  englishName!: string

  @Expose()
  nativeName!: string
}
