import { IsAlpha, IsInt, IsLowercase, Length, Min } from "class-validator"
import { Type } from "class-transformer"

export class LangAndAuthorParams {
  @Length(2, 2)
  @IsAlpha()
  @IsLowercase()
  langAbbr!: string

  @Min(1)
  @IsInt()
  @Type(() => Number)
  authorId!: string
}
