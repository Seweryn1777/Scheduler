import { Controller, Get, Post, Body, Delete, BadRequestException, HttpStatus, Query, HttpCode } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { Role, SchedulerMicroserviceCommand } from 'lib/common'
import { Roles, UserDecorator } from 'lib/decorators'
import { ErrorResponse, User } from 'lib/types'
import { en_US } from 'lib/locale'
import { AppointmentService } from './appointment.service'
import { APPOINTMENT } from './constants'
import { CancelAppointmentDto, CreateAppointmentDto, DeleteAppointmentDto, GetAppointmentsDto } from './dto'

const T = en_US

@Controller(APPOINTMENT)
export class AppointmentController {
    constructor(private readonly appointmentService: AppointmentService) {}

    @MessagePattern({ cmd: SchedulerMicroserviceCommand.GetAppointment })
    getAppointment(@Payload() appointmentUUID: string) {
        return this.appointmentService.getAppointment(appointmentUUID)
    }

    @Post()
    @Roles(Role.Student)
    async createAppointment(@Body() dto: CreateAppointmentDto, @UserDecorator() user: User) {
        return this.appointmentService.createAppointment(dto, user)
    }

    @Get()
    getAppointments(@Query() dto: GetAppointmentsDto, @UserDecorator() user: User) {
        const userUUID = user.role === Role.Admin ? dto.userUUID : user.userUUID

        if (!userUUID) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.user.userNotFound
            }

            throw new BadRequestException(error)
        }

        return this.appointmentService.getAppointments(userUUID, dto.startDate, dto.endDate)
    }

    @Delete()
    @Roles(Role.Student)
    @HttpCode(HttpStatus.NO_CONTENT)
    removeAppointment(@Body() dto: DeleteAppointmentDto, @UserDecorator() user: User) {
        return this.appointmentService.removeAppointment(dto.appointmentUUID, user.userUUID)
    }

    @Delete()
    @Roles(Role.Teacher)
    @HttpCode(HttpStatus.NO_CONTENT)
    cancelAppointment(@Body() dto: CancelAppointmentDto, @UserDecorator() user: User) {
        return this.appointmentService.cancelAppointment(dto, user.userUUID)
    }
}
