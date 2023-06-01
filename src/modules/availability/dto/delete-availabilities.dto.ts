import { ArrayNotEmpty, IsArray, IsOptional, IsString, IsUUID } from 'class-validator'

export class DeleteAvailabilitiesDto {
    @IsUUID(4)
    @IsOptional()
    readonly teacherUUID?: string

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    readonly availabilitiesUUID: Array<string>
}
