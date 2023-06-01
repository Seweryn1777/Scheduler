import { Type } from 'class-transformer'
import { IsUUID, IsOptional, ArrayNotEmpty, IsArray, ValidateNested } from 'class-validator'
import { DateRangeModel } from './models'

export class CreateAvailabilitiesDto {
    @IsUUID(4)
    @IsOptional()
    readonly teacherUUID?: string

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => DateRangeModel)
    readonly dates: Array<DateRangeModel>
}
