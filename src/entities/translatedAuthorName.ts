/**
 * @author Michal Šmahel (xsmahe01)
 * @date April 2025
 */

import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from "typeorm"

import { Language } from "./language"
import { Author } from "./author"

/**
 * Virtual model representing a translated name of an author in a specific language (M:N relationship)
 * @property fullName Full name of the author in the language
 * @property author Author whose name is being translated
 * @property language Language the author's name is translated to
 * @property authorId Foreign key referencing the author
 * @property languageAbbreviation Foreign key referencing the language
 */
@Entity()
export class TranslatedAuthorName extends BaseEntity {
  @Column({ length: 75 })
  fullName!: string

  @ManyToOne(() => Author, (author) => author.translatedFullNames)
  author!: Author

  @ManyToOne(() => Language, (language) => language.translatedFullNames)
  language!: Language

  @PrimaryColumn({ unsigned: true })
  authorId!: number

  @PrimaryColumn({ type: "char", length: 2 })
  languageAbbreviation!: string
}
