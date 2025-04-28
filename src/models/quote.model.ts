/**
 * @file quote.model.ts
 * @module models
 * @author Michal Šmahel (xsmahe01)
 * @date April 2025
 */

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
 * Model representing a quote (popular text from a person)
 *
 * @property text The text of the quote
 * @property source URL of the Wiki quote page where the quote was found (due to license)
 * @property authorId Foreign key referencing the quote author
 * @property author The author of the quote
 * @property languageAbbreviation Foreign key referencing the quote language
 * @property language The language of the quote
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
