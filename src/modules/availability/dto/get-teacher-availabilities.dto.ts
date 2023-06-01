import { IsOptional, IsUUID } from 'class-validator'

export class GetTeacherAvailabilitiesDto {
    @IsUUID(4)
    @IsOptional()
    readonly teacherUUID?: string
}
