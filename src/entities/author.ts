/**
 * @author Michal Šmahel (xsmahe01)
 * @date April 2025
 */

import {
  BaseEntity,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm"

import { Quote } from "./quote"
import { TranslatedAuthorName } from "./translatedAuthorName"

/**
 * Model representing an author of quotes
 *
 * @property englishFullName Full name of the author in English
 * @property translatedFullNames Names of the author in different languages
 * @property quotes Quotes associated with the author
 */
@Entity()
export class Author extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number

  @Column({ length: 75, unique: true })
  englishFullName!: string

  @OneToMany(
    () => TranslatedAuthorName,
    (translatedAuthorName) => translatedAuthorName.author,
  )
  translatedFullNames?: TranslatedAuthorName[]

  @OneToMany(() => Quote, (quote) => quote.author)
  quotes?: Quote[]

  /**
   * Constructor for the Author class
   *
   * @param englishFullName Full name of the author in English
   */
  public constructor(englishFullName: string) {
    super()

    this.englishFullName = englishFullName
  }
}
