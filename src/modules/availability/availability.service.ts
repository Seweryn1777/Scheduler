import { BadRequestException, HttpStatus, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { In, Repository } from 'typeorm'
import { fromUnixTime, isEqual, getUnixTime, addMinutes, eachMinuteOfInterval } from 'date-fns'
import { getConfig, SecondInterval } from 'lib/config'
import { AppointmentEntity, AvailabilityEntity } from 'lib/entities'
import { ErrorResponse, Language, OrderWay } from 'lib/types'
import { en_US } from 'lib/locale'
import { R } from 'lib/utils'
import { IsDateBeforeNow } from 'lib/validators'
import { UserService } from 'modules/user'
import { GetAvailabilitiesDao, GetAvailabilityDao, GetTeacherAvailabilityByRangeDao, GetTeacherOpenAvailabilityDao } from './dao'
import { Availability, AvailabilityInterval } from './types'
import { GetAvailabilitiesDto } from './dto'

const T = en_US

@Injectable()
export class AvailabilityService {
    private readonly availabilitySlotInMin = getConfig().availabilityConfig.availabilitySlotInMin

    constructor(
        @InjectRepository(AvailabilityEntity) private availabilityRepository: Repository<AvailabilityEntity>,
        @InjectRepository(AppointmentEntity) private appointmentRepository: Repository<AppointmentEntity>,
        private readonly userService: UserService
    ) {}

    async createAvailability(teacherUUID: string, dates: Array<AvailabilityInterval>) {
        const teacher = await this.userService.getTeacher(teacherUUID)

        if (!teacher) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.teacher.teacherNotFound
            }

            throw new BadRequestException(error)
        }

        dates.forEach(({ startDate, endDate }) => this.validateDate(startDate, endDate))

        const availabilityIntervals = dates.flatMap(date => this.getIntervals(date.startDate, date.endDate))
        const { minDate, maxDate } = this.getIntervalsExtremum(availabilityIntervals)
        const currentAvailabilities = await this.getTeacherAvailabilitiesByRange(teacherUUID, minDate, maxDate)

        const availabilitiesToAdd = availabilityIntervals.reduce<Array<Availability>>((acc, currentItem) => {
            const isExist = currentAvailabilities.some(currentAvailability => currentAvailability.startDate === currentItem.startDate)

            if (!isExist) {
                return [
                    ...acc,
                    {
                        ...currentItem,
                        teacherUUID,
                        language: teacher.language
                    }
                ]
            }

            return acc
        }, [])

        return this.availabilityRepository.save(availabilitiesToAdd).then(res => res.map(availability => availability.availabilityUUID))
    }

    deleteAvailability(availabilitiesUUID: Array<string>) {
        if (!R.hasElements(availabilitiesUUID)) {
            throw new BadRequestException()
        }

        return this.availabilityRepository.delete({
            availabilityUUID: In(availabilitiesUUID)
        })
    }

    getTeacherAvailabilities(teacherUUID: string) {
        return this.availabilityRepository.find({ where: { teacherUUID } })
    }

    async getAvailabilities(dto: GetAvailabilitiesDto) {
        const { startDate, endDate, language } = dto
        this.validateDate(startDate, endDate)

        const availabilities = await this.availabilityRepository
            .createQueryBuilder('A')
            .select('A.startDate, A.endDate')
            .where('A.startDate >= :startDate AND A.endDate <= :endDate', { startDate, endDate })
            .andWhere(`NOT EXISTS (${this.getIsOccupiedSubQuery()})`)
            .andWhere('A.language = :language', { language })
            .orderBy('A.startDate', OrderWay.ASC)
            .getRawMany<GetAvailabilitiesDao>()

        const startDates = [...new Set(availabilities.map(availability => availability.startDate))]
        const availabilityRecord = availabilities.reduce<Record<number, GetAvailabilitiesDao>>(
            (acc, currentItem) => ({ ...acc, [currentItem.startDate]: currentItem }),
            {}
        )

        return startDates.map(startDate => availabilityRecord[startDate])
    }

    async getAvailability(startDate: number, language: Language) {
        const availabilities = await this.availabilityRepository
            .createQueryBuilder('A')
            .select('A.availabilityUUID, A.startDate, A.endDate, A.teacherUUID')
            .where('A.startDate = :startDate', { startDate })
            .andWhere(`NOT EXISTS (${this.getIsOccupiedSubQuery()})`)
            .andWhere('A.language = :language', { language })
            .getRawMany<GetAvailabilityDao>()

        const teachersUUID = availabilities.map(availabilities => availabilities.teacherUUID)
        const teachers = await this.userService.getTeachers(teachersUUID)
        const [availability] = availabilities

        return {
            availabilityUUID: availability.availabilityUUID,
            startDate: availability.startDate,
            endDate: availability.endDate,
            teachers
        }
    }

    getTeacherOpenAvailabilities(availabilitiesUUID: Array<string>, teacherUUID: string) {
        if (!R.hasElements(availabilitiesUUID)) {
            return Promise.resolve([])
        }

        return this.availabilityRepository
            .createQueryBuilder('A')
            .select('A.availabilityUUID, A.statDate, A.endDate')
            .where('A.teacherUUID = :teacherUUID', { teacherUUID })
            .andWhere('A.availabilityUUID IN (:...availabilitiesUUID)', { availabilitiesUUID })
            .andWhere(`NOT EXISTS (${this.getIsOccupiedSubQuery()})`)
            .getRawMany<GetTeacherOpenAvailabilityDao>()
    }

    private getIntervals(startDate: number, endDate: number) {
        const singleTimeSlotInS = this.availabilitySlotInMin * SecondInterval.Minute
        const interval = {
            start: fromUnixTime(startDate),
            end: fromUnixTime(endDate - singleTimeSlotInS)
        }

        return isEqual(interval.start, interval.end)
            ? [
                  {
                      startDate: getUnixTime(interval.start),
                      endDate: getUnixTime(addMinutes(interval.end, this.availabilitySlotInMin))
                  }
              ]
            : eachMinuteOfInterval(interval, {
                  step: this.availabilitySlotInMin
              }).map(slot => ({
                  startDate: getUnixTime(slot),
                  endDate: getUnixTime(addMinutes(slot, this.availabilitySlotInMin))
              }))
    }

    private getIntervalsExtremum(availabilityIntervals: Array<AvailabilityInterval>) {
        return availabilityIntervals.reduce(
            (acc, currentItem, index) => {
                if (index === 0) {
                    return {
                        minDate: currentItem.startDate,
                        maxDate: currentItem.endDate
                    }
                }

                return {
                    minDate: acc.minDate < currentItem.startDate ? acc.minDate : currentItem.startDate,
                    maxDate: acc.maxDate > currentItem.endDate ? acc.maxDate : currentItem.endDate
                }
            },
            {
                minDate: 0,
                maxDate: 0
            }
        )
    }

    private getTeacherAvailabilitiesByRange(teacherUUID: string, startDate: number, endDate: number) {
        return this.availabilityRepository
            .createQueryBuilder('A')
            .select(
                `
                A.availabilityUUID,
                A.startDate,
                A.endDate,
                A.teacherUUID
            `
            )
            .where('A.startDate >= :startDate AND A.endDate <= :endDate', { startDate, endDate })
            .andWhere('A.teacherUUID = :teacherUUID', { teacherUUID })
            .getRawMany<GetTeacherAvailabilityByRangeDao>()
    }

    private validateDate(startDate: number, endDate: number) {
        if (endDate <= startDate) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.dateTime.invalidDateTo,
                payload: {
                    startDate,
                    endDate
                }
            }

            throw new BadRequestException(error)
        }

        const isBeforeNow = IsDateBeforeNow(startDate)

        if (isBeforeNow) {
            const error: ErrorResponse = {
                code: HttpStatus.BAD_REQUEST,
                message: T.dateTime.invalidDateFrom,
                payload: {
                    startDate,
                    endDate
                }
            }

            throw new BadRequestException(error)
        }
    }

    private getIsOccupiedSubQuery() {
        return this.appointmentRepository
            .createQueryBuilder('AP')
            .select('AP.appointmentUUID')
            .where('AP.availabilityUUID = A.availabilityUUID')
            .getQuery()
    }
}
