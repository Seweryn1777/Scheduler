import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Connection, In, Repository } from 'typeorm'
import { addMinutes, getUnixTime, subHours, subMinutes } from 'date-fns'
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
import { MINUTES_TO_END_REMAINING } from './constants'
import { GetAppointmentDao, GetAppointmentRemainingDao, GetNumberOfUsedAppointmentsDao } from './dao'
import { TeacherReminders } from './types'

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

    async handleAppointmentReminderCron() {
        const reminders = await this.getAppointmentsRemainders()

        if (!R.hasElements(reminders)) {
            return Promise.resolve([])
        }

        const teachersUUID = reminders.map(reminder => reminder.teacherUUID)
        const studentUUID = reminders.map(reminder => reminder.studentUUID)
        const [teachers, students] = await Promise.all([
            this.userService.getUsersEmailInfo(teachersUUID),
            this.userService.getUsersEmailInfo(studentUUID)
        ])

        if (!R.hasElements(teachers) || !R.hasElements(students)) {
            return Promise.resolve([])
        }

        const teachersReminderRecord = reminders.reduce<Record<string, GetAppointmentRemainingDao>>(
            (acc, currentItem) => ({ ...acc, [currentItem.teacherUUID]: currentItem }),
            {}
        )
        const teachersReminders = teachers.map(teacher => {
            const { userUUID, ...rest } = teacher

            return {
                teacherFirstName: rest.firstName,
                teacherLastName: rest.lastName,
                teacherEmail: rest.email,
                ...teachersReminderRecord[teacher.userUUID]
            }
        })
        const studentsRemindersRecord = teachersReminders.reduce<Record<string, TeacherReminders>>(
            (acc, currentItem) => ({ ...acc, [currentItem.studentUUID]: currentItem }),
            {}
        )
        const remindersToSend = students.map(student => {
            const { userUUID, ...rest } = student

            return {
                studentFirstName: rest.firstName,
                studentLastName: rest.lastName,
                studentEmail: rest.email,
                ...studentsRemindersRecord[student.userUUID]
            }
        })

        await this.notificationService.sendReminder({ reminders: remindersToSend })
    }

    async handleFinishedAppointmentsCron() {
        const finishedAppointmentsUUID = await this.getFinishedAppointmentsUUID()

        await this.updateAppointmentsStatus(finishedAppointmentsUUID)
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

    private getAppointmentsRemainders() {
        const startDate = getUnixTime(new Date())
        const endDate = getUnixTime(addMinutes(new Date(), MINUTES_TO_END_REMAINING))

        return this.appointmentRepository
            .createQueryBuilder('A')
            .select('A.studentUUID, A.startDate, A.teacherUUID')
            .where('A.startDate > :startDate AND A.startDate <= :endDate', { startDate, endDate })
            .getRawMany<GetAppointmentRemainingDao>()
    }

    private getFinishedAppointmentsUUID() {
        const now = getUnixTime(new Date())

        return this.appointmentRepository
            .createQueryBuilder('AP')
            .select('AP.appointmentUUID')
            .where('AP.endDate < :now', { now })
            .andWhere('AP.status = :status', { status: AppointmentStatus.Scheduled })
            .getRawMany<GetAppointmentDao>()
            .then(appointments => appointments.map(appointment => appointment.appointmentUUID))
    }

    private updateAppointmentsStatus(finishedAppointmentsUUID: Array<string>) {
        return this.appointmentRepository.update(
            {
                appointmentUUID: In(finishedAppointmentsUUID)
            },
            {
                status: AppointmentStatus.Finished
            }
        )
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
