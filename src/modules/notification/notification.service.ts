import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { lastValueFrom, timeout } from 'rxjs'
import { NOTIFICATION_MICROSERVICE } from './constants'
import { NotificationMicroserviceCommand, SendReminders } from './types'

@Injectable()
export class NotificationService {
    constructor(@Inject(NOTIFICATION_MICROSERVICE) private client: ClientProxy) {}

    sendReminder(request: SendReminders) {
        return lastValueFrom(
            this.client.send<boolean, SendReminders>({ cmd: NotificationMicroserviceCommand.SendReminder }, request).pipe(timeout(2500)),
            { defaultValue: false }
        ).catch(error => {
            throw new HttpException(error, error.code || HttpStatus.BAD_REQUEST)
        })
    }
}
