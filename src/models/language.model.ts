/**
 * @file language.model.ts
 * @module models
 * @author Michal Šmahel (xsmahe01)
 * @date April 2025
 */

import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Length,
  Model,
  PrimaryKey,
  Table,
} from "sequelize-typescript"

import { Quote } from "./quote.model"
import { Author } from "./author.model"
import { TranslatedAuthorName } from "./translatedAuthorName.model"

/**
 * Model representing a natural language
 *
 * @property abbreviation Abbreviation of the language (e.g., "cs" for Czech)
 * @property englishName Full name of the language in English (e.g., "Czech")
 * @property nativeName Full name of the language in its native form (e.g., "Čeština")
 * @property quotes Quotes associated with the language
 * @property translatedAuthorNames Names of authors in different languages
 */
@Table
export class Language extends Model {
  @PrimaryKey
  @Length({ min: 2, max: 2 })
  @Column({ type: DataType.CHAR(2) })
  abbreviation!: string

  @Length({ min: 2, max: 75 })
  @Column({ type: DataType.STRING(75) })
  englishName!: string

  @Length({ min: 2, max: 75 })
  @Column({ type: DataType.STRING(75) })
  nativeName!: string

  @HasMany(() => Quote, "languageAbbreviation")
  quotes!: Quote[]

  @BelongsToMany(
    () => Author,
    () => TranslatedAuthorName,
    "languageAbbreviation",
  )
  translatedAuthorNames!: Array<
    Author & { TranslatedAuthorName: TranslatedAuthorName }
  >

  // TODO: getQuotes()
  // TODO: countQuotes()
  // TODO: addQuote()
}
