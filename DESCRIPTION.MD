## Scheduler microservice
Scheduler microservice is a standalone part of the language platform application,
based on the NestJS framework and microservice architecture. 
Its main purpose is to enable the management of teacher availability and student appointments. 
Here is a brief description of the functions of this microservice:

Adding teacher availability: Teachers can easily set their available appointments when they are
ready to conduct lessons or language sessions. The Scheduler microservice provides an API that
allows teachers to define their preferred times and days when they are available.
This information is stored and managed in a database.

Adding appointments by student: Students can select a language and view teacher availability
and make appointments at their convenience. The Scheduler microservice provides a software
interface that allows students to view available teacher appointments and book appointments.

Schedule management: Scheduler microservice takes care of schedule management by keeping
track of teacher availability and the occupancy of their appointments. When a student adds an appointment,
the system automatically updates the schedule, avoiding scheduling conflicts.

Notifications: Scheduler microservice integrates with a notification module to inform both teachers
and students of new appointments, schedule changes or other relevant information.
Notifications are sent via email.

## Code example

Student fetch the availability of teachers in the selected time frame, e.g. a week and in the given language.
Then endpoint return non-duplicated availability dates. By clicking on a given time student can see which teachers
are available at that time and add a meeting with one of them.

```javascript
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

        const startDates = [...new Set([...availabilities.map(availability => availability.startDate)])]
        const availabilityRecord = availabilities.reduce<Record<number, GetAvailabilitiesDao>>(
            (acc, currentItem) => ({ ...acc, [currentItem.startDate]: currentItem }),
            {}
        )

        return startDates.map(startDate => availabilityRecord[startDate])
    }
```

```javascript
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
```

```javascript
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

```
