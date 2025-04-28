/**
 * @file translatedAuthorName.model.ts
 * @module models
 * @author Michal Šmahel (xsmahe01)
 * @date April 2025
 */

import {
  Column,
  DataType,
  ForeignKey,
  Length,
  Model,
  Table,
} from "sequelize-typescript"

import { Language } from "./language.model"
import { Author } from "./author.model"

/**
 * Virtual model representing a translated name of an author in a specific language (M:N relationship)
 *
 * @property authorId Foreign key referencing the author
 * @property languageAbbreviation Foreign key referencing the language
 * @property fullName Full name of the author in the specified language
 */
@Table({ timestamps: false })
export class TranslatedAuthorName extends Model {
  @ForeignKey(() => Author)
  @Column
  authorId!: number

  @ForeignKey(() => Language)
  @Column
  languageAbbreviation!: string

  @Length({ min: 2, max: 75 })
  @Column({ type: DataType.STRING(75) })
  fullName!: string
}
