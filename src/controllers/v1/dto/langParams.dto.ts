import { IsAlpha, IsLowercase, Length } from "class-validator"

export class LangParams {
  @Length(2, 2)
  @IsAlpha()
  @IsLowercase()
  langAbbr!: string
}
