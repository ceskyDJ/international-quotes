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
 * @class Language
 * @extends Model
 * @classDesc Model representing a natural language
 * @property {string} abbreviation Abbreviation of the language (e.g., "cs" for Czech)
 * @property {string} englishName Full name of the language in English (e.g., "Czech")
 * @property {string} nativeName Full name of the language in its native form (e.g., "Čeština")
 * @property {Array<Quote>} quotes Quotes associated with the language
 * @property {Array<Author & { TranslatedAuthorName: TranslatedAuthorName }>} translatedAuthorNames Names of authors in different languages
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
