import {
  Column,
  DataType,
  ForeignKey,
  Length,
  Model,
  Table,
  Unique,
} from "sequelize-typescript"

import { Language } from "./language.model"
import { Author } from "./author.model"

/**
 * @class TranslatedAuthorName
 * @extends Model
 * @classDesc Virtual model representing a translated name of an author in a specific language (M:N relationship)
 * @property {number} authorId Foreign key referencing the author
 * @property {string} languageAbbreviation Foreign key referencing the language
 * @property {string} fullName Full name of the author in the specified language
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
