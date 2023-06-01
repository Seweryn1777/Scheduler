import { IsUUID } from 'class-validator'

export class CreateAppointmentDto {
    @IsUUID(4)
    readonly teacherUUID: string

    @IsUUID(4)
    readonly availabilityUUID: string
}
