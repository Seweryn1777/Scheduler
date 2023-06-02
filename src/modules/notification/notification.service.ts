import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom, timeout } from 'rxjs'
import { NOTIFICATION_MICROSERVICE } from './constants'
import { CanceledAppointment, NotificationMicroserviceCommand, Reminders } from './types'

@Injectable()
export class NotificationService {
    constructor(@Inject(NOTIFICATION_MICROSERVICE) private client: ClientProxy) {}

    sendReminder(request: Reminders) {
        return lastValueFrom(
            this.client.send<boolean, Reminders>({ cmd: NotificationMicroserviceCommand.SendReminder }, request).pipe(timeout(2500)),
            { defaultValue: false }
        ).catch(error => {
            throw new HttpException(error, error.code || HttpStatus.BAD_REQUEST)
        })
    }

    sendCancellationAppointment(request: CanceledAppointment) {
        return lastValueFrom(
            this.client.send<boolean, CanceledAppointment>({ cmd: NotificationMicroserviceCommand.SendReminder }, request).pipe(timeout(2500)),
            { defaultValue: false }
        ).catch(error => {
            throw new HttpException(error, error.code || HttpStatus.BAD_REQUEST)
        })
    }
}
