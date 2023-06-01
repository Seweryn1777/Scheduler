import { IsEnum, IsInt, IsPositive } from 'class-validator'
import { Language } from 'lib/types'

export class GetAvailabilitiesDto {
    @IsInt()
    @IsPositive()
    readonly startDate: number

    @IsInt()
    @IsPositive()
    readonly endDate: number

    @IsEnum(Language)
    readonly language: Language
}
