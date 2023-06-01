import { IsEnum, IsInt, IsPositive } from 'class-validator'
import { Language } from 'lib/types'

export class GetAvailabilityDto {
    @IsInt()
    @IsPositive()
    readonly startDate: number

    @IsEnum(Language)
    readonly language: Language
}
