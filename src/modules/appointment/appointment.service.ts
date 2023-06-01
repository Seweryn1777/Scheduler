import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Connection, Repository } from 'typeorm'
import { getUnixTime, subHours, subMinutes } from 'date-fns'
import { AppointmentEntity, AvailabilityEntity } from 'lib/entities'
import { AppointmentStatus, ErrorResponse, User } from 'lib/types'
import { getConfig } from 'lib/config'
import { Role } from 'lib/common'
import { en_US } from 'lib/locale'
import { R } from 'lib/utils'
import { UserService } from 'modules/user'
import { NotificationService } from 'modules/notification'
import { AvailabilityService } from 'modules/availability'
import { OrderService } from 'modules/order'
import { CancelAppointmentDto, CreateAppointmentDto } from './dto'
import { MINUTES_TO_START_REMAINING, MINUTES_TO_END_REMAINING } from './constants'
import { GetAppointmentRemainingDao, GetNumberOfUsedAppointmentsDao } from './dao'

const T = en_US

@Injectable()
export class AppointmentService {
    constructor(
        @InjectRepository(AppointmentEntity) private appointmentRepository: Repository<AppointmentEntity>,
        private readonly userService: UserService,
        private readonly notificationService: NotificationService,
        private readonly availabilityService: AvailabilityService,
        private readonly orderService: OrderService,
        private readonly db: Connection
    ) {}

    async appointmentReminderCron() {
        const reminders = await this.getAppointmentsRemainders()

        if (!R.hasElements(reminders)) {
            return Promise.resolve([])
        }

        await this.notificationService.sendReminder({ reminders })
    }

    getAppointmentsRemainders() {
        const startDate = getUnixTime(subMinutes(new Date(), MINUTES_TO_START_REMAINING))
        const endDate = getUnixTime(subMinutes(new Date(), MINUTES_TO_END_REMAINING))

        return this.appointmentRepository
            .createQueryBuilder('A')
            .select(
                `
                S.email AS studentEmail,
                S.firstName AS studentFirstName,
                S.lastName AS studentLastName,
                T.firstName AS teacherFirstName,
                T.lastName AS teacherLastName,
                A.date
            `
            )
            .where('A.date > :startDate AND A.date < :endDate', { startDate, endDate })
            .getRawMany<GetAppointmentRemainingDao>()
    }

    async createAppointment(dto: CreateAppointmentDto, user: User) {
        const { teacherUUID, availabilityUUID } = dto
        const [availability] = await this.availabilityService.getTeacherOpenAvailabilities([availabilityUUID], teacherUUID)

        if (!availability) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.availability.availabilityNotFound
            }

            throw new BadRequestException(error)
        }

        const { hoursToAddAppointment } = getConfig().appointmentConfig

        if (availability.startDate < getUnixTime(subHours(new Date(), hoursToAddAppointment))) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.appointment.incorrectAddDate(hoursToAddAppointment)
            }

            throw new BadRequestException(error)
        }

        const student = await this.userService.getUser({ userUUID: user.userUUID, role: Role.Student })

        if (!student) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.user.studentNotFound
            }

            throw new BadRequestException(error)
        }

        const studentTotalQuantity = await this.orderService.getStudentTotalQuantity(student.userUUID)

        if (!studentTotalQuantity) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.order.orderNotFound
            }

            throw new BadRequestException(error)
        }

        const usedAppointments = await this.getNumberOfUsedAppointments(student.userUUID)

        if (studentTotalQuantity.totalQuantity < usedAppointments) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.appointment.noAppointmentLeft
            }

            throw new BadRequestException(error)
        }

        const hasStudentAppointment = await this.hasStudentAppointment(student.userUUID, availability.startDate)

        if (hasStudentAppointment) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.appointment.studentHasAppointment
            }

            throw new BadRequestException(error)
        }

        return this.appointmentRepository
            .save({
                teacherUUID,
                availabilityUUID,
                studentUUID: student.userUUID,
                startDate: availability.startDate,
                endDate: availability.endDate,
                status: AppointmentStatus.Scheduled
            })
            .then(res => res.appointmentUUID)
    }

    getAppointments(userUUID: string, startDate: number, endDate: number) {
        return this.appointmentRepository
            .createQueryBuilder('AP')
            .where('(AP.teacherUUID = :userUUID OR AP.studentUUID = :userUUID)', { userUUID })
            .andWhere('AP.startDate = :startDate AND AP.endDate = :endDate', { startDate, endDate })
            .getMany()
    }

    async removeAppointment(appointmentUUID: string, studentUUID: string) {
        const appointment = await this.getAppointment(appointmentUUID)

        if (!appointment) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.appointment.appointmentNotFound
            }

            throw new BadRequestException(error)
        }

        if (appointment.studentUUID !== studentUUID) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.appointment.appointmentNotFound
            }

            throw new BadRequestException(error)
        }

        const { hoursToRemoveAppointment } = getConfig().appointmentConfig

        if (appointment.startDate < getUnixTime(subHours(new Date(), hoursToRemoveAppointment))) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.appointment.incorrectRemoveDate(hoursToRemoveAppointment)
            }

            throw new BadRequestException(error)
        }

        return this.appointmentRepository.delete({ appointmentUUID: appointment.appointmentUUID })
    }

    async cancelAppointment(dto: CancelAppointmentDto, teacherUUID: string) {
        const appointment = await this.getAppointment(dto.appointmentUUID)

        if (!appointment) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.appointment.appointmentNotFound
            }

            throw new BadRequestException(error)
        }

        if (appointment.teacherUUID !== teacherUUID) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.appointment.appointmentNotFound
            }

            throw new BadRequestException(error)
        }

        const queryRunner = this.db.createQueryRunner()
        await queryRunner.startTransaction()

        try {
            const manager = queryRunner.manager

            await manager.getRepository(AppointmentEntity).delete({ appointmentUUID: appointment.appointmentUUID })
            await manager.getRepository(AvailabilityEntity).delete({ availabilityUUID: appointment.availabilityUUID })

            await queryRunner.commitTransaction()
        } catch (error) {
            await queryRunner.rollbackTransaction()

            throw error
        } finally {
            await queryRunner.release()
        }

        return appointment.availabilityUUID
    }

    getAppointment(appointmentUUID: string) {
        return this.appointmentRepository.findOne({ where: { appointmentUUID } })
    }

    private async getNumberOfUsedAppointments(studentUUID: string) {
        const appointments = await this.appointmentRepository
            .createQueryBuilder('AP')
            .select('COUNT(AP.appointmentUUID) AS usedAppointments')
            .where('AP.studentUUID = :studentUUID', { studentUUID })
            .andWhere('AP.status = :status', { status: AppointmentStatus.Finished })
            .getRawOne<GetNumberOfUsedAppointmentsDao>()

        return appointments ? appointments.usedAppointments : 0
    }

    private hasStudentAppointment(studentUUID: string, startDate: number) {
        return this.appointmentRepository
            .createQueryBuilder('AP')
            .select('AP.appointmentUUID')
            .where('AP.studentUUID = :studentUUID', { studentUUID })
            .andWhere('AP.startDate = :startDate', { startDate })
            .getRawOne()
            .then(Boolean)
    }
}
