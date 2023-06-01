import { IsString, IsUUID } from 'class-validator'
import { DeleteAppointmentDto } from './delete-appointment.dto'

export class CancelAppointmentDto extends DeleteAppointmentDto {
    @IsString()
    readonly message: string
}
