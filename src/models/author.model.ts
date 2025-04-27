import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Length,
  Model,
  Table,
  Unique,
} from "sequelize-typescript"

import { Language } from "./language.model"
import { Quote } from "./quote.model"
import { TranslatedAuthorName } from "./translatedAuthorName.model"

/**
 * @class Author
 * @extends Model
 * @classDesc Model representing an author of quotes
 * @property {string} englishFullName Full name of the author in English
 * @property {Array<Language & { TranslatedAuthorName: TranslatedAuthorName }>} translatedNames Names of the author in different languages
 * @property {Quote[]} quotes Quotes associated with the author
 */
@Table
export class Author extends Model {
  @Unique
  @Length({ min: 2, max: 75 })
  @Column({ type: DataType.STRING(75) })
  englishFullName!: string

  @BelongsToMany(() => Language, () => TranslatedAuthorName, "authorId")
  translatedNames!: Array<
    Language & { TranslatedAuthorName: TranslatedAuthorName }
  >

  @HasMany(() => Quote, "authorId")
  quotes!: Quote[]

  // TODO: getQuotes()
  // TODO: countQuotes()
  // TODO: addQuote()
}
