import { IsInt, IsPositive } from 'class-validator'

export class DateRangeModel {
    @IsInt()
    @IsPositive()
    readonly startDate: number

    @IsInt()
    @IsPositive()
    readonly endDate: number
}
