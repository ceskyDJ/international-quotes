import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsUrl,
  Length,
  Model,
  Table,
} from "sequelize-typescript"

import { Author } from "./author.model"
import { Language } from "./language.model"

/**
 * @class Quote
 * @extends Model
 * @classDesc Model representing a quote (popular text from a person)
 * @property {string} text The text of the quote
 * @property {string} source URL of the Wiki quote page where the quote was found (due to license)
 * @property {number} authorId Foreign key referencing the quote author
 * @property {Author} author The author of the quote
 * @property {string} languageAbbreviation Foreign key referencing the quote language
 * @property {Language} language The language of the quote
 */
@Table
export class Quote extends Model {
  @Length({ min: 1, max: 1_000 })
  @Column({ type: DataType.STRING(1_000) })
  text!: string

  @IsUrl
  @Column({
    comment:
      "URL of Wikiquote page, where the quote was found (due to license)",
  })
  source!: string

  @ForeignKey(() => Author)
  @Column
  authorId!: number

  @BelongsTo(() => Author, "authorId")
  author!: Author

  @ForeignKey(() => Language)
  @Column
  languageAbbreviation!: string

  @BelongsTo(() => Language, "languageAbbreviation")
  language!: Language
}
