/**
 * @author Michal Šmahel (xsmahe01)
 * @date April 2025
 */

import { BaseEntity, Column, Entity, OneToMany, PrimaryColumn } from "typeorm"
import { IsAlpha, Length } from "class-validator"

import { Quote } from "./quote"
import { TranslatedAuthorName } from "./translatedAuthorName"

/**
 * Model representing a natural language
 *
 * @property abbreviation Abbreviation of the language (e.g., "cs" for Czech)
 * @property englishName Full name of the language in English (e.g., "Czech")
 * @property nativeName Full name of the language in its native form (e.g., "Čeština")
 * @property quotes Quotes associated with the language
 * @property translatedFullNames Names of authors in different languages
 */
@Entity()
export class Language extends BaseEntity {
  @PrimaryColumn({ type: "char", length: 2 })
  @IsAlpha()
  @Length(2, 2)
  abbreviation!: string

  @Column({ length: 75 })
  englishName!: string

  @Column({ length: 75 })
  nativeName!: string

  @OneToMany(() => Quote, (quote) => quote.language)
  quotes?: Quote[]

  @OneToMany(
    () => TranslatedAuthorName,
    (translatedAuthorName) => translatedAuthorName.language,
  )
  translatedFullNames?: TranslatedAuthorName[]

  /**
   * Constructor for the Language class
   *
   * @param abbreviation Abbreviation of the language (e.g., "cs" for Czech)
   * @param englishName Full name of the language in English (e.g., "Czech")
   * @param nativeName Full name of the language in its native form (e.g., "Čeština")
   */
  public constructor(
    abbreviation: string,
    englishName: string,
    nativeName: string,
  ) {
    super()

    this.abbreviation = abbreviation
    this.englishName = englishName
    this.nativeName = nativeName
  }
}
