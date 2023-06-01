import { IsInt, IsOptional, IsPositive, IsUUID } from 'class-validator'

export class GetAppointmentsDto {
    @IsInt()
    @IsPositive()
    readonly startDate: number

    @IsInt()
    @IsPositive()
    readonly endDate: number

    @IsOptional()
    @IsUUID(4)
    readonly userUUID?: string
}
