import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, HttpStatus, Query, HttpCode } from '@nestjs/common'
import { Role } from 'lib/common'
import { Roles, UserDecorator } from 'lib/decorators'
import { en_US } from 'lib/locale'
import { User, ErrorResponse } from 'lib/types'
import { AvailabilityService } from './availability.service'
import { CreateAvailabilitiesDto, DeleteAvailabilitiesDto, GetAvailabilitiesDto, GetAvailabilityDto, GetTeacherAvailabilitiesDto } from './dto'
import { AVAILABILITY } from './constants'

const T = en_US

@Controller(AVAILABILITY)
export class AvailabilityController {
    constructor(private readonly availabilityService: AvailabilityService) {}

    @Post()
    @Roles(Role.Teacher, Role.Admin)
    createAvailabilities(@Body() dto: CreateAvailabilitiesDto, @UserDecorator() user: User) {
        const teacherUUID = user.role === Role.Admin ? dto.teacherUUID : user.userUUID

        if (!teacherUUID) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.teacher.missingTeacherUUID
            }

            throw new BadRequestException(error)
        }

        return this.availabilityService.createAvailability(teacherUUID, dto.dates)
    }

    @Get('teacher')
    @Roles(Role.Teacher, Role.Admin)
    getTeacherAvailabilities(@Query() dto: GetTeacherAvailabilitiesDto, @UserDecorator() user: User) {
        const teacherUUID = user.role === Role.Admin ? dto.teacherUUID : user.userUUID

        if (!teacherUUID) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.teacher.missingTeacherUUID
            }

            throw new BadRequestException(error)
        }

        return this.availabilityService.getTeacherAvailabilities(teacherUUID)
    }

    @Get()
    @Roles(Role.Student, Role.Admin)
    getAvailabilities(@Query() dto: GetAvailabilitiesDto) {
        return this.availabilityService.getAvailabilities(dto)
    }

    @Get('details')
    @Roles(Role.Student, Role.Admin)
    getAvailability(@Query() dto: GetAvailabilityDto) {
        return this.availabilityService.getAvailability(dto.startDate, dto.language)
    }

    @Delete()
    @Roles(Role.Teacher, Role.Admin)
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteAvailability(@Body() dto: DeleteAvailabilitiesDto, @UserDecorator() user: User) {
        const teacherUUID = user.role === Role.Admin ? dto.teacherUUID : user.userUUID
        const { availabilitiesUUID } = dto

        if (!teacherUUID) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.teacher.missingTeacherUUID
            }

            throw new BadRequestException(error)
        }

        const availabilities = await this.availabilityService.getTeacherOpenAvailabilities(availabilitiesUUID, teacherUUID)

        if (availabilitiesUUID.length !== availabilities.length) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.availability.availabilityNotFound
            }

            throw new BadRequestException(error)
        }

        return this.availabilityService.deleteAvailability(availabilitiesUUID)
    }
}
