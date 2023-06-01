import { IsUUID } from 'class-validator'

export class DeleteAppointmentDto {
    @IsUUID(4)
    readonly appointmentUUID: string
}
