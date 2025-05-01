/**
 * @author Michal Šmahel (xsmahe01)
 * @date April 2025
 */

import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm"
import { IsInt, IsUrl, Max, Min } from "class-validator"

import { Author } from "./author"
import { Language } from "./language"

/**
 * Model representing a quote (popular text from a person)
 *
 * @property text The text of the quote
 * @property source URL of the Wiki quote page where the quote was found (due to license)
 * @property score Score given by a language model (from 0 to 100)
 * @property author The author of the quote
 * @property language The language of the quote
 */
@Entity()
export class Quote extends BaseEntity {
  @PrimaryGeneratedColumn({ unsigned: true })
  id!: number

  @Column({ length: 1_000 })
  text!: string

  @Column({
    length: 255,
    comment:
      "URL of Wikiquote page, where the quote was found (due to license)",
  })
  @IsUrl()
  source!: string

  @Column({
    type: "smallint",
    unsigned: true,
    comment: "Score given by language model (from 0 to 100)",
  })
  @IsInt()
  @Min(0)
  @Max(100)
  score!: number

  @ManyToOne(() => Author, (author) => author.quotes)
  author!: Author

  @ManyToOne(() => Language, (language) => language.quotes)
  language!: Language

  /**
   * Constructor for the Quote class
   *
   * @param text The text of the quote
   * @param source URL of the Wiki quote page where the quote was found (due to license)
   * @param score Score given by a language model (from 0 to 100)
   * @param author The author of the quote
   * @param language The language of the quote
   */
  public constructor(
    text: string,
    source: string,
    score: number,
    author: Author,
    language: Language,
  ) {
    super()

    this.text = text
    this.source = source
    this.score = score
    this.author = author
    this.language = language
  }
}
